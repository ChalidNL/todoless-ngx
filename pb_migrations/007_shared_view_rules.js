// Migration 007: shared view rules
// NOTE: This migration is intentionally disabled.
// The is_private-based listRule/viewRule can be configured manually via PocketBase admin UI
// after the database is initialized. PocketBase v0.34 validates rules during migration
// which causes a chicken-and-egg issue.
migrate(
  (app) => {
    // No-op: rules are set manually via admin UI
  },
  (app) => {
    // Rollback: no-op
  },
);
