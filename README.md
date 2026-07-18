# ✈️ Airline Booking System

> A production-style **microservices backend** for searching flights and booking seats — engineered to survive the hardest problem in ticketing: **hundreds of users racing for the last seat, with zero oversells.**

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Sequelize-4169E1?logo=postgresql&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-orange)

---

## 🏗️ Architecture

```
                        ┌──────────────────────────┐
                        │   Frontend (index.html)  │
                        │  vanilla JS · no build   │
                        └───────┬──────────┬───────┘
                          fetch │          │ fetch
              ┌─────────────────▼──┐    ┌──▼──────────────────┐
              │  FLIGHTS SERVICE   │◄───┤  BOOKING SERVICE    │
              │     :3000          │HTTP│      :4000          │
              │                    │    │                     │
              │ • Cities/Airports  │    │ • Create booking    │
              │ • Airplanes        │    │ • Idempotent payment│
              │ • Flight search    │    │ • Cancellation      │
              │ • Seat inventory   │    │ • Auto-expiry sweep │
              │   (row-lock owner) │    │   (every 5 min)     │
              └─────────┬──────────┘    └──────────┬──────────┘
                        │      Sequelize ORM       │
                        └───────────┬──────────────┘
                                    ▼
                          ┌──────────────────┐
                          │    PostgreSQL    │
                          │ Flights · Seats  │
                          │ Airports · Bookings │
                          └──────────────────┘
```

**Separation of concern:** the Booking service *never* writes flight inventory directly. Every seat mutation funnels through one endpoint on the Flights service — a single, lockable critical section.

Each service follows a clean layered design:

```
Routes → Middlewares → Controllers → Services → Repositories → Models → DB
         (validation)   (HTTP only)  (business)  (data + txns)
```

---

## 🔒 The Core Problem: Concurrent Bookings

**Scenario:** a flight has 10 seats left, and 15 users click *Book* at the same instant. A naive `read → check → write` oversells the plane.

**Solution — pessimistic row-level locking inside a transaction:**

```
Booking svc                    Flights svc                     PostgreSQL
POST /bookings ──┐
  BEGIN txn      │
  create booking │
  PATCH /seats ──┼──► updateRemainingSeats ──► BEGIN
                 │      SELECT ... FOR UPDATE ──► 🔒 row locked, rivals queue
                 │      re-check seats ≥ n
                 │      decrement seats
                 │    COMMIT ──► 🔓 lock released, next request proceeds
  COMMIT  ◄──────┘    (any failure ⇒ booking rolled back, nothing leaks)
```

Every competing transaction **queues at the row lock**, re-reads the *fresh* seat count, and only then decrements. If the seat decrement fails, the booking insert is rolled back — no orphan bookings, no phantom seats.

**✅ Verified under fire:** 15 simultaneous booking requests were fired at a 10-seat flight —
exactly **10 succeeded, 5 were rejected, and the seat count landed on precisely 0.**

---

## ⭐ Feature Highlights

| Feature | How it works |
|---|---|
| 🔍 **Flight search** | Filter by route, date, price range, traveller count; sort by any column (`?trips=MAA-BLR&tripDate=2026-07-25&sort=price_ASC`) |
| 🪑 **Concurrent-safe booking** | `SELECT ... FOR UPDATE` row lock + transactional rollback |
| ⏳ **5-minute seat hold** | Booking starts as `initiated`; pay in time or seats are released |
| 💳 **Idempotent payments** | `x-idempotency-key` header — retries and double-clicks can never double-charge |
| 🔁 **Auto-expiry sweeper** | Background job cancels stale unpaid bookings & restores seats every 5 min |
| ❌ **Atomic cancellation** | Seats returned to inventory and status flipped in one transaction |
| 🚨 **Honest error codes** | 400 seat shortage · 404 missing booking · 409 replayed payment · 503 service down — propagated across services |

---

## 🔄 Booking Lifecycle

```
                 pay within 5 min
   INITIATED ───────────────────────► BOOKED ✅
       │
       │  user cancels / 5-min sweeper fires
       ▼
   CANCELLED ❌  (seats restored to the flight)
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js + Express
- **ORM:** Sequelize (migrations, transactions, row locks)
- **Database:** PostgreSQL
- **Inter-service:** REST over HTTP (axios)
- **Logging:** Winston
- **Frontend:** single-file HTML + vanilla JS — zero dependencies, zero build step

---

## 📡 API Reference

### Flights Service — `:3000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/cities` | Add a city |
| `POST` | `/airports` | Add an airport (`{name, code, cityId}`) |
| `POST` | `/airplanes` | Add an airplane (`{modelNumber, capacity}`) |
| `POST` | `/flights` | Schedule a flight (airports referenced by **code**, e.g. `"MAA"`) |
| `GET` | `/flights` | Search — `?trips=MAA-BLR&tripDate=…&travellers=2&price=2000-6000&sort=price_ASC` |
| `GET` | `/flights/:id` | Flight details |
| `PATCH` | `/flights/:id/seats` | 🔒 Seat inventory update (internal — the locked critical section) |

### Booking Service — `:4000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/bookings` | Book seats (`{flightId, userId, noOfSeats}`) — starts the 5-min hold |
| `POST` | `/bookings/payments` | Pay (`{bookingId, userId, totalCost}` + `x-idempotency-key` header) |
| `GET` | `/bookings?userId=N` | User's booking history |
| `DELETE` | `/bookings/:id` | Cancel & release seats |

---

## 🚀 Quick Start

```bash
# 1. Database (Postgres running locally)
createdb Flights

# 2. Flights service  (port 3000)
npm install
(cd src && npx sequelize-cli db:migrate)
npm run dev

# 3. Booking service  (port 4000)
cd Bookings/Flight-Booking-Service
npm install
(cd src && npx sequelize-cli db:migrate)
npm run dev

# 4. Frontend
open frontend/index.html
```

**Environment:** root `.env` → `PORT=3000` · booking `.env` → `PORT=4000`, `FLIGHT_SERVICE=http://localhost:3000`

---

## 📁 Project Structure

```
airline-proj/
├── src/                          # ✈️  Flights service
│   ├── routes/v1/                #     versioned REST routes
│   ├── middlewares/              #     request validation
│   ├── controllers/              #     HTTP in/out only
│   ├── services/                 #     business rules
│   ├── repositories/             #     DB access, transactions, row locks
│   ├── models/ · migrations/     #     Sequelize schema
│   └── config/                   #     env + winston logger
├── Bookings/Flight-Booking-Service/
│   └── src/                      # 🎫  Booking service (same layering)
├── frontend/index.html           # 🖥️  light UI — search / book / pay / cancel
└── FLOW.txt                      # 📜  full end-to-end flow walkthrough
```

---

## 🧠 Design Decisions

- **Why two services?** Inventory and bookings scale and fail independently; the booking service can be redeployed without touching flight search.
- **Why pessimistic locking (not optimistic)?** Seat contention on popular flights is *expected*, not exceptional — queuing on a row lock beats retry storms.
- **Why a seat hold + sweeper?** Users abandon checkouts. Time-boxed holds keep inventory honest without manual cleanup.
- **Why idempotency keys on payments?** Networks retry; users double-click. Charging twice is the one bug you can't apologise for.

📜 Deep-dive of every step: **[FLOW.txt](FLOW.txt)**
