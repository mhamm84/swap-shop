###################################################
# Plain env as basement and for local development #
###################################################
FROM golang:alpine as env

RUN apk add --no-cache ca-certificates git

FROM env as dev
# Hot reload using CompileDaemon
RUN go install github.com/githubnemo/CompileDaemon@latest

WORKDIR /swapshop-api
ADD . .

EXPOSE 9081 9081
ENTRYPOINT CompileDaemon -build "go build ./cmd/swapshop/" -command="./swapshop run-api" -polling

##########################################################
# Prepare a build container with all dependencies inside #
##########################################################
FROM env as builder

WORKDIR /swapshop-api
ADD . .

RUN go build -o /go/bin/swapshop ./cmd/swapshop/

###########################################
# Create clean container with binary only #
###########################################
FROM alpine as exec

RUN apk add --update bash ca-certificates

WORKDIR /app
COPY --from=builder /go/bin/swapshop ./

EXPOSE 9081 9081
CMD ["./swapshop", "run-api"]