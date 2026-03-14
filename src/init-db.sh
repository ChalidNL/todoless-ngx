#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until PGPASSWORD="${POSTGRES_PASSWORD:-todoless123}" psql -h db -U postgres -d todoless -c '\q' 2>/dev/null; do
  echo "Database not ready yet, waiting..."
  sleep 2
done

echo "Database is ready, checking if initialization is needed..."

# Check if tables exist
TABLE_EXISTS=$(PGPASSWORD="${POSTGRES_PASSWORD:-todoless123}" psql -h db -U postgres -d todoless -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');")

if [ "$TABLE_EXISTS" = "f" ]; then
  echo "Initializing database schema..."
  PGPASSWORD="${POSTGRES_PASSWORD:-todoless123}" psql -h db -U postgres -d todoless -f /app/init.sql
  echo "Database initialized successfully!"
else
  echo "Database already initialized, skipping..."
fi

echo "Starting application..."
exec "$@"
