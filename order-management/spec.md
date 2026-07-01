# order-management

## Purpose
The order-management service serves as the system of record for historically finalized transactions. It processes closed sales invoices, tracks internal progress status variations, organizes order histories for historical user accounts, and issues events that drive downstream delivery pipelines.

## Responsibilities
- Persist historical receipt records for successful client transactions
- Render paginated order history lookups for authenticated customer dashboards
- Support administrative status modifications across the lifetime of orders
- Broadcast message broker notifications when order status shifts happen
- Handle cancellations, item return windows, and refund processing logic

## API Endpoints

### POST /orders
- **Purpose:** Ingests a validated payment event to produce an official immutable order record.
- **Request:** JSON payload containing user_id, checkout_session_id, total_paid, items array, and shipping_address.
- **Response:** JSON body with order_id, status, and created_at.
- **Auth:** required (Restricted to internal system gateway or service-to-service calls)

### GET /orders
- **Purpose:** Fetches a chronological list of historical transactions belonging to the caller.
- **Request:** Query parameters: page (integer), limit (integer).
- **Response:** JSON array of matching order items with pagination summaries.
- **Auth:** required

### PATCH /orders/{order_id}/status
- **Purpose:** Transitions the physical processing state of an existing system order entry.
- **Request:** Path parameter order_id. Body contains new status and tracking_number.
- **Response:** JSON confirmation detailing order_id, updated status, and updated_at.
- **Auth:** required (Restricted to identities possessing the admin system role)

## Data Model
- **Order**
  - id: string — Primary identifier tracking the historical record (ord_)
  - user_id: string — Target customer owner identifier
  - total_paid: numeric — Final aggregated currency charged
  - status: string — Lifecycle tracker state (PLACED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  - shipping_street: string — Target street delivery address
  - shipping_city: string — Target city delivery point
  - shipping_state: string — Target state code
  - shipping_zip: string — Target mailing postal code
  - tracking_number: string — Optional logistical carrier tracking string
  - created_at: datetime — Timestamp marking order settlement initialization
- **OrderItem**
  - id: string — Internal sub-record mapping unique rows
  - order_id: string — Owning parent order tracking token
  - product_id: string — Product identity code referenced
  - quantity: integer — Amount of units acquired
  - price_paid: numeric — Real price captured per individual unit

## Dependencies
- External systems: PostgreSQL (highly relational, acid-compliant archival storage engine), RabbitMQ (event bus used to broadcast status modifications to shipping entities)

## Non-functional Requirements
- Expected throughput: 10 creation mutations per second; 100 historical query lookup requests per second
- Latency targets: Data ingestion mechanisms under 40ms; customer history rendering under 60ms
- Auth / authz rules: Access validation matches internal entity context tags; state adjustments explicitly restricted to authorized fulfillment administrative users
