# OpenMusic API v1 (Dicoding Submission)

Stack:
- Node.js (CommonJS)
- Hapi.js
- Joi Validation
- PostgreSQL (pg)
- Migrations: node-pg-migrate

## 1) Install
```bash
npm install
```

## 2) Setup env
Copy `.env.example` to `.env` and fill your PostgreSQL credentials:
```bash
cp .env.example .env
```

## 3) Create DB + run migrations
Create database (example):
```bash
createdb openmusic
```

Run migrations:
```bash
npm run migrate:up
```

## 4) Run server
```bash
npm run start
```

Server will run on:
- `http://HOST:PORT` (default: `http://localhost:5000`)

## 5) Test with Postman
Import Dicoding Postman Collection + Environment, select environment, then run Collection Runner in order.

### Reset data (if needed)
If tests fail due to old data:
```sql
TRUNCATE songs, albums;
```
