/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const field = users.fields.getByName('role');
    if (field) {
      field.values = ['admin', 'user', 'child', 'assistant'];
      app.save(users);
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const field = users.fields.getByName('role');
    if (field) {
      field.values = ['admin', 'user', 'child'];
      app.save(users);
    }
  },
);
