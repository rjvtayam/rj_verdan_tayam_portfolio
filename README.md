# R.J. Verdan Tayam — Professional Portfolio

[![CI](https://github.com/rjvtayam/rj_verdan_tayam_portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/rjvtayam/rj_verdan_tayam_portfolio/actions/workflows/ci.yml)

Full-stack portfolio: **React 19 + Vite + Tailwind CSS v4** frontend, **FastAPI + SQLAlchemy (async) + Alembic** backend, **PostgreSQL 17** database.

## Project layout

```
├── frontend/            # React SPA (Vite, TypeScript, Tailwind v4, TanStack Query, Framer Motion)
├── backend/             # FastAPI service (JWT auth, Alembic migrations, pytest)
├── docker-compose.yml   # api + db + web in one command
└── README.md
```

## Local development

### 1. Database (PostgreSQL 17, local service)

```powershell
# databases created once (use your own postgres password)
$env:PGPASSWORD = '<your-postgres-password>'
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE portfolio;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE portfolio_test OWNER portfolio;"
```

### 2. Backend

```powershell
cd backend
uv sync                    # installs dependencies into .venv
uv run alembic upgrade head    # apply migrations
uv run python -m app.seed      # seed admin user + demo content
uv run uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/api/docs
- Health: http://localhost:8000/api/health
- Tests: `uv run pytest -q`

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev                # http://localhost:5173 (proxies /api to :8000)
```

- `npm run lint` — oxlint
- `npm run test` — vitest unit tests (lib logic: stat parsing, categories, formats)
- `npm run build` — type-check + production build

### 4. Admin console

- URL: http://localhost:5173/admin/login
- Credentials are seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` (see `backend/.env.example`) — never committed.
- Manage projects (incl. 1–5★ author rating), posts, skills, experience timeline, the contact inbox and testimonial moderation (publish / hide / delete).

### Content

- **Projects / skills / experience** are seeded from the real resume content (`backend/app/seed.py`): JNHS Portal, Farm Connect, Enlighten ED, Zuitt CodeCamp Web App (★ award) and this portfolio platform.
- Re-seed content after edits: `uv run python -m app.seed --refresh` (clears projects/skills/experiences; keeps posts, testimonials, messages).
- **Resume downloads**: `frontend/public/resumes/` — served at `/resumes/*.pdf`, opened from the floating right HUD rail (fixed at center-right on xl+, profile + download icon, mirrored with the left display-controls rail) and from the mobile menu drawer.
- **HUD overlays**: the right rail's profile icon opens a public **Profile** overlay (all resume personal details, education, certs, photo carousel — add photos in `frontend/public/photos/` + `src/lib/profile.ts`); the analytics icon opens a public **Analytics** overlay (animated gauges/donut/radar/bars for ratings, testimonials, skills + live browser vitals — no login required).

## Docker

```powershell
docker compose up --build
# web  → http://localhost:5173
# api  → http://localhost:8000/api/health
```

## API surface (prefix `/api/v1`)

| Area    | Endpoints |
|---------|-----------|
| auth    | `POST /auth/login`, `GET /auth/me` |
| public  | `GET /projects`, `GET /projects/{slug}`, `POST /projects/{id}/vote`, `GET /posts`, `GET /posts/{slug}`, `GET /skills`, `GET /experiences`, `POST /messages`, `GET/POST /testimonials` |
| uploads | avatar files served from `/api/uploads/<file>` (mounted static) |
| admin   | CRUD on `/admin/projects`, `/admin/posts`, `/admin/skills`, `/admin/experiences`, `/admin/messages`, testimonial moderation on `/admin/testimonials`, `GET /admin/stats` (JWT required) |

### Ratings & testimonials

- **Author rating** — 1–5★ per project, set in the admin project form (`projects.rating`).
- **Visitor votes** — anonymous per-visitor voting on each project page; one vote per `visitor_id` (UUID in localStorage), changeable, unique constraint `uq_project_visitor`. Returns `{rating_avg, rating_count, my_vote}`.
- **Testimonials** — public `POST /testimonials` (multipart: `name`, `role`, `quote`, `rating`, optional `avatar` ≤ 2MB, png/jpg/webp/gif), auto-published and rate-limited; admin can hide or delete. Avatars are stored in `backend/uploads/` and served from `/api/uploads/`.
- **Skills** — shown as ★ ratings on the About page (uses existing `proficiency`), plus a category radar chart.

## Signature UX features

- **Orbitron display type** + neon card palette (6 hues), aurora hero background, glow/hover shine on cards.
- **Dark-only theme** (forced) + **accent switcher** — 4 accents (lime / cyan / magenta / flame) via `data-accent`, persisted in localStorage.
- **HUD overlays** — profile résumé (printable), public analytics dashboard, and photo gallery (grid + lightbox) via the header/HUD icons.
- **Command palette** — `Ctrl/⌘ + K` (navigate, view photos, copy email, admin console).
- **Admin console** at `/admin` (subtle footer link) — login with the seeded `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- **Boot intro** — once per session (sessionStorage), respects `prefers-reduced-motion`.
- **Custom cursor** (desktop, fine pointer) + card tilt, count-up stats, global reading progress bar.

## Deployment notes

- **Frontend** → Vercel (build `npm run build`, output `dist`), set `VITE_API_URL` if the API is on another origin (the dev proxy is replaced by that).
- **API** → Render/Railway using `backend/Dockerfile`; set `DATABASE_URL`, `SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS`.
- **Database** → Neon/Postgres; run `alembic upgrade head && python -m app.seed` on release.
