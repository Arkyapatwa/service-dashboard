# auth-service

## Purpose
The auth-service manages user identity, authentication, and authorization across the application. It acts as the central authority for issuing secure access tokens, validating user credentials, and managing user roles to ensure that secure endpoints across all other microservices are protected.

## Responsibilities
- Register new user accounts with securely hashed passwords
- Authenticate existing users and issue JSON Web Tokens (JWTs)
- Valresh_token, expires_in.
- **Auth:** none

### POST /auth/refresh
- **Purpose:** Renews an expired access token using a valid refresh token.
- **Request:** JSON body with refresh_token.
- **Response:** JSON body with access_token, expires_in.
- **Auth:** none

### GET /users/{user_id}
- **Purpose:** Retrieves identity and profile information for a specific user.
- **Request:** Path parameter user_id string.
- **Response:** JSON body with user_id, email, first_name, last_name, role.
- **Auth:** required (User must match user_id or possess admin role)

## Data Model
- **User**
  - id: string — Unique identifier for the user account (prefixed with usr_)
  - email: string — Unique email address used for login
  - password_hash: string — Argon2id hash of the user's password
  - first_name: string — Given name of the user
  - last_name: string — Surname of the user
  - role: string — System access level (e.g., customer, admin)
  - created_at: datetime — Timestamp of account creation
- **RefreshToken**
  - token: string — Unique secure random string identifier
  - user_id: string — Foreign key reference to the User entity
  - expires_at: datetime — Expiration boundary for token validity
  - revoked: boolean — Flag indicating if token was explicitly invalidated

## Dependencies
- External systems: PostgreSQL (primary relational datastore), Redis (token blocklist and session caching)

## Non-functional Requirements
- Expected throughput: 50 requests per second peak during login windows
- Latency targets: Password hashing operations must complete within 300ms; token validations within 15ms
- Auth / authz rules: Uses public/private key pairs to sign JWTs; passwords must meet a minimum length of 12 characters including mixed alphanumeric cases and symbols
