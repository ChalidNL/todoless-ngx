/// <reference path="../pb_data/types.d.ts" />

// Migration 012: Fix users createRule
// PocketBase v0.34 auth collections:
//   null  = only superusers/admins
//   ""    = public (anyone can register)
// Migration 010 wrongly set it to null. Fix: set to "".
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    users.createRule = '';  // "" = public registration allowed
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    users.createRule = null;
    app.save(users);
  }
);
