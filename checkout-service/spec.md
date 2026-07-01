# checkout-service

## Purpose
The checkout-service orchestrates the multi-step transaction process of purchasing items. It coordinates with the product catalog to verify stock, interacts with third-party payment gateways to securely charge instruments, and logs initial transaction intents before transferring finalized purchases to fulfillment tracking.

## Responsibilities
- Instantiate a stateful checkout session for validated items
- Verify catalog prices and secure inventory locks across selected items
- Collect billing, shipping addresses, and payment details securely
- Process transactions safely via external financial card networks
- Generate finalized internal purchase records to trigger delivery workflows

## API Endpoints

### POST /checkout/session
- **Purpose:** Initiates a tracked stateful checkout timeline for a user's chosen line items.
- **Request:** JSON body containing an array of item IDs and quantities.
- **Response:** JSON body with checkout_session_id, total_amount, currency, and status.
- **Auth:** required

### POST /checkout/session/{checkout_session_id}/submit
- **Purpose:** Executes the payment phase and finalizes the checkout order instance.
- **Request:** Path parameter checkout_session_id. Body contains shipping_address and payment_method_id.
- **Response:** JSON body with order_id, checkout_session_id, status, and transaction_id.
- **Auth:** required

## Data Model
- **CheckoutSession**
  - id: string — Unique tracking token for active user checkouts (chk_sess_)
  - user_id: string — Associated client account making the transaction
  - total_amount: numeric — Sum total of items compiled in USD
  - status: string — Workflow stage indicator (OPEN, PROCESSING, COMPLETED, EXPIRED)
  - reservation_id: string — Reference matching the inventory isolation block
- **LineItem**
  - id: string — Internal sub-record identifier
  - checkout_session_id: string — Owning checkout session relation
  - product_id: string — Selected catalog unit identifier
  - quantity: integer — Count of target item requested
  - unit_price: numeric — Price captured at session initialization moment

## Dependencies
- Other services: product-catalog (invokes reservation and release mechanisms), order-management (posts verified closed sales data)
- External systems: PostgreSQL (session tracking state storage), Stripe API (external secure third-party payment facilitator)

## Non-functional Requirements
- Expected throughput: 30 concurrent checkout completion attempts per second peak
- Latency targets: Session initialization within 100ms; payment processing execution within 2500ms (bound by external financial network handshakes)
- Auth / authz rules: Access requires an authenticated client JWT corresponding explicitly to the identity owning the session record
