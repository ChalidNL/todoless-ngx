/**
 * PocketBase Client Wrapper for To Do Less
 * This replaces the old api-client.ts with PocketBase SDK calls
 */

import { pb } from './pocketbase';
import type { 
  User, 
  Task, 
  Item, 
  Note, 
  Label, 
  Shop, 
  Sprint, 
  CalendarEvent, 
  InviteCode, 
  AppSettings 
} from './pocketbase';

class PocketBaseClient {
  // ==================== AUTH ====================
  
  async login(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return {
      token: pb.authStore.token,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        role: authData.record.role,
        avatar_url: authData.record.avatar,
      },
    };
  }

  async register(email: string, password: string, name: string, inviteCode: string) {
    // First verify the invite code
    const invites = await pb.collection('invite_codes').getFullList({
      filter: `code = "${inviteCode}" && used = false && expires_at > "${new Date().toISOString()}"`,
    });

    if (invites.length === 0) {
      throw new Error('Invalid or expired invite code');
    }

    // Create the user
    const userData = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
      username: email.split('@')[0], // Use email prefix as username
      role: 'user',
    });

    // Mark invite as used
    await pb.collection('invite_codes').update(invites[0].id, {
      used: true,
      used_by: userData.id,
      used_at: new Date().toISOString(),
    });

    // Auto-login after registration
    const authData = await pb.collection('users').authWithPassword(email, password);
    
    return {
      token: pb.authStore.token,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        role: authData.record.role,
        avatar_url: authData.record.avatar,
      },
    };
  }

  async logout() {
    pb.authStore.clear();
  }

  async getCurrentUser() {
    if (!pb.authStore.isValid || !pb.authStore.record) {
      throw new Error('Not authenticated');
    }
    return {
      user: {
        id: pb.authStore.record.id,
        email: pb.authStore.record.email,
        name: pb.authStore.record.name,
        role: pb.authStore.record.role,
        avatar_url: pb.authStore.record.avatar,
      },
    };
  }

  // ==================== TASKS ====================
  
  async getTasks() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const userId = pb.authStore.record?.id;
    const records = await pb.collection('tasks').getFullList({
      filter: `user = "${userId}"`,
      sort: '-created',
    });
    return records;
  }

  async createTask(task: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    return await pb.collection('tasks').create({
      ...task,
      user: userId,
      status: task.status || 'backlog',
      blocked: task.blocked || false,
      is_private: task.isPrivate || false,
      archived: task.archived || false,
      labels: task.labels || [],
    });
  }

  async updateTask(id: string, updates: any) {
    return await pb.collection('tasks').update(id, updates);
  }

  async deleteTask(id: string) {
    await pb.collection('tasks').delete(id);
  }

  // ==================== ITEMS ====================
  
  async getItems() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const userId = pb.authStore.record?.id;
    const records = await pb.collection('items').getFullList({
      filter: `user = "${userId}"`,
      sort: '-created',
    });
    return records;
  }

  async createItem(item: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    return await pb.collection('items').create({
      ...item,
      user: userId,
      completed: item.completed || false,
      is_private: item.isPrivate || false,
      labels: item.labels || [],
    });
  }

  async updateItem(id: string, updates: any) {
    return await pb.collection('items').update(id, updates);
  }

  async deleteItem(id: string) {
    await pb.collection('items').delete(id);
  }

  // ==================== NOTES ====================
  
  async getNotes() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const userId = pb.authStore.record?.id;
    const records = await pb.collection('notes').getFullList({
      filter: `user = "${userId}"`,
      sort: '-created',
    });
    return records;
  }

  async createNote(note: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    return await pb.collection('notes').create({
      ...note,
      user: userId,
      pinned: note.pinned || false,
      is_private: note.isPrivate || false,
      labels: note.labels || [],
    });
  }

  async updateNote(id: string, updates: any) {
    return await pb.collection('notes').update(id, updates);
  }

  async deleteNote(id: string) {
    await pb.collection('notes').delete(id);
  }

  // ==================== LABELS ====================
  
  async getLabels() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const userId = pb.authStore.record?.id;
    // Get all public labels + user's private labels
    const records = await pb.collection('labels').getFullList({
      filter: `is_private = false || created_by = "${userId}"`,
      sort: 'name',
    });
    return records;
  }

  async createLabel(label: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    return await pb.collection('labels').create({
      ...label,
      created_by: userId,
      is_private: label.isPrivate || false,
    });
  }

  async updateLabel(id: string, updates: any) {
    return await pb.collection('labels').update(id, updates);
  }

  async deleteLabel(id: string) {
    await pb.collection('labels').delete(id);
  }

  // ==================== SHOPS ====================
  
  async getShops() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const userId = pb.authStore.record?.id;
    const records = await pb.collection('shops').getFullList({
      filter: `user = "${userId}"`,
      sort: 'name',
    });
    return records;
  }

  async createShop(shop: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    return await pb.collection('shops').create({
      ...shop,
      user: userId,
    });
  }

  async updateShop(id: string, updates: any) {
    return await pb.collection('shops').update(id, updates);
  }

  async deleteShop(id: string) {
    await pb.collection('shops').delete(id);
  }

  // ==================== SPRINTS ====================
  
  async getSprints() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const userId = pb.authStore.record?.id;
    const records = await pb.collection('sprints').getFullList({
      filter: `user = "${userId}"`,
      sort: '-start_date',
    });
    return records;
  }

  async createSprint(sprint: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    return await pb.collection('sprints').create({
      ...sprint,
      user: userId,
    });
  }

  async updateSprint(id: string, updates: any) {
    return await pb.collection('sprints').update(id, updates);
  }

  async deleteSprint(id: string) {
    await pb.collection('sprints').delete(id);
  }

  // ==================== CALENDAR ====================
  
  async getCalendarEvents() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const userId = pb.authStore.record?.id;
    const records = await pb.collection('calendar_events').getFullList({
      filter: `user = "${userId}"`,
      sort: 'start_date',
    });
    return records;
  }

  async createCalendarEvent(event: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    return await pb.collection('calendar_events').create({
      ...event,
      user: userId,
      blocked: event.blocked || false,
      is_private: event.isPrivate || false,
      labels: event.labels || [],
    });
  }

  async updateCalendarEvent(id: string, updates: any) {
    return await pb.collection('calendar_events').update(id, updates);
  }

  async deleteCalendarEvent(id: string) {
    await pb.collection('calendar_events').delete(id);
  }

  // ==================== SETTINGS ====================
  
  async getSettings() {
    if (!pb.authStore.isValid) {
      // Return default settings if not authenticated
      return {
        hasCompletedOnboarding: false,
        sprintDuration: '2weeks',
        theme: 'light',
        language: 'en',
        archiveRetention: 30,
        autoCleanup: true,
      };
    }
    
    const userId = pb.authStore.record?.id;
    
    // Get user's settings
    const records = await pb.collection('app_settings').getFullList({
      filter: `user = "${userId}"`,
    });

    if (records.length === 0) {
      // Create default settings if none exist
      return await pb.collection('app_settings').create({
        user: userId,
        theme: 'light',
        language: 'en',
        archive_retention_days: 30,
        auto_cleanup: true,
        preferences: {},
      });
    }

    return records[0];
  }

  async updateSettings(updates: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    // Get existing settings
    const records = await pb.collection('app_settings').getFullList({
      filter: `user = "${userId}"`,
    });

    if (records.length > 0) {
      return await pb.collection('app_settings').update(records[0].id, updates);
    } else {
      // Create if doesn't exist
      return await pb.collection('app_settings').create({
        user: userId,
        ...updates,
      });
    }
  }

  // ==================== INVITES ====================
  
  async getInvites() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const records = await pb.collection('invite_codes').getFullList({
      sort: '-created',
    });
    return records;
  }

  async createInvite(data: any) {
    if (!pb.authStore.isValid) throw new Error('Not authenticated');
    const userId = pb.authStore.record?.id;
    
    return await pb.collection('invite_codes').create({
      code: data.code,
      created_by: userId,
      expires_at: data.expires_at,
      used: false,
    });
  }

  async deleteInvite(id: string) {
    await pb.collection('invite_codes').delete(id);
  }

  // ==================== USERS ====================
  
  async getUsers() {
    if (!pb.authStore.isValid) return []; // Return empty array instead of throwing
    const records = await pb.collection('users').getFullList({
      sort: 'name',
    });
    return records;
  }

  async updateUser(id: string, updates: any) {
    return await pb.collection('users').update(id, updates);
  }
}

// Export a single instance
export const api = new PocketBaseClient();