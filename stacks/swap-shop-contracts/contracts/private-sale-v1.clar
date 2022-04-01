;; private-sale-v1
;; <add a description here>

;; S I P 0 0 9 - N F T

;; MAINNET
;; (use-trait nft 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; TESTNET
;; (impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)

;; DEV - SIP010 - nft-trait
(use-trait nft-trait .nft-trait.nft-trait)
(use-trait commission .swap-shop-commission-trait.commission)

;; P U B L I C 

;; list-nft

;; The sender lists an nft avaiable for sale at a set price for a set buyer
;; The listing has an expiry on it which is the block height of the stacks blockchain in  the future
(define-public  (create-listing (nft-asset <nft-trait>) (listing-details {nftId: uint, buyer: principal, price: uint, expiry: uint}))
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

                (map-set listings {listingId: listing-id} {
                        owner: owner,
                        nftContract: nft-contract, 
                        nftId: (get nftId listing-details),
                        buyer: (get buyer listing-details),
                        price: (get price listing-details),
                        expiry: (get expiry listing-details),
                    }
                )

                (try! (contract-call? nft-asset transfer (get nftId listing-details) tx-sender (as-contract tx-sender)))
                (var-set next-listing-id listing-id)
                (ok listing-id)
        )
    )
)

(define-public (unlist (nft-asset <nft-trait>) (listing-id uint))
    (begin
        (asserts! (> listing-id u0) (err ERR_INVALID_LISTING_ID))
        (let 
            (
                (listing (unwrap! (get-listing listing-id) (err ERR_NO_LISTING) ))
                (owner (get owner listing))
                (nft-id (get nftId listing))
            )
            (print-listing "unlist" listing)
            (asserts! (is-eq owner tx-sender) (err ERR_TX_SENDER_NOT_OWNER))
            (asserts! (is-whitelisted nft-asset) (err ERR_NOT_WHITELISTED))

            (try! (as-contract (contract-call? nft-asset transfer nft-id tx-sender owner)))
            (ok (map-delete listings {listingId: listing-id}))
        )  
    )
)

(define-public (purchase (nft-asset <nft-trait>) (listing-id uint) ) 
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
            (asserts! (is-eq tx-sender listing-buyer) (err ERR_TX_SENDER_NOT_OWNER))
            (asserts! (> listing-expiry  block-height) (err ERR_LISTING_EXPIRED))
            (asserts! (is-eq (contract-of nft-asset) listing-nft-contract) (err ERR_INCORRECT_NFT_ASSET))

            (try! (as-contract (contract-call? nft-asset transfer listing-nft-id tx-sender listing-buyer)))
            (try! (stx-transfer? listing-price tx-sender listing-owner ))
            ;; #[filter(listing)]
            (print-listing "purchase" listing)
            (ok true)
        )
    )
)

;; A D M I N

;; admin-add-nft-asset-to-whitelist
(define-public (admin-add-nft-asset-to-whitelist (nft-asset <nft-trait>)) 
    (begin  
        (asserts! (has-role ROLE_WHITELIST_ADMIN tx-sender) (err ERR_UNAUTHORIZED))
        ;; #[filter(nft-asset)]
        (ok (map-insert whitelist (contract-of nft-asset) true))
    )
)

;; admin-update-nft-asset-in-whitelist
(define-public (admin-update-nft-asset-in-whitelist (nft-asset <nft-trait>) (flag bool)) 
    (begin  
        (asserts! (has-role ROLE_WHITELIST_ADMIN tx-sender) (err ERR_UNAUTHORIZED))
        ;; #[filter(nft-asset, flag)]
        (ok (map-set whitelist (contract-of nft-asset) flag))
    )
)

;; R E A D  O N L Y

;; is-whitelisted
(define-read-only (is-whitelisted (nft-asset <nft-trait>))
    (default-to false (map-get? whitelist (contract-of nft-asset)))
)

;; get-listing
(define-read-only (get-listing (listing-id uint))
    (begin 
        (asserts! (> listing-id u0) (err ERR_INVALID_LISTING_ID))
        (ok (unwrap! (map-get? listings {listingId: listing-id}) (err ERR_NO_LISTING)))
    )
)

;; has-role 
(define-read-only (has-role (role uint) (account principal))
    (default-to false (get allowed (map-get? roles {role: role, account: account})))
)


;; P R I V A T E

;; get-owner
(define-private (get-owner (nft-asset <nft-trait>) (nft-id uint))
    (unwrap-panic (contract-call? nft-asset get-owner nft-id))
)    

;; print-listing
(define-private (print-listing (action (string-ascii 25)) (listing { 
                        owner: principal,
                        nftContract: principal, 
                        nftId: uint,
                        buyer: principal,
                        price: uint,
                        expiry: uint}))
    (print { type: "nft-private-sale", action: action, data: { listing: (get owner listing)}})
)

;; S T O R A G E

;; has the deployed contract been initalized
(define-data-var is-initialized bool false)

;; owner of the contract
(define-constant contract-owner tx-sender)

;; current id listing
(define-data-var next-listing-id uint u0)

;; whitelist of nft's
(define-map whitelist principal bool)

;; listings of private nft sales
(define-map listings 
    {   listingId: uint    }
    { 
        owner: principal,
        nftContract: principal, 
        nftId: uint,
        buyer: principal,
        price: uint,
        expiry: uint
    }
)

(define-map roles {role: uint, account: principal} {allowed: bool})

(define-map commissions principal bool)


;; E R R O R S

(define-constant ERR_NFT_ID_INVALID u1000)
(define-constant ERR_TX_SENDER_NOT_OWNER u1001)
(define-constant ERR_NFT_OWNER_NOT_FOUND u1002)
(define-constant ERR_UNAUTHORIZED u1003)
(define-constant ERR_NOT_WHITELISTED u1004)
(define-constant ERR_PRICE_TOO_LOW u1005)
(define-constant ERR_EXPIRY_IN_PAST u1006)
(define-constant ERR_NO_LISTING u1007)
(define-constant ERR_TX_SENDER_NOT_sBUYER u1008)
(define-constant ERR_INVALID_PURCHASE_PRICE u1009)
(define-constant ERR_LISTING_EXPIRED u1010)
(define-constant ERR_INCORRECT_NFT_ASSET u1011)
(define-constant ERR_TX_SENDER_NOT_BUYER u1012)
(define-constant ERR_TX_SENDER_NOT_DEPLOYER u1013)
(define-constant ERR_INVALID_LISTING_ID u1014)

;; ROLES
(define-constant ROLE_WHITELIST_ADMIN u1)

(map-insert roles {role: ROLE_WHITELIST_ADMIN, account: contract-owner} {allowed: true})

;; W H I T E  L I S T

(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-ape-club-nft true)
(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-robot-nft true)
(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-robot-component-nft true)
(map-insert whitelist 'SP176ZMV706NZGDDX8VSQRGMB7QN33BBDVZ6BMNHD.project-indigo-landmarks true)
(map-insert whitelist 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.stacks-punks-v3 true)
