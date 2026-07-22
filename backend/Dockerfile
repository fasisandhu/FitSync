# FitSync Django backend — container image for Render (or any Docker host)
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install Python dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project
COPY gym_backend/ ./gym_backend/

WORKDIR /app/gym_backend

EXPOSE 8000

# On boot: apply migrations, collect static, ensure a demo superuser exists, then serve.
# createsuperuser --noinput is a no-op (non-zero) if the user already exists, hence `|| true`.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && (python manage.py createsuperuser --noinput || true) && gunicorn gym_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"]
