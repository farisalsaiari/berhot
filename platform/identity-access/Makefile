SERVICE_NAME := identity-access
BINARY := bin/server
GO_FILES := $(shell find . -name '*.go' -not -path './vendor/*')
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TIME := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)

.PHONY: build run test lint clean docker

build:
	CGO_ENABLED=0 go build -ldflags="-w -s -X main.version=$(VERSION) -X main.buildTime=$(BUILD_TIME)" -o $(BINARY) ./cmd/server/main.go

run:
	go run ./cmd/server/main.go

test:
	go test -race -coverprofile=coverage.out ./...

test-verbose:
	go test -race -v ./...

lint:
	golangci-lint run ./...

clean:
	rm -rf bin/ coverage.out

docker:
	docker build -t berhot/$(SERVICE_NAME):$(VERSION) -f Dockerfile .

.DEFAULT_GOAL := build
