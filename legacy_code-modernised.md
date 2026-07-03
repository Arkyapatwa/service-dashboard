# Technical Specification Document

**System Name:** CMTPS (CineMainframe Ticket Processing System)

**System ID:** MBSPROD01

**Environment:** Cloud-Native (Kubernetes / managed cloud platform)

**Language:** Service-tier: Java (Spring Boot) / Node.js / .NET Core (per service); Frontend: React (TypeScript)

**API Standard:** OpenAPI 3.x / JSON Schema

**Date:** 2026-06-30

---

## 1. System Architecture & Component Overview

**Current State:** CMTPS was a monolithic IBM z/OS mainframe system comprising a single CICS online region (COBOL program MBSBOOK1), a nightly JCL batch region (MBSBCHRC), a shared DB2 relational database, and a VSAM KSDS audit file — all tightly coupled within a single deployable unit with no versioning or API boundary.

**Modernized Design:**

The system is decomposed into independently deployable microservices aligned to bounded contexts, each owning its own datastore. An API Gateway (e.g., Kong or AWS API Gateway) is the single entry point for all external consumers. Service discovery and traffic management are handled via a service mesh (e.g., Istio). Inter-service communication uses REST over HTTPS for synchronous, low-latency paths and an event bus (Apache Kafka or AWS SQS) for asynchronous reconciliation flows.

### 1.1 Service Decomposition

| Service | Responsibility | Primary Datastore |
|---|---|---|
| **Reservation Service** | Seat selection, booking, inventory management, seat release | PostgreSQL + Redis cache |
| **Audit Service** | Structured event recording for all reservation state transitions | Append-only event store (e.g., PostgreSQL with audit schema) |
| **Reconciliation Service** | Payment clearing matching, reservation status lifecycle (PENDING → CONFIRMED / EXPIRED) | PostgreSQL (shared read from Reservation Service via internal API) |

### 1.2 Versioned API Endpoint Catalogue

All external-facing API endpoints MUST carry a URI version prefix. The initial release is `/v1/`. Breaking changes require a new version prefix (e.g., `/v2/`). Non-breaking additions (new optional fields, new endpoints) may be made within the current version. Deprecated endpoints MUST return `Sunset` (RFC 8594) and `Deprecation` response headers indicating the removal date, with a minimum 90-day notice period. Migration guides between versions are maintained in the API documentation portal (Swagger UI / Redoc / Scalar).

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/reservations` | Create a seat reservation |
| `GET` | `/v1/reservations/{reservationId}` | Retrieve reservation status |
| `PATCH` | `/v1/reservations/{reservationId}` | Update reservation status (internal service use) |
| `DELETE` | `/v1/reservations/{reservationId}` | Cancel a reservation |
| `GET` | `/v1/showtimes/{showtimeId}/seat-availability` | Query current seat availability |
| `GET` | `/v1/showtimes/{showtimeId}/seat-availability/stream` | SSE stream for real-time seat status updates |
| `POST` | `/v1/reconciliation/bank-clearance` | Webhook: receive bank clearance payload |
| `GET` | `/v1/reconciliation/status` | Query reconciliation run status |
| `POST` | `/v1/inventory/release` | Release seat coordinates back to active inventory |

### 1.3 Caching Architecture

All seat availability reads are served from a **Redis** distributed cache (keyed by `showtimeId:seatRow:seatNumber`) before falling through to the authoritative PostgreSQL datastore. Cache entries carry a TTL of ≤ 30 seconds to bound staleness during high-concurrency booking windows. A query-result cache covers the showtime lookup performed during input validation. The cache-aside pattern is used: on a cache miss the service fetches from the datastore, populates the cache, and returns the result. Write operations (seat reservation commit, seat release) invalidate the relevant cache keys immediately.

### 1.4 Architecture Diagram

```
  [React SPA (Browser / POS Web Client)]
                    |
          HTTPS REST / SSE
                    |
         +---------------------+
         |    API Gateway      |  (/v1/*)
         |  (Kong / AWS APIGW) |
         +---------------------+
           /         |        \
          /          |         \
  +----------+  +----------+  +-------------------+
  |Reservation|  |  Audit   |  | Reconciliation    |
  | Service   |  | Service  |  | Service           |
  | /v1/      |  |          |  | /v1/reconciliation|
  +----------+  +----------+  +-------------------+
       |               |               |
  [PostgreSQL    [Event Store]   [Kafka / SQS]
   + Redis Cache]                      |
                              [Bank Clearance Webhook]
```

---

## 2. Interface Definitions (Booking UI & API Contract)

**Current State:** Online seat selection and booking were handled through a standard 24×80 IBM 3270 terminal using Basic Mapping Support (BMS) macros (screen `MBSMAP1`), tightly coupled to the CICS backend transaction `MBS1`.

**Modernized Design:**

The booking interface is replaced by a reactive Single-Page Application (SPA) built with **React** (TypeScript). The frontend is fully decoupled from the backend and communicates exclusively through the versioned REST API (`/v1/`). State management uses **Redux Toolkit**. The seat map subscribes to a Server-Sent Events (SSE) stream (`GET /v1/showtimes/{showtimeId}/seat-availability/stream`) to reflect real-time seat status changes without polling.

### 2.1 Legacy Screen Field to Modern Component Mapping

| Legacy BMS Field (MBSMAP1) | Modern SPA Component |
|---|---|
| MOVIE ID / SHOWTIME ID | Searchable dropdown, populated via `GET /v1/movies` and `GET /v1/showtimes` |
| SCREEN NO / Seat Selection grid | Interactive SVG seat map component with real-time availability state (SSE-driven) |
| TOTAL PRICE | Computed client-side from pricing API response |
| CUSTOMER PHONE | Validated form field |
| CARD NUMBER / EXP DATE | Validated form fields; card data routed to PCI-compliant payment tokenisation service (out of scope for this system) |
| STATUS message | Toast/notification component driven by API response body |
| F3=EXIT | Standard browser Back navigation |
| F12=CANCEL | Cancel button → `DELETE /v1/reservations/{reservationId}` |

### 2.2 OpenAPI 3.x Contract (Reservation Endpoint — Excerpt)

```yaml
openapi: "3.1.0"
info:
  title: CMTPS Reservation API
  version: "1.0.0"
paths:
  /v1/reservations:
    post:
      summary: Create a seat reservation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ReservationRequest'
      responses:
        '201':
          description: Reservation created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReservationResponse'
        '409':
          description: Seat conflict
          content:
            application/problem+json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'
        '422':
          description: Validation error
          content:
            application/problem+json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'
```

---

## 3. Data Structures & API Schemas

**Current State:** Data structures were defined as COBOL copybooks stored in a `COPYLIB` PDS, included via `COPY` statements in both online and batch programs. Error context was captured in a fixed-length flat structure (`MBSERR01`) containing raw SQLCODE, CICS response codes, and a 60-character free-text message.

**Modernized Design:** All data structures are defined as JSON Schema components within the OpenAPI 3.x specification document, which is the authoritative contract for all services.

### 3.1 Ticket Transaction Record (replaces `MBSREC01`)

```yaml
components:
  schemas:
    ReservationRequest:
      type: object
      required: [showtimeId, movieId, theaterNumber, seat, customerInfo]
      properties:
        showtimeId:
          type: string
          description: "Unique showtime identifier (8-digit numeric string)"
          pattern: "^[0-9]{8}$"
        movieId:
          type: string
          maxLength: 5
        theaterNumber:
          type: integer
          minimum: 1
          maximum: 99
        seat:
          type: object
          required: [row, number]
          properties:
            row:
              type: string
              maxLength: 1
            number:
              type: integer
              minimum: 1
              maximum: 99
        customerInfo:
          type: object
          required: [phone, name]
          properties:
            phone:
              type: string
              maxLength: 10
            name:
              type: string
              maxLength: 30

    ReservationResponse:
      type: object
      properties:
        reservationId:
          type: string
          maxLength: 12
        status:
          type: string
          enum: [PENDING, CONFIRMED, CANCELLED, EXPIRED]
        ticketPrice:
          type: number
          format: decimal
          description: "Ticket price; stored and computed using fixed-point decimal arithmetic to eliminate floating-point rounding errors"
        tax:
          type: number
          format: decimal
```

> **Business Rule (preserved):** All financial arithmetic (ticket price, tax) MUST use fixed-point decimal representation to eliminate floating-point rounding errors. This is the direct equivalent of the legacy `COMP-3` packed decimal constraint.

### 3.2 Error Context Schema — RFC 7807 Problem Details (replaces `MBSERR01`)

```yaml
    ProblemDetails:
      type: object
      required: [type, title, status]
      properties:
        type:
          type: string
          format: uri
          example: "https://api.cmtps.internal/problems/seat-conflict"
        title:
          type: string
          example: "Seat No Longer Available"
        status:
          type: integer
          example: 409
        detail:
          type: string
        instance:
          type: string
          format: uri
          description: "Per-request trace identifier URI for distributed tracing correlation"
        violations:
          type: array
          description: "Field-level validation errors (populated on 422 responses)"
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string
```

---

## 4. Reservation Service Specification (replaces `MBSBOOK1`)

**Current State:** `MBSBOOK1` was a conversational CICS transaction (`MBS1`) written in COBOL. It evaluated `EIBCALEN` to distinguish initial screen renders from user-input processing, used embedded SQL (`EXEC SQL`) with explicit cursor controls for all database access, and wrote audit records via `EXEC CICS WRITE DATASET`.

**Modernized Design:**

The Reservation Service is a stateless REST microservice. All session state previously held in the CICS COMMAREA is managed client-side in the Redux store. The service is deployed as a containerised workload on Kubernetes.

### 4.1 OpenAPI 3.x Specification

The OpenAPI 3.x document (see Section 2.2 excerpt) is the authoritative contract. The `info.version` field follows SemVer. The specification is published to the documentation portal (Swagger UI / Redoc / Scalar) and versioned in source control alongside the service code.

### 4.2 Core Logic Flow (replaces COBOL paragraph definitions)

| Legacy Paragraph | Modern Equivalent |
|---|---|
| `0000-MAIN-PROCESSING` (EIBCALEN = 0 → initial map send) | `GET /v1/showtimes/{showtimeId}/seat-availability` — returns current seat grid as JSON; SPA renders interactive seat map |
| `0000-MAIN-PROCESSING` (EIBCALEN > 0 → user input parse) | `POST /v1/reservations` — accepts JSON request body |
| `1000-VALIDATE-INPUT` | Request validation layer: checks field formats, confirms `showtimeId` exists via internal showtime lookup (result cached in Redis) |
| `2000-RESERVE-SEAT` | Optimistic concurrency control on seat row (database-level row lock or compare-and-swap); seat availability read served from Redis cache with cache-aside fallback to PostgreSQL |
| `3000-COMMIT-TRANSACTION` | If seat is AVAILABLE: mark OCCUPIED in PostgreSQL, invalidate Redis cache key, publish `ReservationConfirmed` event to Audit Service via event bus; respond `201 Created` |

### 4.3 Seat Reservation Concurrency

If the seat is no longer available at commit time (concurrent reservation conflict), the service returns:

```json
{
  "type": "https://api.cmtps.internal/problems/seat-conflict",
  "title": "Seat No Longer Available",
  "status": 409,
  "detail": "The requested seat was reserved by another transaction during processing.",
  "instance": "/v1/reservations/req-a1b2c3d4"
}
```

The transaction is rolled back atomically. No partial state is persisted.

---

## 5. Reconciliation Service Specification (replaces `MBSBCHRC`)

**Current State:** `MBSBCHRC` was a nightly JCL batch job that ingested a sequential flat file from the financial warehouse and performed a loop-based matching pass against DB2 tables.

**Modernized Design:**

The Reconciliation Service is an independent, independently deployable microservice. It exposes a webhook endpoint (`POST /v1/reconciliation/bank-clearance`) that the financial warehouse calls when a clearance payload is available, replacing the flat-file FTP drop. Internally the service processes clearance records as a stream (Apache Kafka or AWS SQS), matching each record against reservation data via the Reservation Service's internal API.

### 5.1 Processing Rules (business logic preserved unchanged)

1. **Ingest:** The financial warehouse POSTs bank clearance records to `POST /v1/reconciliation/bank-clearance`. Records are enqueued to the event stream for processing.
2. **Match:** Each clearance record is matched against the reservation datastore by `reservationId`. Reservation status lookups are served from the Redis cache where available; on a cache miss the service fetches from the authoritative datastore and back-fills the cache.
3. **Confirm:** If a reservation remains `PENDING` and a matching bank clearance record exists, the Reconciliation Service calls `PATCH /v1/reservations/{reservationId}` with `{ "status": "CONFIRMED" }`. The Redis cache entry for that reservation is invalidated immediately.
4. **Expire:** If no matching bank clearance record exists after 24 hours, the Reconciliation Service calls `PATCH /v1/reservations/{reservationId}` with `{ "status": "EXPIRED" }` and triggers seat release via `POST /v1/inventory/release` with the seat coordinates. The Redis cache entry is invalidated immediately.

### 5.2 Reconciliation Status API

`GET /v1/reconciliation/status` returns the current state of the reconciliation pipeline, including counts of PENDING, CONFIRMED, and EXPIRED records processed in the current window.

---

## 6. Deployment & Runtime

**Current State:** The system was provisioned via JCL (`MBSJOB01`) on an IBM z/OS LPAR, with load libraries in a PDS (`MBS.PROD.LOADLIB`) and output routed to SYSOUT.

**Modernized Design:** All services are containerised and deployed to Kubernetes. Infrastructure-as-code (e.g., Terraform or Helm charts) defines the deployment configuration. CI/CD pipelines automate build, test, and deployment. Operational concerns (log aggregation, metrics, tracing) are handled by the observability stack (e.g., OpenTelemetry, Prometheus, Grafana, Jaeger). JCL job definitions, SYSOUT routing, and PDS load libraries are fully retired.

---

## 7. System Operational Constraints & Fail-Safes

**Current State:** Critical exceptions triggered `EXEC CICS ABEND ABCODE('MBSE')`, invoking a system-wide rollback to release VSAM and DB2 locks.

**Modernized Design:**

### 7.1 Transactional Integrity

All reservation state transitions are atomic. On any unhandled exception during a reservation commit, the service performs a full transaction rollback — no partial state is persisted and all acquired locks are released. This preserves the same transactional boundary guarantee as the legacy CICS SYNCPOINT / ABEND mechanism.

### 7.2 Structured Error Responses (RFC 7807)

All error responses returned by the API layer MUST conform to RFC 7807 Problem Details (`Content-Type: application/problem+json`). Each error class has a unique type URI. Defined error classes:

| Error Class | Type URI | HTTP Status | Trigger Condition |
|---|---|---|---|
| Seat Conflict | `https://api.cmtps.internal/problems/seat-conflict` | 409 | Seat reserved by concurrent transaction |
| Validation Failure | `https://api.cmtps.internal/problems/validation-error` | 422 | Field format / existence check failed |
| Payment Timeout | `https://api.cmtps.internal/problems/payment-timeout` | 504 | No bank clearance match within 24-hour window |
| Internal Server Error | `https://api.cmtps.internal/problems/internal-error` | 500 | Unhandled exception; rollback triggered |

All error responses include an `instance` field populated with the per-request trace identifier to support distributed tracing. Validation errors include a `violations` array with field-level detail.

Example — Validation Failure response:

```json
{
  "type": "https://api.cmtps.internal/problems/validation-error",
  "title": "Input Validation Failed",
  "status": 422,
  "detail": "One or more fields failed validation.",
  "instance": "/v1/reservations/req-a1b2c3d4",
  "violations": [
    { "field": "seat.row", "message": "Must be a single alphabetic character." },
    { "field": "showtimeId", "message": "Showtime ID does not exist." }
  ]
}
```

### 7.3 Financial Arithmetic Constraint (preserved)

All financial calculations (ticket price, tax) MUST use fixed-point decimal arithmetic throughout the service tier and data layer to eliminate floating-point rounding errors. This is a mandatory business constraint carried forward from the legacy `COMP-3` packed decimal requirement.

---

## 8. API Versioning & Deprecation Policy

All API endpoints are versioned via URI prefix (`/v1/`, `/v2/`, etc.).

| Policy Item | Requirement |
|---|---|
| Breaking change | Requires new version prefix (e.g., `/v2/`) |
| Non-breaking addition | Permitted within current version |
| Deprecation notice period | Minimum 90 days |
| Deprecation signalling | `Sunset` header (RFC 8594) + `Deprecation` header on all responses from deprecated endpoints |
| Migration support | Migration guide published in API documentation portal for each version transition |
| Backward compatibility | Current version endpoints remain fully functional until Sunset date |

The OpenAPI specification document `info.version` field follows Semantic Versioning (SemVer). The specification is the authoritative contract and is versioned in source control alongside the service code.