# COMP 3123 Assignment 1 – Secure Employee Management REST API

**Student:** 101496696
**GitHub:** https://github.com/martinsmadubuchi/101496696_COMP3123_Assignment1
**Deployed API:** https://101496696-comp-3123-assignment1.vercel.app

## 1. Project Overview

A secure RESTful backend API built with **Node.js, Express and MongoDB**. Users can sign up and log in, which returns a JWT. With that token they can create, read, update and delete **their own** employees. A user can never see or change employees created by another user.

### Technologies
| Purpose | Technology |
|---|---|
| Runtime / framework | Node.js, Express 5 |
| Database | MongoDB Atlas + Mongoose (database: `comp3123_assignment1`) |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password hashing | `bcryptjs` (12 salt rounds) |
| Validation | `express-validator` |
| Security headers | `helmet` |
| Rate limiting | `express-rate-limit` |
| Logging | `winston` (file + console) + `morgan` (HTTP requests) |
| Config | `dotenv` |
| Dev | `nodemon` |

## 2. Project Structure

```
├── server.js                 # Entry point: loads env, connects DB, starts server
├── src/
│   ├── app.js                # Express app: middleware, routes, error handling
│   ├── config/db.js          # MongoDB connection (database comp3123_assignment1)
│   ├── controllers/          # HTTP layer (request → response)
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   └── healthController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification → req.user
│   │   ├── errorHandler.js   # Centralized JSON error handler
│   │   ├── notFound.js       # 404 for unknown routes
│   │   ├── rateLimiters.js   # Auth + general API rate limits
│   │   ├── requestLogger.js  # Morgan → Winston request logs
│   │   └── validate.js       # Returns 400 when validation fails
│   ├── models/
│   │   ├── User.js
│   │   └── Employee.js       # `user` field references User (owner)
│   ├── routes/               # Express Routers
│   ├── services/             # Business logic + database queries
│   ├── validators/           # express-validator rules
│   └── utils/                # logger, AppError
├── logs/                     # Local log files (sample-app.log committed)
├── postman/                  # Exported Postman collection
├── .env.example
└── .gitignore
```

## 3. Installation & Running

1. **Clone the repository**
```bash
   git clone https://github.com/martinsmadubuchi/101496696_COMP3123_Assignment1.git
   cd 101496696_COMP3123_Assignment1
```
2. **Install dependencies**
```bash
   npm install
```
3. **Configure environment variables**: copy `.env.example` to `.env` and fill in real values:
```bash
   cp .env.example .env
```
4. **Start MongoDB**: use a MongoDB Atlas cluster (recommended) or a local `mongod`. Put its connection string in `MONGODB_URI`. The database name is always `comp3123_assignment1`.
5. **Start the application**
```bash
   npm run dev     # development (auto-restart with nodemon)
   npm start       # production
```
6. **Test the API**: open `http://localhost:3000/health`, then import `postman/COMP3123_Assignment1.postman_collection.json` into Postman. Set the collection variable `baseUrl` to `http://localhost:3000` (or the deployed URL).

## 4. Configuration (Environment Variables)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `3000` |
| `NODE_ENV` | Environment name | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<user>:<password>@<host>/comp3123_assignment1` |
| `JWT_SECRET` | Long random secret used to sign JWTs | *(64+ random characters)* |
| `JWT_EXPIRES_IN` | Token lifetime | `1h` |

The real `.env` file is **never committed** (it is listed in `.gitignore`).

## 5. API Endpoints

Base paths: `/api/v1/user` and `/api/v1/emp`

| # | Method | Endpoint | Auth | Success | Purpose |
|---|---|---|---|---|---|
| 1 | POST | `/api/v1/user/signup` | No | **201** | Register a new user |
| 2 | POST | `/api/v1/user/login` | No | **200** | Log in with username **or** email; returns JWT |
| 3 | GET | `/api/v1/emp/employees` | JWT | **200** | List the logged-in user's employees |
| 4 | POST | `/api/v1/emp/employees` | JWT | **201** | Create an employee owned by the logged-in user |
| 5 | GET | `/api/v1/emp/employees/{eid}` | JWT | **200** | Get one of the user's employees |
| 6 | PUT | `/api/v1/emp/employees/{eid}` | JWT | **200** | Update one of the user's employees |
| 7 | DELETE | `/api/v1/emp/employees?eid={eid}` | JWT | **204** | Delete one of the user's employees |
| – | GET | `/health` | No | **200** | Health check |

### Example requests
**Signup**
```json
POST /api/v1/user/signup
{ "username": "userA", "email": "usera@example.com", "password": "Password123!" }
```
**Login** (username **or** email)
```json
POST /api/v1/user/login
{ "username": "userA", "password": "Password123!" }
{ "email": "usera@example.com", "password": "Password123!" }
```
**Create employee**
```json
POST /api/v1/emp/employees
Authorization: Bearer <jwt>
{
  "first_name": "John", "last_name": "Doe", "email": "john.doe@example.com",
  "position": "Software Developer", "salary": 75000,
  "date_of_joining": "2024-03-15", "department": "Engineering"
}
```

### Error response format
Every error returns consistent JSON:
```json
{ "status": "error", "message": "Validation failed", "errors": [ { "field": "email", "message": "email format is invalid" } ] }
```

### HTTP status codes used
| Code | When |
|---|---|
| 200 OK | Successful login, read, update, health check |
| 201 Created | User or employee created |
| 204 No Content | Employee deleted (empty body) |
| 400 Bad Request | Validation failure, malformed JSON, invalid ObjectId |
| 401 Unauthorized | Missing / invalid / expired JWT, wrong credentials |
| 403 Forbidden | Employee exists but belongs to another user |
| 404 Not Found | Employee does not exist, unknown route |
| 409 Conflict | Username or email already registered |
| 413 Payload Too Large | Request body over 10 KB |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Unexpected error (details logged, never sent to the client) |

## 6. Authentication

1. **Signup**: the user registers with a username, email and password. The password is hashed with bcrypt before it is saved.
2. **Login**: the user sends username **or** email plus password. The server compares the password with the stored hash using `bcrypt.compare`. The same error message is returned whether the user doesn't exist or the password is wrong, so attackers can't discover which usernames exist.
3. **JWT**: on success the server returns a JWT signed with `JWT_SECRET` (HS256). It contains the user's id (`sub`) and expires after `JWT_EXPIRES_IN` (1 hour).
4. **Authorization header**: the client sends the token on every employee request:
```
   Authorization: Bearer <jwt>
```
5. **Protected endpoints**: every `/api/v1/emp` route runs the `auth` middleware first. It rejects missing, malformed, invalid and expired tokens with **401**, checks the user still exists, and sets `req.user` from the **verified token only**.

## 7. Authorization (Employee Ownership)

Each employee document has a `user` field (an ObjectId referencing the `User` collection) that stores its owner.

- **On create**, the owner is always set from `req.user.id` (the JWT). Any `user` field sent by the client is rejected by validation, so a client can't assign employees to someone else.
- **Every query includes the owner**, e.g. `Employee.findOne({ _id: eid, user: req.user.id })`. The database itself will only return, update or delete a document if **both** the id and the owner match. Changing `eid` in the URL or query string can't bypass this.
- If the owner-scoped query finds nothing, the API checks whether the employee exists at all: it returns **403 Forbidden** if it belongs to someone else, or **404 Not Found** if it doesn't exist.
- `GET /employees` only returns `{ user: req.user.id }`, so each user sees only their own list.

Tested with two users (userA and userB): every cross-user GET / PUT / DELETE returns **403**.

## 8. Security

| Feature | Implementation |
|---|---|
| **Password hashing** | bcrypt with 12 salt rounds in a Mongoose `pre('save')` hook. The password field has `select: false` and is stripped from all JSON output, so it is never returned by the API. |
| **JWT** | Signed with a secret from the environment, HS256 only, 1-hour expiry, verified on every protected request. |
| **Helmet** | Adds security headers: `Content-Security-Policy` (limits where scripts load from, against XSS), `X-Frame-Options: SAMEORIGIN` (against clickjacking), `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (forces HTTPS), `Referrer-Policy`, and removes `X-Powered-By`. |
| **Rate limiting** | See below. |
| **Input validation** | `express-validator` on every body field, URL param and query param: required fields, string lengths, email format, positive salary, ISO date (YYYY-MM-DD), valid MongoDB ObjectId, password strength. Unknown fields (e.g. `user`) are rejected. Body size limited to 10 KB. |
| **Environment variables** | Secrets (`MONGODB_URI`, `JWT_SECRET`) live in `.env`, which is git-ignored. `.env.example` documents the variables without real values. |

### Rate limiting
Rate limiting caps how many requests one IP address can make in a time window. It protects against brute-force password guessing, spam signups and request flooding.

| Limiter | Endpoints | Limit |
|---|---|---|
| `authLimiter` | `POST /api/v1/user/signup`, `POST /api/v1/user/login` | **10 requests / 15 min / IP** |
| `apiLimiter` | Everything under `/api` | **100 requests / 15 min / IP** |

When the limit is exceeded, the API returns **429 Too Many Requests**:
```json
{ "status": "error", "message": "Too many authentication attempts from this IP. Please try again in 15 minutes." }
```
along with `RateLimit-Policy`, `RateLimit` and `Retry-After` headers telling the client when to try again. Each 429 is also logged as `RATE LIMIT exceeded`. `/health` is not rate-limited so monitoring always works.

## 9. Logging

- **Where:** `logs/app.log` (all levels) and `logs/error.log` (errors only), plus the console. On Vercel, where only `/tmp` is writable, logs go to `/tmp/logs` and the Vercel log viewer. Generated `.log` files are git-ignored; **`logs/sample-app.log`** is committed as an example.
- **What is logged:** timestamp, level, server startup, database connection, every HTTP request (method, path, status, response time, IP), signup/login success and failure, validation failures, authorization failures (missing/invalid/expired token, cross-user access attempts), employee create/update/delete, rate-limit events, and server errors (stack traces in the log file only).
- **Intentionally excluded:** passwords, JWTs / Authorization headers, `JWT_SECRET`, database credentials and request bodies. Morgan logs the URL only, never headers or body.

Example:
```
2026-10-16 05:44:34 [WARN] AUTHZ forbidden: user=6ad1d76f... tried to view employee=6ad1ed47... owned by another user
2026-10-16 07:42:26 [WARN] RATE LIMIT exceeded: POST /api/v1/user/login ip=::1
```

## 10. Health Check

`GET /health` (no authentication required)

```json
{
  "status": "ok",
  "service": "COMP3123 Assignment 1 API",
  "environment": "development",
  "uptime_seconds": 141,
  "timestamp": "2026-10-16T06:49:45.522Z",
  "database": { "name": "comp3123_assignment1", "status": "connected" }
}
```

## 11. Sample Test Credentials (non-sensitive)

| User | Username | Email | Password |
|---|---|---|---|
| User A | `userA` | `usera@example.com` | `Password123!` |
| User B | `userB` | `userb@example.com` | `Password123!` |

## 12. Postman

The exported collection is in `postman/COMP3123_Assignment1.postman_collection.json`. It contains success cases, validation/error cases, the two-user ownership tests and the rate-limit test. Login requests save the token automatically into the `tokenA` / `tokenB` collection variables.