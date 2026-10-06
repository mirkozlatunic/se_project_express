# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WTWR (What to Wear?) back-end — an Express.js REST API for a clothing recommendation app. Users create accounts, add clothing items tagged by weather type, and like/dislike items. The frontend React app lives at https://github.com/mirkozlatunic/se_project_react.

## Commands

- `npm run start` — start the server (`node server.js`)
- `npm run dev` — start with hot reload (`nodemon server.js`)
- `npm run lint` — run ESLint
- `npm test` — run Jest (unit + Supertest integration tests); `npm run test:coverage` adds coverage
- Tests use `mongodb-memory-server` (no local MongoDB needed) and run with `--experimental-vm-modules` because `celebrate` is ESM-only

## Prerequisites

- MongoDB must be running for `npm start` (default `mongodb://127.0.0.1:27017/wtwr_db`, override with `MONGODB_URI`)
- Server runs on port 3001 by default (configurable via `PORT` env var)
- `JWT_SECRET` env var (via `.env`) signs tokens; required when `NODE_ENV=production`, otherwise falls back to a dev secret

## Architecture

**Entry points:** `app.js` builds and exports the Express app (CORS, Helmet, JSON parsing, Winston logging, Celebrate validation errors, centralized error handler) with no side effects, so tests can import it. `server.js` connects to MongoDB and calls `listen()`.

**Routing flow:** `routes/index.js` is the main router.
- `/signup` (POST) and `/signin` (POST) are public (validated with Celebrate)
- `/users/*` requires JWT auth via `middlewares/auth.js`
- `/items` — GET is public, POST/DELETE/like/dislike require auth (handled in `routes/clothingItem.js`)
- Unmatched routes return 404 via NotFoundError

**Error handling:** Custom error classes in `utils/` (BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError) each set a `statusCode`. The centralized `middlewares/error-handler.js` reads `err.statusCode` and returns JSON. Celebrate's `errors()` middleware handles validation errors before the custom handler.

**Auth:** JWT Bearer tokens, signed with `SECRET_KEY` from `utils/config.js` (sourced from `JWT_SECRET`), 7-day expiry. Password hashing with bcrypt. The `authorize` middleware extracts the user ID from the token into `req.user._id`.

**Models (Mongoose):**
- `user` — name, avatar (URL), email (unique), password (select: false). Has static `findUserByCredentials` for login.
- `clothingItem` — name, weather (enum: hot/warm/cold), imageUrl, owner (ObjectId ref), likes (array of ObjectId refs).

**Validation:** `middlewares/validation.js` uses Celebrate/Joi for request validation. URL fields use `validator.isURL()` via custom Joi validator. Item IDs validated as 24-char hex strings.

## Code Style

- ESLint with airbnb-base + prettier
- CommonJS modules (`require`/`module.exports`)
- `_id` is allowed in no-underscore-dangle rule
- `next` parameter is allowed as unused (for Express error middleware signatures)
