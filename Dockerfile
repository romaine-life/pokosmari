# pokosmari: one Go binary serving the game's files (embedded) and logging the errors the
# game reports.
FROM artifacts.home.romaine.life/dockerhub/library/golang:1.26-alpine@sha256:30b1e546a9c7fa3b747c2bdba3a0c7bdf3a02ebb4c5b8405d2f948d7e8aac4ec AS build
WORKDIR /src
ENV GOPROXY=https://artifacts.home.romaine.life/go/go,direct
ENV GOMAXPROCS=4 GOFLAGS=-p=4
# Our Go modules (github.com/romaine-life/*) come from Forgejo through git, which has a new tag
# at once; the home proxy has it later. The image suite passes GOPRIVATE and GONOSUMDB, and the
# git settings, signed in, as the secret go-private-git for go mod download alone
# (pipeline-templates suites/README.md, Our Go modules in an image; PIPT-61).
RUN sed -i 's#https\?://dl-cdn.alpinelinux.org/alpine#https://artifacts.home.romaine.life/alpine/alpine#' /etc/apk/repositories && apk add --no-cache git
ARG GOPRIVATE GONOSUMDB
# The release this build is (the web-app suite passes the tag): the server serves the game
# under /v/<release>/, so browsers never mix two releases' files.
ARG APP_VERSION=dev

COPY go.mod go.sum ./
RUN --mount=type=secret,id=go-private-git,target=/root/.gitconfig --mount=type=cache,id=pokosmari-go-mod,target=/go/pkg/mod go mod download
COPY cmd ./cmd
COPY internal ./internal
COPY web/embed.go ./web/
COPY web/static ./web/static
RUN --mount=type=cache,id=pokosmari-go-mod,target=/go/pkg/mod \
    --mount=type=cache,id=pokosmari-go-build,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -trimpath -ldflags="-s -w -X main.version=${APP_VERSION}" -o /out/pokosmari ./cmd/pokosmari

FROM artifacts.home.romaine.life/gcr/distroless/static-debian12:nonroot@sha256:afa5c872c891853ca7fcf1f12c3edb23f7eeef36189728842dd51042ff57f7ab
COPY --from=build /out/pokosmari /pokosmari
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/pokosmari"]
