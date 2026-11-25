package main

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"

	"github.com/romaine-life/pokosmari/internal/server"
	"github.com/romaine-life/pokosmari/web"
)

// runSelfTest serves the built image's own files and checks each route the game loads
// answers as the game expects.
func runSelfTest() error {
	h, err := server.New(server.Config{Static: web.Static(), PublicURL: "https://example.test", Version: version,
		Log: slog.New(slog.NewTextHandler(io.Discard, nil))})
	if err != nil {
		return err
	}
	srv := httptest.NewServer(h)
	defer srv.Close()

	base := "/v/" + version + "/"
	checks := []struct{ method, path, ctype, contains string }{
		{"GET", "/healthz", "application/json", `"status":"ok"`},
		{"GET", "/", "text/html", base + "src/main.js"},
		{"GET", base + "src/main.js", "text/javascript", "titleScreen"},
		{"GET", base + "src/world/overworld.js", "text/javascript", "class Overworld"},
		{"GET", base + "src/data/maps/fernhollow-home.js", "text/javascript", "fernhollow-home"},
		{"GET", base + "data/species.json", "application/json", `"sproufawn"`},
		{"GET", base + "style.css", "text/css", "#screen"},
		{"GET", base + "favicon.svg", "image/svg+xml", "<svg"},
	}
	for _, c := range checks {
		res, err := http.Get(srv.URL + c.path)
		if err != nil {
			return fmt.Errorf("GET %s: %w", c.path, err)
		}
		body, _ := io.ReadAll(res.Body)
		res.Body.Close()
		if res.StatusCode != http.StatusOK {
			return fmt.Errorf("GET %s: status %d", c.path, res.StatusCode)
		}
		if ct := res.Header.Get("Content-Type"); !strings.HasPrefix(ct, c.ctype) {
			return fmt.Errorf("GET %s: content type %q, want %s", c.path, ct, c.ctype)
		}
		if !strings.Contains(string(body), c.contains) {
			return fmt.Errorf("GET %s: body lacks %q", c.path, c.contains)
		}
	}
	res, err := http.Post(srv.URL+"/api/errors", "application/json", strings.NewReader(`{"where":"self-test","message":"ok"}`))
	if err != nil {
		return fmt.Errorf("POST /api/errors: %w", err)
	}
	res.Body.Close()
	if res.StatusCode != http.StatusNoContent {
		return fmt.Errorf("POST /api/errors: status %d", res.StatusCode)
	}
	return nil
}
