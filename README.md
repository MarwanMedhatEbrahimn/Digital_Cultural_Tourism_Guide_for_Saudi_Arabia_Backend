# Digital Cultural Tourism Guide for Saudi Arabia — Backend

RESTful API for a digital cultural tourism guide. Admins manage cities, categories,
places, quiz questions, and suggested destinations; tourists (app users) register,
browse, like places, plan daily activities, and take quizzes.

This guide walks you through the project **from a fresh clone all the way to logging
in as an Admin and as a User (Tourist)** — installing dependencies, initializing
Prisma, pushing the schema to the database, configuring the environment, and hitting
the auth endpoints.

---

## Tech Stack

| Area          | Technology                                              |
| ------------- | ------------------------------------------------------- |
| Runtime       | Node.js + Express 5                                     |
| ORM           | Prisma 7 (`@prisma/client`) + `@prisma/adapter-mariadb` |
| Database      | MySQL / MariaDB                                          |
| Auth          | JWT (`jsonwebtoken`) + `bcryptjs`                        |
| Validation    | `express-validator`                                     |
| File uploads  | `multer` (images stored under `/uploads`)               |

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** and **npm**
- A running **MySQL 8+** or **MariaDB** server that you can connect to
- A database client (optional) — the MySQL CLI, DBeaver, or Prisma Studio

---

## How the schema reaches the database (the big picture)

There are **two** ways Prisma talks to your database in this project, and it matters:

1. **Prisma CLI** (migrations, `prisma studio`, `prisma generate`) reads the connection
   string from `DATABASE_URL` via [`prisma.config.ts`](prisma.config.ts).
2. **The running app** connects through the **MariaDB adapter** in
   [`src/config/database.js`](src/config/database.js), which reads the split
   variables: `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`,
   and `allow_Public_Key_Retrieval`.

> ⚠️ Both must point to the **same** database. That's why `.env` contains **both**
> the `DATABASE_URL` and the individual `DATABASE_*` variables.

The table definitions live in [`prisma/schema.prisma`](prisma/schema.prisma). The
actual SQL that creates the tables is committed under
[`prisma/migrations/`](prisma/migrations/). Running `prisma migrate deploy` executes
that SQL against your database.

> Note: The generated Prisma Client is written to `generated/prisma/` (a custom
> output path), and that folder is **gitignored** — so you **must** run
> `prisma generate` after every fresh clone and after any schema change.

---

## Step-by-step setup

### 1) Clone & install dependencies

```bash
git clone <your-repo-url>
cd Digital_Cultural_Tourism_Guide_for_Saudi_Arabia_Backend
npm install
```

### 2) Create an (empty) database

Prisma creates the **tables** for you — you only need to create the empty database.

```sql
CREATE DATABASE tourism_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

(Use the same name you put in `DATABASE_NAME` / `DATABASE_URL` below.)

### 3) Configure the environment

```bash
cp .env.example .env
```

Open `.env` and fill in your real values. See the
[Environment variables](#environment-variables) table below. At minimum, set your
database credentials and a strong `JWT_SECRET`.

### 4) Generate the Prisma Client

```bash
npx prisma generate
# or the npm script:
npm run generate-prisma
```

This creates the typed client in `generated/prisma/`.

### 5) Push the schema to the database (run the migrations)

This is the step that **creates all the tables** from the schema:

```bash
npx prisma migrate deploy
```

- `migrate deploy` — applies the committed migrations as-is (recommended for a clean
  setup and for production).
- `npx prisma migrate dev` — use this while **developing** if you change
  `schema.prisma` and want to generate a new migration.
- `npx prisma db push` — quick alternative that syncs the schema **without** creating
  migration history (handy for throwaway/dev databases).

### 6) (Optional) Verify the database visually

```bash
npm run prisma-studio
```

Opens Prisma Studio in the browser so you can confirm the tables were created.

### 7) Start the server

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start       # plain node
```

You should see the server banner and:

```
Server running on: http://localhost:3000
```

Quick health check:

```bash
curl http://localhost:3000/api/health
```

---

## Authentication flow

The API has **two independent identities**, each with its own auth endpoints:

- **Admin** → manages all content and the dashboard.
- **Tourist (app user)** → uses the mobile/app-facing features.

A JWT token encodes either `admin_id` **or** `tourist_id`. The
[`auth.middleware`](src/middlewares/auth.middleware.js) reads the token, loads the
right entity, and sets `req.userRole` to `"admin"` or `"tourist"`. The
[`role.middleware`](src/middlewares/role.middleware.js) (`requireAdmin` /
`requireTourist`) then guards each route.

> There is **no seed script** and no default admin, so you create the first admin
> yourself through the register endpoint. Passwords must be **at least 6 characters**.

### 8) Create & log in as an **Admin**

**Register the first admin** (public endpoint):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "Super Admin", "email": "admin@example.com", "password": "admin123" }'
```

**Log in as admin:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@example.com", "password": "admin123" }'
```

Response (shape):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": { "admin_id": 1, "name": "Super Admin", "email": "admin@example.com" },
    "token": "eyJhbGciOiJ..."
  }
}
```

Use the returned token as a Bearer token on protected admin routes:

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

Admin-guarded areas: `POST/PUT/DELETE` on `/api/cities`, `/api/categories`,
`/api/places`, `/api/questions`, `/api/suggested-destinations`, and the whole
`/api/dashboard`.

### 9) Register & log in as a **User (Tourist)**

**Register a tourist:**

```bash
curl -X POST http://localhost:3000/api/tourist/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "Ahmed", "email": "ahmed@example.com", "password": "user123" }'
```

**Log in as tourist:**

```bash
curl -X POST http://localhost:3000/api/tourist/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "ahmed@example.com", "password": "user123" }'
```

Both return a JWT token. Use it for tourist-only features:

```bash
curl http://localhost:3000/api/tourist/features/likes \
  -H "Authorization: Bearer <TOURIST_TOKEN>"
```

Tourist features live under `/api/tourist/features/*` (likes, activities, quiz submit).

---

## Environment variables

| Variable                    | Used by                         | Description                                                        |
| --------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`              | Prisma CLI (migrations, studio) | Full MySQL connection string. Same DB as the `DATABASE_*` vars.   |
| `DATABASE_HOST`             | Runtime adapter                 | DB host (e.g. `localhost`).                                        |
| `DATABASE_USER`             | Runtime adapter                 | DB user.                                                           |
| `DATABASE_PASSWORD`         | Runtime adapter                 | DB password.                                                       |
| `DATABASE_NAME`             | Runtime adapter                 | Database name (e.g. `tourism_db`).                                 |
| `DATABASE_PORT`             | (documentation)                 | DB port. Adapter currently defaults to `3306`.                    |
| `allow_Public_Key_Retrieval`| Runtime adapter                 | `true` for MySQL 8 over non-TLS localhost. Keep lowercase spelling.|
| `JWT_SECRET`                | Auth                            | Secret used to sign JWTs. Use a long random value in production.   |
| `JWT_EXPIRES_IN`            | Auth                            | Token lifetime (e.g. `7d`).                                        |
| `PORT`                      | Server                          | HTTP port (default `3000`).                                        |
| `NODE_ENV`                  | Server                          | `development` / `production`.                                      |
| `CORS_ORIGIN`              | (reserved)                      | Currently CORS is open (`*`) in `src/app.js`; kept for later use.  |

---

## API overview

Base URL: `http://localhost:3000/api`

| Group                  | Base path                    | Access                          |
| ---------------------- | ---------------------------- | ------------------------------- |
| Admin auth             | `/auth`                      | Public (register/login)         |
| Tourist auth           | `/tourist/auth`              | Public (register/login)         |
| Tourist features       | `/tourist/features`          | Tourist (Bearer token)          |
| Cities                 | `/cities`                    | Public read, Admin write        |
| Categories             | `/categories`                | Public read, Admin write        |
| Places                 | `/places`                    | Public read, Admin write        |
| Questions (quiz)       | `/questions`                 | Admin                           |
| Suggested destinations | `/suggested-destinations`    | Admin                           |
| Dashboard / app users  | `/dashboard`                 | Admin                           |
| Health                 | `/health`                    | Public                          |

Uploaded images are served statically from `/uploads`.

---

## NPM scripts

| Script                   | Command                | What it does                          |
| ------------------------ | ---------------------- | ------------------------------------- |
| `npm run dev`            | `nodemon src/app.js`   | Start with auto-reload                 |
| `npm start`              | `node src/app.js`      | Start the server                       |
| `npm run generate-prisma`| `prisma generate`      | Generate the Prisma Client             |
| `npm run prisma-studio`  | `prisma studio`        | Open Prisma Studio                     |
| `npm run test-db`        | `node test-db-connection.js` | (helper) test DB connection      |

---

## Notes & gotchas

- **`generated/prisma/` is gitignored.** After every clone or `npm install`, run
  `npx prisma generate` before starting the app, or you'll get a "Prisma Client did
  not initialize" error.
- **Two connection configs.** Prisma CLI uses `DATABASE_URL`; the running app uses the
  split `DATABASE_*` vars. Keep them pointing at the same database.
- **`allow_Public_Key_Retrieval` casing.** The code reads it in lowercase-`a`
  (`process.env.allow_Public_Key_Retrieval`). On Windows env vars are
  case-insensitive, but on Linux/macOS use the exact lowercase name.
- **No default admin.** Create the first admin via `POST /api/auth/register`.
- **Password rule.** Minimum 6 characters (enforced by `express-validator`).
