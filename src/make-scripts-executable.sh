#!/bin/bash
# Quick script to make all shell scripts executable

chmod +x *.sh
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x backend/*.sh 2>/dev/null || true

echo "✅ All scripts are now executable"
echo ""
echo "Main deployment scripts:"
echo "  ./deploy-to-casaos.sh  - Complete deployment workflow"
echo "  ./build-and-push.sh    - Build and push images"
echo "  ./test-deployment.sh   - Test your deployment"
echo ""
