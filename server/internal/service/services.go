package service

import (
	"context"
	"github.com/mhamm84/swap-shop/server/internal/data"
)

type ServicesModel struct {
	TradeService TradeService
}

func NewServicesModel() ServicesModel {

	return ServicesModel{
		TradeService: NewTradeService(),
	}
}

type TradeService interface {
	CreateTrade(ctx context.Context, inputTrade *CreateTrade) (*data.Trade, error)
}

type CreateTrade struct {
	Trader1      string `json:"trader_1"`
	Trader2      string `json:"trader_2"`
	LockedUntil  uint64 `json:"locked_until"`
	NftTransfers []struct {
		Contract string `json:"contract"`
		Id       uint64 `json:"id"`
		Sender   string `json:"sender"`
		Receiver string `json:"receiver"`
	} `json:"nft_transfers"`
	FtTransfers []struct {
		Contract string `json:"contract"`
		Amount   uint   `json:"amount"`
		Sender   string `json:"sender"`
		Receiver string `json:"receiver"`
	} `json:"ft_transfers,omitempty"`
	StxTransfers []struct {
		Amount   uint64 `json:"amount"`
		Sender   string `json:"sender"`
		Receiver string `json:"receiver"`
	} `json:"stx_transfers,omitempty"`
}
