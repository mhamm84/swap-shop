;; Title: swapshop
;; Author: Mark Hammond
;;
;; Overview:
;; The swapshop contract is a bespoke contract deployed for 2 user who engage in a deal to transfer assets with each other
;; in a trustless deal. The deal specifics are hammered out off-chain and then when a deal is agreed upon by both parties
;; a swapshop contract and be created and deployed onto the Stacks blockchain. Users have complete control over their assets
;; they send to the contract. A timelock is provided, which is a future blockheight where a user can claim their assets.
;; Before a deal can go through in the time window, both parties have to confrim the transactions involved to transfer assets.
;; The transfering of assets is an atomic operation. All transfers succeed, else the deal fails

;; ################ -> Templated areas of the contract


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
(use-trait nft-trait .traits.sip-009-trait)

;; D E A L  T R A I T S
;;
(use-trait executor-trait .traits.executor-trait) 
(use-trait swapshop-trait .traits.swapshop-trait)
(use-trait commission-trait .traits.commission)

(impl-trait .traits.swapshop-trait)

;; P U B L I C 
;;
;; real-only function returning information on this contract

(define-read-only (get-info)
    (ok {
        deal-status: (get-deal-status),
        confirmations: (get-confirm-count),
        time-lock: (get-time-lock),
        version: (get-version),
        dealers: (get-dealers)
    })
)

;; P R I V A T E
;;
(define-private (get-version) VERSION)
(define-private (get-dealers) (var-get dealers))
(define-private (get-deal-status) (var-get deal-status))
(define-private (get-confirm-count) (var-get confirm-count))
(define-private (get-time-lock) (var-get time-lock))
;; adds a dealer principal to the dealers list - internal only
(define-private (add-dealer-internal (dealer principal)) 
    (let 
        (
            (new-dealers (unwrap! (as-max-len? (append (var-get dealers) dealer) u2) ERR_DEALER_MAX_REACHED))
        ) 
        (map-set dealer-map dealer { assets-submitted: true, confirmed-trade: true, claimed: true })
        (ok (var-set dealers new-dealers))
    )
)

;; S T O R A G E
;;
;; contract deployer principal
(define-constant SELF (as-contract tx-sender))
;; version of the contract
(define-constant VERSION "v1")
;; dealers list for this contract - populated from init function
(define-data-var dealers (list 2 principal) (list))
;; number of dealers
(define-constant no-of-dealers u2)
;; number of confirms, must be a confirm for each dealer for the deal to complete
(define-data-var confirm-count uint u0)
;; ##############################################################################################################################
;; the time lock for the dealers assets, on expiry, dealers can claim back
(define-data-var time-lock uint u5)
;; ##############################################################################################################################
;; dealer map, storeing some flags on the dealers
(define-map dealer-map principal { assets-submitted: bool, confirmed-trade: bool, claimed: bool })
;; status of the deal
;; 1 = ACTIVE ; 2 = COMPLETE; 3 = EXPIRED
(define-data-var deal-status uint u1)

;;
(define-public (submit-deal)
;; ##############################################################################################################################
    (begin 
        ;; Check the time-lock
        (asserts! (<  block-height (var-get time-lock)) ERR_TIME_LOCK_EXCEEDED)
        ;; Check dealer 1
        (if (is-eq tx-sender dealer-1)
           (begin
                (let 
                    (
                        (dealer (unwrap-panic (map-get? dealer-map dealer-1)))
                        (assets-submitted (get assets-submitted dealer))
                    ) 
                    (asserts! assets-submitted ERR_DEALER_ALREADY_SUBMITTED)
;; ##############################################################################################################################               
                    (asserts! (is-ok (contract-call?  .sip009-test transfer u1 tx-sender (as-contract tx-sender))) ERR_DEALER_NFT_TRANSFER_FAILED)
;; ##############################################################################################################################                                   
                    (asserts! (is-eq (map-set dealer-map dealer-1 (merge dealer {assets-submitted: true}))) ERR_DEALER_UPDATE_FAILED)
                )
           )
           true
        )
        ;; Check dealer 2
        (if (is-eq tx-sender dealer-2)
           (begin
                (let 
                    (
                        (dealer (unwrap-panic (map-get? dealer-map dealer-2)))
                        (assets-submitted (get assets-submitted dealer))
                    ) 
                    (asserts! assets-submitted ERR_DEALER_ALREADY_SUBMITTED)
 ;; ##############################################################################################################################                                  
                    (asserts! (is-ok (stx-transfer? u10000 tx-sender (as-contract tx-sender) )) ERR_DEALER_STX_TRANSFER_FAILED)
 ;; ##############################################################################################################################               
                    (asserts! (is-eq (map-set dealer-map dealer-2 (merge dealer {assets-submitted: true}))) ERR_DEALER_UPDATE_FAILED)
                )
           )
           true
        )
        (ok true)
    )
;; ##############################################################################################################################
)

;; confirm the trade per dealer and if both agree, complete the deal
(define-public (confirm-trade) 
    (begin  
        (asserts! (is-some (map-get? dealer-map tx-sender)) ERR_DEALER_NOT_FOUND)
        (asserts! (not (is-eq (var-get confirm-count) no-of-dealers)) ERR_DEAL_ALREADY_CONFIRMED)

        (let 
            (
                (dealer (unwrap-panic (map-get? dealer-map tx-sender)))
            ) 
            (asserts! (is-eq (map-set dealer-map tx-sender (merge dealer {confirmed-trade: true}))) ERR_DEALER_UPDATE_FAILED)
            (var-set confirm-count (+ (var-get confirm-count) u1))
        )

        (if (is-eq (var-get confirm-count) no-of-dealers) 
            (begin 
                ;; dealer-1 -> dealer-2
;; ##############################################################################################################################               
                (asserts! (is-ok (contract-call?  .sip009-test transfer u1 (as-contract tx-sender) dealer-1)) ERR_DEALER_NFT_TRANSFER_FAILED)
                ;; dealer-2 -> dealer-1
                (asserts! (is-ok (stx-transfer? u10000 (as-contract tx-sender) dealer-2)) ERR_DEALER_STX_TRANSFER_FAILED)
;; ##############################################################################################################################  
                (var-set deal-status u2)             
            ) 
            true
        )
        (ok true)
    )
)

(define-public (claim)
    (begin 
        (asserts! (>= block-height (var-get time-lock)) ERR_TIME_LOCK_NOT_REACHED)
        (var-set deal-status u3)

        ;; ##############################################################################################################################
        (if (is-eq tx-sender dealer-1)
           (begin
                (let 
                    (
                        (dealer (unwrap-panic (map-get? dealer-map tx-sender)))
                        (claimed (get claimed dealer))
                    ) 
                    (asserts! claimed ERR_DEALER_ALREADY_CLAIMED)
;; ##############################################################################################################################
                    (asserts! (is-ok (contract-call?  .sip009-test transfer u1 (as-contract tx-sender) tx-sender)) ERR_DEALER_NFT_TRANSFER_FAILED)
;; ##############################################################################################################################                                 
                    (asserts! (is-eq (map-set dealer-map tx-sender (merge dealer {claimed: true}))) ERR_DEALER_UPDATE_FAILED)
                )
           )
           true
        )
        ;; Check dealer 2
        (if (is-eq tx-sender dealer-2)
           (begin
                (let 
                    (
                        (dealer (unwrap-panic (map-get? dealer-map dealer-2)))
                        (claimed (get claimed dealer))
                    ) 
                    (asserts! claimed ERR_DEALER_ALREADY_CLAIMED)
;; ##############################################################################################################################
                    (asserts! (is-ok (stx-transfer? u10000 (as-contract tx-sender) tx-sender)) ERR_DEALER_STX_TRANSFER_FAILED)
;; ##############################################################################################################################               
                    (asserts! (is-eq (map-set dealer-map dealer-2 (merge dealer { claimed: true}))) ERR_DEALER_UPDATE_FAILED)
                )
           )
           true
        )
        (ok true)
    )
)


;; E R R O R S
;;
(define-constant ERR_TIME_LOCK_EXCEEDED (err u100))
(define-constant ERR_TIME_LOCK_NOT_REACHED (err u101))

(define-constant ERR_DEALER_NOT_SENDER (err u200))
(define-constant ERR_DEALER_MAX_REACHED (err u201))
(define-constant ERR_DEALER_ALREADY_SUBMITTED (err u202))
(define-constant ERR_DEALER_ALREADY_CONFIRMED (err u203))
(define-constant ERR_DEALER_ALREADY_CLAIMED (err u204))
(define-constant ERR_DEALER_NFT_TRANSFER_FAILED (err u205))
(define-constant ERR_DEALER_STX_TRANSFER_FAILED (err u206))
(define-constant ERR_DEALER_FT_TRANSFER_FAILED (err u207))
(define-constant ERR_DEALER_UPDATE_FAILED (err u208))
(define-constant ERR_DEALER_NOT_FOUND (err u209))

(define-constant ERR_DEAL_ALREADY_CONFIRMED (err u300))


;; D E A L E R S
;; ##############################################################################################################################
;; Dealer constants are dynamically added to the contract when a swapshop deal is setup. 
;; The dealer-1 and dealer-2 principal addresses are injected it BEFORE the contract is programatically deployed to the blockchain
;; deployer ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
(define-constant dealer-1 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(define-constant dealer-2 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
;; ##############################################################################################################################

;; I N I T
;;
;; init function to add the dealers to an internal list for info purpuses
(define-private (init (d (list 2 principal)) ) 
    (begin  
        (map add-dealer-internal d)
        (print {action:  "init of deal"})
    )
)
;; call init
(init (list 
        dealer-1
        dealer-2
    )
)