// pokosmari serves https://pokosmari.romaine.life: a monster-catching RPG that runs in the
// browser. The server hands out the game's files and logs the errors the game reports; the
// game itself, and its saves, live in the browser.
//
// Environment:
//
//	PORT        listen port (8080)
//	PUBLIC_URL  the site's origin, for share-card links (https://pokosmari.romaine.life)
//
// Flags: --self-test checks the built image's routes and exits (the web-app suite's image
// check).
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/romaine-life/pokosmari/internal/server"
	"github.com/romaine-life/pokosmari/web"
)

// version is the release, stamped by the image build.
var version = "dev"

func main() {
	selfTest := flag.Bool("self-test", false, "check the built image's routes and exit")
	flag.Parse()
	log := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	if *selfTest {
		if err := runSelfTest(); err != nil {
			fmt.Fprintf(os.Stderr, "pokosmari self-test failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("pokosmari self-test passed")
		return
	}
	if err := run(log); err != nil {
		log.Error("pokosmari stopped", "err", err)
		os.Exit(1)
	}
}

func env(name, fallback string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return fallback
}

func run(log *slog.Logger) error {
	h, err := server.New(server.Config{
		Static:    web.Static(),
		PublicURL: env("PUBLIC_URL", "https://pokosmari.romaine.life"),
		Version:   version,
		Log:       log,
	})
	if err != nil {
		return err
	}
	srv := &http.Server{Addr: ":" + env("PORT", "8080"), Handler: h, ReadHeaderTimeout: 10 * time.Second}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	errc := make(chan error, 1)
	go func() { errc <- srv.ListenAndServe() }()
	log.Info("listening", "addr", srv.Addr, "version", version)
	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
	}
	// A rollout's SIGTERM: finish what's in flight, then exit.
	shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdown); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}
