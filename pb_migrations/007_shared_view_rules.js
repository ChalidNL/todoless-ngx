migrate(
  (app) => {
    // Update listRule and viewRule for tasks, items, notes to allow viewing non-private records of other users
    const collectionsToUpdate = ['tasks', 'items', 'notes'];
    
    collectionsToUpdate.forEach(name => {
      const collection = app.findCollectionByNameOrId(name);
      if (!collection) return;
      
      // Only set rule if is_private field exists on this collection
      const hasIsPrivate = collection.fields.some(f => f.name === 'is_private');
      if (!hasIsPrivate) {
        console.log(`[007] Skipping ${name}: is_private field not found`);
        return;
      }
      
      // New rule: user can see their own records OR non-private records of others
      const newRule = '(user = @request.auth.id) || (is_private = false)';
      collection.listRule = newRule;
      collection.viewRule = newRule;
      
      app.save(collection);
    });
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
