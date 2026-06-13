import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoFile = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('backend regression guards', () => {
  it('allows family members to update shared shops they can see', () => {
    const migration = repoFile('pb_migrations/054_family_shop_write_rules.js');

    expect(migration).toContain("shops.updateRule = familyRule");
    expect(migration).toContain("shops.deleteRule = familyRule");
    expect(migration).toContain("user.family_id = @request.auth.family_id");
  });

  it('uses a fresh auth record for member role and block actions', () => {
    const hook = repoFile('pb_hooks/main.pb.js');

    expect(hook).toContain('function _freshAuth()');
    expect(hook).toContain('var actorRoleRecord = _freshAuth()');
    expect(hook).toContain('var actorBlockRecord = _freshAuth()');
    expect(hook).toContain('Cannot demote the owner');
  });
});
