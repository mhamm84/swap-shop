;; Title: swapshop
;; Author: Mark Hammond
;;
;; Overview:
;; The swapshop contract is a bespoke contract deployed for 2 user who engage in a trader to transfer assets with each other
;; in a trustless trade. The trade specifics are hammered out off-chain and then when a trade is agreed upon by both parties
;; a swapshop contract and be created and deployed onto the Stacks blockchain. Users have complete control over their assets
;; they send to the contract. A timelock is provided, which is a future blockheight where a user can claim their assets.
;; Before a trade can go through in the time window, both parties have to confrim the transactions involved to transfer assets.
;; The transfering of assets is an atomic operation. All transfers succeed, else the trade fails

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
;;
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
        tradeStatus: (get-trade-status),
        confirmations: (get-confirm-count),
        timelock: (get-time-lock),
        version: (get-version),
        traders: (get-traders)
    })
)

;; P R I V A T E
;;
(define-private (get-version) VERSION)
(define-private (get-traders) (var-get traders))
(define-private (get-trade-status) (var-get trade-status))
(define-private (get-confirm-count) (var-get confirm-count))
(define-private (get-time-lock) (var-get time-lock))

;; adds a trader principal to the traders list - internal only
(define-private (add-trader-internal (trader principal)) 
    (let 
        (
            (new-traders (unwrap! (as-max-len? (append (var-get traders) trader) u2) ERR_TRADER_MAX_REACHED))
        ) 
        (map-set trader-map trader {assets-submitted: false, confirmed-trade: false, claimed: false})
        (ok (var-set traders new-traders))
    )
)

;; check to see if the timelock has expired on the trade
(define-private (has-timelock-expired) 
    (begin  
        (if (>= block-height (var-get time-lock)) 
            (begin 
                (var-set trade-status u3)
                (print {msg: "timelock has expired", timelock: (var-get time-lock), tradeStatus: (var-get trade-status)})
                true
            )
            false
        )
    )
)

;; S T O R A G E
;;
;; contract deployer principal
(define-constant SELF (as-contract tx-sender))
;; version of the contract
(define-constant VERSION "v1")
;; traders list for this contract - populated from init function
(define-data-var traders (list 2 principal) (list))
;; number of traders
(define-constant no-of-traders u2)
;; number of confirms, must be a confirm for each trader for the trade to complete
(define-data-var confirm-count uint u0)
;; trader map, storeing some flags on the traders
(define-map trader-map principal {assets-submitted: bool, confirmed-trade: bool, claimed: bool})
;; status of the trade
;; 1 = ACTIVE; 2 = COMPLETE; 3 = EXPIRED
(define-data-var trade-status uint u1)
;; ##############################################################################################################################
;; the time lock for the traders assets, on expiry, traders can claim back
(define-data-var time-lock uint u5)
;; ##############################################################################################################################

;; P U B L I C
;;
(define-public (submit-trade)
;; ##############################################################################################################################
    (begin 
        ;; Check the time-lock
        (asserts! (not (has-timelock-expired)) ERR_TIME_LOCK_EXCEEDED)
        (asserts! (is-some (map-get? trader-map tx-sender)) ERR_TRADER_NOT_FOUND)
        ;; Check trader 1
        (if (is-eq tx-sender trader-1)
           (begin
                (let 
                    (
                        (trader (unwrap-panic (map-get? trader-map trader-1)))
                        (assets-submitted (get assets-submitted trader))
                    ) 
                    (asserts! (is-eq assets-submitted false) ERR_TRADER_ALREADY_SUBMITTED)
                    ;;  .sip009-test.swapshop-test-nft
;; ##############################################################################################################################               
                    (asserts! (is-ok (contract-call?  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-test transfer u1 tx-sender (as-contract tx-sender))) ERR_TRADER_NFT_TRANSFER_FAILED)
;; ##############################################################################################################################                                   
                    (asserts! (is-eq (map-set trader-map trader-1 (merge trader {assets-submitted: true}))) ERR_TRADER_UPDATE_FAILED)
                )
           )
           true
        )
        ;; Check trader 2
        (if (is-eq tx-sender trader-2)
           (begin
                (let 
                    (
                        (trader (unwrap-panic (map-get? trader-map trader-2)))
                        (assets-submitted (get assets-submitted trader))
                    ) 
                    (asserts! (is-eq assets-submitted false) ERR_TRADER_ALREADY_SUBMITTED)
 ;; ##############################################################################################################################                                  
                    (asserts! (is-ok (stx-transfer? u10000 tx-sender (as-contract tx-sender) )) ERR_TRADER_STX_TRANSFER_FAILED)
 ;; ##############################################################################################################################               
                    (asserts! (is-eq (map-set trader-map trader-2 (merge trader {assets-submitted: true})) ) ERR_TRADER_UPDATE_FAILED)
                )
           )
           true
        )
        (ok true)
    )
;; ##############################################################################################################################
)

;; confirm the trade per trader and if both agree, complete the trade
(define-public (confirm-trade) 
    (begin  
        (asserts! (is-some (map-get? trader-map tx-sender)) ERR_TRADER_NOT_FOUND)
        (asserts! (not (is-eq (var-get confirm-count) no-of-traders)) ERR_TRADE_ALREADY_CONFIRMED)

        (let 
            (
                (trader (unwrap-panic (map-get? trader-map tx-sender)))
            ) 
            (asserts! (get assets-submitted trader) ERR_TRADE_NOT_SUBMITTED)
            (asserts! (not (get confirmed-trade trader)) ERR_TRADER_ALREADY_CONFIRMED)
            (asserts! (is-eq (map-set trader-map tx-sender (merge trader {confirmed-trade: true}))) ERR_TRADER_UPDATE_FAILED)
            (var-set confirm-count (+ (var-get confirm-count) u1))
        )

        (if (is-eq (var-get confirm-count) no-of-traders) 
            (begin 
                ;; trader-1 -> trader-2
;; ##############################################################################################################################               
                (asserts! (is-ok (as-contract (contract-call?  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-test transfer u1 tx-sender trader-2))) ERR_TRADER_NFT_TRANSFER_FAILED)
                ;; trader-2 -> trader-1
                (asserts! (is-ok (as-contract (stx-transfer? u10000 tx-sender trader-1))) ERR_TRADER_STX_TRANSFER_FAILED)
;; ##############################################################################################################################  
                (var-set trade-status u2)             
            ) 
            true
        )
        (ok true)
    )
)

(define-public (claim)
    (begin 
        (asserts! (is-some (map-get? trader-map tx-sender)) ERR_TRADER_NOT_FOUND)
        (asserts! (has-timelock-expired) ERR_TIME_LOCK_NOT_REACHED)
        (print {msg: "trader claiming back assets", trader: tx-sender})

;; ##############################################################################################################################
        (if (is-eq tx-sender trader-1)
           (begin
                (let 
                    (
                        (trader (unwrap-panic (map-get? trader-map trader-1)))
                        (claimed (get claimed trader))
                        (submitted (get assets-submitted trader))
                    ) 
                    (asserts! submitted ERR_TRADE_NOT_SUBMITTED)
                    (asserts! (not claimed) ERR_TRADER_ALREADY_CLAIMED)
                    (asserts! (is-ok (as-contract (contract-call?  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-test transfer u1 tx-sender trader-1))) ERR_TRADER_NFT_TRANSFER_FAILED)
                    (asserts! (is-eq (map-set trader-map trader-1 (merge trader {claimed: true}))) ERR_TRADER_UPDATE_FAILED)
                    true
                )
           )
           false
        )
        ;; Check trader 2
        (if (is-eq tx-sender trader-2)
           (begin
                (let 
                    (
                        (trader (unwrap-panic (map-get? trader-map trader-2)))
                        (claimed (get claimed trader))
                        (submitted (get assets-submitted trader))
                    ) 
                    (asserts! submitted ERR_TRADE_NOT_SUBMITTED)
                    (asserts! (not claimed) ERR_TRADER_ALREADY_CLAIMED)
                    (asserts! (is-ok (as-contract (stx-transfer? u10000 tx-sender trader-2))) ERR_TRADER_STX_TRANSFER_FAILED)
                    (asserts! (is-eq (map-set trader-map trader-2 (merge trader { claimed: true}))) ERR_TRADER_UPDATE_FAILED)
;; ##############################################################################################################################                                 
                     true
                )
           )
           false
        )
        (ok true)
    )
)

;; E R R O R S
;;
(define-constant ERR_TIME_LOCK_EXCEEDED (err u100))
(define-constant ERR_TIME_LOCK_NOT_REACHED (err u101))
(define-constant ERR_TRADER_NOT_SENDER (err u200))
(define-constant ERR_TRADER_MAX_REACHED (err u201))
(define-constant ERR_TRADER_ALREADY_SUBMITTED (err u202))
(define-constant ERR_TRADER_ALREADY_CONFIRMED (err u203))
(define-constant ERR_TRADER_ALREADY_CLAIMED (err u204))
(define-constant ERR_TRADER_NFT_TRANSFER_FAILED (err u205))
(define-constant ERR_TRADER_STX_TRANSFER_FAILED (err u206))
(define-constant ERR_TRADER_FT_TRANSFER_FAILED (err u207))
(define-constant ERR_TRADER_UPDATE_FAILED (err u208))
(define-constant ERR_TRADER_NOT_FOUND (err u209))
(define-constant ERR_TRADE_ALREADY_CONFIRMED (err u300))
(define-constant ERR_TRADE_NOT_SUBMITTED (err u301))


;; D E A L E R S
;; ##############################################################################################################################
;; trader constants are dynamically added to the contract when a swapshop trade is setup. 
;; The trader-1 and trader-2 principal addresses are injected it BEFORE the contract is programatically deployed to the blockchain
;; deployer ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
(define-constant trader-1 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(define-constant trader-2 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
;; ##############################################################################################################################

;; I N I T
;;
;; init function to add the traders to an internal list for info purpuses
(define-private (init (d (list 2 principal)) ) 
    (begin  
        (map add-trader-internal d)
        (print {action:  "init of trade"})
    )
)
;; call init
(init (list 
        trader-1
        trader-2
    )
)