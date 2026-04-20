migrate(
  (app) => {
    const collections = [
      'tasks', 'items', 'notes', 'labels', 'shops',
      'calendar_events', 'sprints', 'invite_codes', 'app_settings',
      'rewards', 'goals',
    ];

    for (const name of collections) {
      let collection;
      try {
        collection = app.findCollectionByNameOrId(name);
      } catch {
        continue; // skip if collection doesn't exist yet
      }

      if (!collection.fields.getByName('created')) {
        collection.fields.add(
          new AutodateField({
            name: 'created',
            onCreate: true,
            onUpdate: false,
          }),
        );
      }

      if (!collection.fields.getByName('updated')) {
        collection.fields.add(
          new AutodateField({
            name: 'updated',
            onCreate: true,
            onUpdate: true,
          }),
        );
      }

      app.save(collection);
    }
  },
  (app) => {
    // down: no-op, removing autodate fields is destructive
  },
);
