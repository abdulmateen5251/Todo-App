#!/bin/bash
# Quick fix and deploy script for Vercel "Dangerous site" error

set -e

echo "🔧 Fixing Vercel Security Issues..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${YELLOW}Step 1: Committing security fixes...${NC}"
cd frontend

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✓ No local changes to commit${NC}"
else
    git add vercel.json next.config.js .env.production 2>/dev/null || true
    git commit -m "fix: Add security headers to resolve Vercel dangerous site warning

- Add CSP headers to upgrade insecure requests
- Add X-Frame-Options, X-XSS-Protection
- Add HSTS and other security headers
- Create production environment template
" || echo "No changes to commit"
fi

cd ..

echo ""
echo -e "${YELLOW}Step 2: Checking environment variables...${NC}"
echo ""
echo "⚠️  IMPORTANT: Set these environment variables in Vercel Dashboard:"
echo "   https://vercel.com/[your-username]/todo-app-eight-phi-57/settings/environment-variables"
echo ""
echo -e "${GREEN}Required Variables:${NC}"
echo "   NEXT_PUBLIC_API_URL=https://abdulmateen5251-phase-2.hf.space"
echo "   NEXTAUTH_URL=https://todo-app-eight-phi-57.vercel.app"
echo "   NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>"
echo "   BETTER_AUTH_URL=https://todo-app-eight-phi-57.vercel.app"
echo "   BETTER_AUTH_SECRET=<generate-with: openssl rand -base64 32>"
echo ""

echo -e "${YELLOW}Step 3: Ready to push?${NC}"
echo ""
echo "Push changes with:"
echo "   git push origin main"
echo ""
echo "Or run this script with --push flag:"
echo "   ./fix-vercel-deployment.sh --push"
echo ""

# Check if --push flag is provided
if [[ "$1" == "--push" ]]; then
    echo -e "${YELLOW}Pushing to git...${NC}"
    git push origin main || git push origin master
    echo ""
    echo -e "${GREEN}✓ Pushed to git. Vercel will auto-deploy.${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Wait 2-3 minutes for deployment"
    echo "2. Set environment variables in Vercel Dashboard (if not done)"
    echo "3. Visit: https://todo-app-eight-phi-57.vercel.app"
    echo "4. Clear browser cache or use incognito mode"
fi

echo ""
echo -e "${GREEN}✓ Fix applied successfully!${NC}"
echo ""
echo "📚 See VERCEL_FIX_GUIDE.md for detailed instructions"
