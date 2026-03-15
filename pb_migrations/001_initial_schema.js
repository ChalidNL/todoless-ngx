migrate(
  (app) => {
    const baseRules = {
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
    };

    const createCollection = (collection) => {
      return app.save(collection);
    };

    createCollection(
      new Collection({
        name: 'tasks',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'title', type: 'text', required: true },
          { name: 'status', type: 'select', required: true, options: { values: ['backlog', 'todo', 'done'], maxSelect: 1 } },
          { name: 'blocked', type: 'bool' },
          { name: 'blocked_comment', type: 'text' },
          { name: 'priority', type: 'select', options: { values: ['urgent', 'normal', 'low'], maxSelect: 1 } },
          { name: 'horizon', type: 'select', options: { values: ['week', 'month', '3months', '6months', 'year'], maxSelect: 1 } },
          { name: 'assigned_to', type: 'relation', options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 } },
          { name: 'sprint_id', type: 'relation', options: { collectionId: 'sprints', cascadeDelete: false, maxSelect: 1 } },
          { name: 'due_date', type: 'date' },
          { name: 'repeat_interval', type: 'select', options: { values: ['week', 'month', 'year'], maxSelect: 1 } },
          { name: 'completed_at', type: 'date' },
          { name: 'archived', type: 'bool' },
          { name: 'archived_at', type: 'date' },
          { name: 'delete_after', type: 'date' },
          { name: 'is_private', type: 'bool' },
          { name: 'labels', type: 'json' },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    createCollection(
      new Collection({
        name: 'items',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'title', type: 'text', required: true },
          { name: 'completed', type: 'bool' },
          { name: 'shop_id', type: 'relation', options: { collectionId: 'shops', cascadeDelete: false, maxSelect: 1 } },
          { name: 'quantity', type: 'number' },
          { name: 'priority', type: 'select', options: { values: ['urgent', 'normal', 'low'], maxSelect: 1 } },
          { name: 'assigned_to', type: 'relation', options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 } },
          { name: 'due_date', type: 'date' },
          { name: 'labels', type: 'json' },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    createCollection(
      new Collection({
        name: 'notes',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'title', type: 'text' },
          { name: 'content', type: 'text', required: true },
          { name: 'pinned', type: 'bool' },
          { name: 'linked_type', type: 'select', options: { values: ['task', 'item'], maxSelect: 1 } },
          { name: 'linked_to', type: 'text' },
          { name: 'labels', type: 'json' },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    createCollection(
      new Collection({
        name: 'labels',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'color', type: 'text', required: true },
          { name: 'is_private', type: 'bool' },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    createCollection(
      new Collection({
        name: 'shops',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'color', type: 'text', required: true },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    createCollection(
      new Collection({
        name: 'calendar_events',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'start_time', type: 'date', required: true },
          { name: 'end_time', type: 'date' },
          { name: 'all_day', type: 'bool' },
          { name: 'task_id', type: 'relation', options: { collectionId: 'tasks', cascadeDelete: false, maxSelect: 1 } },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    createCollection(
      new Collection({
        name: 'sprints',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'start_date', type: 'date', required: true },
          { name: 'end_date', type: 'date', required: true },
          { name: 'duration', type: 'select', options: { values: ['1week', '2weeks', '3weeks', '1month'], maxSelect: 1 } },
          { name: 'week_number', type: 'number' },
          { name: 'year', type: 'number' },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    createCollection(
      new Collection({
        name: 'invite_codes',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'code', type: 'text', required: true },
          { name: 'expires_at', type: 'date', required: true },
          { name: 'used', type: 'bool' },
          { name: 'used_by', type: 'relation', options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 } },
          { name: 'used_at', type: 'date' },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    createCollection(
      new Collection({
        name: 'app_settings',
        type: 'base',
        ...baseRules,
        schema: [
          { name: 'theme', type: 'select', options: { values: ['light', 'dark'], maxSelect: 1 } },
          { name: 'language', type: 'text' },
          { name: 'sprint_duration', type: 'select', options: { values: ['1week', '2weeks', '3weeks', '1month'], maxSelect: 1 } },
          { name: 'sprint_start_day', type: 'number' },
          { name: 'archive_retention_days', type: 'number' },
          { name: 'auto_cleanup', type: 'bool' },
          { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 } },
        ],
      }),
    );

    const usersCollection = app.findCollectionByNameOrId('_pb_users_auth_');

    if (!usersCollection.fields.getByName('name')) {
      usersCollection.fields.add(
        new TextField({
          name: 'name',
          required: true,
        }),
      );
    }

    if (!usersCollection.fields.getByName('role')) {
      usersCollection.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'user', 'child'],
          maxSelect: 1,
        }),
      );
    }

    app.save(usersCollection);
  },
  (app) => {
    ['app_settings', 'invite_codes', 'calendar_events', 'sprints', 'shops', 'labels', 'notes', 'items', 'tasks'].forEach((name) => {
      try {
        const collection = app.findCollectionByNameOrId(name);
        app.delete(collection);
      } catch {}
    });
  },
);
