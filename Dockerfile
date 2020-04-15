# Build UI
FROM node:10 as ui

ARG API_ENDPOINT
ENV API_ENDPOINT=${API_ENDPOINT}

ARG UI_PUBLIC_URL
ENV UI_PUBLIC_URL=${UI_PUBLIC_URL}

RUN mkdir -p /app
WORKDIR /app

COPY ui/package*.json /app/
RUN npm install
COPY ui /app

RUN npm run build -- --public-url $UI_PUBLIC_URL

# Build API
FROM golang:alpine AS api

WORKDIR /app
COPY api /app

RUN go get -d -v ./...
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o photoview .

# Copy api and ui to production environment
FROM alpine:latest

COPY --from=ui /app/dist /ui
COPY --from=api /app/database/migrations /database/migrations
COPY --from=api /app/photoview /app/photoview

EXPOSE 80

ENTRYPOINT ["/app/photoview"]
