;; Title: ft-noop
;; Author: Mark Hammond
;;
;; Overview:
;; A no-op fungible token used as a placeholder for an optional (no-op) FT value as contract-of function cannot be called on an optional
;; trait

(define-fungible-token swapshop-ft-noop)

(define-read-only (get-name)
  (ok "None")
)

(define-read-only (get-symbol)
  (ok "NONE")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance swapshop-ft-noop account))
  
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin 
    (asserts! (is-eq true false) (err u333))
    (ft-transfer? swapshop-ft-noop amount sender recipient)
  )
)
