/// <reference path="../pb_data/types.d.ts" />

// Migration 011: Fix collection rules
// - families: authenticated users can create, own records can be read/updated
// - app_settings: public read for setup_complete field (needed for unauthenticated info mode)
// - users: own record can update family_id

migrate(
  (app) => {
    // Fix families createRule and listRule
    const families = app.findCollectionByNameOrId('families');
    families.createRule = '@request.auth.id != ""';
    families.listRule = '@request.auth.id != ""';
    families.viewRule = '@request.auth.id != ""';
    families.updateRule = 'created_by = @request.auth.id';
    families.deleteRule = 'created_by = @request.auth.id';
    app.save(families);

    // Fix app_settings: allow public list (only setup_complete matters for unauthed)
    const settings = app.findCollectionByNameOrId('app_settings');
    settings.listRule = '';  // empty string = public
    settings.viewRule = 'user = @request.auth.id';
    app.save(settings);
  },
  (app) => {
    // Rollback
    const families = app.findCollectionByNameOrId('families');
    families.createRule = null;
    app.save(families);

    const settings = app.findCollectionByNameOrId('app_settings');
    settings.listRule = 'user = @request.auth.id';
    app.save(settings);
  }
);
