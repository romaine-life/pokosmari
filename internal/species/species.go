// Package species makes the game's creatures from pokemon-generator. The roster
// (roster.json) names each family by the generator seed and type lock that make it; Build
// turns it into the dex the game loads, web/static/data/species.json. The generator is
// pinned in go.mod, so a family only changes when that pin is taken up and the dex is
// rebuilt (go run ./cmd/species).
package species

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/romaine-life/pokemon-generator/gen"
)

//go:embed roster.json
var rosterJSON []byte

// Family is one evolution line in the roster: the generator's seed and type lock.
type Family struct {
	Seed string `json:"seed"`
	Type string `json:"type"`
	Role string `json:"role,omitempty"` // "starter", "legendary" or empty
}

// Roster is the committed list of families, in dex order.
func Roster() ([]Family, error) {
	var r []Family
	if err := json.Unmarshal(rosterJSON, &r); err != nil {
		return nil, fmt.Errorf("roster.json: %w", err)
	}
	return r, nil
}

// Base is a species' base stats.
type Base struct {
	HP  int `json:"hp"`
	Atk int `json:"atk"`
	Def int `json:"def"`
	SpA int `json:"spa"`
	SpD int `json:"spd"`
	Spe int `json:"spe"`
}

// Evolution is how a species becomes the next stage: at a level, or with an item.
type Evolution struct {
	To    string `json:"to"`
	Level int    `json:"level,omitempty"`
	Item  string `json:"item,omitempty"`
}

// Sprite is the generator's sprite, its pixels packed one base-36 digit per pixel, row by
// row (0 is transparent).
type Sprite struct {
	Width   int      `json:"width"`
	Height  int      `json:"height"`
	Palette []string `json:"palette"`
	Pixels  string   `json:"pixels"`
}

// Species is one creature as the game knows it.
type Species struct {
	ID        string     `json:"id"` // the name in lower case, how game data names it
	Num       int        `json:"num"`
	Name      string     `json:"name"`
	Category  string     `json:"category"`
	Types     []string   `json:"types"`
	Base      Base       `json:"base"`
	Total     int        `json:"total"`
	Entry     string     `json:"entry"`
	HeightM   float64    `json:"heightM"`
	WeightKg  float64    `json:"weightKg"`
	BodyPlan  string     `json:"bodyPlan"`
	Family    int        `json:"family"` // index into the roster
	Role      string     `json:"role,omitempty"`
	Stage     int        `json:"stage"`
	Stages    int        `json:"stages"`
	Legendary bool       `json:"legendary,omitempty"`
	Evolution *Evolution `json:"evolution,omitempty"`
	Sprite    Sprite     `json:"sprite"`
}

// Type is one of the generator's eighteen types.
type Type struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}

// Dex is the file the game loads.
type Dex struct {
	Generator string    `json:"generator"`
	Types     []Type    `json:"types"`
	Species   []Species `json:"species"`
}

var levelHow = regexp.MustCompile(`^Lv\. (\d+)$`)

// Stones maps the generator's name for an evolution stone to the game's own item name.
// The generator builds its names from move words, which can match another game's items, so
// the dex never carries them; a stone missing here has no item in the game.
var Stones = map[string]string{
	"Hyper Stone": "Hyper Stone",
	"Leaf Stone":  "Bloomstone",
}

// Usable reports whether a family can be in the game: every evolution is by level or by a
// stone the game has an item for, and it isn't the generator's shiny variant.
func Usable(m gen.Monster) bool {
	if m.Shiny {
		return false
	}
	for _, e := range m.Evolution[1:] {
		if !levelHow.MatchString(e.How) && Stones[e.How] == "" {
			return false
		}
	}
	return true
}

// Build makes the dex from a roster.
func Build(roster []Family) (Dex, error) {
	d := Dex{Generator: gen.Version}
	for _, t := range gen.Types() {
		d.Types = append(d.Types, Type{ID: t.ID, Name: t.Name, Color: t.Color})
	}
	seen := map[string]bool{}
	for fi, f := range roster {
		first := gen.Generate(gen.Options{Seed: f.Seed, Type: f.Type, Stage: 1})
		if !Usable(first) {
			return d, fmt.Errorf("family %d (%s/%s) evolves in a way the game has no item for, or is shiny", fi, f.Seed, f.Type)
		}
		for st := 1; st <= first.Stages; st++ {
			m := gen.Generate(gen.Options{Seed: f.Seed, Type: f.Type, Stage: st})
			id := strings.ToLower(m.Name)
			if seen[id] {
				return d, fmt.Errorf("family %d (%s/%s): name %s is taken", fi, f.Seed, f.Type, m.Name)
			}
			seen[id] = true
			s := Species{
				ID: id, Num: len(d.Species) + 1, Name: m.Name, Category: m.Category,
				Entry: m.Entry, HeightM: m.HeightM, WeightKg: m.WeightKg, BodyPlan: m.BodyPlan,
				Family: fi, Role: f.Role, Stage: st, Stages: m.Stages, Legendary: m.Legendary,
				Total: m.Total, Sprite: pack(m.Sprite),
			}
			for _, t := range m.Types {
				s.Types = append(s.Types, t.ID)
			}
			v := map[string]int{}
			for _, x := range m.Stats {
				v[x.ID] = x.Value
			}
			s.Base = Base{HP: v["hp"], Atk: v["atk"], Def: v["def"], SpA: v["spa"], SpD: v["spd"], Spe: v["spe"]}
			if st < m.Stages {
				next := m.Evolution[st]
				e := &Evolution{To: strings.ToLower(next.Name)}
				if g := levelHow.FindStringSubmatch(next.How); g != nil {
					e.Level, _ = strconv.Atoi(g[1])
				} else {
					e.Item = Stones[next.How]
				}
				s.Evolution = e
			}
			d.Species = append(d.Species, s)
		}
	}
	return d, nil
}

const digits = "0123456789abcdefghijklmnopqrstuvwxyz"

func pack(s gen.Sprite) Sprite {
	var b strings.Builder
	for _, p := range s.Pixels {
		if p < 0 || p >= len(digits) {
			panic(fmt.Sprintf("sprite palette index %d doesn't fit one base-36 digit", p))
		}
		b.WriteByte(digits[p])
	}
	return Sprite{Width: s.Width, Height: s.Height, Palette: s.Palette, Pixels: b.String()}
}

// DexPath is where the dex is committed, relative to the repository root.
const DexPath = "web/static/data/species.json"

// Encode writes the dex as the committed file has it: one species per line, so a change
// to one family shows as a change to its lines.
func Encode(d Dex) ([]byte, error) {
	var b strings.Builder
	head, err := json.Marshal(struct {
		Generator string `json:"generator"`
		Types     []Type `json:"types"`
	}{d.Generator, d.Types})
	if err != nil {
		return nil, err
	}
	b.Write(head[:len(head)-1])
	b.WriteString(",\n\"species\": [\n")
	for i, s := range d.Species {
		line, err := json.Marshal(s)
		if err != nil {
			return nil, err
		}
		b.Write(line)
		if i < len(d.Species)-1 {
			b.WriteByte(',')
		}
		b.WriteByte('\n')
	}
	b.WriteString("]}\n")
	return []byte(b.String()), nil
}
