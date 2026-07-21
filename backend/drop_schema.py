import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gym_backend.settings')

# Activate Django
django.setup()

from django.db import connection

print('Dropping and recreating public schema (destructive)...')
with connection.cursor() as cursor:
    # Drop public schema and recreate it
    cursor.execute('DROP SCHEMA public CASCADE;')
    cursor.execute('CREATE SCHEMA public;')
print('Schema reset complete.')
