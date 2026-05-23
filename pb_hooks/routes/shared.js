// pb_hooks/routes/shared.js
// REST API endpoints for shared/cross-user views

// GET /api/v1/shared/tasks - get shared tasks (non-private, family-scoped)
routerAdd(
  'GET',
  '/api/v1/shared/tasks',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const filter = 'is_private = false'
    const sort = $request.queryParam('sort') || '-created'

    const result = $app.dao().findRecordsByFilter('tasks', filter, sort, 0, 0)
    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)

// GET /api/v1/shared/items - get shared items (non-private)
routerAdd(
  'GET',
  '/api/v1/shared/items',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const filter = 'is_private = false'
    const sort = $request.queryParam('sort') || '-created'

    const result = $app.dao().findRecordsByFilter('items', filter, sort, 0, 0)
    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)

// GET /api/v1/shared/notes - get shared notes (non-private)
routerAdd(
  'GET',
  '/api/v1/shared/notes',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const filter = 'is_private = false'
    const sort = $request.queryParam('sort') || '-created'

    const result = $app.dao().findRecordsByFilter('notes', filter, sort, 0, 0)
    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)
