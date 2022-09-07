(impl-trait .traits.commission)

;; P U B L I C

;; pay
;; price - the price of the listing
(define-public (pay (price uint))
    (begin  
        (asserts! (> price u0) (err ERR_PRICE_INVALID))
        (ok (try! (stx-transfer? (/ price (var-get slice)) tx-sender (var-get recipient))))
    )
)

;; change-owner
;; new-recipient - the new recipient of the commission
(define-public (change-recipient (new-recipient principal))
    (begin  
        (asserts! (is-eq tx-sender (var-get recipient)) (err ERR_UNAUTHORIZED))
        ;; #[filter(new-recipient)]
        (ok (var-set recipient new-recipient))
    )
)

;; change-commission
;; the new new-slice to set for the commission
;; slice = 100 -> price = 100 -> commission = 1
(define-public (change-commission (new-slice uint))
    (begin  
        (asserts! (> new-slice u0) (err ERR_SLICE_INVALID))
        (asserts! (is-eq tx-sender (var-get recipient)) (err ERR_UNAUTHORIZED))
        (ok (var-set slice new-slice))
    )
)

;; S T O R A G E

(define-data-var recipient principal tx-sender)
(define-data-var slice uint u100)

;; E R R O R S

(define-constant ERR_UNAUTHORIZED u1000)
(define-constant ERR_PRICE_INVALID u1002)
(define-constant ERR_SLICE_INVALID u1002)