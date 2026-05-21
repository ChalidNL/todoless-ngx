migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('tasks');

    if (!collection.fields.getByName('subtask_ids')) {
      collection.fields.add(
        new JSONField({
          name: 'subtask_ids',
        }),
      );
    }

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('tasks');
    try {
      collection.fields.remove(collection.fields.getByName('subtask_ids'));
    } catch {}
    app.save(collection);
  },
);
