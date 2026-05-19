// pb_hooks/routes/external-references.js
// REST API endpoints for external_references collection
// Integration: create external linked task, list external links, update sync state
// API-003: Public/Internal API Endpoints

// GET /api/todoless/external-references - list external links
routerAdd(
  'GET',
  '/api/todoless/external-references',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const userId = authRecord.id
    const familyId = authRecord.get('family_id')

    let filter = ''
    if (familyId) {
      filter = 'user.family_id = "' + familyId + '"'
    } else {
      filter = 'user.id = "' + userId + '"'
    }

    // Optional filters
    const source = $request.queryParam('source')
    if (source) {
      filter += ' && source = "' + source + '"'
    }

    const syncStatus = $request.queryParam('sync_status')
    if (syncStatus) {
      filter += ' && sync_status = "' + syncStatus + '"'
    }

    const entityType = $request.queryParam('entity_type')
    if (entityType) {
      filter += ' && entity_type = "' + entityType + '"'
    }

    const sort = $request.queryParam('sort') || '-created'
    const result = $app.dao().findRecordsByFilter('external_references', filter, sort, 0, 0)

    const mapped = result.map(function(r) {
      return {
        id: r.id,
        source: r.get('source'),
        external_id: r.get('external_id'),
        external_url: r.get('external_url') || '',
        sync_status: r.get('sync_status'),
        last_synced_at: r.get('last_synced_at') || null,
        entity_type: r.get('entity_type'),
        entity_id: r.get('entity_id'),
        user: r.get('user'),
        created: r.created,
        updated: r.updated,
      }
    })

    return c.json(200, mapped)
  },
  $apis.requireRecordAuth()
)

// GET /api/todoless/external-references/:id - get a specific external link
routerAdd(
  'GET',
  '/api/todoless/external-references/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('external_references', id)
    if (!record) {
      return c.json(404, { 'error': 'External reference not found' })
    }

    // Ensure family-scoped access
    const recUser = String(record.get('user') || '')
    const authFamilyId = String(authRecord.get('family_id') || '')
    const recUserRecord = $app.dao().findRecordById('users', recUser)
    const recFamilyId = recUserRecord ? String(recUserRecord.get('family_id') || '') : ''

    if (authFamilyId && recFamilyId && recFamilyId !== authFamilyId) {
      return c.json(403, { 'error': 'Forbidden - cross-family access denied' })
    }
    if (!authFamilyId && recUser !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    return c.json(200, {
      id: record.id,
      source: record.get('source'),
      external_id: record.get('external_id'),
      external_url: record.get('external_url') || '',
      sync_status: record.get('sync_status'),
      last_synced_at: record.get('last_synced_at') || null,
      entity_type: record.get('entity_type'),
      entity_id: record.get('entity_id'),
      user: record.get('user'),
      created: record.created,
      updated: record.updated,
    })
  },
  $apis.requireRecordAuth()
)

// POST /api/todoless/external-references - create external linked task
routerAdd(
  'POST',
  '/api/todoless/external-references',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const body = $request.body()
    const source = String(body.get('source') || '').trim()
    const externalId = String(body.get('external_id') || '').trim()
    const entityType = String(body.get('entity_type') || '').trim()
    const entityId = String(body.get('entity_id') || '').trim()

    if (!source) return c.json(400, { 'error': 'source required (paperless, home_assistant, gmail, custom)' })
    if (!externalId) return c.json(400, { 'error': 'external_id required' })
    if (!entityType || ['task', 'grocery', 'note'].indexOf(entityType) === -1) {
      return c.json(400, { 'error': 'entity_type must be task, grocery, or note' })
    }
    if (!entityId) return c.json(400, { 'error': 'entity_id required' })

    // Check for duplicate (source + external_id unique constraint)
    const existing = $app.dao().findRecordsByFilter(
      'external_references',
      'source = "' + source + '" && external_id = "' + externalId + '"',
      '',
      1,
      0
    )
    if (existing.length > 0) {
      return c.json(409, { 'error': 'External reference already exists', 'id': existing[0].id })
    }

    const collection = $app.dao().findCollectionByNameOrId('external_references')
    const record = new Record(collection)
    const data = new RecordUpsertAction($app, record)

    data.set('source', source)
    data.set('external_id', externalId)
    data.set('entity_type', entityType)
    data.set('entity_id', entityId)
    data.set('sync_status', body.get('sync_status') || 'pending')
    data.set('user', authRecord.id)

    if (body.has('external_url')) data.set('external_url', body.get('external_url'))
    if (body.has('last_synced_at')) data.set('last_synced_at', body.get('last_synced_at'))

    data.submit()

    return c.json(201, {
      id: record.id,
      source: record.get('source'),
      external_id: record.get('external_id'),
      external_url: record.get('external_url') || '',
      sync_status: record.get('sync_status'),
      last_synced_at: record.get('last_synced_at') || null,
      entity_type: record.get('entity_type'),
      entity_id: record.get('entity_id'),
      user: record.get('user'),
      created: record.created,
      updated: record.updated,
    })
  },
  $apis.requireRecordAuth()
)

// PATCH /api/todoless/external-references/:id - update sync state
routerAdd(
  'PATCH',
  '/api/todoless/external-references/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('external_references', id)
    if (!record) {
      return c.json(404, { 'error': 'External reference not found' })
    }

    if (String(record.get('user') || '') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    const body = $request.body()
    const data = new RecordUpsertAction($app, record).loadRequest(body)

    if (body.has('sync_status')) {
      const status = String(body.get('sync_status') || '').trim()
      if (['synced', 'pending', 'error', 'orphaned'].indexOf(status) === -1) {
        return c.json(400, { 'error': 'sync_status must be synced, pending, error, or orphaned' })
      }
      data.set('sync_status', status)
    }

    if (body.has('last_synced_at')) data.set('last_synced_at', body.get('last_synced_at'))
    if (body.has('external_url')) data.set('external_url', body.get('external_url'))
    if (body.has('entity_type')) data.set('entity_type', body.get('entity_type'))
    if (body.has('entity_id')) data.set('entity_id', body.get('entity_id'))

    data.submit()

    return c.json(200, {
      id: record.id,
      source: record.get('source'),
      external_id: record.get('external_id'),
      external_url: record.get('external_url') || '',
      sync_status: record.get('sync_status'),
      last_synced_at: record.get('last_synced_at') || null,
      entity_type: record.get('entity_type'),
      entity_id: record.get('entity_id'),
      user: record.get('user'),
      created: record.created,
      updated: record.updated,
    })
  },
  $apis.requireRecordAuth()
)

// DELETE /api/todoless/external-references/:id - delete an external link
routerAdd(
  'DELETE',
  '/api/todoless/external-references/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('external_references', id)
    if (!record) {
      return c.json(404, { 'error': 'External reference not found' })
    }

    if (String(record.get('user') || '') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    $app.dao().deleteRecord(record)
    return c.json(200, { 'deleted': true, 'id': id })
  },
  $apis.requireRecordAuth()
)
