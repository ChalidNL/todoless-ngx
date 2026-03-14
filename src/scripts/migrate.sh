#!/bin/bash

# Database Migration Helper
# Run database migrations for Todoless

set -e

MIGRATIONS_DIR="./supabase/migrations"
DB_CONTAINER="supabase-db"
DB_NAME="todoless"
DB_USER="postgres"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📦 Todoless Database Migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if database container is running
if ! docker ps | grep -q $DB_CONTAINER; then
    echo "❌ Database container is not running!"
    echo "   Start it with: docker-compose -f docker-compose.supabase.yml up -d db"
    exit 1
fi

echo "✅ Database container is running"
echo ""

# Function to run a migration
run_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")
    
    echo "📝 Running migration: $migration_name"
    
    if docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$migration_file" 2>&1 | grep -q "ERROR"; then
        echo "❌ Migration failed: $migration_name"
        return 1
    else
        echo "✅ Migration successful: $migration_name"
        return 0
    fi
}

# Check if specific migration file is provided
if [ -n "$1" ]; then
    if [ -f "$1" ]; then
        run_migration "$1"
    else
        echo "❌ Migration file not found: $1"
        exit 1
    fi
else
    # Run all migrations in order
    echo "🔍 Looking for migrations in $MIGRATIONS_DIR"
    
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
        exit 1
    fi
    
    migration_count=0
    for migration_file in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration_file" ]; then
            run_migration "$migration_file"
            migration_count=$((migration_count + 1))
            echo ""
        fi
    done
    
    if [ $migration_count -eq 0 ]; then
        echo "⚠️  No migration files found in $MIGRATIONS_DIR"
    else
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Completed $migration_count migration(s)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
fi

echo ""
echo "📊 Database tables:"
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "\dt"
echo ""
