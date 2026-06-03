import { describe, expect, it } from 'vitest';
import { canChangeMemberRole, getCompactUserName, getMemberInitials, isOnlyAdmin } from '../lib/member-role-utils';
import { buildFlagUpdate, getCommentButtonActive } from '../lib/task-attribute-utils';

describe('member-role utils', () => {
  it('uses only the first name for compact user labels', () => {
    expect(getCompactUserName({ firstName: 'Chalid', name: 'Chalid Ben', email: 'c@example.com' })).toBe('Chalid');
    expect(getCompactUserName({ name: 'Loubna Test', email: 'l@example.com' })).toBe('Loubna');
    expect(getCompactUserName({ email: 'agent.family@example.com' })).toBe('agent.family');
  });

  it('builds compact member initials', () => {
    expect(getMemberInitials({ firstName: 'Chalid', lastName: 'Ben', name: 'Chalid Ben', email: 'c@example.com' })).toBe('CB');
    expect(getMemberInitials({ name: 'Loubna', email: 'l@example.com' })).toBe('LO');
  });

  it('allows role changes only for admins/owners on non-owner human users', () => {
    expect(canChangeMemberRole({ role: 'admin' }, { role: 'member', member_type: 'human' })).toBe(true);
    expect(canChangeMemberRole({ role: 'member' }, { role: 'member', member_type: 'human' })).toBe(false);
    expect(canChangeMemberRole({ role: 'admin' }, { role: 'owner', member_type: 'human' })).toBe(false);
    expect(canChangeMemberRole({ role: 'admin' }, { role: 'member', member_type: 'agent' })).toBe(false);
  });

  it('detects the only admin correctly', () => {
    expect(isOnlyAdmin([
      { id: 'a', role: 'admin' },
      { id: 'b', role: 'member' },
    ], 'a')).toBe(true);

    expect(isOnlyAdmin([
      { id: 'a', role: 'admin' },
      { id: 'b', role: 'admin' },
    ], 'a')).toBe(false);
  });
});

describe('task attribute utils', () => {
  it('requires a comment before enabling a flag', () => {
    expect(buildFlagUpdate({ flag: false, blockedComment: '' }, '')).toEqual({ error: 'comment-required' });
    expect(buildFlagUpdate({ flag: false, blockedComment: '' }, '  Needs follow-up  ')).toEqual({
      update: {
        flag: true,
        blocked: true,
        blockedComment: 'Needs follow-up',
      },
    });
  });

  it('keeps comment state when removing a flag', () => {
    expect(buildFlagUpdate({ flag: true, blockedComment: 'Waiting on reply' }, 'Waiting on reply')).toEqual({
      update: {
        flag: false,
        blocked: false,
        blockedComment: 'Waiting on reply',
      },
    });
  });

  it('marks the comment attribute active when there is a flag or comment', () => {
    expect(getCommentButtonActive({ flag: true, blockedComment: '' })).toBe(true);
    expect(getCommentButtonActive({ flag: false, blockedComment: 'Blocked by vendor' })).toBe(true);
    expect(getCommentButtonActive({ flag: false, blockedComment: '   ' })).toBe(false);
  });
});
