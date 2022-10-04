package api

import (
	"fmt"
	"github.com/mhamm84/swap-shop/server/internal/utils"
	"go.uber.org/zap"
	"net/http"
)

func (app *application) errorResponse(w http.ResponseWriter, r *http.Request, status int, msg interface{}) {
	errorData := envelope{
		"error": msg,
	}
	err := app.WriteData(w, status, errorData, nil)
	if err != nil {
		utils.Logger(r.Context()).Error("error writing errorResponse data",
			zap.Any("request", &r),
			zap.Int("httpStatus", status),
			zap.Any("msg", msg),
		)
	}
}

func (app *application) serverErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logError(r, err)
	app.errorResponse(w, r, http.StatusInternalServerError, "the server encountered a problem and could not process your request")
}

func (app *application) badRequestResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logError(r, err)
	app.errorResponse(w, r, http.StatusBadRequest, "the server encountered a bad request")
}

func (app *application) notFoundHandler(w http.ResponseWriter, r *http.Request) {
	msg := "The requested resource could not be found"
	app.errorResponse(w, r, http.StatusNotFound, msg)
}

func (app *application) methodNotAllowedResponse(w http.ResponseWriter, r *http.Request) {
	message := fmt.Sprintf("the %s method is not supported for this resource", r.Method)
	app.errorResponse(w, r, http.StatusMethodNotAllowed, message)
}

func (app *application) logError(r *http.Request, err error) {
	utils.Logger(r.Context()).Error("error writing errorResponse data",
		zap.Any("request", &r),
		zap.Error(err),
	)
}
