

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
(define-public (list-nft (nft-asset <nft-trait>) (listing-details {nft-id: uint, buyer: principal, price: uint, listing-expiry: uint}))
    (begin
        (asserts! (is-in-whitelist nft-asset) (err ERR_NOT_WHITELISTED))
        (asserts! (> (get nft-id listing-details) u0) (err ERR_NFT_ID_INVALID))
        (asserts! (> (get price listing-details) u0) (err ERR_PRICE_TOO_LOW))
        (asserts! (> (get listing-expiry listing-details) block-height) (err ERR_EXPIRY_IN_PAST))

        (let 
                (
                    (owner (unwrap! (get-owner nft-asset (get nft-id listing-details)) (err ERR_NFT_OWNER_NOT_FOUND)))
                    (nft-contract (contract-of nft-asset))
                    (listing-id (+ u1 (var-get next-listing-id)))
                )
                
                (asserts! (is-eq owner tx-sender) (err ERR_TX_SENDER_NOT_OWNER))

                (map-set listings listing-id
                    {
                        owner: owner,
                        nft-contract: nft-contract, 
                        nft-id: (get nft-id listing-details),
                        buyer: (get buyer listing-details),
                        price: (get price listing-details),
                        expiry: (get listing-expiry listing-details)
                    }
                )
                (var-set next-listing-id listing-id)

                (ok listing-id)
        )
    )
)

;; unlist
(define-public (unlist (listing-id uint))
    (let 
        (
            (listing (unwrap-panic (get-listing listing-id)))
        )
        (asserts! (is-eq (get owner listing) tx-sender) ERR_TX_SENDER_NOT_OWNER)
        (map-delete listings listing-id)

        (print {
            type:   "nft-private-sale",
            action: "unlist",
            data: { listing: listing }
        })
        (ok true)
    )  
)

;; A D M I N

(define-public (admin-add-nft-asset-to-whitelist (nft-asset <nft-trait>)) 
    (begin  
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
        (ok (map-insert whitelist (contract-of nft-asset) true))
    )
)

(define-read-only (admin-check-nft-asset-whitelisted (nft-asset <nft-trait>))
    (default-to false (map-get? whitelist (contract-of nft-asset)))
)

(define-public (admin-update-nft-asset-in-whitelist (nft-asset <nft-trait>) (flag bool)) 
    (begin  
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
        (ok (map-set whitelist (contract-of nft-asset) flag))
    )
)

(define-public (admin-set-contract-owner (new-owner principal))
    (begin 
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
        (ok (var-set contract-owner new-owner))
    )
)


;; R E A D  O N L Y

(define-read-only (is-in-whitelist (nft-asset <nft-trait>))
    (default-to false (map-get? whitelist (contract-of nft-asset)))
)

(define-read-only (get-listing (listing-id uint))
    (begin  
        (asserts! (> listing-id u0) (err ERR_INVALID_LISTING_ID))
         (let 
            (
                (listing  (unwrap! (map-get? listings listing-id) (err ERR_NO_LISTING)))
            )
            (ok listing)
         )
    )   
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
        nft-contract: principal, 
        nft-id: uint,
        buyer: principal,
        price: uint,
        expiry: uint
    }
)

;; E R R O R S

(define-constant ERR_NFT_GET_OWNER (err u100))
(define-constant ERR_NFT_ID_INVALID (err u101))
(define-constant ERR_TX_SENDER_NOT_OWNER (err u102))
(define-constant ERR_NFT_OWNER_NOT_FOUND (err u103))
(define-constant ERR_UNAUTHORIZED (err u104))
(define-constant ERR_NOT_WHITELISTED (err u105))
(define-constant ERR_PRICE_TOO_LOW (err u106))
(define-constant ERR_EXPIRY_IN_PAST (err u107))
(define-constant ERR_NO_LISTING (err u108))
(define-constant ERR_INVALID_LISTING_ID (err u109))

;; W H I T E  L I S T

(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-ape-club-nft true)
(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-robot-nft true)
(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-robot-component-nft true)
(map-insert whitelist 'SP176ZMV706NZGDDX8VSQRGMB7QN33BBDVZ6BMNHD.project-indigo-landmarks true)
(map-insert whitelist 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.stacks-punks-v3 true)
