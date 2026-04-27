#!/bin/sh
# Seed bundled migrations into the volume.
# Always overwrite — migrations in the image are the source of truth.
mkdir -p /pb_migrations

for f in /pb_migrations_bundled/*.js; do
  base=$(basename "$f")
  if [ ! -f "/pb_migrations/$base" ]; then
    echo "[entrypoint] seeding migration: $base"
    cp "$f" "/pb_migrations/$base"
  else
    # Overwrite if the bundled version is newer/different
    if ! cmp -s "$f" "/pb_migrations/$base"; then
      echo "[entrypoint] updating migration: $base"
      cp "$f" "/pb_migrations/$base"
    fi
  fi
done

exec /usr/local/bin/pocketbase "$@"
