# Airline Booking System

Microservices flight-booking backend (Node.js + Express + Sequelize + Postgres) with a zero-dependency HTML frontend. Handles **concurrent bookings safely** via row-level locking — overselling a flight is impossible.

## Services

| Service | Port | Path | Owns |
|---|---|---|---|
| Flights | 3000 | `/` (root) | Cities, Airports, Airplanes, Flights, Seats |
| Bookings | 4000 | `Bookings/Flight-Booking-Service` | Bookings, payments, expiry |
| Frontend | — | `frontend/index.html` | Search / book / pay / cancel UI |

The booking service never writes flight inventory directly — it calls the flight service over HTTP, which serializes seat updates behind a `SELECT ... FOR UPDATE` row lock inside a transaction.

## Features

- **Flight search** — filter by route (`trips=MAA-BLR`), date, price range, traveller count; sort by any column.
- **Concurrent-safe booking** — 15 simultaneous requests for 10 seats → exactly 10 succeed, seat count lands on 0 (tested).
- **5-minute seat hold** — a booking starts as `initiated`; pay within 5 minutes or a background sweeper cancels it and returns the seats.
- **Idempotent payments** — `x-idempotency-key` header prevents double charges on retries; amount and user are verified against the booking.
- **Cancellation** — releases seats back to the flight atomically.
- **Consistent errors** — real status codes (400/404/409/503) with explanations, propagated across services.

## Quick start

```bash
# 1. Database (Postgres running locally)
createdb Flights

# 2. Flight service
npm install
(cd src && npx sequelize-cli db:migrate)
npm run dev                # port 3000

# 3. Booking service
cd Bookings/Flight-Booking-Service
npm install
(cd src && npx sequelize-cli db:migrate)
npm run dev                # port 4000

# 4. Frontend
open frontend/index.html
```

`.env` files: root needs `PORT=3000`; booking service needs `PORT=4000` and `FLIGHT_SERVICE=http://localhost:3000`.

## API

### Flight service (`:3000/api/v1`)

| Method | Route | Body / query |
|---|---|---|
| POST | `/cities` | `{name}` |
| POST | `/airports` | `{name, code, cityId}` |
| POST | `/airplanes` | `{modelNumber, capacity}` |
| POST | `/flights` | `{flightNumber, airplaneId, departureAirportId (code), arrivalAirportId (code), departureTime, arrivalTime, price, boardingGate, totalSeats}` |
| GET | `/flights` | `?trips=MAA-BLR&tripDate=YYYY-MM-DD&travellers=2&price=2000-6000&sort=price_ASC` |
| GET | `/flights/:id` | |
| PATCH | `/flights/:id/seats` | `{seats, dec}` — internal, called by booking service |

### Booking service (`:4000/api/v1`)

| Method | Route | Body / headers |
|---|---|---|
| POST | `/bookings` | `{flightId, userId, noOfSeats}` |
| POST | `/bookings/payments` | `{bookingId, userId, totalCost}` + `x-idempotency-key` header |
| GET | `/bookings?userId=N` | user's bookings |
| DELETE | `/bookings/:id` | cancel + release seats |

## How concurrency is handled

```
Booking svc                     Flight svc                    Postgres
POST /bookings ──┐
  txn begin      │
  create booking │
  PATCH /seats ──┼──> updateRemainingSeats ──> BEGIN
                 │      findByPk(FOR UPDATE) ──> row locked, rivals queue
                 │      re-check seats ≥ n, decrement
                 │    COMMIT ──> lock released
  txn commit <───┘   (any failure ⇒ booking rolled back)
```

See [FLOW.txt](FLOW.txt) for the full end-to-end walkthrough.

## Booking lifecycle

`initiated` → (pay ≤ 5 min) → `booked`
`initiated` → (cancel, or 5-min sweeper) → `cancelled` (seats restored)
