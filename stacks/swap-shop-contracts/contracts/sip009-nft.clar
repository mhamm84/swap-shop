(impl-trait .nft-trait.nft-trait)

(define-non-fungible-token swap-nft uint)

(define-data-var last-token-id uint u0)

(define-constant err-not-sender (err u100))

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
        (asserts! (is-eq sender tx-sender) err-not-sender)
        (nft-transfer? swap-nft token-id sender recipient)
    )
)

(define-public (mint (recipient principal))
    (let
        (
            (next-token-id (+ (var-get last-token-id) u1))
        )
        (try! (nft-mint? swap-nft next-token-id recipient))
        (var-set last-token-id next-token-id)
        (ok true)
    )

)