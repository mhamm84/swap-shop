(define-non-fungible-token swapshop-nft-noop uint)

(define-read-only (get-last-token-id)
  (ok u99)
)

(define-public (transfer (id uint) (sender principal) (recipient principal))
  (begin 
    (asserts! (is-eq true false) (err u333))  ;;  This token has no value. So no need to confuse people.
    (nft-transfer? swapshop-nft-noop id sender recipient)
  )
)