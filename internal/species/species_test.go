package species

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
)

// The committed dex is what the roster builds at the pinned generator: a roster edit or a
// generator take-up without go run ./cmd/species fails here.
func TestCommittedDexIsCurrent(t *testing.T) {
	r, err := Roster()
	if err != nil {
		t.Fatal(err)
	}
	d, err := Build(r)
	if err != nil {
		t.Fatal(err)
	}
	want, err := Encode(d)
	if err != nil {
		t.Fatal(err)
	}
	got, err := os.ReadFile(filepath.Join("..", "..", DexPath))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(bytes.ReplaceAll(got, []byte("\r\n"), []byte("\n")), want) {
		t.Fatalf("%s is stale: run go run ./cmd/species", DexPath)
	}
}

func TestDexIsWhole(t *testing.T) {
	r, _ := Roster()
	d, err := Build(r)
	if err != nil {
		t.Fatal(err)
	}
	byID := map[string]Species{}
	for _, s := range d.Species {
		byID[s.ID] = s
	}
	starters, legends := 0, 0
	for _, s := range d.Species {
		if len(s.Sprite.Pixels) != s.Sprite.Width*s.Sprite.Height {
			t.Errorf("%s: sprite has %d pixels for %dx%d", s.ID, len(s.Sprite.Pixels), s.Sprite.Width, s.Sprite.Height)
		}
		if s.Evolution != nil {
			next, ok := byID[s.Evolution.To]
			if !ok || next.Family != s.Family || next.Stage != s.Stage+1 {
				t.Errorf("%s evolves into %q, which isn't its next stage", s.ID, s.Evolution.To)
			}
			if (s.Evolution.Level == 0) == (s.Evolution.Item == "") {
				t.Errorf("%s: an evolution needs a level or an item", s.ID)
			}
		}
		if s.Role == "starter" && s.Stage == 1 {
			starters++
		}
		if s.Role == "legendary" {
			legends++
		}
	}
	if starters != 3 || legends != 3 {
		t.Errorf("want 3 starters and 3 legendaries, got %d and %d", starters, legends)
	}
}
