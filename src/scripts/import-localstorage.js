#!/usr/bin/env node

/**
 * Import localStorage data to Supabase
 * 
 * Usage:
 *   node scripts/import-localstorage.js backup.json
 * 
 * Prerequisites:
 *   - Supabase must be running
 *   - SERVICE_ROLE_KEY must be set in .env
 *   - backup.json must exist (created from browser console)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const supabaseKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Error: SERVICE_ROLE_KEY not found in .env');
  console.log('\nPlease set SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to map camelCase to snake_case
const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
};

async function importData(backupFile) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📦 Importing localStorage data to Supabase');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Load backup file
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    console.log('\nCreate a backup first by running this in your browser console:');
    console.log('━'.repeat(60));
    console.log(`
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
};

// Copy output and save to backup.json
console.log(JSON.stringify(backup, null, 2));
    `);
    console.log('━'.repeat(60));
    process.exit(1);
  }
  
  console.log(`📂 Loading backup from: ${backupFile}`);
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  let totalImported = 0;
  
  // Import in correct order (respecting foreign keys)
  
  // 1. Users (no dependencies)
  if (backup.users && backup.users.length > 0) {
    console.log(`\n👥 Importing ${backup.users.length} users...`);
    for (const user of backup.users) {
      const { error } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password,
        role: user.role || 'user',
        avatar_url: user.avatarUrl,
        created_at: user.createdAt || new Date().toISOString(),
      });
      
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error(`  ⚠️  Error importing user ${user.email}:`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.users.length} users`);
  }
  
  // 2. Labels (depends on users)
  if (backup.labels && backup.labels.length > 0) {
    console.log(`\n🏷️  Importing ${backup.labels.length} labels...`);
    for (const label of backup.labels) {
      const { error } = await supabase.from('labels').insert({
        id: label.id,
        name: label.name,
        color: label.color,
        is_private: label.isPrivate || false,
        created_by: label.createdBy,
        created_at: label.createdAt || new Date().toISOString(),
      });
      
      if (error && error.code !== '23505') {
        console.error(`  ⚠️  Error importing label ${label.name}:`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.labels.length} labels`);
  }
  
  // 3. Shops (no dependencies)
  if (backup.shops && backup.shops.length > 0) {
    console.log(`\n🏪 Importing ${backup.shops.length} shops...`);
    for (const shop of backup.shops) {
      const { error } = await supabase.from('shops').insert({
        id: shop.id,
        name: shop.name,
        color: shop.color,
        created_at: new Date().toISOString(),
      });
      
      if (error && error.code !== '23505') {
        console.error(`  ⚠️  Error importing shop ${shop.name}:`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.shops.length} shops`);
  }
  
  // 4. Sprints (no dependencies)
  if (backup.sprints && backup.sprints.length > 0) {
    console.log(`\n🏃 Importing ${backup.sprints.length} sprints...`);
    for (const sprint of backup.sprints) {
      const { error } = await supabase.from('sprints').insert({
        id: sprint.id,
        name: sprint.name,
        start_date: sprint.startDate,
        end_date: sprint.endDate,
        duration: sprint.duration,
        week_number: sprint.weekNumber,
        year: sprint.year,
        created_at: new Date().toISOString(),
      });
      
      if (error && error.code !== '23505') {
        console.error(`  ⚠️  Error importing sprint ${sprint.name}:`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.sprints.length} sprints`);
  }
  
  // 5. Tasks (depends on sprints, users, labels)
  if (backup.tasks && backup.tasks.length > 0) {
    console.log(`\n✅ Importing ${backup.tasks.length} tasks...`);
    for (const task of backup.tasks) {
      const { error } = await supabase.from('tasks').insert({
        id: task.id,
        title: task.title,
        status: task.status || 'backlog',
        priority: task.priority,
        horizon: task.horizon,
        blocked: task.blocked || false,
        blocked_comment: task.blockedComment,
        sprint_id: task.sprintId,
        assigned_to: task.assignedTo,
        due_date: task.dueDate,
        repeat_interval: task.repeatInterval,
        labels: task.labels || [],
        is_private: task.isPrivate || false,
        archived: task.archived || false,
        archived_at: task.archivedAt,
        delete_after: task.deleteAfter,
        created_at: task.createdAt || new Date().toISOString(),
        completed_at: task.completedAt,
      });
      
      if (error && error.code !== '23505') {
        console.error(`  ⚠️  Error importing task "${task.title}":`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.tasks.length} tasks`);
  }
  
  // 6. Items (depends on shops, labels)
  if (backup.items && backup.items.length > 0) {
    console.log(`\n🛒 Importing ${backup.items.length} items...`);
    for (const item of backup.items) {
      const { error } = await supabase.from('items').insert({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        category: item.category,
        location: item.location,
        minimum_stock: item.minimumStock,
        completed: item.completed || false,
        labels: item.labels || [],
        shop_id: item.shopId,
        is_private: item.isPrivate || false,
        created_at: item.createdAt || new Date().toISOString(),
      });
      
      if (error && error.code !== '23505') {
        console.error(`  ⚠️  Error importing item "${item.title}":`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.items.length} items`);
  }
  
  // 7. Notes (depends on labels, tasks, items)
  if (backup.notes && backup.notes.length > 0) {
    console.log(`\n📝 Importing ${backup.notes.length} notes...`);
    for (const note of backup.notes) {
      const { error } = await supabase.from('notes').insert({
        id: note.id,
        content: note.content,
        linked_to: note.linkedTo,
        linked_type: note.linkedType,
        labels: note.labels || [],
        pinned: note.pinned || false,
        is_private: note.isPrivate || false,
        created_at: note.createdAt || new Date().toISOString(),
      });
      
      if (error && error.code !== '23505') {
        console.error(`  ⚠️  Error importing note:`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.notes.length} notes`);
  }
  
  // 8. Calendar Events (depends on users, labels)
  if (backup.calendarEvents && backup.calendarEvents.length > 0) {
    console.log(`\n📅 Importing ${backup.calendarEvents.length} calendar events...`);
    for (const event of backup.calendarEvents) {
      const { error } = await supabase.from('calendar_events').insert({
        id: event.id,
        title: event.title,
        start_date: event.startDate,
        end_date: event.endDate,
        assigned_to: event.assignedTo,
        priority: event.priority,
        horizon: event.horizon,
        blocked: event.blocked || false,
        blocked_comment: event.blockedComment,
        due_date: event.dueDate,
        repeat_interval: event.repeatInterval,
        labels: event.labels || [],
        is_private: event.isPrivate || false,
        created_at: event.createdAt || new Date().toISOString(),
      });
      
      if (error && error.code !== '23505') {
        console.error(`  ⚠️  Error importing event "${event.title}":`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.calendarEvents.length} calendar events`);
  }
  
  // 9. Invite Codes (depends on users)
  if (backup.inviteCodes && backup.inviteCodes.length > 0) {
    console.log(`\n🎟️  Importing ${backup.inviteCodes.length} invite codes...`);
    for (const code of backup.inviteCodes) {
      const { error } = await supabase.from('invite_codes').insert({
        id: code.id,
        code: code.code,
        created_by: code.createdBy,
        created_at: code.createdAt || new Date().toISOString(),
        expires_at: code.expiresAt,
        used: code.used || false,
        used_by: code.usedBy,
        used_at: code.usedAt,
      });
      
      if (error && error.code !== '23505') {
        console.error(`  ⚠️  Error importing invite code ${code.code}:`, error.message);
      } else {
        totalImported++;
      }
    }
    console.log(`  ✅ Imported ${backup.inviteCodes.length} invite codes`);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✅ Import completed! Imported ${totalImported} records`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 Summary:');
  console.log(`  Users: ${backup.users?.length || 0}`);
  console.log(`  Labels: ${backup.labels?.length || 0}`);
  console.log(`  Shops: ${backup.shops?.length || 0}`);
  console.log(`  Sprints: ${backup.sprints?.length || 0}`);
  console.log(`  Tasks: ${backup.tasks?.length || 0}`);
  console.log(`  Items: ${backup.items?.length || 0}`);
  console.log(`  Notes: ${backup.notes?.length || 0}`);
  console.log(`  Calendar Events: ${backup.calendarEvents?.length || 0}`);
  console.log(`  Invite Codes: ${backup.inviteCodes?.length || 0}`);
  
  console.log('\n🎉 Next steps:');
  console.log('  1. Open http://localhost:3000 to verify data');
  console.log('  2. Check Supabase Studio: http://localhost:3010');
  console.log('  3. Test real-time updates (open 2 browser tabs)');
  console.log('  4. Review MIGRATION_GUIDE.md for verification steps\n');
}

// Get backup file from command line
const backupFile = process.argv[2] || 'backup.json';

importData(backupFile).catch(error => {
  console.error('\n❌ Import failed:', error);
  process.exit(1);
});
