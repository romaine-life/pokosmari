// Package web holds the game's files: the page, its scripts and the dex.
package web

import (
	"embed"
	"io/fs"
)

//go:embed static
var files embed.FS

// Static is the game's files, rooted at static/.
func Static() fs.FS {
	sub, err := fs.Sub(files, "static")
	if err != nil {
		panic(err)
	}
	return sub
}
