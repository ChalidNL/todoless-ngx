migrate(
  (app) => {
    // Shops don't have an is_private field, so use a simplified family-sharing rule
    let shops = app.findCollectionByNameOrId('shops');
    shops.listRule = 'user = @request.auth.id || user.family_id = @request.auth.family_id';
    shops.viewRule = 'user = @request.auth.id || user.family_id = @request.auth.family_id';
    app.save(shops);
  },
  (app) => {
    // Revert shops to owner-only
    let shops = app.findCollectionByNameOrId('shops');
    shops.listRule = 'user = @request.auth.id';
    shops.viewRule = 'user = @request.auth.id';
    app.save(shops);
  }
);
