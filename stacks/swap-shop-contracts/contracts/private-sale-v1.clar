

;; private-sale-v1
;; <add a description here>

;; S I P 0 0 9 - N F T

;; MAINNET
;; (use-trait nft 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; TESTNET
;; (impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)

;; DEV - SIP010 - nft-trait
(use-trait nft-trait .nft-trait.nft-trait)

;; P U B L I C 

;; list-nft

;; The sender lists an nft avaiable for sale at a set price for a set buyer
;; The listing has an expiry on it which is the block height of the stacks blockchain in  the future
(define-public (list-nft (nft-asset <nft-trait>) (listing-details {nftId: uint, buyer: principal, price: uint, expiry: uint}))
    (begin
        (asserts! (is-whitelisted nft-asset) (err ERR_NOT_WHITELISTED))
        (asserts! (> (get nftId listing-details) u0) (err ERR_NFT_ID_INVALID))
        (asserts! (> (get price listing-details) u0) (err ERR_PRICE_TOO_LOW))
        (asserts! (> (get expiry listing-details) block-height) (err ERR_EXPIRY_IN_PAST))

        (let 
                (
                    (owner (unwrap! (get-owner nft-asset (get nftId listing-details)) (err ERR_NFT_OWNER_NOT_FOUND)))
                    (nft-contract (contract-of nft-asset))
                    (listing-id (+ u1 (var-get next-listing-id)))
                )
                
                (asserts! (is-eq owner tx-sender) (err ERR_TX_SENDER_NOT_OWNER))

                (map-set listings listing-id
                    {
                        owner: owner,
                        nftContract: nft-contract, 
                        nftId: (get nftId listing-details),
                        buyer: (get buyer listing-details),
                        price: (get price listing-details),
                        expiry: (get expiry listing-details)
                    }
                )
                (var-set next-listing-id listing-id)
                (print {
                    type:   "nft-private-sale",
                    action: "list",
                    data: { listing: (map-get? listings listing-id) }
                })
                (ok listing-id)
        )
    )
)

;; unlist
(define-public (unlist (listing-id uint))
    (let 
        (
            (listing (unwrap! (get-listing listing-id) (err ERR_NO_LISTING) ))
        )
        (asserts! (is-eq (get owner listing) tx-sender) (err ERR_TX_SENDER_NOT_OWNER))
        (map-delete listings listing-id)

        (print {
            type:   "nft-private-sale",
            action: "unlist",
            data: { listing: listing }
        })
        (ok true)
    )  
)

(define-public (purchase (nft-asset <nft-trait>) (listing-id uint) (price uint) ) 
    (begin 
        (let 
            (
                (listing (unwrap! (get-listing listing-id) (err ERR_NO_LISTING) ))
                (listing-price (get price listing))
                (listing-owner (get owner listing))
                (listing-buyer (get buyer listing))
                (listing-expiry (get expiry listing))
                (listing-nft-contract (get nftContract listing))
                (listing-nft-id (get nftId listing))
            )
            (asserts! (is-eq listing-buyer tx-sender) (err ERR_TX_SENDER_NOT_BUYER))
            (asserts! (is-eq listing-price price) (err ERR_INVALID_PURCHASE_PRICE))
            (asserts! (> listing-expiry  block-height) (err ERR_LISTING_EXPIRED))
            (asserts! (is-eq (contract-of nft-asset) listing-nft-contract) (err ERR_INCORRECT_NFT_ASSET))

            (try! (contract-call? nft-asset transfer listing-nft-id listing-owner tx-sender))
            (try! (stx-transfer? listing-price tx-sender listing-owner))
            (print-listing listing)    
        )
    )
)

(define-private (print-listing (listing { 
                        owner: principal,
                        nftContract: principal, 
                        nftId: uint,
                        buyer: principal,
                        price: uint,
                        expiry: uint
                    }))
    (begin  
        (print {
                    type:   "nft-private-sale",
                    action: "list",
                    data: { listing: (get owner listing) }
                })
        (ok true)
    )
    
)

;; A D M I N

(define-public (admin-add-nft-asset-to-whitelist (nft-asset <nft-trait>)) 
    (begin  
        (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))
        (ok (map-insert whitelist (contract-of nft-asset) true))
    )
)

(define-public (admin-update-nft-asset-in-whitelist (nft-asset <nft-trait>) (flag bool)) 
    (begin  
        (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))
        (ok (map-set whitelist (contract-of nft-asset) flag))
    )
)

(define-public (admin-set-contract-owner (new-owner principal))
    (begin 
        (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))
        (ok (var-set contract-owner new-owner))
    )
)


;; R E A D  O N L Y

(define-read-only (is-whitelisted (nft-asset <nft-trait>))
    (default-to false (map-get? whitelist (contract-of nft-asset)))
)

;; (define-read-only (get-listing (listing-id uint))
;;     (map-get? listings listing-id)
;; )

(define-read-only (get-listing (listing-id uint))
    (ok (unwrap! (map-get? listings listing-id) (err ERR_NO_LISTING)))
)


;; P R I V A T E

;; get-owner
(define-private (get-owner (nft-asset <nft-trait>) (nft-id uint))
    (unwrap-panic (contract-call? nft-asset get-owner nft-id))
)    

;; S T O R A G E

;; owner of the contract
(define-data-var contract-owner principal tx-sender)

;; current id listing
(define-data-var next-listing-id uint u0)

;; whitelist of nft's
(define-map whitelist principal bool)

;; listings of private nft sales
(define-map listings 
    uint
    { 
        owner: principal,
        nftContract: principal, 
        nftId: uint,
        buyer: principal,
        price: uint,
        expiry: uint
    }
)

;; E R R O R S

(define-constant ERR_NFT_ID_INVALID u100)
(define-constant ERR_TX_SENDER_NOT_OWNER u101)
(define-constant ERR_NFT_OWNER_NOT_FOUND u102)
(define-constant ERR_UNAUTHORIZED u103)
(define-constant ERR_NOT_WHITELISTED u104)
(define-constant ERR_PRICE_TOO_LOW u105)
(define-constant ERR_EXPIRY_IN_PAST u106)
(define-constant ERR_NO_LISTING u107)
(define-constant ERR_TX_SENDER_NOT_sBUYER u108)
(define-constant ERR_INVALID_PURCHASE_PRICE u109)
(define-constant ERR_LISTING_EXPIRED u110)
(define-constant ERR_INCORRECT_NFT_ASSET u111)
(define-constant ERR_TX_SENDER_NOT_BUYER u112)


;; W H I T E  L I S T

(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-ape-club-nft true)
(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-robot-nft true)
(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-robot-component-nft true)
(map-insert whitelist 'SP176ZMV706NZGDDX8VSQRGMB7QN33BBDVZ6BMNHD.project-indigo-landmarks true)
(map-insert whitelist 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.stacks-punks-v3 true)
