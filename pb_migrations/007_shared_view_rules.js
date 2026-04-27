migrate(
  (app) => {
    // Update listRule and viewRule for tasks and notes to allow viewing non-private records
    // Note: 'items' is excluded here as it does not have an is_private field
    const collectionsWithPrivate = ['tasks', 'notes'];
    
    collectionsWithPrivate.forEach(name => {
      const collection = app.findCollectionByNameOrId(name);
      if (!collection) return;
      
      // New rule: user can see their own records OR non-private records of others
      const newRule = '(user = @request.auth.id) || (is_private = false)';
      collection.listRule = newRule;
      collection.viewRule = newRule;
      
      app.save(collection);
    });

    // For items: allow viewing items that belong to accessible tasks
    const items = app.findCollectionByNameOrId('items');
    if (items) {
      const itemsRule = 'user = @request.auth.id';
      items.listRule = itemsRule;
      items.viewRule = itemsRule;
      app.save(items);
    }
  },
  (app) => {
    // Rollback: restore original rules (user = @request.auth.id)
    const collectionsToUpdate = ['tasks', 'items', 'notes'];
    
    collectionsToUpdate.forEach(name => {
      const collection = app.findCollectionByNameOrId(name);
      if (!collection) return;
      
      const originalRule = 'user = @request.auth.id';
      collection.listRule = originalRule;
      collection.viewRule = originalRule;
      
      app.save(collection);
    });
  },
);
