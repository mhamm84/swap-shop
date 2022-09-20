;; Title: swapshop-whitelist-v1
;; Author: Mark Hammond
;;
;; Overview:
;; This contract supports an nft whitelist. It enables callers to check if an nft is supported for swapshot
;; admin users can be added to add nft contracts to the contract and to add a new admin list
;; the contract is always and admin

;; nft - SIP-009 
(use-trait nft-trait .traits.sip-009-trait)

;; contract owner
(define-constant contract tx-sender)

;; admin list
(define-data-var admins (list 10 principal) (list contract))

;; whitelist of nft's
(define-map whitelist principal bool)

;; >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
;; P U B L I C
;; >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

;; add an nft contract to the whitelist
(define-public (add-to-whitelist (nft <nft-trait>)) 
    (begin  
        (map-insert whitelist (contract-of nft) true)
        (ok true)
    )
)

;; Checks that and NFT is in the whitelist
(define-public (is-whitelisted (nft <nft-trait>))
    (begin 
        (asserts! (is-some (map-get? whitelist (contract-of nft))) ERR_NFT_NOT_WHITELISTED)
        (ok true)
    )
)

;; Set a new admin list
(define-public (set-admins (admin-list (list 10 principal)))
    (begin 
        (asserts! (check-admin tx-sender) ERR_UNAUTHORIZED)
        (asserts! (> (len admin-list) u0) ERR_ADMIN_LIST_INVALID)
        (var-set admins admin-list)
        (ok true)
    )
)

;; >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
;; P R I V A T E
;; >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

;; Checks a principal is an admin
(define-private (check-admin (admin principal))
    (or (is-some (index-of (var-get admins) tx-sender)) (is-eq tx-sender contract))
)

;; >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
;; E R R O R S
;; >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_ADMIN_LIST_INVALID (err u101))
(define-constant ERR_NFT_NOT_WHITELISTED (err 200))

;; >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
;; I N I T  W H I T E L I S T
;; >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

;; test NFT
(map-insert whitelist .sip009-test true)

(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-ape-club-nft true)
(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-robot-nft true)
(map-insert whitelist 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-robot-component-nft true)
(map-insert whitelist 'SP176ZMV706NZGDDX8VSQRGMB7QN33BBDVZ6BMNHD.project-indigo-landmarks true)
(map-insert whitelist 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.stacks-punks-v3 true)
;; TODO --- Add in more 