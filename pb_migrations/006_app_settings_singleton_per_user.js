migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('app_settings');

    // Ensure the user relation field exists and is configured as single-select required relation.
    const existingUserField = collection.fields.getByName('user');

    if (!existingUserField) {
      collection.fields.add(
        new RelationField({
          name: 'user',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        }),
      );
    } else {
      existingUserField.required = true;
      existingUserField.collectionId = '_pb_users_auth_';
      existingUserField.cascadeDelete = true;
      existingUserField.maxSelect = 1;
    }

    // Backward-safe cleanup before uniqueness enforcement:
    // 1) remove orphaned settings records without a valid user id
    // 2) deduplicate to keep the newest record per user (updated/created/id fallback)
    const hasUpdated = !!collection.fields.getByName('updated');
    const hasCreated = !!collection.fields.getByName('created');

    let olderRecencyExpr = 'older."id"';
    let newerRecencyExpr = 'newer."id"';
    if (hasUpdated && hasCreated) {
      olderRecencyExpr = 'COALESCE(older."updated", older."created", older."id")';
      newerRecencyExpr = 'COALESCE(newer."updated", newer."created", newer."id")';
    } else if (hasUpdated) {
      olderRecencyExpr = 'COALESCE(older."updated", older."id")';
      newerRecencyExpr = 'COALESCE(newer."updated", newer."id")';
    } else if (hasCreated) {
      olderRecencyExpr = 'COALESCE(older."created", older."id")';
      newerRecencyExpr = 'COALESCE(newer."created", newer."id")';
    }

    app.db().newQuery(`
      DELETE FROM app_settings
      WHERE "user" IS NULL OR TRIM("user") = ''
    `).execute();

    app.db().newQuery(`
      DELETE FROM app_settings
      WHERE "id" IN (
        SELECT older."id"
        FROM app_settings older
        INNER JOIN app_settings newer
          ON older."user" = newer."user"
         AND older."user" IS NOT NULL
         AND TRIM(older."user") != ''
         AND (
           ${olderRecencyExpr} < ${newerRecencyExpr}
           OR (
             ${olderRecencyExpr} = ${newerRecencyExpr}
             AND older."id" < newer."id"
           )
         )
      )
    `).execute();

    const uniqueIndex =
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_app_settings_user_unique ON app_settings ("user")';

    collection.indexes = (collection.indexes || []).filter(
      (idx) => !idx.includes('idx_app_settings_user_unique'),
    );
    collection.indexes.push(uniqueIndex);

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('app_settings');

    collection.indexes = (collection.indexes || []).filter(
      (idx) => !idx.includes('idx_app_settings_user_unique'),
    );

    app.save(collection);
  },
);
