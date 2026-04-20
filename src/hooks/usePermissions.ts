import { pb } from '../lib/pocketbase';

export function usePermissions() {
  const role = (pb.authStore.record?.role as string) || 'user';

  return {
    canManageUsers: role === 'admin',
    canCreateSprints: role !== 'child',
    canDeleteOthersItems: role === 'admin',
    canSeeAllItems: role === 'admin',
    canManageRewards: role !== 'child',
    canEarnRewards: role === 'child',
    canAccessSettings: role !== 'child',
    canAccessFullSettings: role === 'admin',
    isAdmin: role === 'admin',
    isChild: role === 'child',
    role,
  };
}
