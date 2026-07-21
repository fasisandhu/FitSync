import os
import django

# Ensure settings module points to project settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gym_backend.settings')

django.setup()

from django.db import connection

print('Connected to DB. Clearing django_migrations table...')
with connection.cursor() as cursor:
    cursor.execute('DELETE FROM django_migrations;')
print('django_migrations table cleared.')
