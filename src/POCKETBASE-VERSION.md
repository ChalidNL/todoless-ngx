# PocketBase Version Selection

## Current Version in docker-compose.yml

```yaml
image: ghcr.io/muchobien/pocketbase:0.22.0
```

## Why This Version?

The compose file uses **version 0.22.0** because:

1. **Stability** — 0.22.x is a tested, stable release
2. **SDK Compatibility** — Matches the PocketBase SDK version 0.21.1 used in `package.json`
3. **Known Working** — This version is confirmed to work with the app's database schema

## Checking for Newer Versions

To use a newer PocketBase version:

1. **Check available tags:**
   - GitHub: https://github.com/pocketbase/pocketbase/releases
   - Docker Hub: https://hub.docker.com/r/muchobien/pocketbase/tags
   - GHCR: https://github.com/users/muchobien/packages/container/package/pocketbase

2. **Update docker-compose.yml:**
   ```yaml
   image: ghcr.io/muchobien/pocketbase:0.23.0  # or whatever version
   ```

3. **Test locally first:**
   ```bash
   docker compose pull
   docker compose up -d
   docker logs todoless-pocketbase
   ```

4. **Backup before upgrading:**
   ```bash
   cp -r /DATA/AppData/todoless/pb_data /backup/pb_data-$(date +%Y%m%d)
   ```

## Version Compatibility

| PocketBase Server | JavaScript SDK | Notes |
|------------------|----------------|-------|
| 0.22.x | 0.21.x | ✅ Current stable |
| 0.21.x | 0.21.x | ✅ Tested |
| 0.20.x | 0.20.x | ⚠️ Older, works but missing features |
| 0.23.x+ | 0.22.x+ | ℹ️ May require SDK update in package.json |

## Automatic Updates (Not Recommended)

You could use `:latest` tag:
```yaml
image: ghcr.io/muchobien/pocketbase:latest
```

**However, this is NOT recommended** because:
- Breaking changes can occur
- Auto-updates may break your app
- CasaOS best practices prefer pinned versions

## Upgrading PocketBase

Safe upgrade process:

1. **Backup database**
2. **Check release notes** for breaking changes
3. **Update version** in docker-compose.yml
4. **Pull new image:** `docker compose pull pocketbase`
5. **Restart:** `docker compose up -d pocketbase`
6. **Check logs:** `docker logs todoless-pocketbase`
7. **Test app** functionality
8. **Rollback if needed:** Change version back and restart

## Rollback Procedure

If upgrade fails:

```bash
# 1. Stop containers
docker compose down

# 2. Edit docker-compose.yml back to old version
# Change: image: ghcr.io/muchobien/pocketbase:0.23.0
# To:     image: ghcr.io/muchobien/pocketbase:0.22.0

# 3. Restore backup (if database migration failed)
rm -rf /DATA/AppData/todoless/pb_data
cp -r /backup/pb_data-YYYYMMDD /DATA/AppData/todoless/pb_data

# 4. Start containers
docker compose up -d

# 5. Verify
docker logs todoless-pocketbase
```

## Future-Proofing

The PocketBase project is actively developed. Check their:
- **Release schedule:** Usually monthly minor releases
- **Migration guides:** https://pocketbase.io/docs/migrations/
- **Changelog:** https://github.com/pocketbase/pocketbase/blob/master/CHANGELOG.md

## Recommendation

**For production CasaOS deployments:**
- Use a pinned version (like `0.22.0`)
- Test updates in a separate environment first
- Keep backups before upgrading
- Update quarterly, not on every release
