package service

type TradeService interface {
}

type CreateTrade struct {
	TraderOne    string `json:"trader_one"`
	TraderTwo    string `json:"trader_two"`
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
