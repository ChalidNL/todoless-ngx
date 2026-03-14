# PocketBase Schema Setup

This directory contains the database schema for To Do Less app.

## Automatic Setup (Recommended)

When you first run PocketBase, access the Admin UI at `http://localhost:8090/_/` and import the `pb_schema.json` file.

## Manual Setup

If you prefer to create collections manually, follow the structure below:

### 1. Users Collection (Built-in Auth)

PocketBase provides this by default. Add these custom fields:
- `name` (text, required)
- `role` (select: admin, user, child - default: user)

### 2. Tasks Collection

**Type:** Base
**API Rules:**
- List: `user = @request.auth.id`
- View: `user = @request.auth.id`
- Create: `@request.auth.id != ""`
- Update: `user = @request.auth.id`
- Delete: `user = @request.auth.id`

**Fields:**
- `title` (text, required)
- `status` (select: backlog, todo, done - default: backlog)
- `priority` (select: urgent, normal, low)
- `horizon` (select: week, month, 3months, 6months, year)
- `blocked` (bool, default: false)
- `blocked_comment` (text)
- `sprint_id` (relation → sprints)
- `assigned_to` (relation → users)
- `due_date` (date)
- `repeat_interval` (select: week, month, year)
- `labels` (json, default: [])
- `is_private` (bool, default: false)
- `archived` (bool, default: false)
- `archived_at` (date)
- `delete_after` (date)
- `completed_at` (date)
- `user` (relation → users, required, cascade delete)

### 3. Items Collection

**Type:** Base
**API Rules:** Same as Tasks

**Fields:**
- `title` (text, required)
- `quantity` (number)
- `category` (text)
- `location` (text)
- `minimum_stock` (number)
- `completed` (bool, default: false)
- `labels` (json, default: [])
- `shop_id` (relation → shops)
- `is_private` (bool, default: false)
- `user` (relation → users, required, cascade delete)

### 4. Notes Collection

**Type:** Base
**API Rules:** Same as Tasks

**Fields:**
- `content` (text, required)
- `linked_to` (text) - ID of linked task/item
- `linked_type` (select: task, item)
- `labels` (json, default: [])
- `pinned` (bool, default: false)
- `is_private` (bool, default: false)
- `user` (relation → users, required, cascade delete)

### 5. Labels Collection

**Type:** Base
**API Rules:**
- List: `is_private = false || created_by = @request.auth.id`
- View: `is_private = false || created_by = @request.auth.id`
- Create: `@request.auth.id != ""`
- Update: `created_by = @request.auth.id`
- Delete: `created_by = @request.auth.id`

**Fields:**
- `name` (text, required)
- `color` (text, required, default: "#3B82F6")
- `is_private` (bool, default: false)
- `created_by` (relation → users, required)

### 6. Shops Collection

**Type:** Base
**API Rules:** Same as Tasks

**Fields:**
- `name` (text, required)
- `color` (text, required, default: "#10B981")
- `user` (relation → users, required, cascade delete)

### 7. Sprints Collection

**Type:** Base
**API Rules:** Same as Tasks

**Fields:**
- `name` (text, required)
- `start_date` (date, required)
- `end_date` (date, required)
- `duration` (select: 1week, 2weeks, 3weeks, 1month, required)
- `week_number` (number)
- `year` (number)
- `user` (relation → users, required, cascade delete)

### 8. Calendar Events Collection

**Type:** Base
**API Rules:** Same as Tasks

**Fields:**
- `title` (text, required)
- `start_date` (date, required)
- `end_date` (date)
- `assigned_to` (relation → users)
- `priority` (select: urgent, normal, low)
- `horizon` (select: week, month, 3months, 6months, year)
- `blocked` (bool, default: false)
- `blocked_comment` (text)
- `due_date` (date)
- `repeat_interval` (select: week, month, year)
- `labels` (json, default: [])
- `is_private` (bool, default: false)
- `user` (relation → users, required, cascade delete)

### 9. Invite Codes Collection

**Type:** Base
**API Rules:**
- List: `@request.auth.id != "" && @request.auth.role = "admin"`
- View: `@request.auth.id != ""`
- Create: `@request.auth.id != "" && @request.auth.role = "admin"`
- Update: `@request.auth.id != "" && @request.auth.role = "admin"`
- Delete: `@request.auth.id != "" && @request.auth.role = "admin"`

**Fields:**
- `code` (text, required, unique)
- `created_by` (relation → users, required)
- `expires_at` (date, required)
- `used` (bool, default: false)
- `used_by` (relation → users)
- `used_at` (date)

### 10. App Settings Collection

**Type:** Base
**API Rules:**
- List: `user = @request.auth.id`
- View: `user = @request.auth.id`
- Create: `@request.auth.id != ""`
- Update: `user = @request.auth.id`
- Delete: `user = @request.auth.id`

**Fields:**
- `user` (relation → users, required, unique, cascade delete)
- `theme` (text, default: "light")
- `language` (text, default: "en")
- `archive_retention_days` (number, default: 30)
- `auto_cleanup` (bool, default: true)
- `preferences` (json, default: {})

## After Creating Collections

1. Create your first admin user through PocketBase Admin UI
2. Use the admin account to create invite codes for other users
3. Test the registration flow with an invite code

## Notes

- All timestamps (`created` and `updated`) are automatically managed by PocketBase
- User IDs are automatically filled from `@request.auth.id` on create
- Private labels are only visible to their creators
- All user data is isolated by the `user = @request.auth.id` rule
