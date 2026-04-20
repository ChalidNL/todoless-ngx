/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Create rewards collection
  const rewards = new Collection({
    name: 'rewards',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'points', type: 'number', required: true },
      { name: 'earned_by', type: 'relation', options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      { name: 'earned_at', type: 'date' },
      { name: 'reason', type: 'text' },
      { name: 'task_id', type: 'relation', options: { collectionId: 'tasks', maxSelect: 1 } },
      { name: 'awarded_by', type: 'relation', options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
    ],
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != "" && @request.auth.role != "child"',
    updateRule: '@request.auth.id != "" && @request.auth.role != "child"',
    deleteRule: '@request.auth.id != "" && @request.auth.role != "child"',
  });
  app.save(rewards);

  // Create goals collection
  const goals = new Collection({
    name: 'goals',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'points_required', type: 'number', required: true },
      { name: 'points_current', type: 'number' },
      { name: 'target_user', type: 'relation', options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      { name: 'completed', type: 'bool' },
      { name: 'completed_at', type: 'date' },
      { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
    ],
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != "" && @request.auth.role != "child"',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != "" && @request.auth.role != "child"',
  });
  app.save(goals);
}, (app) => {
  // Revert
  const rewards = app.findCollectionByNameOrId('rewards');
  app.delete(rewards);
  const goals = app.findCollectionByNameOrId('goals');
  app.delete(goals);
});
