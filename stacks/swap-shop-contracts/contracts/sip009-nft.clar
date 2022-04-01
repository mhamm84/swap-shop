(impl-trait .nft-trait.nft-trait)

(define-non-fungible-token swap-nft uint)

;; Last token ID, limited to uint range

(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
    (ok none)
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? swap-nft token-id))
)


(define-public (transfer (token-id  uint) (sender principal) (recipient principal))
    (begin 

        (asserts! (is-eq sender tx-sender) (err ERR_UNAUTHORIZED))
        (asserts! (> token-id u0) (err ERR_INVALID_TOKEN_ID))
        ;; #[filter(recipient)]
        (nft-transfer? swap-nft token-id sender recipient)
    )
)

(define-public (mint (recipient principal))
    (let
        ( 
            (next-token-id (+ (var-get last-token-id) u1))
        )
        ;; #[filter(recipient)]
        (try! (nft-mint? swap-nft next-token-id recipient))
        (ok (var-set last-token-id next-token-id))
    )
)

(define-constant ERR_UNAUTHORIZED u100)
(define-constant ERR_INVALID_TOKEN_ID u200)

(define-data-var last-token-id uint u0)