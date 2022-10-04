package api

import (
	"github.com/julienschmidt/httprouter"
	"net/http"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()
	router.NotFound = http.HandlerFunc(app.notFoundHandler)
	router.MethodNotAllowed = http.HandlerFunc(app.methodNotAllowedResponse)

	router.HandlerFunc(http.MethodGet, "/v1/health", app.healthCheckHandler)

	router.HandlerFunc(http.MethodPost, "/v1/trade", app.createTradeHandler)

	return app.recoverPanic(app.addRequestId(router))
}
