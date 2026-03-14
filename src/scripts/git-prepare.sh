#!/bin/bash

# Todoless - Git Preparation Script
# Prepares the repository for pushing to Git

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📦 Preparing Todoless for Git Push"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
  echo "⚠️  Not a git repository. Initializing..."
  git init
  echo "✅ Git repository initialized"
  echo ""
fi

# Check for sensitive files
echo "🔍 Checking for sensitive files..."
SENSITIVE_FILES=()

if [ -f .env ] && [ ! -f .env.example ]; then
  SENSITIVE_FILES+=(".env (no .env.example found)")
fi

if [ -d .supabase ] && ! grep -q ".supabase/" .gitignore 2>/dev/null; then
  SENSITIVE_FILES+=(".supabase/ (should be in .gitignore)")
fi

if [ -d backups ] && ! grep -q "backups/" .gitignore 2>/dev/null; then
  SENSITIVE_FILES+=("backups/ (should be in .gitignore)")
fi

if [ ${#SENSITIVE_FILES[@]} -gt 0 ]; then
  echo "⚠️  WARNING: Found potentially sensitive files:"
  for file in "${SENSITIVE_FILES[@]}"; do
    echo "   - $file"
  done
  echo ""
  echo "These files should be in .gitignore to prevent accidental commits."
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
  fi
fi

# Check for .env.example
if [ ! -f .env.example ]; then
  echo "⚠️  Warning: .env.example not found"
  if [ -f .env ]; then
    echo "   Creating .env.example from .env (with sanitized values)..."
    
    # Create .env.example with placeholders
    cat .env | sed \
      -e 's/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=your-secure-password/' \
      -e 's/JWT_SECRET=.*/JWT_SECRET=your-jwt-secret/' \
      -e 's/ANON_KEY=.*/ANON_KEY=your-anon-key/' \
      -e 's/SERVICE_ROLE_KEY=.*/SERVICE_ROLE_KEY=your-service-role-key/' \
      > .env.example
    
    echo "   ✅ Created .env.example"
  fi
fi

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x Makefile 2>/dev/null || true
echo "✅ Scripts are executable"

# Check critical files
echo ""
echo "📋 Checking critical files..."
MISSING_FILES=()

CRITICAL_FILES=(
  "README.md"
  "docker-compose.supabase.yml"
  "supabase/migrations/001_initial_schema.sql"
  "scripts/setup.sh"
  "Makefile"
  ".gitignore"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
    echo "❌ Missing: $file"
  else
    echo "✅ Found: $file"
  fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo ""
  echo "⚠️  WARNING: Missing critical files. Repository may not work correctly."
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
  fi
fi

# Show git status
echo ""
echo "📊 Git Status:"
git status --short

# Show what will be committed
echo ""
echo "📦 Files to be added:"
git add -n . | head -20
TOTAL_FILES=$(git add -n . | wc -l)
if [ "$TOTAL_FILES" -gt 20 ]; then
  echo "... and $((TOTAL_FILES - 20)) more files"
fi

# Check repository size
echo ""
echo "📏 Checking repository size..."
REPO_SIZE=$(du -sh . | cut -f1)
echo "Total size: $REPO_SIZE"

if [ -d node_modules ]; then
  NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
  echo "⚠️  node_modules detected ($NODE_MODULES_SIZE)"
  echo "   Make sure 'node_modules/' is in .gitignore!"
fi

if [ -d .supabase ]; then
  SUPABASE_SIZE=$(du -sh .supabase 2>/dev/null | cut -f1)
  echo "⚠️  .supabase detected ($SUPABASE_SIZE)"
  echo "   Make sure '.supabase/' is in .gitignore!"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Pre-commit Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  [ ] .gitignore is properly configured"
echo "  [ ] No .env file in commits (only .env.example)"
echo "  [ ] No sensitive data (passwords, keys, tokens)"
echo "  [ ] node_modules/ is ignored"
echo "  [ ] Documentation is up to date"
echo "  [ ] Scripts are executable"
echo ""

# Offer to commit
read -p "Ready to commit? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  read -p "Enter commit message: " COMMIT_MSG
  
  if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update Todoless with Supabase integration"
  fi
  
  echo ""
  echo "📝 Staging all files..."
  git add .
  
  echo "💾 Creating commit..."
  git commit -m "$COMMIT_MSG"
  
  echo ""
  echo "✅ Commit created successfully!"
  echo ""
  
  # Check for remote
  if git remote | grep -q origin; then
    echo "🌐 Remote 'origin' found"
    read -p "Push to origin? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      # Get current branch
      BRANCH=$(git branch --show-current)
      echo ""
      echo "🚀 Pushing to origin/$BRANCH..."
      git push origin "$BRANCH"
      echo ""
      echo "✅ Pushed successfully!"
    fi
  else
    echo "⚠️  No remote repository configured"
    echo ""
    echo "To add a remote:"
    echo "  git remote add origin <repository-url>"
    echo "  git push -u origin main"
  fi
else
  echo ""
  echo "ℹ️  Skipped commit. You can commit manually:"
  echo "   git add ."
  echo "   git commit -m 'Your message'"
  echo "   git push origin main"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 Git preparation complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
