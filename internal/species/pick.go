package species

import (
	"fmt"
	"strings"

	"github.com/romaine-life/pokemon-generator/gen"
)

// Slot asks Pick for one family: its type, and for the starters an exact number of stages.
type Slot struct {
	Type   string
	Role   string
	Stages int // 0: any
}

// Slots is the roster's shape: three starters, fifty regular families spread over the
// types the way a region's wild creatures are (more normal, bug, water and flying), and
// three legendaries.
func Slots() []Slot {
	s := []Slot{{"grass", "starter", 3}, {"fire", "starter", 3}, {"water", "starter", 3}}
	counts := []struct {
		t string
		n int
	}{
		{"normal", 4}, {"bug", 4}, {"flying", 4}, {"water", 5}, {"grass", 4}, {"fire", 2},
		{"electric", 3}, {"poison", 2}, {"ground", 2}, {"rock", 3}, {"fighting", 2},
		{"psychic", 2}, {"ghost", 3}, {"ice", 2}, {"dragon", 2}, {"dark", 2}, {"steel", 2},
		{"fairy", 2},
	}
	for _, c := range counts {
		for i := 0; i < c.n; i++ {
			s = append(s, Slot{Type: c.t})
		}
	}
	return append(s, Slot{"psychic", "legendary", 1}, Slot{"electric", "legendary", 1}, Slot{"ice", "legendary", 1})
}

// Pick finds a family for each slot by trying seeds pokosmari-<type>-<n> in order. A family
// qualifies when Usable, legendary exactly when its slot is, every stage's name is new and
// at most ten letters (the game's name width), and a starter's evolutions are all by level.
func Pick(slots []Slot) ([]Family, error) {
	var out []Family
	taken := map[string]bool{}
	tried := map[string]int{}
	for _, sl := range slots {
		found := false
		for tried[sl.Type] < 100000 && !found {
			tried[sl.Type]++
			seed := fmt.Sprintf("pokosmari-%s-%d", sl.Type, tried[sl.Type])
			m := gen.Generate(gen.Options{Seed: seed, Type: sl.Type, Stage: 1})
			if !Usable(m) || m.Legendary != (sl.Role == "legendary") || (sl.Stages != 0 && m.Stages != sl.Stages) {
				continue
			}
			if sl.Role == "starter" && !allLevels(m) {
				continue
			}
			names := make([]string, 0, m.Stages)
			ok := true
			for _, e := range m.Evolution {
				n := strings.ToLower(e.Name)
				if len(n) > 10 || taken[n] || contains(names, n) {
					ok = false
				}
				names = append(names, n)
			}
			if !ok {
				continue
			}
			for _, n := range names {
				taken[n] = true
			}
			out = append(out, Family{Seed: seed, Type: sl.Type, Role: sl.Role})
			found = true
		}
		if !found {
			return nil, fmt.Errorf("no family found for %+v", sl)
		}
	}
	return out, nil
}

func allLevels(m gen.Monster) bool {
	for _, e := range m.Evolution[1:] {
		if !levelHow.MatchString(e.How) {
			return false
		}
	}
	return true
}

func contains(list []string, s string) bool {
	for _, x := range list {
		if x == s {
			return true
		}
	}
	return false
}
