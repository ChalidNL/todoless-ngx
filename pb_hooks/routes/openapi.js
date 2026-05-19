/// <reference path="../../pb_data/types.d.ts" />

// Complete OpenAPI 3.0 spec — routes/openapi.js handles /api/todoless/openapi.json
// Keep this file small (<50 lines) to avoid Goja parse delays on startup.

routerAdd('GET', '/api/todoless/openapi.json', (c) => {
  var spec = {
    openapi: '3.0.3',
    info: { title: 'TodoLess API', version: '1.0.0', description: 'Self-hosted multi-user task and grocery manager.' },
    servers: [{ url: '/api/todoless' }],
    tags: [
      { name: 'public', description: 'No authentication required' },
      { name: 'auth', description: 'Bearer token (JWT) required' },
      { name: 'admin', description: 'Admin role required' },
      { name: 'agent', description: 'Agent API key authentication (Bearer tlsk_...)' }
    ],
    paths: {

      // ── Public ────────────────────────────────────────────────────────────
      '/hook-health': { get: { tags:['public'], summary:'Hook health check', responses:{ '200':{ description:'OK', content:{'application/json':{ schema:{ type:'object', properties:{ ok:{type:'boolean'} } } } } } } } },
      '/setup-status': { get: { tags:['public'], summary:'Setup/bootstrap status', description:'Returns has_users and setup_complete for onboarding detection.', responses:{ '200':{ description:'Status', content:{'application/json':{ schema:{ type:'object', properties:{ has_users:{type:'boolean'}, setup_complete:{type:'boolean'} } } } } } } } },
      '/validate-invite': { get: { tags:['public'], summary:'Validate invite code', description:'Check if an invite code is valid, unused, and not expired.', parameters:[{ name:'code', in:'query', required:true, schema:{type:'string'}, description:'6-digit invite code' }], responses:{ '200':{ description:'Validation result', content:{'application/json':{ schema:{ type:'object', properties:{ status:{type:'string',enum:['valid','not_found','used','expired']}, message:{type:'string'}, invite:{ type:'object', properties:{ id:{type:'string'}, code:{type:'string'}, created_by:{type:'string'}, inviter:{ type:'object', properties:{ id:{type:'string'}, name:{type:'string'} } } } } } } } }, '400':{ description:'code required' } } } },
      '/auth-with-password': { post: { tags:['public'], summary:'Authenticate with email/password', description:'Returns a PocketBase JWT token for subsequent authenticated requests.', requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ email:{type:'string',format:'email'}, password:{type:'string'} }, required:['email','password'] } } } }, responses:{ '200':{ description:'Auth token + user', content:{'application/json':{ schema:{ type:'object' } } } }, '400':{ description:'Invalid credentials' } } } },
      '/register': { post: { tags:['public'], summary:'Register user', description:'First user becomes admin. Subsequent users require a valid invite code (or bootstrap window).', requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ email:{type:'string',format:'email'}, password:{type:'string',minLength:8}, passwordConfirm:{type:'string'}, name:{type:'string'}, firstName:{type:'string'}, lastName:{type:'string'}, family_name:{type:'string'}, invite_code:{type:'string'}, user_type:{type:'string',enum:['family_member','family_assistant']} }, required:['email','password','passwordConfirm'] } } } }, responses:{ '201':{ description:'User created', content:{'application/json':{ schema:{ type:'object', properties:{ user:{ type:'object', properties:{ id:{type:'string'}, email:{type:'string'}, name:{type:'string'}, first_name:{type:'string'}, last_name:{type:'string'}, role:{type:'string'}, family_id:{type:'string'} } } } } } }, '400':{ description:'Validation error' } } } },

      // ── Authenticated: Entries ─────────────────────────────────────────────
      '/entries': { get: { tags:['auth'], summary:'Unified entries feed', description:'Returns combined tasks and groceries for the user/family, with optional filters.', security:[{ bearerAuth: [] }], parameters:[ { name:'type', in:'query', schema:{type:'string',enum:['task','grocery']} }, { name:'status', in:'query', schema:{type:'string'} }, { name:'assignee_id', in:'query', schema:{type:'string'} }, { name:'label', in:'query', schema:{type:'string'} }, { name:'shop_id', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Entries list', content:{'application/json':{ schema:{ type:'array', items:{ type:'object' } } } } }, '401':{ description:'Unauthorized' } } } },

      // ── Authenticated: Unified API Dispatcher ──────────────────────────────
      '/api': { post: { tags:['auth'], summary:'Unified action dispatcher', description:'Single endpoint for all CRUD and admin actions: list, create, update, complete, assign, delete, filters, set_role, set_user_block, delete_user.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ action:{type:'string',enum:['list','create','update','complete','assign','delete','filters','set_role','set_user_block','delete_user']}, data:{type:'object'} }, required:['action'] } } } }, responses:{ '200':{ description:'Action result' }, '201':{ description:'Created' }, '400':{ description:'Invalid request' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' } } } },

      // ── Tasks ─────────────────────────────────────────────────────────────
      '/tasks': {
        get: { tags:['auth'], summary:'List tasks', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'status', in:'query', schema:{type:'string',enum:['backlog','todo','done']} } ], responses:{ '200':{ description:'Task list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create task', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, status:{type:'string',default:'todo'}, blocked:{type:'boolean'}, blocked_comment:{type:'string'}, priority:{type:'string'}, horizon:{type:'string'}, due_date:{type:'string',format:'date-time'}, repeat_interval:{type:'string'}, labels:{type:'array',items:{type:'string'}}, is_private:{type:'boolean'}, archived:{type:'boolean'}, flag:{type:'boolean'}, assigned_to:{type:'string'}, sprint_id:{type:'string'}, linked_to:{type:'string'}, linked_type:{type:'string'}, linked_item_ids:{type:'array',items:{type:'string'}}, linked_note_ids:{type:'array',items:{type:'string'}}, completed_at:{type:'string',format:'date-time'} } } } }, responses:{ '201':{ description:'Task created' }, '401':{ description:'Unauthorized' } } }
      },
      '/tasks/{id}': {
        get: { tags:['auth'], summary:'Get task', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Task record' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update task', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete task', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },
      '/tasks/{id}/archive': { post: { tags:['auth'], summary:'Archive task', description:'Archive a completed task. Optional retention days query param.', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }, { name:'retention', in:'query', schema:{type:'string'}, description:'Days before auto-delete (default 30)' }], responses:{ '200':{ description:'Archived' }, '401':{ description:'Unauthorized' } } } },
      '/tasks/archive-done': { post: { tags:['auth'], summary:'Archive all done tasks', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Batch archive result', content:{'application/json':{ schema:{ type:'object', properties:{ archived:{type:'array',items:{type:'string'}}, count:{type:'integer'} } } } } }, '401':{ description:'Unauthorized' } } } },
      '/tasks/{id}/convert-to-item': { post: { tags:['auth'], summary:'Convert task to grocery item', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Converted', content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'}, item_id:{type:'string'} } } } } }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/tasks/{id}/move': { post: { tags:['auth'], summary:'Move task to status', description:'Move a task to backlog, todo, or done.', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ status:{type:'string',enum:['backlog','todo','done']} }, required:['status'] } } } }, responses:{ '200':{ description:'Moved' }, '400':{ description:'Invalid status' }, '401':{ description:'Unauthorized' } } } },
      '/tasks/uncheck-all-done': { post: { tags:['auth'], summary:'Reset all done tasks to todo', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Reset result', content:{'application/json':{ schema:{ type:'object', properties:{ updated:{type:'array',items:{type:'string'}}, count:{type:'integer'} } } } } }, '401':{ description:'Unauthorized' } } } },

      // ── Items (Grocery) ───────────────────────────────────────────────────
      '/items': {
        get: { tags:['auth'], summary:'List grocery items', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'completed', in:'query', schema:{type:'string',enum:['true','false']} } ], responses:{ '200':{ description:'Item list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create grocery item', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, completed:{type:'boolean'}, quantity:{type:'integer'}, labels:{type:'array',items:{type:'string'}}, is_private:{type:'boolean'}, shop_id:{type:'string'}, priority:{type:'string'}, assigned_to:{type:'string'}, due_date:{type:'string',format:'date-time'} } } } }, responses:{ '201':{ description:'Item created' }, '401':{ description:'Unauthorized' } } }
      },
      '/items/{id}': {
        get: { tags:['auth'], summary:'Get grocery item', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Item record' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update grocery item', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete grocery item', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },
      '/items/{id}/convert-to-task': { post: { tags:['auth'], summary:'Convert grocery item to task', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Converted', content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'}, task_id:{type:'string'} } } } } }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/items/uncheck-all-done': { post: { tags:['auth'], summary:'Reset all completed items to incomplete', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Reset result', content:{'application/json':{ schema:{ type:'object', properties:{ updated:{type:'array',items:{type:'string'}}, count:{type:'integer'} } } } } }, '401':{ description:'Unauthorized' } } } },

      // ── Calendar ──────────────────────────────────────────────────────────
      '/calendar': {
        get: { tags:['auth'], summary:'List calendar events', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'start', in:'query', schema:{type:'string',format:'date'}, description:'ISO date (e.g. 2025-01-01)' }, { name:'end', in:'query', schema:{type:'string',format:'date'}, description:'ISO date' } ], responses:{ '200':{ description:'Calendar events' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create calendar event', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, description:{type:'string'}, all_day:{type:'boolean'}, start_time:{type:'string',format:'date-time'}, end_time:{type:'string',format:'date-time'}, task_id:{type:'string'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/calendar/{id}': {
        get: { tags:['auth'], summary:'Get calendar event', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Event' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update calendar event', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete calendar event', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Invites ───────────────────────────────────────────────────────────
      '/invites': {
        get: { tags:['auth'], summary:'List invite codes', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Invite list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create invite record', security:[{ bearerAuth: [] }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ code:{type:'string'}, expires_at:{type:'string',format:'date-time'} } } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/invites/generate': { post: { tags:['auth'], summary:'Generate 6-digit invite code', description:'Creates a random 6-digit code valid for 1 hour.', security:[{ bearerAuth: [] }], responses:{ '201':{ description:'Generated code', content:{'application/json':{ schema:{ type:'object', properties:{ id:{type:'string'}, code:{type:'string'}, expires_at:{type:'string',format:'date-time'} } } } } }, '401':{ description:'Unauthorized' } } } },
      '/invites/{id}': { get: { tags:['auth'], summary:'Get invite code', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Invite' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/invites/{id}/use': { post: { tags:['auth'], summary:'Consume invite code', description:'Mark an invite as used by the authenticated user.', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Consumed' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' }, '409':{ description:'Already used' }, '410':{ description:'Expired' } } } },
      '/invites/create': { post: { tags:['auth','admin'], summary:'Create invite code (server-side)', description:'Admin-only: generates a unique 6-digit code valid for 24 hours, bypassing PB API rules.', security:[{ bearerAuth: [] }], responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } } },
      '/invites/{id}': { delete: { tags:['auth'], summary:'Delete invite code', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } } },

      // ── Labels ───────────────────────────────────────────────────────────
      '/labels': {
        get: { tags:['auth'], summary:'List labels', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Label list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create label', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, color:{type:'string',default:'#6366f1'}, is_private:{type:'boolean'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/labels/{id}': {
        get: { tags:['auth'], summary:'Get label', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Label' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update label', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, color:{type:'string'}, is_private:{type:'boolean'} } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete label', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Shops ─────────────────────────────────────────────────────────────
      '/shops': {
        get: { tags:['auth'], summary:'List shops', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Shop list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create shop', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, color:{type:'string',default:'#6366f1'} } } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/shops/{id}': {
        get: { tags:['auth'], summary:'Get shop', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Shop' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update shop', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, color:{type:'string'} } } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete shop', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Families ──────────────────────────────────────────────────────────
      '/families': {
        get: { tags:['auth'], summary:'List families', description:"Returns the user's own family, or families they created.", security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Family list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create family', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'} }, required:['name'] } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/families/{id}': { get: { tags:['auth'], summary:'Get family', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Family' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/families/join/{id}': { post: { tags:['auth'], summary:'Join family', description:"Set the user's family_id to the given family.", security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'}, description:'Family ID' }], responses:{ '200':{ description:'Joined', content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'}, family_id:{type:'string'} } } } } }, '401':{ description:'Unauthorized' }, '404':{ description:'Family not found' } } } },
      '/families/leave': { post: { tags:['auth'], summary:'Leave family', description:"Clear the user's family_id.", security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Left', content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'} } } } } }, '401':{ description:'Unauthorized' } } } },

      // ── Rewards ──────────────────────────────────────────────────────────
      '/rewards': {
        get: { tags:['auth'], summary:'List rewards', description:'Rewards are visible to all authenticated users.', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Reward list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create reward', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, points:{type:'integer'}, earned_by:{type:'string'}, earned_at:{type:'string',format:'date-time'}, reason:{type:'string'}, task_id:{type:'string'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/rewards/{id}': { get: { tags:['auth'], summary:'Get reward', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Reward' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/rewards/{id}': { delete: { tags:['auth'], summary:'Delete reward', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } } },

      // ── Goals ─────────────────────────────────────────────────────────────
      '/goals': {
        get: { tags:['auth'], summary:'List goals', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Goal list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create goal', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, description:{type:'string'}, points_required:{type:'integer'}, points_current:{type:'integer'}, completed:{type:'boolean'}, target_user:{type:'string'}, completed_at:{type:'string',format:'date-time'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/goals/{id}': {
        get: { tags:['auth'], summary:'Get goal', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Goal' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update goal', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete goal', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Reminders ────────────────────────────────────────────────────────
      '/reminders': {
        get: { tags:['auth'], summary:'List reminders', description:'Returns pending reminders by default. Use ?include_fired=true to include fired/dismissed.', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'include_fired', in:'query', schema:{type:'string',enum:['true']} } ], responses:{ '200':{ description:'Reminder list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create reminder', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, message:{type:'string'}, reminder_time:{type:'string',format:'date-time'}, repeat_interval:{type:'string'}, linked_type:{type:'string'}, linked_to:{type:'string'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/reminders/{id}': {
        patch: { tags:['auth'], summary:'Update reminder', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, message:{type:'string'}, reminder_time:{type:'string',format:'date-time'}, fired:{type:'boolean'}, dismissed:{type:'boolean'}, repeat_interval:{type:'string'} } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } } },
        delete: { tags:['auth'], summary:'Delete reminder', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Projects ─────────────────────────────────────────────────────────
      '/projects': {
        get: { tags:['auth'], summary:'List projects', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'status', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Project list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create project', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, description:{type:'string'}, color:{type:'string',default:'#6366f1'}, status:{type:'string',default:'active'}, task_ids:{type:'array',items:{type:'string'}}, due_date:{type:'string',format:'date-time'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/projects/{id}': {
        get: { tags:['auth'], summary:'Get project', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Project' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update project', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete project', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Sprints ──────────────────────────────────────────────────────────
      '/sprints': {
        get: { tags:['auth'], summary:'List sprints', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Sprint list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create sprint', security:[{ bearerAuth: [] }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, duration:{type:'string',enum:['1week','2weeks','3weeks','1month']}, week_number:{type:'integer'}, year:{type:'integer'}, start_date:{type:'string',format:'date'}, end_date:{type:'string',format:'date'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/sprints/{id}': {
        get: { tags:['auth'], summary:'Get sprint', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Sprint' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update sprint', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete sprint', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },
      '/sprints/new': { post: { tags:['auth'], summary:'Create sprint from settings', description:'Creates a new sprint based on user sprint_duration and sprint_start_day settings.', security:[{ bearerAuth: [] }], responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } } },
      '/sprints/{id}/archive-tasks': { post: { tags:['auth'], summary:'Archive done tasks in sprint', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Batch archive result', content:{'application/json':{ schema:{ type:'object', properties:{ archived:{type:'array',items:{type:'string'}}, count:{type:'integer'} } } } } }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },

      // ── Notes ────────────────────────────────────────────────────────────
      '/notes': {
        get: { tags:['auth'], summary:'List notes', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Note list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create note', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, content:{type:'string'}, pinned:{type:'boolean'}, labels:{type:'array',items:{type:'string'}}, linked_type:{type:'string'}, linked_to:{type:'string'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/notes/{id}': {
        get: { tags:['auth'], summary:'Get note', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Note' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update note', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete note', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Shared ───────────────────────────────────────────────────────────
      '/shared/tasks': { get: { tags:['auth'], summary:'List shared (non-private) tasks', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Shared task list' }, '401':{ description:'Unauthorized' } } } },
      '/shared/items': { get: { tags:['auth'], summary:'List shared (non-private) grocery items', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Shared item list' }, '401':{ description:'Unauthorized' } } } },
      '/shared/notes': { get: { tags:['auth'], summary:'List shared (non-private) notes', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Shared note list' }, '401':{ description:'Unauthorized' } } } },

      // ── Settings ─────────────────────────────────────────────────────────
      '/settings': {
        get: { tags:['auth'], summary:'Get app settings', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Settings', content:{'application/json':{ schema:{ type:'object', properties:{ user:{type:'string'}, sprint_duration:{type:'string'}, sprint_start_day:{type:'integer'}, language:{type:'string'}, archive_retention_days:{type:'integer'}, auto_cleanup:{type:'boolean'}, theme:{type:'string'}, setup_complete:{type:'boolean'} } } } } }, '401':{ description:'Unauthorized' } } },
        patch: { tags:['auth'], summary:'Update app settings', security:[{ bearerAuth: [] }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ sprint_duration:{type:'string',enum:['1week','2weeks','3weeks','1month']}, sprint_start_day:{type:'integer'}, language:{type:'string'}, archive_retention_days:{type:'integer'}, auto_cleanup:{type:'boolean'}, theme:{type:'string',enum:['light','dark']}, setup_complete:{type:'boolean'} } } } }, responses:{ '200':{ description:'Updated' }, '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },

      // ── AI ────────────────────────────────────────────────────────────────
      '/ai/config': {
        get: { tags:['auth'], summary:'Get AI config', description:'Returns configured AI provider settings.', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'AI config', content:{'application/json':{ schema:{ type:'object', properties:{ configured:{type:'boolean'}, provider:{type:'string'}, api_url:{type:'string'}, model:{type:'string'}, max_tokens:{type:'integer'}, temperature:{type:'number'}, enabled:{type:'boolean'} } } } } }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Configure AI settings', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ provider:{type:'string'}, api_url:{type:'string'}, api_key:{type:'string'}, model:{type:'string',default:'gpt-4o-mini'}, max_tokens:{type:'integer',default:1024}, temperature:{type:'number',default:0.7}, enabled:{type:'boolean'} } } } }, responses:{ '200':{ description:'Updated' }, '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/ai/suggest': { post: { tags:['auth'], summary:'Get task suggestions', description:'Returns AI-generated task suggestions based on title and description.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, description:{type:'string'} } } } } }, responses:{ '200':{ description:'Suggestions', content:{'application/json':{ schema:{ type:'object' } } } }, '401':{ description:'Unauthorized' }, '503':{ description:'AI not configured' } } } },
      '/ai/categorize': { post: { tags:['auth'], summary:'Auto-categorize entry', description:'Assigns labels and other attributes to a task or grocery item.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ type:{type:'string',enum:['task','grocery']}, id:{type:'string'} } } } } }, responses:{ '200':{ description:'Categorization result' }, '401':{ description:'Unauthorized' }, '503':{ description:'AI not configured' } } } },
      '/ai/chat': { post: { tags:['auth'], summary:'AI chat', description:'Conversational AI assistant for task management.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'}, history:{type:'array',items:{ type:'object' }} } } } } }, responses:{ '200':{ description:'AI response' }, '401':{ description:'Unauthorized' }, '503':{ description:'AI not configured' } } } },

      // ── Agent API Keys ───────────────────────────────────────────────────
      '/agent/auth-test': { get: { tags:['agent'], summary:'Test agent API key', description:'Returns key info and scopes for a valid agent API key.', security:[{ agentApiKeyAuth: [] }], responses:{ '200':{ description:'Key info' }, '401':{ description:'Invalid or missing key' } } } },
      '/agent/keys': {
        get: { tags:['agent','admin'], summary:'List agent API keys', description:'Admin-only: list all agent API keys.', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Key list' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } },
        post: { tags:['agent','admin'], summary:'Create agent API key', description:'Generate a new agent API key with specified scopes.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, scopes:{type:'array',items:{type:'string'}}, expires_at:{type:'string',format:'date-time'} }, required:['name'] } } } }, responses:{ '201':{ description:'Key created' }, '400':{ description:'Validation error' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } }
      },
      '/agent/keys/{id}/revoke': { post: { tags:['agent','admin'], summary:'Revoke agent API key', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Revoked' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } } },
      '/agent/dispatch': {
        get: { tags:['agent'], summary:'Agent list entries', description:'List tasks and groceries accessible to this agent API key.', security:[{ agentApiKeyAuth: [] }], parameters:[ { name:'type', in:'query', schema:{type:'string',enum:['task','grocery']} }, { name:'status', in:'query', schema:{type:'string'} }, { name:'limit', in:'query', schema:{type:'integer'} } ], responses:{ '200':{ description:'Entries list' }, '401':{ description:'Invalid or missing key' } } },
        post: { tags:['agent'], summary:'Agent action dispatcher', description:'Execute actions: create, read, update, delete, complete, assign, set_labels, set_due_date.', security:[{ agentApiKeyAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ action:{type:'string',enum:['create','read','update','delete','complete','assign','set_labels','set_due_date']}, type:{type:'string',enum:['task','grocery']}, id:{type:'string'}, title:{type:'string'}, status:{type:'string'}, assignee_id:{type:'string'}, labels:{type:'array',items:{type:'string'}}, due_date:{type:'string',format:'date-time'}, description:{type:'string'}, shop_id:{type:'string'}, quantity:{type:'integer'}, complete:{type:'boolean'} } } } }, responses:{ '200':{ description:'Action result' }, '201':{ description:'Created' }, '400':{ description:'Invalid request' }, '401':{ description:'Invalid or missing key' }, '403':{ description:'Insufficient scope' } } }
      },
      '/agent/audit-log': { get: { tags:['agent','admin'], summary:'Agent audit log', description:'View audit log of agent actions.', security:[{ bearerAuth: [] }], parameters:[ { name:'limit', in:'query', schema:{type:'integer'} }, { name:'action', in:'query', schema:{type:'string'} }, { name:'key_id', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Audit log entries' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } } },

      // ── API Tokens (Bearer) ───────────────────────────────────────────────
      '/api-tokens': {
        get: { tags:['auth'], summary:'List API tokens', description:'List all API tokens for the authenticated user (admin sees all).', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Token list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create API token', description:'Create a new API token with specific permissions. The raw token is returned once.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, permissions:{type:'array',items:{type:'string'}}, expires_at:{type:'string',format:'date-time'} }, required:['name','permissions'] } } } }, responses:{ '201':{ description:'Token created' }, '400':{ description:'Validation error' }, '401':{ description:'Unauthorized' } } }
      },
      '/api-tokens/{id}': { delete: { tags:['auth'], summary:'Revoke API token', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Revoked' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' } } } },
      '/api-tokens/{id}/toggle': { patch: { tags:['auth'], summary:'Toggle API token enabled/disabled', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ enabled:{type:'boolean'} }, required:['enabled'] } } } }, responses:{ '200':{ description:'Toggled' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' } } } },

    },
    components: {
      securitySchemes: {
        bearerAuth: { type:'http', scheme:'bearer', bearerFormat:'JWT', description:'PocketBase JWT from /api/todoless/auth-with-password' },
        agentApiKeyAuth: { type:'apiKey', in:'header', name:'Authorization', description:'Bearer token with agent API key: "Bearer tlsk_<key>"' }
      }
    }
  };
  return c.json(200, spec);
});