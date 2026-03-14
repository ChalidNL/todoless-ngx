/// <reference path="../pb_data/types.d.ts" />

/**
 * This migration creates the initial database schema for To Do Less app
 * Run this in PocketBase admin panel or via migrations
 */

migrate((db) => {
  // Tasks collection
  const tasksCollection = new Collection({
    name: 'tasks',
    type: 'base',
    schema: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['backlog', 'todo', 'done'],
        },
      },
      {
        name: 'priority',
        type: 'select',
        options: {
          maxSelect: 1,
          values: ['urgent', 'normal', 'low'],
        },
      },
      {
        name: 'horizon',
        type: 'select',
        options: {
          maxSelect: 1,
          values: ['week', 'month', '3months', '6months', 'year'],
        },
      },
      {
        name: 'blocked',
        type: 'bool',
      },
      {
        name: 'blocked_comment',
        type: 'text',
      },
      {
        name: 'sprint_id',
        type: 'relation',
        options: {
          collectionId: 'sprints',
          cascadeDelete: false,
        },
      },
      {
        name: 'assigned_to',
        type: 'relation',
        options: {
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
        },
      },
      {
        name: 'due_date',
        type: 'date',
      },
      {
        name: 'repeat_interval',
        type: 'select',
        options: {
          maxSelect: 1,
          values: ['week', 'month', 'year'],
        },
      },
      {
        name: 'labels',
        type: 'json',
      },
      {
        name: 'is_private',
        type: 'bool',
      },
      {
        name: 'archived',
        type: 'bool',
      },
      {
        name: 'archived_at',
        type: 'date',
      },
      {
        name: 'delete_after',
        type: 'date',
      },
      {
        name: 'completed_at',
        type: 'date',
      },
      {
        name: 'user',
        type: 'relation',
        required: true,
        options: {
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
        },
      },
    ],
    listRule: 'user = @request.auth.id',
    viewRule: 'user = @request.auth.id',
    createRule: '@request.auth.id != ""',
    updateRule: 'user = @request.auth.id',
    deleteRule: 'user = @request.auth.id',
  });

  return db.saveCollection(tasksCollection);
}, (db) => {
  return db.deleteCollection('tasks');
});
