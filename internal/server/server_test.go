package server

import (
	"bytes"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
)

func newTest(t *testing.T, version string) (http.Handler, *bytes.Buffer) {
	t.Helper()
	files := fstest.MapFS{
		"index.html":  {Data: []byte(`<html data-base="{{.Base}}"><script src="{{.Base}}src/main.js"></script></html>`)},
		"src/main.js": {Data: []byte("export const x = 1;")},
	}
	var logs bytes.Buffer
	h, err := New(Config{Static: files, PublicURL: "https://example.test", Version: version, Log: slog.New(slog.NewJSONHandler(&logs, nil))})
	if err != nil {
		t.Fatal(err)
	}
	return h, &logs
}

func get(h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, path, strings.NewReader(body)))
	return rec
}

func TestPageNamesThisRelease(t *testing.T) {
	h, _ := newTest(t, "v1.2.3")
	rec := get(h, "GET", "/", "")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), "/v/v1.2.3/src/main.js") {
		t.Fatalf("page: %d %s", rec.Code, rec.Body)
	}
	if rec.Header().Get("Cache-Control") != "no-cache" {
		t.Errorf("the page must be revalidated, got %q", rec.Header().Get("Cache-Control"))
	}
}

func TestFilesAreServedUnderTheirRelease(t *testing.T) {
	h, _ := newTest(t, "v1.2.3")
	rec := get(h, "GET", "/v/v1.2.3/src/main.js", "")
	if rec.Code != 200 || !strings.Contains(rec.Header().Get("Cache-Control"), "immutable") {
		t.Fatalf("this release's file: %d %q", rec.Code, rec.Header().Get("Cache-Control"))
	}
	if rec := get(h, "GET", "/v/v1.2.2/src/main.js", ""); rec.Code != 404 {
		t.Errorf("another release's address must be a 404, got %d", rec.Code)
	}
	if rec := get(h, "GET", "/v/v1.2.3/index.html", ""); rec.Code != 404 {
		t.Errorf("the raw template must not be served, got %d", rec.Code)
	}
}

func TestClientErrorsAreLogged(t *testing.T) {
	h, logs := newTest(t, "dev")
	if rec := get(h, "POST", "/api/errors", `{"message":"boom","where":"battle"}`); rec.Code != 204 {
		t.Fatalf("report: %d", rec.Code)
	}
	if !strings.Contains(logs.String(), "boom") {
		t.Errorf("the report wasn't logged: %s", logs)
	}
	if rec := get(h, "POST", "/api/errors", "not json"); rec.Code != 400 {
		t.Errorf("a non-JSON report: %d", rec.Code)
	}
	big := `{"m":"` + strings.Repeat("x", 20000) + `"}`
	if rec := get(h, "POST", "/api/errors", big); rec.Code != 400 {
		t.Errorf("a report over 8 KB is cut and so isn't JSON: %d", rec.Code)
	}
	_ = io.Discard
}
