package server

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/romaine-life/logline"
)

func newTest(t *testing.T, version string) (http.Handler, *bytes.Buffer) {
	t.Helper()
	files := fstest.MapFS{
		"index.html":  {Data: []byte(`<html data-base="{{.Base}}"><script src="{{.Base}}src/main.js"></script></html>`)},
		"src/main.js": {Data: []byte("export const x = 1;")},
	}
	var logs bytes.Buffer
	h, err := New(Config{Static: files, PublicURL: "https://example.test", Version: version, Log: logline.New(&logs)})
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
	lines := parsed(t, logs)
	if len(lines) != 2 || lines[1].Message != "request" {
		t.Fatalf("want the report's line, then the request's: %q", logs)
	}
	report := lines[0]
	if report.Level != logline.Error || report.Message != "client error" ||
		field(report, "message") != "boom" || field(report, "where") != "battle" {
		t.Errorf("the report's line: %+v", report)
	}
	if rec := get(h, "POST", "/api/errors", "not json"); rec.Code != 400 {
		t.Errorf("a non-JSON report: %d", rec.Code)
	}
	big := `{"m":"` + strings.Repeat("x", 20000) + `"}`
	if rec := get(h, "POST", "/api/errors", big); rec.Code != 400 {
		t.Errorf("a report over 8 KB is cut and so isn't JSON: %d", rec.Code)
	}
}

func TestReportFieldsAreLogKeys(t *testing.T) {
	h, logs := newTest(t, "dev")
	body := `{"stack":"Error: boom\n    at main.js:1","Bad Key":1,"9":true,"nested":{"a":[1,2]}}`
	if rec := get(h, "POST", "/api/errors", body); rec.Code != 204 {
		t.Fatalf("report: %d", rec.Code)
	}
	line := parsed(t, logs)[0]
	want := map[string]string{
		"stack":   "Error: boom\n    at main.js:1",
		"bad_key": "1",
		"x_9":     "true",
		"nested":  `{"a":[1,2]}`,
	}
	for k, v := range want {
		if got := field(line, k); got != v {
			t.Errorf("field %s = %q, want %q", k, got, v)
		}
	}
}

func TestRequestsAreLogged(t *testing.T) {
	h, logs := newTest(t, "dev")
	get(h, "GET", "/healthz", "")
	get(h, "GET", "/v/dev/src/main.js", "")
	lines := parsed(t, logs)
	if len(lines) != 1 {
		t.Fatalf("want one line, health checks unlogged: %q", logs)
	}
	l := lines[0]
	if l.Level != logline.Info || l.Message != "request" || field(l, "method") != "GET" ||
		field(l, "path") != "/v/dev/src/main.js" || field(l, "status") != "200" || field(l, "ms") == "" {
		t.Errorf("the request's line: %+v", l)
	}
}

// parsed is every line the server wrote, each read back as the standard line.
func parsed(t *testing.T, logs *bytes.Buffer) []logline.Entry {
	t.Helper()
	var entries []logline.Entry
	for _, line := range strings.Split(strings.TrimSuffix(logs.String(), "\n"), "\n") {
		if line == "" {
			continue
		}
		e, err := logline.Parse(line)
		if err != nil {
			t.Fatalf("not the standard line (%v): %q", err, line)
		}
		entries = append(entries, e)
	}
	return entries
}

func field(e logline.Entry, key string) string {
	for _, f := range e.Fields {
		if f.Key == key {
			return f.Value
		}
	}
	return ""
}
