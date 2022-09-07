;; Title: swapshop
;; Author: Mark Hammond
;;
;; Overview:
;;
;; TODO

;; S I P 0 0 9 - N F T

;; M A I N N E T
;; (use-trait nft 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
;; T E S T N E T
;; (impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)
;; D E V
;; (use-trait nft-trait .traits.sip-009-trait)

;; S I P 0 0 1 0 - N F T

;; D E V
(use-trait ft-trait .traits.sip-010-trait)

;; D E A L  T R A I T S
(use-trait executor-trait .traits.executor-trait) 
(use-trait safe-trait .traits.swap-deal-trait)
(use-trait commission-trait .traits.commission)

(impl-trait .traits.swap-deal-trait)

;; P U B L I C 

(define-read-only (get-info)
    (ok {
        version: (get-version),
        dealers: (get-dealers),
        deal: (get-deal-id)
    })
)

;; P R I V A T E

(define-private (get-version) VERSION)

(define-private (get-dealers) (var-get dealers) )

(define-private (get-deal-id) (var-get deal-id) )

(define-private (add-dealer-internal (dealer principal)) 
    (let 
        (
            (new-dealers (unwrap! (as-max-len? (append (var-get dealers) dealer) u2) ERR_DEALER_MAX_REACHED))
        ) 
        (ok (var-set dealers new-dealers))
    )
)

;; init function
(define-private (init (d (list 2 principal)) ) 
    (begin  
        (map add-dealer-internal d)
        (print {action:  "init of deal"})
    )
)

;; I N I T
(init (list 
        dealer-1
        dealer-2
    )
)

;; S T O R A G E

;; contract deployer principal
(define-constant SELF (as-contract tx-sender))
;; version of the contract
(define-constant VERSION "0.0.1")

;; latest ID for a deal
(define-data-var deal-id uint u0)
(define-data-var dealers (list 2 principal) (list))

;; E R R O R S
(define-constant ERR_DEALER_MAX_REACHED (err u100))

;; D E A L E R S
(define-constant dealer-1 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
(define-constant dealer-2 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
