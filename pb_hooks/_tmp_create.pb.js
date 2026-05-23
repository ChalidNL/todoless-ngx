/// <reference path="../pb_data/types.d.ts" />
// TEMPORARY: Creates a user for Sam with invite-less registration
routerAdd('GET', '/api/todoless/tmp-user', (c) => {
  try {
    // Use the same approach as main.pb.js register endpoint
    var uc = $app.findCollectionByNameOrId('users');
    var u = $app.unsafeWithoutHooks();
    var rec = new Record(uc);
    rec.set('id', $security.randomString(15));
    rec.set('tokenKey', $security.randomString(30));
    rec.set('verified', true);
    rec.set('email', 'sam@todoless.agent');
    rec.set('password', 'samagent123');
    rec.set('passwordConfirm', 'samagent123');
    rec.set('name', 'Sam (Agent)');
    rec.set('emailVisibility', true);
    rec.set('role', 'member');
    rec.set('family_id', '4ezxfwnbqpiugf7');
    u.save(rec);
    
    return c.json(201, {
      id: rec.id,
      email: 'sam@todoless.agent',
      name: 'Sam (Agent)',
      role: 'member',
      family_id: '4ezxfwnbqpiugf7'
    });
  } catch(e) {
    return c.json(500, { error: String(e), stack: String(e.stack||'') });
  }
});
