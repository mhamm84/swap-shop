package service

import (
	"context"
	"embed"
	"fmt"
	"github.com/mhamm84/swap-shop/server/internal/data"
	"github.com/mhamm84/swap-shop/server/internal/utils"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/buffer"
	"os"
	"text/template"
)

//go:embed "templates"
var templateFS embed.FS

type tradeService struct {
}

func NewTradeService() TradeService {
	return &tradeService{}
}

func (t tradeService) CreateTrade(ctx context.Context, inputTrade *CreateTrade) (*data.Trade, error) {
	trade := &data.Trade{}

	// TODO - Validate
	// TODO - Persist the Trade

	templateFilename := "swapshop-private-trade-v1.tmpl"

	tmpl, err := template.New(templateFilename).ParseFS(templateFS, "templates/"+templateFilename)
	if err != nil {
		msg := fmt.Sprintf("error parsing %s", templateFilename)
		utils.Logger(ctx).Error(msg, zap.Error(err))
		return nil, errors.Wrap(err, msg)
	}

	clarityContract := new(buffer.Buffer)
	err = tmpl.Execute(clarityContract, &inputTrade)
	if err != nil {
		msg := fmt.Sprintf("error executing %s", templateFilename)
		utils.Logger(ctx).Error(msg, zap.Error(err), zap.Any("inputTrade", &inputTrade))
		return nil, errors.Wrap(err, msg)
	}

	err = writeClarityFile(ctx, clarityContract)
	if err != nil {
		return nil, err
	}

	return trade, nil

}

func writeClarityFile(ctx context.Context, clarityContract *buffer.Buffer) error {
	fileName := "swapshop-private-trade-v1.clar"
	contractFile, err := os.OpenFile(fileName, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		msg := fmt.Sprintf("Unable to open file %s", fileName)
		utils.Logger(ctx).Error(msg, zap.Error(err))
		return errors.Wrap(err, msg)
	}

	_, err = contractFile.Write(clarityContract.Bytes())
	if err != nil {
		msg := fmt.Sprintf("Unable to write bytes into file %s", fileName)
		utils.Logger(ctx).Error(msg, zap.Error(err))
		return errors.Wrap(err, msg)
	}
	return nil
}
