// pb_hooks/fix_schema.pb.js
// One-shot endpoint to make all collection fields optional.
// Required because onRecordCreate doesn't fire in PB 0.35.1 HTTP API.
// Call once after deploy: curl -X POST http://host:7070/api/fix-all-schema

routerAdd('POST', '/api/fix-all-schema', function(c) {
  var results = [];
  var cols = ['tasks', 'items', 'shops', 'labels', 'families', 'sprints', 'projects', 'notes', 'invite_codes'];
  
  for (var i = 0; i < cols.length; i++) {
    try {
      var col = $app.findCollectionByNameOrId(cols[i]);
      var changed = 0;
      for (var j = 0; j < col.fields.length; j++) {
        var field = col.fields[j];
        if (field.required === true) {
          field.required = false;
          changed++;
        }
      }
      if (changed > 0) {
        $app.save(col);
        results.push(cols[i] + ': ' + changed + ' fields fixed');
      } else {
        results.push(cols[i] + ': ok');
      }
    } catch(ex) {
      results.push(cols[i] + ': ERROR ' + String(ex));
    }
  }
  
  return c.json(200, { results: results });
});
