// Simple API client for Todoless-ngx backend

// If VITE_API_URL is empty, use same host (nginx proxy)
// Otherwise use the specified URL (for development: http://localhost:4000)
const API_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async register(email: string, password: string, name: string, inviteCode: string) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, inviteCode }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Tasks
  async getTasks() {
    return this.request('/api/tasks');
  }

  async createTask(task: any) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, updates: any) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/api/tasks/${id}`, { method: 'DELETE' });
  }

  // Items
  async getItems() {
    return this.request('/api/items');
  }

  async createItem(item: any) {
    return this.request('/api/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem(id: string, updates: any) {
    return this.request(`/api/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteItem(id: string) {
    return this.request(`/api/items/${id}`, { method: 'DELETE' });
  }

  // Notes
  async getNotes() {
    return this.request('/api/notes');
  }

  async createNote(note: any) {
    return this.request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: string, updates: any) {
    return this.request(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteNote(id: string) {
    return this.request(`/api/notes/${id}`, { method: 'DELETE' });
  }

  // Labels
  async getLabels() {
    return this.request('/api/labels');
  }

  async createLabel(label: any) {
    return this.request('/api/labels', {
      method: 'POST',
      body: JSON.stringify(label),
    });
  }

  async updateLabel(id: string, updates: any) {
    return this.request(`/api/labels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteLabel(id: string) {
    return this.request(`/api/labels/${id}`, { method: 'DELETE' });
  }

  // Shops
  async getShops() {
    return this.request('/api/shops');
  }

  async createShop(shop: any) {
    return this.request('/api/shops', {
      method: 'POST',
      body: JSON.stringify(shop),
    });
  }

  async updateShop(id: string, updates: any) {
    return this.request(`/api/shops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteShop(id: string) {
    return this.request(`/api/shops/${id}`, { method: 'DELETE' });
  }

  // Sprints
  async getSprints() {
    return this.request('/api/sprints');
  }

  async createSprint(sprint: any) {
    return this.request('/api/sprints', {
      method: 'POST',
      body: JSON.stringify(sprint),
    });
  }

  async updateSprint(id: string, updates: any) {
    return this.request(`/api/sprints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteSprint(id: string) {
    return this.request(`/api/sprints/${id}`, { method: 'DELETE' });
  }

  // Calendar
  async getCalendarEvents() {
    return this.request('/api/calendar');
  }

  async createCalendarEvent(event: any) {
    return this.request('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateCalendarEvent(id: string, updates: any) {
    return this.request(`/api/calendar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCalendarEvent(id: string) {
    return this.request(`/api/calendar/${id}`, { method: 'DELETE' });
  }

  // Settings
  async getSettings() {
    return this.request('/api/settings');
  }

  async updateSettings(updates: any) {
    return this.request('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Invites
  async getInvites() {
    return this.request('/api/invites');
  }

  async createInvite(data: any) {
    return this.request('/api/invites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteInvite(id: string) {
    return this.request(`/api/invites/${id}`, { method: 'DELETE' });
  }

  // Users
  async getUsers() {
    return this.request('/api/users');
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
}

export const api = new ApiClient();