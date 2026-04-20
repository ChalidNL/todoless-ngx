     1|migrate(
     2|  (app) => {
     3|    const baseRules = {
     4|      listRule: 'user = @request.auth.id',
     5|      viewRule: 'user = @request.auth.id',
     6|      createRule: '@request.auth.id != ""',
     7|      updateRule: 'user = @request.auth.id',
     8|      deleteRule: 'user = @request.auth.id',
     9|    };
    10|
    11|    const createCollection = (collection) => {
    12|      return app.save(collection);
    13|    };
    14|
    15|    createCollection(
    16|      new Collection({
    17|        name: 'tasks',
    18|        type: 'base',
    19|        ...baseRules,
    20|        fields: [
    21|          { name: 'title', type: 'text', required: true },
    22|          { name: 'status', type: 'select', required: true, values: ['backlog', 'todo', 'done'], maxSelect: 1 },
    23|          { name: 'blocked', type: 'bool' },
    24|          { name: 'blocked_comment', type: 'text' },
    25|          { name: 'priority', type: 'select', values: ['urgent', 'normal', 'low'], maxSelect: 1 },
    26|          { name: 'horizon', type: 'select', values: ['week', 'month', '3months', '6months', 'year'], maxSelect: 1 },
    27|          { name: 'assigned_to', type: 'relation', collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 },
    29|          { name: 'due_date', type: 'date' },
    30|          { name: 'repeat_interval', type: 'select', values: ['week', 'month', 'year'], maxSelect: 1 },
    31|          { name: 'completed_at', type: 'date' },
    32|          { name: 'archived', type: 'bool' },
    33|          { name: 'archived_at', type: 'date' },
    34|          { name: 'delete_after', type: 'date' },
    35|          { name: 'is_private', type: 'bool' },
    36|          { name: 'labels', type: 'json' },
    37|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
    38|        ],
    39|      }),
    40|    );
    41|
    42|    createCollection(
    43|      new Collection({
    44|        name: 'items',
    45|        type: 'base',
    46|        ...baseRules,
    47|        fields: [
    48|          { name: 'title', type: 'text', required: true },
    49|          { name: 'completed', type: 'bool' },
    51|          { name: 'quantity', type: 'number' },
    52|          { name: 'priority', type: 'select', values: ['urgent', 'normal', 'low'], maxSelect: 1 },
    53|          { name: 'assigned_to', type: 'relation', collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 },
    54|          { name: 'due_date', type: 'date' },
    55|          { name: 'labels', type: 'json' },
    56|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
    57|        ],
    58|      }),
    59|    );
    60|
    61|    createCollection(
    62|      new Collection({
    63|        name: 'notes',
    64|        type: 'base',
    65|        ...baseRules,
    66|        fields: [
    67|          { name: 'title', type: 'text' },
    68|          { name: 'content', type: 'text', required: true },
    69|          { name: 'pinned', type: 'bool' },
    70|          { name: 'linked_type', type: 'select', values: ['task', 'item'], maxSelect: 1 },
    71|          { name: 'linked_to', type: 'text' },
    72|          { name: 'labels', type: 'json' },
    73|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
    74|        ],
    75|      }),
    76|    );
    77|
    78|    createCollection(
    79|      new Collection({
    80|        name: 'labels',
    81|        type: 'base',
    82|        ...baseRules,
    83|        fields: [
    84|          { name: 'name', type: 'text', required: true },
    85|          { name: 'color', type: 'text', required: true },
    86|          { name: 'is_private', type: 'bool' },
    87|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
    88|        ],
    89|      }),
    90|    );
    91|
    92|    createCollection(
    93|      new Collection({
    94|        name: 'shops',
    95|        type: 'base',
    96|        ...baseRules,
    97|        fields: [
    98|          { name: 'name', type: 'text', required: true },
    99|          { name: 'color', type: 'text', required: true },
   100|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
   101|        ],
   102|      }),
   103|    );
   104|
   105|    createCollection(
   106|      new Collection({
   107|        name: 'calendar_events',
   108|        type: 'base',
   109|        ...baseRules,
   110|        fields: [
   111|          { name: 'title', type: 'text', required: true },
   112|          { name: 'description', type: 'text' },
   113|          { name: 'start_time', type: 'date', required: true },
   114|          { name: 'end_time', type: 'date' },
   115|          { name: 'all_day', type: 'bool' },
   117|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
   118|        ],
   119|      }),
   120|    );
   121|
   122|    createCollection(
   123|      new Collection({
   124|        name: 'sprints',
   125|        type: 'base',
   126|        ...baseRules,
   127|        fields: [
   128|          { name: 'name', type: 'text', required: true },
   129|          { name: 'start_date', type: 'date', required: true },
   130|          { name: 'end_date', type: 'date', required: true },
   131|          { name: 'duration', type: 'select', values: ['1week', '2weeks', '3weeks', '1month'], maxSelect: 1 },
   132|          { name: 'week_number', type: 'number' },
   133|          { name: 'year', type: 'number' },
   134|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
   135|        ],
   136|      }),
   137|    );
   138|
   139|    createCollection(
   140|      new Collection({
   141|        name: 'invite_codes',
   142|        type: 'base',
   143|        ...baseRules,
   144|        fields: [
   145|          { name: 'code', type: 'text', required: true },
   146|          { name: 'expires_at', type: 'date', required: true },
   147|          { name: 'used', type: 'bool' },
   149|          { name: 'used_at', type: 'date' },
   150|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
   151|        ],
   152|      }),
   153|    );
   154|
   155|    createCollection(
   156|      new Collection({
   157|        name: 'app_settings',
   158|        type: 'base',
   159|        ...baseRules,
   160|        fields: [
   161|          { name: 'theme', type: 'select', values: ['light', 'dark'], maxSelect: 1 },
   162|          { name: 'language', type: 'text' },
   163|          { name: 'sprint_duration', type: 'select', values: ['1week', '2weeks', '3weeks', '1month'], maxSelect: 1 },
   164|          { name: 'sprint_start_day', type: 'number' },
   165|          { name: 'archive_retention_days', type: 'number' },
   166|          { name: 'auto_cleanup', type: 'bool' },
   167|          { name: 'user', type: 'relation', required: true, collectionId: '_pb_users_auth_', cascadeDelete: true, maxSelect: 1 },
   168|        ],
   169|      }),
   170|    );
   171|
   172|    const usersCollection = app.findCollectionByNameOrId('_pb_users_auth_');
   173|
   174|    if (!usersCollection.fields.getByName('name')) {
   175|      usersCollection.fields.add(
   176|        new TextField({
   177|          name: 'name',
   178|          required: true,
   179|        }),
   180|      );
   181|    }
   182|
   183|    if (!usersCollection.fields.getByName('role')) {
   184|      usersCollection.fields.add(
   185|        new SelectField({
   186|          name: 'role',
   187|          values: ['admin', 'user', 'child'],
   188|          maxSelect: 1,
   189|        }),
   190|      );
   191|    }
   192|
   193|    app.save(usersCollection);
   194|  },
   195|  (app) => {
   196|    ['app_settings', 'invite_codes', 'calendar_events', 'sprints', 'shops', 'labels', 'notes', 'items', 'tasks'].forEach((name) => {
   197|      try {
   198|        const collection = app.findCollectionByNameOrId(name);
   199|        app.delete(collection);
   200|      } catch {}
   201|    });
   202|  },
   203|);
   204|