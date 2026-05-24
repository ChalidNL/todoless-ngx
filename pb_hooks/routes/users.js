// pb_hooks/routes/users.js
// REST API endpoints for user management

// GET /api/v1/users - list all users
routerAdd(
  'GET',
  '/api/v1/users',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const users = $app.dao().findCollectionByNameOrId('users')
    const records = $app.dao().findRecordsByFilter('users', '', 'name', 0, 0)

    const result = []
    for (let i = 0; i < records.length; i++) {
      result.push({
        'id': records[i].id,
        'email': records[i].get('email'),
        'name': records[i].get('name'),
        'avatar': records[i].get('avatar'),
        'role': records[i].get('role'),
        'family_id': records[i].get('family_id'),
      })
    }

    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)

// GET /api/v1/users/:id - get a specific user
routerAdd(
  'GET',
  '/api/v1/users/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('users', id)
    if (!record) {
      return c.json(404, { 'error': 'User not found' })
    }

    return c.json(200, {
      'id': record.id,
      'email': record.get('email'),
      'name': record.get('name'),
      'avatar': record.get('avatar'),
      'role': record.get('role'),
      'family_id': record.get('family_id'),
    })
  },
  $apis.requireRecordAuth()
)

// PATCH /api/v1/users/:id - update a user
routerAdd(
  'PATCH',
  '/api/v1/users/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    // Only admins or the user themselves can update
    const id = c.pathParam('id')
    if (id !== authRecord.id && authRecord.get('role') !== 'admin' && authRecord.get('role') !== 'owner') {
      return c.json(403, { 'error': 'Forbidden' })
    }

    const record = $app.dao().findRecordById('users', id)
    if (!record) {
      return c.json(404, { 'error': 'User not found' })
    }

    const body = $request.body()
    const data = new RecordUpsertAction($app, record).loadRequest(body)

    if (body.has('name')) data.set('name', body.get('name'))
    if (body.has('avatar')) data.set('avatar', body.get('avatar'))
    if (body.has('family_id')) data.set('family_id', body.get('family_id'))
    if (body.has('firstName') || body.has('first_name')) data.set('first_name', body.get('firstName') || body.get('first_name'))
    if (body.has('lastName') || body.has('last_name')) data.set('last_name', body.get('lastName') || body.get('last_name'))
    if (body.has('displayName') || body.has('display_name')) data.set('display_name', body.get('displayName') || body.get('display_name'))

    // Only admins can change roles
    if (body.has('role') && (authRecord.get('role') === 'admin' || authRecord.get('role') === 'owner')) {
      data.set('role', body.get('role'))
    }

    // Password change
    if (body.has('password')) {
      data.set('password', body.get('password'))
      data.set('passwordConfirm', body.get('password'))
    }

    data.submit()

    return c.json(200, {
      'id': record.id,
      'email': record.get('email'),
      'name': record.get('name'),
      'first_name': record.get('first_name'),
      'last_name': record.get('last_name'),
      'displayName': record.get('displayName'),
      'avatar': record.get('avatar'),
      'role': record.get('role'),
      'family_id': record.get('family_id'),
    })
  },
  $apis.requireRecordAuth()
)

// DELETE /api/v1/users/:id - delete a user (admin only)
routerAdd(
  'DELETE',
  '/api/v1/users/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    if (authRecord.get('role') !== 'admin' && authRecord.get('role') !== 'owner') {
      return c.json(403, { 'error': 'Admin only' })
    }

    const id = c.pathParam('id')
    if (id === authRecord.id) {
      return c.json(409, { 'error': 'Cannot delete yourself' })
    }

    var target = $app.dao().findRecordById('users', id)
    if (!target) {
      return c.json(404, { 'error': 'User not found' })
    }
    if (target.get('role') === 'admin' || target.get('role') === 'owner') {
      return c.json(403, { 'error': 'Cannot delete admin/owner accounts' })
    }

    // Cross-family check
    var actorFamilyId = String(authRecord.get('family_id') || '')
    var targetFamilyId = String(target.get('family_id') || '')
    if (!actorFamilyId || actorFamilyId !== targetFamilyId) {
      return c.json(403, { 'error': 'Cross-family delete denied' })
    }

    // Transfer ownership of user-created records to the admin
    var transferCollections = ['tasks','items','notes','labels','shops','rewards','goals','projects','reminders','calendar_events','invite_codes']
    for (var ci = 0; ci < transferCollections.length; ci++) {
      try {
        var collName = transferCollections[ci]
        var owned = $app.dao().findRecordsByFilter(collName, 'user = \"' + id + '\"', '-created', 0, 0)
        for (var ri = 0; ri < owned.length; ri++) {
          owned[ri].set('user', authRecord.id)
          $app.dao().saveRecord(owned[ri])
        }
      } catch (_) {}
    }

    // Clear assignee references
    var assignColls = ['tasks', 'items']
    for (var ai = 0; ai < assignColls.length; ai++) {
      try {
        var assigned = $app.dao().findRecordsByFilter(assignColls[ai], 'assigned_to = \"' + id + '\"', '-created', 0, 0)
        for (var ari = 0; ari < assigned.length; ari++) {
          assigned[ari].set('assigned_to', '')
          $app.dao().saveRecord(assigned[ari])
        }
      } catch (_) {}
    }

    $app.dao().deleteRecord(target)
    return c.json(200, { 'ok': true, 'deleted_user_id': id })
  },
  $apis.requireRecordAuth()
)
