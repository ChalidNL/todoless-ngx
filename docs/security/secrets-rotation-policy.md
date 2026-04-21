# Secrets & Token Rotation Policy (agentix)

## Purpose
Prevent secrets/tokens from entering git and enable fast containment when exposure happens.

## Scope
- GitHub private repository
- Local mirror (self-hosted bare repo or internal git mirror)
- Developer workstations and CI/CD

## Secret classification
- **P0 (critical)**: admin passwords, signing/encryption keys, production API tokens
- **P1 (high)**: CI deploy tokens, registry credentials, service account tokens
- **P2 (medium)**: dev/test tokens with limited scope

## Rotation frequency
- **P0**: every 30 days or immediately on incident
- **P1**: every 60 days or immediately on incident
- **P2**: every 90 days
- Always rotate on team offboarding, scope change, or suspected exfiltration.

## Minimum requirements per token/secret
1. Unique per environment (dev/stage/prod)
2. Least privilege (minimum required scopes)
3. Expiration date required where possible
4. Never in code, commits, issues, or PR comments
5. Stored in a secret manager (GitHub Secrets / local vault / CI secret store)

## Standard rotation procedure
1. **Generate** a new secret/token in the source system
2. **Store** it in secret manager(s):
   - GitHub Actions secrets (repo/environment)
   - Local mirror CI secret store
   - Runtime secret store (if applicable)
3. **Deploy** with the new secret
4. **Validate** health checks and auth flows
5. **Revoke** the old secret/token
6. **Document** rotation date + owner + next rotation date

## Incident procedure (secret in git)
1. Treat as compromised (even in private repos)
2. Revoke/rotate immediately
3. Scan history: `gitleaks git --redact --config .gitleaks.toml`
4. Remove secret from history if needed (git filter-repo / BFG)
5. Force push + mirror sync
6. Close incident with RCA + prevention actions

## Enforcement
- Pre-commit hook with gitleaks (staged scan)
- CI secret scan on every PR and push to main/master
- Local mirror CI must run the same script: `scripts/security/scan-secrets.sh`

