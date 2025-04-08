;; Property Registration Contract
;; Records details and valuation of buildings

;; Define data variables
(define-data-var last-property-id uint u0)

;; Define data maps
(define-map properties
  { property-id: uint }
  {
    owner: principal,
    address: (string-utf8 100),
    building-type: (string-utf8 50),
    square-footage: uint,
    year-built: uint,
    valuation: uint,
    registration-date: uint
  }
)

;; Register a new property
(define-public (register-property
    (address (string-utf8 100))
    (building-type (string-utf8 50))
    (square-footage uint)
    (year-built uint)
    (valuation uint))
  (let
    (
      (new-id (+ (var-get last-property-id) u1))
      (current-time (get-block-info? time (- block-height u1)))
    )
    (asserts! (is-some current-time) (err u1))
    (map-set properties
      { property-id: new-id }
      {
        owner: tx-sender,
        address: address,
        building-type: building-type,
        square-footage: square-footage,
        year-built: year-built,
        valuation: valuation,
        registration-date: (unwrap-panic current-time)
      }
    )
    (var-set last-property-id new-id)
    (ok new-id)
  )
)

;; Get property details
(define-read-only (get-property (property-id uint))
  (map-get? properties { property-id: property-id })
)

;; Update property valuation
(define-public (update-valuation (property-id uint) (new-valuation uint))
  (let
    (
      (property (map-get? properties { property-id: property-id }))
    )
    (asserts! (is-some property) (err u1))
    (asserts! (is-eq (get owner (unwrap-panic property)) tx-sender) (err u2))

    (map-set properties
      { property-id: property-id }
      (merge (unwrap-panic property) { valuation: new-valuation })
    )
    (ok true)
  )
)
