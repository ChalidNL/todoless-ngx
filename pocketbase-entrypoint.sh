#!/bin/sh
# Seed bundled migrations into the volume on first install.
# On subsequent starts the files already exist, so nothing is overwritten.
mkdir -p /pb_migrations

for f in /pb_migrations_bundled/*.js; do
  base=$(basename "$f")
  if [ ! -f "/pb_migrations/$base" ]; then
    echo "[entrypoint] seeding migration: $base"
    cp "$f" "/pb_migrations/$base"
  fi
done

exec /pocketbase "$@"
