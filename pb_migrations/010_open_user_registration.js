/// <reference path="../pb_data/types.d.ts" />

// Migration 010: Open user registration (createRule = null = open)
// PocketBase v0.34: empty string '' = blocked, null = open
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    users.createRule = null;
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    users.createRule = '';
    app.save(users);
  },
);
