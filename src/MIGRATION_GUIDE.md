# Todoless - Migratie van localStorage naar Supabase

Deze guide helpt je bij het migreren van de bestaande localStorage versie naar Supabase.

## Overzicht

Todoless heeft nu twee versies van AppContext:
- **AppContext.tsx** - Oude versie met localStorage (huidige)
- **AppContext.supabase.tsx** - Nieuwe versie met Supabase backend

## Stap 1: Backup huidige data

Voordat je migre <br, maak een backup van je huidige data:

```javascript
// Open browser console op http://localhost:3000
// Kopieer en plak dit script:

const backup = {
  tasks: JSON.parse(localStorage.getItem('todoless_tasks') || '[]'),
  items: JSON.parse(localStorage.getItem('todoless_items') || '[]'),
  notes: JSON.parse(localStorage.getItem('todoless_notes') || '[]'),
  labels: JSON.parse(localStorage.getItem('todoless_labels') || '[]'),
  shops: JSON.parse(localStorage.getItem('todoless_shops') || '[]'),
  calendarEvents: JSON.parse(localStorage.getItem('todoless_calendarEvents') || '[]'),
  sprints: JSON.parse(localStorage.getItem('todoless_sprints') || '[]'),
  users: JSON.parse(localStorage.getItem('todoless_users') || '[]'),
  inviteCodes: JSON.parse(localStorage.getItem('todoless_inviteCodes') || '[]'),
  appSettings: JSON.parse(localStorage.getItem('todoless_appSettings') || '{}'),
};

console.log(JSON.stringify(backup, null, 2));
// Kopieer de output en sla op in backup.json
```

## Stap 2: Start Supabase

Zorg dat Supabase draait:

```bash
# Start Supabase stack
docker-compose -f docker-compose.supabase.yml up -d

# Check status
docker-compose -f docker-compose.supabase.yml ps

# Bekijk logs
docker-compose -f docker-compose.supabase.yml logs -f
```

## Stap 3: Activeer Supabase AppContext

Update `/App.tsx` om de nieuwe AppContext te gebruiken:

```typescript
// Oude import:
// import { AppProvider } from './context/AppContext';

// Nieuwe import:
import { AppProvider } from './context/AppContext.supabase';
```

Of hernoem de bestanden:

```bash
# Backup oude context
mv context/AppContext.tsx context/AppContext.localStorage.tsx

# Activeer Supabase context
mv context/AppContext.supabase.tsx context/AppContext.tsx
```

## Stap 4: Importeer data in Supabase

### Optie A: Via Supabase Studio UI

1. Open Supabase Studio: http://localhost:3010
2. Ga naar "Table Editor"
3. Voor elke tabel:
   - Klik op "Insert" → "Insert rows"
   - Plak je JSON data
   - Klik "Save"

### Optie B: Via SQL Script

Maak een import script (`import-data.sql`):

```sql
-- Import Users
INSERT INTO users (id, email, name, role, created_at)
VALUES
  ('user-id-1', 'admin@example.com', 'Admin User', 'admin', NOW()),
  ('user-id-2', 'user@example.com', 'Regular User', 'user', NOW());

-- Import Labels
INSERT INTO labels (id, name, color, is_private, created_by, created_at)
VALUES
  ('label-1', 'Work', '#3b82f6', false, 'user-id-1', NOW()),
  ('label-2', 'Personal', '#10b981', false, 'user-id-1', NOW());

-- Import Tasks
INSERT INTO tasks (id, title, status, priority, labels, created_at)
VALUES
  ('task-1', 'Complete project', 'todo', 'urgent', '["label-1"]'::jsonb, NOW()),
  ('task-2', 'Buy groceries', 'backlog', 'normal', '["label-2"]'::jsonb, NOW());

-- Continue voor andere tabellen...
```

Voer uit:

```bash
docker exec -i supabase-db psql -U postgres -d todoless < import-data.sql
```

### Optie C: Via JavaScript/Node.js Script

Maak een import script (`scripts/import-localstorage.js`):

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const supabaseKey = process.env.SERVICE_ROLE_KEY; // Use service role key for import
const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
  // Load backup
  const backup = JSON.parse(fs.readFileSync('backup.json', 'utf8'));
  
  console.log('Importing users...');
  for (const user of backup.users || []) {
    await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatarUrl,
    });
  }
  
  console.log('Importing labels...');
  for (const label of backup.labels || []) {
    await supabase.from('labels').insert({
      id: label.id,
      name: label.name,
      color: label.color,
      is_private: label.isPrivate,
      created_by: label.createdBy,
    });
  }
  
  console.log('Importing shops...');
  for (const shop of backup.shops || []) {
    await supabase.from('shops').insert({
      id: shop.id,
      name: shop.name,
      color: shop.color,
    });
  }
  
  console.log('Importing sprints...');
  for (const sprint of backup.sprints || []) {
    await supabase.from('sprints').insert({
      id: sprint.id,
      name: sprint.name,
      start_date: sprint.startDate,
      end_date: sprint.endDate,
      duration: sprint.duration,
      week_number: sprint.weekNumber,
      year: sprint.year,
    });
  }
  
  console.log('Importing tasks...');
  for (const task of backup.tasks || []) {
    await supabase.from('tasks').insert({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      horizon: task.horizon,
      blocked: task.blocked,
      blocked_comment: task.blockedComment,
      sprint_id: task.sprintId,
      assigned_to: task.assignedTo,
      due_date: task.dueDate,
      repeat_interval: task.repeatInterval,
      labels: task.labels,
      is_private: task.isPrivate,
      archived: task.archived,
      archived_at: task.archivedAt,
      delete_after: task.deleteAfter,
      created_at: task.createdAt,
      completed_at: task.completedAt,
    });
  }
  
  console.log('Importing items...');
  for (const item of backup.items || []) {
    await supabase.from('items').insert({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      category: item.category,
      location: item.location,
      minimum_stock: item.minimumStock,
      completed: item.completed,
      labels: item.labels,
      shop_id: item.shopId,
      is_private: item.isPrivate,
      created_at: item.createdAt,
    });
  }
  
  console.log('Importing notes...');
  for (const note of backup.notes || []) {
    await supabase.from('notes').insert({
      id: note.id,
      content: note.content,
      linked_to: note.linkedTo,
      linked_type: note.linkedType,
      labels: note.labels,
      pinned: note.pinned,
      is_private: note.isPrivate,
      created_at: note.createdAt,
    });
  }
  
  console.log('Importing calendar events...');
  for (const event of backup.calendarEvents || []) {
    await supabase.from('calendar_events').insert({
      id: event.id,
      title: event.title,
      start_date: event.startDate,
      end_date: event.endDate,
      assigned_to: event.assignedTo,
      priority: event.priority,
      horizon: event.horizon,
      blocked: event.blocked,
      blocked_comment: event.blockedComment,
      due_date: event.dueDate,
      repeat_interval: event.repeatInterval,
      labels: event.labels,
      is_private: event.isPrivate,
      created_at: event.createdAt,
    });
  }
  
  console.log('Importing invite codes...');
  for (const code of backup.inviteCodes || []) {
    await supabase.from('invite_codes').insert({
      id: code.id,
      code: code.code,
      created_by: code.createdBy,
      created_at: code.createdAt,
      expires_at: code.expiresAt,
      used: code.used,
      used_by: code.usedBy,
      used_at: code.usedAt,
    });
  }
  
  console.log('✅ Import completed!');
}

importData().catch(console.error);
```

Voer uit:

```bash
node scripts/import-localstorage.js
```

## Stap 5: Rebuild en test

```bash
# Rebuild frontend
npm run build

# Restart Docker containers
docker-compose -f docker-compose.supabase.yml restart todoless

# Test de applicatie
open http://localhost:3000
```

## Stap 6: Verificatie

Controleer dat alles werkt:

- [ ] Login werkt
- [ ] Tasks worden getoond
- [ ] Nieuwe task aanmaken werkt
- [ ] Task updaten werkt
- [ ] Task verwijderen werkt
- [ ] Labels worden getoond
- [ ] Items worden getoond
- [ ] Notes worden getoond
- [ ] Calendar werkt
- [ ] Settings worden opgeslagen
- [ ] Real-time updates werken (test met 2 browser tabs)

## Stap 7: Clean up localStorage (optioneel)

Als alles werkt, verwijder oude localStorage data:

```javascript
// In browser console:
Object.keys(localStorage)
  .filter(key => key.startsWith('todoless_'))
  .forEach(key => localStorage.removeItem(key));

console.log('localStorage cleaned!');
```

## Troubleshooting

### "Cannot read properties of undefined"

Check of Supabase draait:
```bash
docker-compose -f docker-compose.supabase.yml ps
```

### "Failed to fetch"

Check de Supabase URL in `.env`:
```bash
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### "Permission denied" bij insert

Check RLS policies in Supabase Studio. Tijdelijk disablen voor import:

```sql
-- Disable RLS tijdelijk
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
-- ... voor alle tabellen

-- Na import, weer enablen
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
-- ... voor alle tabellen
```

### Data mapping problemen

Check de field names in de database:
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `sprintId` → `sprint_id`
- `shopId` → `shop_id`
- `isPrivate` → `is_private`

## Rollback Plan

Als er problemen zijn, rollback:

```bash
# Stop Supabase versie
docker-compose -f docker-compose.supabase.yml down

# Herstel oude AppContext
mv context/AppContext.localStorage.tsx context/AppContext.tsx

# Rebuild
npm run build

# Oude data zit nog in localStorage
```

## Voordelen van Supabase

Na migratie heb je:

- ✅ **Real-time synchronisatie** - Updates verschijnen direct in alle tabs/devices
- ✅ **Multi-user support** - Meerdere users kunnen tegelijk werken
- ✅ **Database backup** - Automatische backups met pg_dump
- ✅ **Better data integrity** - PostgreSQL constraints en validatie
- ✅ **Schaalbaarheid** - Kan groeien met je team
- ✅ **API endpoints** - REST API voor integraties
- ✅ **Row Level Security** - Fine-grained permissions
- ✅ **Audit logging** - Track alle wijzigingen

## Next Steps

1. **Setup productie deployment** - Volg SETUP_CHECKLIST.md
2. **Configure backups** - Automatische dagelijkse backups
3. **Add monitoring** - Track performance en errors
4. **Enable SSL** - Secure verbindingen in productie
5. **Optimize queries** - Add indexes waar nodig

## Support

Bij vragen of problemen:
- Check README_SUPABASE.md voor Supabase documentatie
- Check database logs: `docker logs supabase-db`
- Check app logs: `docker logs todoless-app`
- Test API direct: `curl http://localhost:8000/rest/v1/tasks`
