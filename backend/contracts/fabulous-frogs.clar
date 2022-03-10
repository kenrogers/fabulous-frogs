(impl-trait .sip009-nft-trait.sip009-nft-trait)

;; SIP009 NFT trait on mainnet
;; If we were deploying this, we would want to implement this instead
;; But since we are just using this locally, we'll create our own and implement it, as we do above
;; (impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

(define-non-fungible-token fabulous-frogs uint)

(define-data-var last-token-id uint u0)

(define-read-only (get-last-token-id)
	(ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
	(ok none)
)

(define-read-only (get-owner (token-id uint))
	(ok (nft-get-owner? fabulous-frogs token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
	(begin
		(asserts! (is-eq tx-sender sender) err-not-token-owner)
		(nft-transfer? fabulous-frogs token-id sender recipient)
	)
)

(define-public (mint (recipient principal))
	(let
		(
			(token-id (+ (var-get last-token-id) u1))
		)
		(try! (stx-transfer? u50000000 tx-sender (as-contract tx-sender)))
		(try! (nft-mint? fabulous-frogs token-id recipient))
		(var-set last-token-id token-id)
		(ok token-id)
	)
)
