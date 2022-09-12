;; Title: SwapShop sip-010 fungible token transfer executor
;; Author: Mark Hammond

;; D E V
;;
(impl-trait .traits.executor-trait)
(use-trait nft-trait .traits.sip-009-trait)
(use-trait ft-trait .traits.sip-010-trait)
(use-trait swapshop-trait .traits.swapshop-trait)

;; T E S T  N E T
;;

;; M A I N  N E T
;;

(define-public (execute (swapshop <swapshop-trait>) (param-ft <ft-trait>) (param-nft <nft-trait>) (param-p (optional principal)) (param-u (optional uint)) (param-b (optional (buff 20))))
        (contract-call? param-ft transfer (unwrap! param-u (err u9999)) (contract-of swapshop) (unwrap! param-p (err u9999)) param-b)
)