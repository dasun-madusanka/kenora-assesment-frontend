# Workshop Registration Service - Technical Decisions

## 1. Stack Choices & Why
- **Backend (Express.js / Node.js)**: Lightweight and fast to configure. Gives full control over routing and custom RBAC middleware without framework overhead.
- **Database (PostgreSQL / Neon)**: Relational consistency and ACID transactions are critical for capacity locking and audit history.
- **Frontend (React, Vite, TypeScript, Tailwind CSS)**: Fast dev workflow with Vite, compile-time safety with TypeScript, and a clean responsive UI that non-technical staff can use without training.
- **Auth (JWT & bcryptjs)**: Stateless token authentication with bcrypt password hashing (cost factor 10).

## 2. Design Decisions
- **Backend-Enforced RBAC**: Permissions are checked in route middleware (`requireRole`). An Admin attempting workshop actions or Staff creating accounts gets an immediate 403 Forbidden.
- **Soft Deletions**: Registrations are never deleted. Cancellations update `status` to `CANCELLED` and track `cancelled_by`, `cancelled_at`, and reason, freeing the seat while preserving history.
- **Stateless Auth**: Token stored in `localStorage` with React Context, keeping UI state synchronized across refreshes.

## 3. Preventing Over-Registration
Race conditions occur when multiple staff members book the last seat simultaneously over the phone.
- Every registration runs inside an explicit transaction (`BEGIN ... COMMIT`).
- We acquire a row lock on the workshop: `SELECT capacity, status FROM workshops WHERE id = $1 FOR UPDATE`. Competing requests for the same workshop queue behind this lock.
- While holding the lock, active confirmed registrations are counted. If count >= capacity, the transaction rolls back and returns 409 Conflict.
- Tested and verified with a 10-thread parallel script (`npm run test:concurrency`): exactly 1 booking succeeds and 9 are rejected.

## 4. Trade-offs
- **Postgres Row Locks vs Redis**: Chose database row locking over Redis. For 15 staff across 3 locations, PostgreSQL guarantees ACID correctness without added operational complexity.
- **LocalStorage JWT vs HTTP-only Cookies**: Stored JWT in `localStorage` for rapid cross-origin configuration between decoupled Render and frontend environments.

## 5. Assumptions Made
- Attendees do not have user accounts. Staff enter name and email over phone or at the desk.
- An attendee cannot hold duplicate confirmed seats for the same workshop session.
- Workshops are tagged across the centre's three physical locations.

## 6. Anything Skipped
- **Email Delivery (SMTP)**: Logged confirmations instead of setting up external email services.
- **Payments & Self-Service**: Kept scope focused on internal front-desk operations.

## 7. Bonus Features
- **Audit Trail**: Created `audit_logs` tracking account, workshop, and booking changes.
- **Waitlist Queue**: Added automated waitlist promotion when a confirmed seat is cancelled.
