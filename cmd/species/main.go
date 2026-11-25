// species writes the game's dex, web/static/data/species.json, from the roster in
// internal/species/roster.json. With --pick it first chooses a new roster from the
// generator (internal/species.Slots), replacing roster.json.
//
// Run it from the repository root: go run ./cmd/species [--pick]
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"github.com/romaine-life/pokosmari/internal/species"
)

func main() {
	pick := flag.Bool("pick", false, "choose a new roster before writing the dex")
	flag.Parse()
	if err := run(*pick); err != nil {
		fmt.Fprintln(os.Stderr, "species:", err)
		os.Exit(1)
	}
}

func run(pick bool) error {
	if pick {
		r, err := species.Pick(species.Slots())
		if err != nil {
			return err
		}
		b, err := json.MarshalIndent(r, "", "  ")
		if err != nil {
			return err
		}
		if err := os.WriteFile("internal/species/roster.json", append(b, '\n'), 0o644); err != nil {
			return err
		}
		fmt.Println("wrote internal/species/roster.json; run again without --pick to build the dex from it")
		return nil
	}
	r, err := species.Roster()
	if err != nil {
		return err
	}
	d, err := species.Build(r)
	if err != nil {
		return err
	}
	b, err := species.Encode(d)
	if err != nil {
		return err
	}
	if err := os.WriteFile(species.DexPath, b, 0o644); err != nil {
		return err
	}
	fmt.Printf("wrote %s: %d species in %d families\n", species.DexPath, len(d.Species), len(r))
	return nil
}
