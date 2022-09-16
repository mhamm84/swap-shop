(define-trait swapshop-trait
	(
		(get-info () (response {deal-status: uint, confirmations: uint, time-lock: uint, version: (string-ascii 20), dealers: (list 2 principal)} uint))
	)
)

(define-trait executor-trait
	(
		(execute (<swapshop-trait> <sip-010-trait> <sip-009-trait> (optional principal) (optional uint) (optional (buff 20))) (response bool uint))
	)
)

(define-trait commission
    (
      (pay (uint) (response bool uint))
    )
)

(define-trait sip-009-trait
  (
    ;; Last token ID, limited to uint range
	(get-last-token-id () (response uint uint))

    ;; URI for metadata associated with the token 
    (get-token-uri (uint) (response (optional (string-ascii 256)) uint))

    ;; Owner of a given token identifier
    (get-owner (uint) (response (optional principal) uint))

    ;; Transfer from the sender to a new principal
    (transfer (uint principal principal) (response bool uint))
  )
)

(define-trait sip-010-trait
  (
    ;; Transfer from the caller to a new principal
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))

    ;; the human readable name of the token
    (get-name () (response (string-ascii 32) uint))

    ;; the ticker symbol, or empty if none
    (get-symbol () (response (string-ascii 32) uint))

    ;; the number of decimals used, e.g. 6 would mean 1_000_000 represents 1 token
    (get-decimals () (response uint uint))

    ;; the balance of the passed principal
    (get-balance (principal) (response uint uint))

    ;; the current total supply (which does not need to be a constant)
    (get-total-supply () (response uint uint))

    ;; an optional URI that represents metadata of this token
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)

