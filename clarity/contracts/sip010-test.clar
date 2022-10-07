(impl-trait .traits.sip-010-trait)

;; Title: swapshop-test-ft
;; Author: Mark Hammond
;;
;; Overview:
;; A no-op fungible token used as a placeholder for an optional (no-op) FT value as contract-of function cannot be called on an optional
;; trait

(define-fungible-token swapshop-test-ft)

(define-read-only (get-name)
  (ok "swapshop-test-ft")
)

(define-read-only (get-symbol)
  (ok "SWP")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-token-uri)
  (ok none)
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply swapshop-test-ft))
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance swapshop-test-ft account))
)

(define-public (mint (amount uint) (recipient principal)) 
  (begin  
    (asserts!  (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? swapshop-test-ft amount recipient)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (is-eq tx-sender sender) err-not-token-owner)
		(try! (ft-transfer? swapshop-test-ft amount sender recipient))
		(match memo to-print (print to-print) 0x)
		(ok true)
	)
)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
