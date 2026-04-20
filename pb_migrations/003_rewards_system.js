migrate(
  (app) => {
    // Create rewards collection (no cross-refs to non-user collections initially)
    app.save(new Collection({
      name: 'rewards',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != "" && @request.auth.role != "child"',
      updateRule: '@request.auth.id != "" && @request.auth.role != "child"',
      deleteRule: '@request.auth.id != "" && @request.auth.role != "child"',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'points', type: 'number', required: true },
        { name: 'earned_by', type: 'relation', collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 },
        { name: 'earned_at', type: 'date' },
        { name: 'reason', type: 'text' },
        { name: 'awarded_by', type: 'relation', collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 },
        { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
      ],
    }));

    // Add task_id relation (tasks already exists from migration 001)
    const rewards = app.findCollectionByNameOrId('rewards');
    rewards.fields.add(new RelationField({
      name: 'task_id',
      collectionId: app.findCollectionByNameOrId('tasks').id,
      cascadeDelete: false,
      maxSelect: 1,
    }));
    app.save(rewards);

    // Create goals collection
    app.save(new Collection({
      name: 'goals',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != "" && @request.auth.role != "child"',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != "" && @request.auth.role != "child"',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'points_required', type: 'number', required: true },
        { name: 'points_current', type: 'number' },
        { name: 'target_user', type: 'relation', collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 },
        { name: 'completed', type: 'bool' },
        { name: 'completed_at', type: 'date' },
        { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
      ],
    }));
  },
  (app) => {
    try { app.delete(app.findCollectionByNameOrId('rewards')); } catch {}
    try { app.delete(app.findCollectionByNameOrId('goals')); } catch {}
  },
);
