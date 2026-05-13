# Full-stack Starter (Spring Boot + React)

## What's included

- **Backend**: Spring Boot 3, Java 17, Maven, Spring Web, Spring Data JPA, Spring Security (JWT)
- **Frontend**: React + Vite, Tailwind CSS, `lucide-react`
- **Database**: PostgreSQL via Docker Compose

## Prereqs

- Java 17+
- Node.js 18+ (recommended)
- Docker Desktop

## Run Postgres

From the repo root:

```bash
docker compose up -d
```

Postgres is exposed on `localhost:5432`.

## Run backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.
If port 8080 is taken, it may run on `http://localhost:8081`.

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Auth endpoints (JWT)

- `POST /api/auth/signup` `{ "username": "alice", "password": "pass" }`
- `POST /api/auth/login` `{ "username": "alice", "password": "pass" }` → `{ "token": "..." }`
- `GET /api/me` (requires `Authorization: Bearer <token>`)

