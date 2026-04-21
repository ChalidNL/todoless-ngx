migrate(
  (app) => {
    const inviteCodes = app.findCollectionByNameOrId('invite_codes');

    inviteCodes.listRule =
      'user = @request.auth.id || (code = @request.query.code && used = false && expires_at > @now)';
    inviteCodes.viewRule =
      'user = @request.auth.id || (code = @request.query.code && used = false && expires_at > @now)';
    inviteCodes.updateRule =
      'user = @request.auth.id || (@request.auth.id != "" && used = false && expires_at > @now)';

    app.save(inviteCodes);
  },
  (app) => {
    const inviteCodes = app.findCollectionByNameOrId('invite_codes');

    inviteCodes.listRule = 'user = @request.auth.id';
    inviteCodes.viewRule = 'user = @request.auth.id';
    inviteCodes.updateRule = 'user = @request.auth.id';

    app.save(inviteCodes);
  },
);
