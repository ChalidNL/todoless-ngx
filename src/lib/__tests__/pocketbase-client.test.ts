import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock PocketBase SDK
const mockCollection = {
  authWithPassword: vi.fn(),
  getList: vi.fn(),
  getFullList: vi.fn(),
  getFirstListItem: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../pocketbase', () => ({
  pb: {
    collection: vi.fn(() => mockCollection),
    authStore: {
      token: 'mock-token',
      isValid: true,
      record: { id: 'user1', email: 'test@test.com', name: 'Test', role: 'admin' },
      clear: vi.fn(),
    },
  },
}));

// Import after mock
import { pb } from '../pocketbase';

// Dynamically import the client
let api: any;

describe('PocketBaseClient', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    // Re-import to get fresh instance
    const mod = await import('../pocketbase-client');
    api = mod.api;
  });

  describe('login', () => {
    it('calls authWithPassword with correct params', async () => {
      mockCollection.authWithPassword.mockResolvedValue({
        record: { id: 'u1', email: 'test@test.com', name: 'Test', role: 'user' },
      });

      const result = await api.login('test@test.com', 'password123');

      expect(pb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.authWithPassword).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('register', () => {
    it('creates user and handles first user as admin', async () => {
      (fetch as any).mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ totalItems: 0 }) });
      mockCollection.create.mockResolvedValue({ id: 'u1', email: 'admin@test.com', name: 'Admin', role: 'admin' });
      mockCollection.authWithPassword.mockResolvedValue({
        record: { id: 'u1', email: 'admin@test.com', name: 'Admin', role: 'admin' },
      });

      const result = await api.register('admin@test.com', 'pass', 'Admin');

      expect(mockCollection.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
      expect(mockCollection.authWithPassword).toHaveBeenCalledWith('admin@test.com', 'pass');
      expect(result).toHaveProperty('user');
    });

    it('requires invite code for non-first user', async () => {
      (fetch as any).mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ totalItems: 1 }) });

      await expect(api.register('user@test.com', 'pass', 'User')).rejects.toThrow('Invite code is required');
    });

    it('validates invite code for non-first user', async () => {
      (fetch as any)
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ totalItems: 1 }) })
        .mockResolvedValueOnce({ ok: false, json: vi.fn().mockResolvedValue({}) });

      await expect(api.register('user@test.com', 'pass', 'User', 'BAD_CODE')).rejects.toThrow('Invalid or expired invite code');
    });

    it('consumes invite after successful non-first-user registration', async () => {
      (fetch as any)
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ totalItems: 3 }) })
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ items: [{ id: 'inv1', code: 'ABC123' }] }) });
      mockCollection.create.mockResolvedValue({ id: 'u2', email: 'user@test.com', name: 'User', role: 'user' });
      mockCollection.authWithPassword.mockResolvedValue({
        record: { id: 'u2', email: 'user@test.com', name: 'User', role: 'user' },
      });

      await api.register('user@test.com', 'pass', 'User', 'abc123');

      expect(mockCollection.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'user' }));
      expect(mockCollection.update).toHaveBeenCalledWith(
        'inv1',
        expect.objectContaining({ used: true, used_by: 'u2' }),
      );
    });
  });

  describe('CRUD operations', () => {
    it('getTasks calls tasks collection with exact user relation filter', async () => {
      mockCollection.getFullList.mockResolvedValue([
        { id: 't1', title: 'Test Task', status: 'todo', created: new Date().toISOString(), user: 'user1', labels: [] },
      ]);

      const tasks = await api.getTasks();

      expect(pb.collection).toHaveBeenCalledWith('tasks');
      expect(mockCollection.getFullList).toHaveBeenCalledWith(
        expect.objectContaining({ filter: 'user = "user1"' })
      );
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Test Task');
    });

    it('createTask sends correct data', async () => {
      mockCollection.create.mockResolvedValue({ id: 't1' });

      await api.createTask({ title: 'New Task', status: 'todo' });

      expect(pb.collection).toHaveBeenCalledWith('tasks');
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Task', status: 'todo' })
      );
    });

    it('deleteTask calls delete with id', async () => {
      mockCollection.delete.mockResolvedValue(undefined);

      await api.deleteTask('t1');

      expect(pb.collection).toHaveBeenCalledWith('tasks');
      expect(mockCollection.delete).toHaveBeenCalledWith('t1');
    });

    it('getItems returns normalized items', async () => {
      mockCollection.getFullList.mockResolvedValue([
        { id: 'i1', title: 'Milk', completed: false, created: new Date().toISOString(), user: 'user1', labels: [] },
      ]);

      const items = await api.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Milk');
    });

    it('updateTask calls update with correct id', async () => {
      mockCollection.update.mockResolvedValue({ id: 't1' });

      await api.updateTask('t1', { title: 'Updated' });

      expect(pb.collection).toHaveBeenCalledWith('tasks');
      expect(mockCollection.update).toHaveBeenCalledWith('t1', expect.objectContaining({}));
    });
  });

  describe('logout', () => {
    it('clears auth store', async () => {
      await api.logout();
      expect(pb.authStore.clear).toHaveBeenCalled();
    });
  });

  describe('shared operations', () => {
    it('getUsers fetches all users', async () => {
      mockCollection.getFullList.mockResolvedValue([
        { id: 'u1', email: 'a@b.com', name: 'User A', role: 'admin' },
        { id: 'u2', email: 'c@d.com', name: 'User B', role: 'user' },
      ]);

      const users = await api.getUsers();
      expect(users).toHaveLength(2);
      expect(pb.collection).toHaveBeenCalledWith('users');
    });
  });
});
