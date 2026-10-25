# TaskFlow

TaskFlow is a full-stack task and project management application built with
Django REST Framework and React. It provides a private workspace where an
authenticated user can organize projects, manage tasks, track progress on a
Kanban board, and see real database-backed statistics on a dashboard.

The frontend is compiled into the Django project and can be served from a
single origin, or run separately with Vite during development.

---

## Feature highlights

- Session-based authentication with registration, login, logout, profile
  editing, and password change.
- Private projects with task counts, completion percentages, search,
  filtering, ordering, and archive support.
- Full task CRUD with status, priority, optional due date, search, filters,
  ordering, pagination, overdue detection, and completion tracking.
- Kanban board with To Do / In Progress / Done columns and accessible status
  changes.
- Dashboard with real statistics: totals, status and priority breakdowns,
  completion percentage, overdue count, weekly activity, upcoming deadlines,
  recent tasks, and project progress.
- Responsive React UI with reusable components, loading/empty/error states,
  form validation, dialogs, toasts, and keyboard-accessible controls.
- Versioned REST API with OpenAPI schema and interactive documentation.
- Ownership isolation: every project and task query is scoped to the current
  user, and cross-user access returns `404`.
- Automated backend and frontend tests, plus verified production build.

---

## Architecture

### Backend

```text
taskflow/backend/
├── config/                 # settings, URLs, API index, health, middleware,
│                           # OpenAPI authentication extension
├── accounts/               # custom user, email/username auth, profile,
│                           # password change, CSRF and session endpoints
├── projects/               # projects, ownership, filters, counts
├── tasks/                  # tasks, status/priority model, filters, demo seed
├── dashboard/              # aggregate statistics and dashboard serializer
├── conftest.py             # shared pytest fixtures
├── manage.py
├── requirements.txt
├── requirements-dev.txt
└── requirements-prod.txt
```

The API follows a conventional Django REST Framework structure:

- `ModelViewSet` for projects and tasks.
- Serializers enforce validation and restrict related projects to the owner.
- `get_queryset()` applies ownership, filtering, ordering, and search before
  pagination.
- Dashboard aggregation lives in `dashboard/services.py` rather than in views.
- Authentication uses Django's HTTP-only session cookie.
- State-changing requests require the CSRF token.
- DRF returns `401` for unauthenticated protected endpoints.

### Frontend

```text
taskflow/frontend/
├── src/
│   ├── components/         # UI primitives, layout, auth, tasks, projects,
│   │                       # dashboard widgets
│   ├── context/            # auth and global task dialog providers
│   ├── hooks/              # workspace queries, mutations, document title
│   ├── lib/                # API client, query keys, errors, dates, helpers
│   ├── pages/              # landing, auth, dashboard, tasks, board, projects,
│   │                       # profile, task detail, 404
│   ├── test/               # Vitest setup, fixtures, render helpers
│   └── types/              # typed API models
├── package.json
├── vite.config.ts
└── tsconfig.json
```

- React 19 + TypeScript.
- React Router for client-side routing and protected routes.
- TanStack Query for server-state caching and invalidation.
- React Hook Form + Zod for form state and validation.
- Tailwind CSS v4 with a small custom design-token layer.
- Radix primitives for accessible dialogs/dropdowns.
- Axios client with automatic CSRF-token handling.

In development, Vite proxies `/api` to `http://127.0.0.1:8000`. In production,
the built assets are served by Django/WhiteNoise under `/static/`, and Django
serves the SPA shell for client-side routes.

---

## Technology stack

| Layer | Technology |
|---|---|
| Backend | Python 3.13, Django 5.2, Django REST Framework 3.18 |
| API docs | drf-spectacular (OpenAPI 3) |
| Database | SQLite locally; PostgreSQL supported through `DATABASE_URL` |
| Auth | Django sessions, HTTP-only cookies, CSRF protection |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Data fetching | Axios, TanStack Query |
| Forms | React Hook Form, Zod |
| Tests | pytest, pytest-django, Vitest, Testing Library |
| Production | Gunicorn (Linux), WhiteNoise, PostgreSQL |

---

## Prerequisites

- Windows 10/11 (commands below use PowerShell), macOS, or Linux.
- Python 3.11+ (the verified environment uses Python 3.13).
- Node.js 20+ and npm (the verified environment uses Node 22).
- No external services are required for local development.

---

## Local development

### 1. Backend setup

```powershell
cd C:\laragon\www\django-web-site-master\taskflow\backend

# The virtualenv already exists in the current workspace. To recreate it:
# C:\laragon\bin\python\python-3.13\python.exe -m venv .venv

.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt

# Optional: create a local .env from the safe example.
Copy-Item .env.example .env
```

Development defaults work without a `.env` file. When `DEBUG=True`,
`SECRET_KEY` falls back to a development-only value and SQLite is used.

### 2. Database and superuser

```powershell
python manage.py migrate
python manage.py createsuperuser
```

### 3. Optional demo data

Demo data is idempotent and is attached to an existing account:

```powershell
python manage.py seed_demo --user <username>
```

This creates four projects (one archived) and sixteen tasks, including
overdue, upcoming, and completed items. Run it again safely; it will not
create duplicates.

### 4. Run the backend

```powershell
python manage.py runserver
```

- API root: <http://127.0.0.1:8000/api/v1/>
- Swagger UI: <http://127.0.0.1:8000/api/docs/>
- ReDoc: <http://127.0.0.1:8000/api/redoc/>
- OpenAPI schema: <http://127.0.0.1:8000/api/schema/>
- Health check: <http://127.0.0.1:8000/api/v1/health/>
- Django admin: <http://127.0.0.1:8000/admin/>

### 5. Run the frontend dev server

In a second terminal:

```powershell
cd C:\laragon\www\django-web-site-master\taskflow\frontend
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. Vite proxies API requests to the Django server on
port 8000.

### Single-origin preview

To serve the built frontend from Django:

```powershell
cd C:\laragon\www\django-web-site-master\taskflow\frontend
npm run build

cd ..\backend
python manage.py collectstatic --noinput
python manage.py runserver
```

Open <http://127.0.0.1:8000>. With `DEBUG=True`, Django serves the built assets
directly from `frontend/dist`; `collectstatic` is mainly needed for a
`DEBUG=False` production-style run.

---

## Environment variables

Backend variables are read from `backend/.env` (see `backend/.env.example`) or
from the process environment.

| Variable | Default | Purpose |
|---|---|---|
| `DJANGO_ENV` | `development` | Set to `production` for production mode. |
| `DEBUG` | `True` unless production | Enables development behaviour and debug pages. |
| `SECRET_KEY` | dev fallback | Required when `DEBUG=False`; must be at least 32 characters. |
| `ALLOWED_HOSTS` | local hosts in dev | Comma-separated production hostnames. Required when `DEBUG=False`. |
| `CSRF_TRUSTED_ORIGINS` | empty | Comma-separated HTTPS origins, e.g. `https://taskflow.example.com`. |
| `DATABASE_URL` | empty (SQLite) | PostgreSQL URL, e.g. `postgresql://user:pass@host:5432/taskflow`. |
| `SESSION_COOKIE_SECURE` | `True` when not DEBUG | Send the session cookie only over HTTPS. |
| `CSRF_COOKIE_SECURE` | `True` when not DEBUG | Send the CSRF cookie only over HTTPS. |
| `SECURE_SSL_REDIRECT` | `False` | Redirect HTTP to HTTPS. Enable when Django handles HTTPS directly. |
| `SECURE_HSTS_SECONDS` | `31536000` when not DEBUG | HSTS max-age. Set `0` only for local HTTP testing. |
| `SECURE_HSTS_INCLUDE_SUBDOMAINS` | `True` when not DEBUG | Include subdomains in HSTS. |
| `SECURE_HSTS_PRELOAD` | `False` | Enable only after confirming HSTS readiness. |

Optional frontend variable:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | Override the API base URL at build time. |

Never commit a real `.env` file. It is ignored by `.gitignore`.

---

## API overview

All endpoints are under `/api/v1/`.

### Authentication and profile

| Method | Path | Description |
|---|---|---|
| `GET` | `/auth/csrf/` | Set/read the CSRF cookie. |
| `POST` | `/auth/register/` | Create an account and start a session. |
| `POST` | `/auth/login/` | Sign in with username or email. |
| `POST` | `/auth/logout/` | End the session. |
| `GET` | `/auth/me/` | Current user. |
| `GET` | `/auth/profile/` | Current profile. |
| `PATCH` | `/auth/profile/` | Update username, email, or names. |
| `POST` | `/auth/password/change/` | Change the password and keep the session. |

### Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/projects/` | Paginated list of the current user's projects. |
| `POST` | `/projects/` | Create a project. |
| `GET` | `/projects/{id}/` | Project detail with task counts. |
| `PATCH` | `/projects/{id}/` | Update name, description, color, or archive state. |
| `DELETE` | `/projects/{id}/` | Delete a project and its tasks. |

Query parameters: `archived=active|archived|all`, `search`, `ordering`
(`-updated_at`, `updated_at`, `-created_at`, `created_at`, `name`, `-name`),
`page`, `page_size`.

### Tasks

| Method | Path | Description |
|---|---|---|
| `GET` | `/tasks/` | Paginated list of the current user's tasks. |
| `POST` | `/tasks/` | Create a task. |
| `GET` | `/tasks/{id}/` | Task detail. |
| `PATCH` | `/tasks/{id}/` | Update title, description, status, priority, project, or due date. |
| `DELETE` | `/tasks/{id}/` | Delete a task. |

Query parameters: `status`, `priority`, `project`, `due`
(`overdue|today|upcoming|none`), `search`, `ordering`, `page`, `page_size`.

Supported task orderings: `-updated_at`, `updated_at`, `-created_at`,
`created_at`, `due_date`, `-due_date`, `priority`, `-priority`, `title`,
`-title`.

### Dashboard and service

| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard/` | Real statistics and recent/upcoming tasks. |
| `GET` | `/health/` | Lightweight health check. |
| `GET` | `/` | API index with links. |

### CSRF and authentication example

```text
1. GET /api/v1/auth/csrf/          -> sets csrftoken cookie
2. POST /api/v1/auth/register/     -> X-CSRFToken: <cookie value>
3. The session cookie is set automatically.
4. Every POST/PATCH/DELETE request must send X-CSRFToken.
```

Example registration:

```powershell
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-WebRequest http://127.0.0.1:8000/api/v1/auth/csrf/ -WebSession $session | Out-Null
$token = ($session.Cookies.GetCookies('http://127.0.0.1:8000') | Where-Object Name -eq 'csrftoken').Value
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/v1/auth/register/ `
  -WebSession $session -ContentType 'application/json' `
  -Headers @{ 'X-CSRFToken' = $token } `
  -Body '{"username":"alice","email":"alice@example.com","password":"StrongPass!2026","password_confirm":"StrongPass!2026"}'
```

Unavailable or other-user resources return `404` so resource existence is not
leaked. Validation errors return `400` with field-level messages.

---

## Testing and verification

### Backend

```powershell
cd C:\laragon\www\django-web-site-master\taskflow\backend
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py spectacular --file schema.yml --validate
```

Verified on 2026-10-25:

- `51 passed` backend tests.
- Django system checks clean.
- No pending model changes.
- OpenAPI schema generated and validated with zero warnings.

### Frontend

```powershell
cd C:\laragon\www\django-web-site-master\taskflow\frontend
npm run test
npm run typecheck
npm run build
```

Verified on 2026-10-25:

- `19 passed` frontend interaction tests across 7 test files.
- TypeScript type check passed.
- Production build completed successfully.

The build reports a non-blocking chunk-size advisory because the main bundle is
larger than 500 kB. Route-level code splitting is a documented future
improvement.

### Live end-to-end verification

A real HTTP run against a temporary SQLite database verified 24 checks:

- SPA HTML, built JS asset, OpenAPI docs, and health endpoint.
- CSRF cookie handling and unauthenticated rejection.
- Registration, session authentication, profile update, and logout.
- Project and task creation, status transition to done, filters, ordering,
  project counts, and dashboard statistics.
- Cross-user read, update, and delete attempts all returning `404`.

The development database was not modified by this check.

---

## Security notes

- Authentication uses an HTTP-only session cookie; passwords are hashed by
  Django and never returned by the API.
- CSRF is enforced for state-changing requests, including registration,
  login, logout, profile updates, and password changes.
- Every project and task queryset is filtered by `owner=request.user`.
- Related-project fields are limited to the current user's projects, so a user
  cannot attach a task to another user's project.
- Cross-user access returns `404` rather than revealing that a resource exists.
- Authentication endpoints are rate-limited to `30/min`.
- Security headers include `X-Content-Type-Options`, a same-origin referrer
  policy, `X-Frame-Options: DENY`, and a cross-origin opener policy.
- Production mode requires a strong `SECRET_KEY` and explicit
  `ALLOWED_HOSTS`; secure cookies default to `True`.
- Secrets are loaded from environment variables and `.env` is ignored by Git.

No application can be declared completely secure. Review deployment-specific
TLS, proxy, logging, backup, and monitoring configuration before production use.

---

## Production deployment

The verified local environment uses SQLite. For a multi-user production
deployment, use PostgreSQL. SQLite is not suitable for concurrent writes across
multiple application workers.

### 1. Install production dependencies

On the Linux server:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-prod.txt
```

`gunicorn` is included for Linux/Unix. It is not supported on Windows.

### 2. Configure the environment

```bash
export DJANGO_ENV=production
export DEBUG=False
export SECRET_KEY='replace-with-a-long-random-value'
export ALLOWED_HOSTS='taskflow.example.com'
export CSRF_TRUSTED_ORIGINS='https://taskflow.example.com'
export DATABASE_URL='postgresql://taskflow:password@db-host:5432/taskflow'
export SESSION_COOKIE_SECURE=True
export CSRF_COOKIE_SECURE=True
export SECURE_SSL_REDIRECT=True
```

Use a strong, unique `SECRET_KEY` of at least 32 characters. Terminate TLS at a
reverse proxy or load balancer and forward `X-Forwarded-Proto: https`.

### 3. Build the frontend

```bash
cd taskflow/frontend
npm ci
npm run build
```

### 4. Migrate, collect static files, and start

```bash
cd ../backend
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

WhiteNoise serves the collected static files. The SPA shell is served by
Django for `/`, `/login`, `/register`, and all `/app` routes, so the reverse
proxy should forward those paths to Gunicorn.

Example Nginx location:

```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 5. Verify deployment

```bash
python manage.py check --deploy
```

The current production profile reports only two optional warnings:

- `security.W008`: `SECURE_SSL_REDIRECT` is not enabled by default. Enable it
  when Django should perform the redirect.
- `security.W021`: HSTS preload is not enabled. Enable it only after confirming
  that all subdomains are HTTPS-ready.

Do not claim a deployment has succeeded until migrations, static files,
authentication, and the health endpoint have been verified on the target host.

---

## API documentation

- Interactive Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- Raw OpenAPI schema: `/api/schema/`
- Regenerate the checked-in schema:

```powershell
cd C:\laragon\www\django-web-site-master\taskflow\backend
.\.venv\Scripts\python.exe manage.py spectacular --file schema.yml --validate
```

---

## Known limitations

- No email verification, password reset, or email notifications.
- No real-time collaboration or WebSocket updates.
- The Kanban board uses explicit status controls instead of drag-and-drop.
  This is accessible and reliable but less tactile than pointer dragging.
- No background task queue.
- No CI pipeline is included in the repository.
- The frontend main bundle exceeds the default 500 kB advisory; route-level
  code splitting is not yet implemented.
- SQLite is used for local development. Production requires PostgreSQL or a
  comparable concurrent database.
- Django admin remains available at `/admin/` for staff users. Keep it behind
  HTTPS and restrict staff access in deployment.

---

## Quick command reference

```powershell
# Backend
cd C:\laragon\www\django-web-site-master\taskflow\backend
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver
.\.venv\Scripts\python.exe -m pytest -q

# Frontend
cd C:\laragon\www\django-web-site-master\taskflow\frontend
npm run dev
npm run test
npm run typecheck
npm run build
```
