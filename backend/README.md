# FitSync Gym Backend (Django)

A Django REST API for managing a gym/fitness center: members, trainers, subscriptions and payments, attendance tracking, expenses, and dashboard analytics. Authentication uses JWT.

## Tech stack

- Python (3.10+ recommended)
- Django 5.2
- Django REST Framework (DRF)
- JWT auth via djangorestframework-simplejwt
- CORS via django-cors-headers
- Filtering via django-filter
- PostgreSQL (default DB; SQLite commented as an alternative)

## Features

- Users & Admin
  - JWT login/refresh, admin CRUD for users
- Members & Trainers
  - CRUD, filtering (e.g., trainer active, gender)
- Subscriptions & Payments
  - Plans, subscriptions, payments with analytics (monthly revenue, methods, renewal rate)
- Attendance
  - CRUD with filters/search; analytics (daily trend, peak hours, member activity)
- Expenses
  - CRUD, search/order/filter; dashboards, statistics, monthly profits (payments − expenses)
- Dashboard
  - Aggregated KPIs and charts (attendance, revenue, trainers, members)

## Project layout

```
backend/
  README.md
  gym_backend/
    manage.py
    gym_backend/           # Django project settings/urls
    attendance/            # Attendance API + analytics
    dashboard/             # Dashboard KPIs & charts
    expenses/              # Expense tracking & analytics
    members/               # Members API
    subscriptions/         # Plans, subscriptions, payments + analytics
    trainers/              # Trainers API
    users/                 # Admin-only user management (Django User)
  misc/                    # App-specific notes (non-code)
```

## Quickstart (Windows PowerShell)

Prereqs:
- Python 3.10+
- PostgreSQL 13+ running locally

1) Clone and enter the backend folder

```powershell
# cd to your workspace (if not already)
cd d:\Workspace\FitSync\backend
```

2) Create and activate a virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3) Install dependencies

If you have a requirements.txt (see below), run:

```powershell
pip install -r requirements.txt
```

If not, install the core packages manually:

```powershell
pip install django==5.2.* djangorestframework django-filter \
            djangorestframework-simplejwt django-cors-headers \
            psycopg2-binary python-dateutil
```

4) Configure the database

The project is configured for PostgreSQL in `gym_backend/gym_backend/settings.py`.
Update the `DATABASES` section to match your local credentials, e.g.:

- NAME: your database name (e.g., gym_db)
- USER: your Postgres user
- PASSWORD: your Postgres password
- HOST: localhost
- PORT: 5432

Alternatively, switch to SQLite by uncommenting the provided SQLite block.

5) Run migrations and create a superuser

```powershell
cd gym_backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

6) Start the dev server

```powershell
python manage.py runserver
```

Server will be available at http://127.0.0.1:8000/

## Authentication

- Obtain token (POST): `/api/token/` with JSON body `{ "username": "<admin>", "password": "<password>" }`
- Refresh token (POST): `/api/token/refresh/` with `{ "refresh": "<refresh-token>" }`
- Include the access token in requests: `Authorization: Bearer <access-token>`

PowerShell example using Invoke-RestMethod:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/token/ -ContentType 'application/json' -Body (@{ username='admin'; password='yourpassword' } | ConvertTo-Json)
$token = $login.access

Invoke-RestMethod -Method Get -Uri http://127.0.0.1:8000/api/members/ -Headers @{ Authorization = "Bearer $token" }
```

## API overview

Base paths:
- Admin: `/admin/`
- API: `/api/`
- Dashboard: `/api/dashboard/`

Users (admin-only, JWT required)
- GET/POST `/api/users/`
- GET/PATCH/DELETE `/api/users/{id}/`
- POST `/api/users/{id}/toggle-status/`

Members
- REST: `/api/members/` (ModelViewSet)

Trainers
- REST: `/api/trainers/`
- Filters: `?is_active=true&gender=male`

Subscriptions & Payments
- REST: `/api/plans/`, `/api/subscriptions/`, `/api/payments/`
- Filters:
  - Subscriptions: `?member=1&is_active=true`
  - Payments: `?subscription=1&status=paid&method=cash`
- Analytics:
  - GET `/api/payments/analytics/monthly-revenue/?months=6`
  - GET `/api/payments/analytics/payment-methods/`
  - GET `/api/subscriptions/analytics/renewal-rate/`

Attendance
- REST: `/api/attendance/` (filters: `member`, `date`, `status`; search: `member__full_name`, `remarks`)
- Analytics:
  - GET `/api/attendance/analytics/daily-trend/?days=7`
  - GET `/api/attendance/analytics/peak-hours/`
  - GET `/api/attendance/analytics/member-activity/?page=1&page_size=20`

Expenses
- REST: `/api/expenses/`
- Extra endpoints:
  - GET `/api/expenses/recent/`
  - GET `/api/expenses/by_person/`
  - GET `/api/expenses/monthly_summary/`
  - GET `/api/expenses/dashboard/`
  - GET `/api/expenses/statistics/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`
  - GET `/api/analytics/monthly-profits/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`

Dashboard
- GET `/api/dashboard/analytics/overview/`
- GET `/api/dashboard/analytics/charts/`

## Environment and security

- Do not commit real secrets. Consider loading sensitive values (SECRET_KEY, DB creds, DEBUG, allowed hosts) from environment variables or a `.env` file (via `python-dotenv`) and updating `settings.py` accordingly.
- CORS is currently set to allow all origins (`CORS_ALLOW_ALL_ORIGINS = True`). Restrict this in production.

## Running tests

```powershell
cd gym_backend
python manage.py test
```

## Troubleshooting

- psycopg2 build issues on Windows: prefer `psycopg2-binary` in dev. For production, use `psycopg2`.
- 403 responses: ensure you send `Authorization: Bearer <token>` and your user has permissions (many endpoints require admin).
- Filters not working: make sure `django-filter` is installed and added to `INSTALLED_APPS`.

## Requirements

If you want a starter `requirements.txt`, create one like:

```
django==5.2.3
djangorestframework==3.15.2
django-filter==24.3
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.4.0
psycopg2-binary==2.9.9
python-dateutil==2.9.0.post0
```

You can then install with:

```powershell
pip install -r requirements.txt
```

## License

This project is intended for internal use. Add a license if you plan to distribute.
