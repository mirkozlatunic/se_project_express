# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WTWR (What to Wear?) back-end — an Express.js REST API for a clothing recommendation app. Users create accounts, add clothing items tagged by weather type, and like/dislike items. The frontend React app lives at https://github.com/mirkozlatunic/se_project_react.

## Commands

- `npm run start` — start the server (`node app.js`)
- `npm run dev` — start with hot reload (`nodemon app.js`)
- `npm run lint` — run ESLint (`npx eslint .`)
- No test suite is configured

## Prerequisites

- MongoDB must be running locally at `mongodb://127.0.0.1:27017/wtwr_db`
- Server runs on port 3001 by default (configurable via `PORT` env var)
- `JWT_SECRET` env var can be set via `.env` file (falls back to `"JWT_SECRET"` string)

## Architecture

**Entry point:** `app.js` — sets up Express with CORS, Helmet, JSON parsing, Winston logging, Celebrate validation errors, and a centralized error handler.

**Routing flow:** `routes/index.js` is the main router.
- `/signup` (POST) and `/signin` (POST) are public (validated with Celebrate)
- `/users/*` requires JWT auth via `middlewares/auth.js`
- `/items` — GET is public, POST/DELETE/like/dislike require auth (handled in `routes/clothingItem.js`)
- Unmatched routes return 404 via NotFoundError

**Error handling:** Custom error classes in `utils/` (BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError) each set a `statusCode`. The centralized `middlewares/error-handler.js` reads `err.statusCode` and returns JSON. Celebrate's `errors()` middleware handles validation errors before the custom handler.

**Auth:** JWT Bearer tokens, signed with `SECRET_KEY` from `utils/config.js`, 7-day expiry. Password hashing with bcrypt. The `authorize` middleware extracts the user ID from the token into `req.user._id`.

**Models (Mongoose):**
- `user` — name, avatar (URL), email (unique), password (select: false). Has static `findUserByCredentials` for login.
- `clothingItem` — name, weather (enum: hot/warm/cold), imageUrl, owner (ObjectId ref), likes (array of ObjectId refs).

**Validation:** `middlewares/validation.js` uses Celebrate/Joi for request validation. URL fields use `validator.isURL()` via custom Joi validator. Item IDs validated as 24-char hex strings.

## Code Style

- ESLint with airbnb-base + prettier
- CommonJS modules (`require`/`module.exports`)
- `_id` is allowed in no-underscore-dangle rule
- `next` parameter is allowed as unused (for Express error middleware signatures)
