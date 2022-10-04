package data

import (
	"database/sql/driver"
	"encoding/json"
	"github.com/pkg/errors"
	"time"
)

type Meta map[string]interface{}

func (e Meta) Value() (driver.Value, error) {
	return json.Marshal(e)
}

func (e *Meta) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &e)
}

type TradeStatus = uint8

const (
	CONTRACT_PENDING TradeStatus = iota + 1
	CONTRACT_DEPLOYED
)

type Trade struct {
	Id           int64         `json:"id"`
	Status       TradeStatus   `json:"status"`
	CreatedAt    time.Time     `json:"createdAt"`
	TraderOne    Trader        `json:"traderOne"`
	TraderTwo    Trader        `json:"traderTwo"`
	LockedUntil  uint64        `json:"lockedUntil"`
	NftTransfers []NftTransfer `json:"nftTransfers"`
	StxTransfers []StxTransfer `json:"stxTransfers"`
	FtTransfer   []FtTransfer  `json:"ftTransfer"`
}

type Trader struct {
	StxAddress string
}

type Asset struct {
	Contract string `json:"contract"`
	Meta     Meta   `json:"meta"`
}

type NftTransfer struct {
	Nft      Asset
	Id       uint
	Sender   Trader
	Receiver Trader
}

type StxTransfer struct {
	Amount   uint64
	Sender   Trader
	Receiver Trader
}

type FtTransfer struct {
	Ft       Asset
	Amount   uint
	Sender   Trader
	Receiver Trader
}
