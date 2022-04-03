# S W A P  - S H O P

## Clarinet console calls

```
clarient console
```

```
// View the assets of each wallet
::get_assets_maps
```

### admin - Add nft asset to whitelist
```
(contract-call? .swap-shop-private-sale-v1 admin-add-to-whitelist 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft)
```

### mint
```
(contract-call? .sip009-nft mint tx-sender)

Events emitted
{"type":"nft_mint_event","nft_mint_event":{"asset_identifier":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft::swap-nft","recipient":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","value":"u1"}}
(ok true)
```

### list-nft

```
(contract-call? .swap-shop-private-sale-v1 list-nft 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft {buyer: tx-sender, listing-expiry: u5, nft-id: u1, price: u10000000})
```

### get-listing
```
(contract-call? .swap-shop-private-sale-v1 get-listing u1)

(ok {buyer: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, expiry: u10, nft-contract: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft, nft-id: u1, owner: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM, price: u10000000})
```