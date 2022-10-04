package api

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/mhamm84/swap-shop/server/internal/utils"
	"go.uber.org/zap"
	"net/http"
)

func (app *application) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Connection", "Close")
				app.serverErrorResponse(w, r, fmt.Errorf("%s", err))
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func (app *application) addRequestId(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		reqId := uuid.New()
		rqCtx := utils.WithReqId(r.Context(), reqId.String())
		r = r.WithContext(rqCtx)

		utils.Logger(rqCtx).Debug("Incoming request",
			zap.Any("requestURI", r.RequestURI),
			zap.Any("remoteAddress", r.RemoteAddr),
			zap.Any("method", r.Method),
		)

		next.ServeHTTP(w, r)
	})
}
