#!/bin/bash
# Quick Deploy Script - Connect Backend & Frontend
# Usage: ./connect_deployments.sh

set -e

echo "🚀 Todo App Deployment Connection Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
HF_SPACE_URL="https://abdulmateen5251-hacton.hf.space"
FRONTEND_DIR="frontend"

echo -e "${YELLOW}Step 1: Checking backend status...${NC}"
if curl -s --max-time 10 "$HF_SPACE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on Hugging Face!${NC}"
    echo "   URL: $HF_SPACE_URL"
else
    echo -e "${RED}❌ Backend not responding${NC}"
    echo "   Check: https://huggingface.co/spaces/AbdulMateen5251/hacton"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Testing API endpoint...${NC}"
if curl -s --max-time 10 "$HF_SPACE_URL/docs" > /dev/null; then
    echo -e "${GREEN}✅ API documentation available${NC}"
    echo "   Docs: $HF_SPACE_URL/docs"
else
    echo -e "${YELLOW}⚠️  API docs not accessible (might be normal)${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Checking frontend configuration...${NC}"

# Check if .env.local exists
if [ -f "$FRONTEND_DIR/.env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    
    # Check if it has the correct URL
    if grep -q "$HF_SPACE_URL" "$FRONTEND_DIR/.env.local"; then
        echo -e "${GREEN}✅ Backend URL configured correctly${NC}"
    else
        echo -e "${YELLOW}⚠️  Updating backend URL in .env.local${NC}"
        sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$HF_SPACE_URL|" "$FRONTEND_DIR/.env.local"
        echo -e "${GREEN}✅ Updated!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Creating .env.local from example...${NC}"
    cp "$FRONTEND_DIR/.env.local.example" "$FRONTEND_DIR/.env.local"
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$HF_SPACE_URL|" "$FRONTEND_DIR/.env.local"
    echo -e "${GREEN}✅ Created!${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Ready to deploy to Vercel!${NC}"
echo ""
echo "Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Push to GitHub:"
echo "   ${GREEN}git add .${NC}"
echo "   ${GREEN}git commit -m 'Configure for HF + Vercel deployment'${NC}"
echo "   ${GREEN}git push origin main${NC}"
echo ""
echo "2. Deploy to Vercel:"
echo "   • Go to: https://vercel.com/new"
echo "   • Import your GitHub repository"
echo "   • Root Directory: ${GREEN}frontend${NC}"
echo "   • Add Environment Variable:"
echo "     Name:  ${GREEN}NEXT_PUBLIC_API_URL${NC}"
echo "     Value: ${GREEN}$HF_SPACE_URL${NC}"
echo "   • Click Deploy!"
echo ""
echo "3. Test the connection:"
echo "   ${GREEN}curl $HF_SPACE_URL/api/tasks${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}📚 Full guide: DEPLOYMENT_CONNECTION_GUIDE.md${NC}"
echo ""
echo "🎉 Ready to deploy!"
