
;; swap-shop-v1
;; <add a description here>

;; S I P 0 0 9 - N F T

;; MAINNET
;; (use-trait nft 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; TESTNET
;; (impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)

;; DEV - SIP010 - nft-trait
(use-trait nft-trait .nft-trait.nft-trait)

;; S I P 0 1 0 - F T

;; MAINNET
;; (use-trait ft 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; DEV
(use-trait ft-trait .ft-trait.sip-010-trait)


;;              P U B L I C


(define-public (create-deal 
        (source-user principal) 
        (target-user principal) 
        (expiry-block-height uint)
        (source-user-nfts (list 20 {nft-contract: principal, item-id: uint}))
        (source-user-tokens (optional (list 5 {token-contract: principal, item-id: uint})))
        (target-user-nfts (list 20 {nft-contract: principal, item-id: uint}))
        (target-user-tokens (optional (list 5 {token-contract: principal, item-id: uint})))

    )
    (begin 
        (asserts! (is-eq source-user tx-sender) (err ERR_SENDER_NOT_SOURCE_USER))
        (asserts! (> expiry-block-height block-height) (err ERR_BLOCK_HEIGHT_IN_PAST))
        (asserts! (> (len source-user-nfts) u0) (err ERR_NO_SOURCE_NFTS))
        (asserts! (> (len target-user-nfts) u0) (err ERR_NO_TARGET_NFTS))

        (print source-user)
        (ok true)
    )
)

;;              R E A D - O N L Y


;;              P R I V A T E


;;              E R R O R  C O D E S
(define-constant ERR_SENDER_NOT_SOURCE_USER 100)
(define-constant ERR_BLOCK_HEIGHT_IN_PAST 101)
(define-constant ERR_NO_SOURCE_NFTS 102)
(define-constant ERR_NO_TARGET_NFTS 103)

;;              S T O R A G E

(define-constant CONTRACT-OWNER tx-sender)

;; data maps and vars
;;
(define-map user-offers 
    {user: principal} {offer-ids: (list 100 uint)}
)

(define-map offers-detail
    {   source-user: principal, 
        target-user: principal
    }
    {   expiry-block-height:    uint,
        source-user-nfts:       (list 20    {nft-contract:      principal, item-id: uint}),
        source-user-tokens:     (list 5     {token-contract:    principal, item-id: uint}),
        target-user-nfts:       (list 20    {nft-contract:      principal, item-id: uint}),
        target-user-tokens:     (list 5     {token-contract:    principal, item-id: uint}),
    }
)


