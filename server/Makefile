# Include variables from the .envrc file
include .envrc

## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

## confirm: create the new confirm target.
.PHONY: confirm
confirm:
	@echo -n 'Are you sure? [y/N] ' && read ans && [ $${ans:-N} = y ]

# ==================================================================================== #
# QUALITY CONTROL
# ==================================================================================== #
## api/audit: tidy dependencies and format, vet and test all code
.PHONY: api/audit
api/audit:
	@echo 'Tidying and verifying module dependencies...'
	go mod tidy
	go mod verify
	@echo 'Formatting code...'
	go fmt ./...
	@echo 'Vetting code...'
	go vet ./...
	staticcheck ./...

.PHONY: api/run
api/run: api/audit
	@echo 'Running swapshop server...'
	go run ./cmd/swapshop/ run-api --cors-trusted-origins="http://localhost:9090" --log-level="DEBUG"

## api/build: build local go binary and linux_amd_64 binary
.PHONY: api/build
api/build: api/audit
	@echo "Building swapshop API..."
	go build ./cmd/swapshop/
	GOOS=linux GOARCH=amd64 go build -o=./docker/bin/linux_amd64/swapshop ./cmd/swapshop/

## dev/docker/build: build docker image for the swap shop api
.PHONY: dev/docker/build
dev/docker/build: api/build
	@echo "Building dev Docker env"
	docker-compose -f docker-compose-dev.yml build

## dev/docker/up: create and start swap shop API containers for dev
.PHONY: dev/docker/up
dev/docker/up: dev/docker/build
	@echo "Creating and starting Swap Shops API containers..."
	docker-compose -f docker-compose-dev.yml up -d

## dev/docker/start: start all docker containers for dev
.PHONY: dev/docker/start
dev/docker/start:
	@echo "Starting Swap Shop API stack..."
	docker-compose -f docker-compose-dev.yml start

## dev/docker/stop: stop all docker containers
.PHONY: dev/docker/stop
dev/docker/stop:
	@echo "Stopping Swap Shop API stack..."
	docker-compose -f docker-compose-dev.yml stop

## dev/docker/down: stop and remove all docker containers
.PHONY: dev/docker/down
dev/docker/down:
	@echo "Stopping & removing Swap Shop API containers..."
	docker-compose -f docker-compose-dev.yml down

