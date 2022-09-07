(impl-trait .traits.commission)

;; P U B L I C

;; pay
;; price - the price of the listing
;; no commission payed for the noop impl
(define-public (pay (price uint))
    (begin  
        (print { message: "no payment - noop commission" })
        (ok true)
    )
)   
