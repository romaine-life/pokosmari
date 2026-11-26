// Package server serves the game: its page and its static files.
package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/romaine-life/logline"
)

// Config is what the server needs from its environment.
type Config struct {
	Static    fs.FS           // the game's files: index.html, src/, data/, style.css, favicon.svg
	PublicURL string          // the site's origin, for share-card links
	Version   string          // the release this build is
	Log       *logline.Logger // the service's log: stdout, which the cluster keeps
}

type server struct {
	Config
	page []byte
}

// New returns the site's handler. The game's files are served under /v/<version>/, so each
// release is a new address: browsers keep them for a year and never mix two releases'
// scripts. The page itself is revalidated on each load, so a release shows at once.
func New(c Config) (http.Handler, error) {
	index, err := template.ParseFS(c.Static, "index.html")
	if err != nil {
		return nil, fmt.Errorf("parse index.html: %w", err)
	}
	var b bytes.Buffer
	err = index.Execute(&b, struct{ Base, PublicURL, Version string }{
		Base: "/v/" + c.Version + "/", PublicURL: c.PublicURL, Version: c.Version,
	})
	if err != nil {
		return nil, fmt.Errorf("render index.html: %w", err)
	}
	s := &server{Config: c, page: b.Bytes()}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", s.health)
	mux.HandleFunc("GET /{$}", s.index)
	mux.HandleFunc("POST /api/errors", s.clientError)
	mux.Handle("GET /v/{version}/", s.files())
	return s.logged(mux), nil
}

func (s *server) health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "version": s.Version})
}

func (s *server) index(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.Write(s.page)
}

// files serves /v/<version>/<file>. Another release's address is a 404, not this release's
// file under the old name, so an old page never runs new scripts.
func (s *server) files() http.Handler {
	fsrv := http.FileServerFS(s.Static)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.PathValue("version") != s.Version {
			http.NotFound(w, r)
			return
		}
		name := strings.TrimPrefix(r.URL.Path, "/v/"+s.Version)
		if name == "/index.html" || strings.HasSuffix(name, "/") {
			http.NotFound(w, r)
			return
		}
		if s.Version == "dev" {
			w.Header().Set("Cache-Control", "no-cache")
		} else {
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		}
		r2 := r.Clone(r.Context())
		r2.URL.Path = name
		fsrv.ServeHTTP(w, r2)
	})
}

// clientError logs a script error the game reports, so a crash in someone's browser is in
// the server's log rather than only on their screen. The body is the game's JSON report,
// kept to 8 KB; each of its fields is a field of the line.
func (s *server) clientError(w http.ResponseWriter, r *http.Request) {
	body, _ := io.ReadAll(io.LimitReader(r.Body, 8<<10))
	var report map[string]any
	if err := json.Unmarshal(body, &report); err != nil {
		http.Error(w, "the report must be JSON", http.StatusBadRequest)
		return
	}
	s.Log.Error("client error", reportFields(report)...)
	w.WriteHeader(http.StatusNoContent)
}

// reportFields is a report as a line's key, value pairs, in key order. A key is made a
// log key (lower case, [a-z0-9_.-], starting with a letter); a value that isn't a string
// or number is written as its JSON.
func reportFields(report map[string]any) []any {
	keys := make([]string, 0, len(report))
	for k := range report {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	kv := make([]any, 0, 2*len(keys))
	for _, k := range keys {
		var value any
		switch v := report[k].(type) {
		case string, float64:
			value = v
		default:
			b, _ := json.Marshal(v)
			value = string(b)
		}
		kv = append(kv, logKey(k), value)
	}
	return kv
}

// logKey is k as a log line's key.
func logKey(k string) string {
	b := []byte(strings.ToLower(k))
	for i, c := range b {
		if !(c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || c == '_' || c == '.' || c == '-') {
			b[i] = '_'
		}
	}
	if len(b) == 0 || b[0] < 'a' || b[0] > 'z' {
		return "x_" + string(b)
	}
	return string(b)
}

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

// logged writes one line per request, except health checks.
func (s *server) logged(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)
		if r.URL.Path == "/healthz" {
			return
		}
		s.Log.Info("request", "method", r.Method, "path", r.URL.Path, "status", sw.status,
			"ms", time.Since(start).Milliseconds())
	})
}
