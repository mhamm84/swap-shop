package api

import (
	"github.com/mhamm84/swap-shop/server/internal/service"
	"github.com/mhamm84/swap-shop/server/internal/utils"
	"go.uber.org/zap"
	"net/http"
)

func (app *application) createTradeHandler(w http.ResponseWriter, r *http.Request) {

	tradeInput := service.CreateTrade{}

	err := app.ReadData(w, r, &tradeInput)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	utils.Logger(r.Context()).Debug("creating new trade",
		zap.Any("proposed trade", tradeInput),
	)

	// TODO - Create the Service
	env := envelope{
		"msg": "Success",
	}
	app.WriteData(w, http.StatusCreated, env, nil)
}
