#!/bin/bash
# Complete Vercel Deployment Setup Script for Todo App

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Todo App - Vercel Deployment Setup${NC}"
echo "=================================================="
echo ""

# Step 1: Install Vercel CLI if not present
echo -e "${YELLOW}Step 1: Installing Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI globally..."
    npm install -g vercel
else
    echo -e "${GREEN}✓ Vercel CLI already installed${NC}"
fi

echo ""

# Step 2: Check if user is logged into Vercel
echo -e "${YELLOW}Step 2: Vercel Authentication${NC}"
echo "Please make sure you're logged into Vercel..."
echo "If not logged in, run: vercel login"
echo ""

# Step 3: Prepare frontend environment
echo -e "${YELLOW}Step 3: Preparing Frontend Environment...${NC}"
cd frontend

# Create production environment file
cat > .env.production << EOF
# Production Environment Variables for Vercel
NEXT_PUBLIC_API_URL=https://todo-app-api.vercel.app
NEXTAUTH_URL=https://todo-app-frontend.vercel.app
NEXTAUTH_SECRET=\$NEXTAUTH_SECRET
BETTER_AUTH_URL=https://todo-app-frontend.vercel.app
BETTER_AUTH_SECRET=\$BETTER_AUTH_SECRET
EOF

echo -e "${GREEN}✓ Created .env.production${NC}"

# Update vercel.json for frontend with better configuration
cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url",
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "BETTER_AUTH_URL": "@better_auth_url",
    "BETTER_AUTH_SECRET": "@better_auth_secret"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "upgrade-insecure-requests"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://todo-app-api.vercel.app/api/:path*"
    }
  ]
}
EOF

echo -e "${GREEN}✓ Updated frontend/vercel.json${NC}"

cd ..

# Step 4: Prepare backend environment
echo -e "${YELLOW}Step 4: Preparing Backend Environment...${NC}"
cd backend

# Update vercel.json for backend
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.py"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "ENVIRONMENT": "production",
    "OPENAI_GEMINI_MODE": "@openai_gemini_mode",
    "OPENAI_API_KEY": "@openai_api_key",
    "GEMINI_API_KEY": "@gemini_api_key",
    "CORS_ORIGINS": "@cors_origins"
  }
}
EOF

echo -e "${GREEN}✓ Updated backend/vercel.json${NC}"

cd ..

# Step 5: Git setup
echo -e "${YELLOW}Step 5: Git Setup...${NC}"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✓ Initialized git repository${NC}"
else
    echo -e "${GREEN}✓ Git repository already exists${NC}"
fi

# Create .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/

# Vercel
.vercel

# Database
*.db
*.sqlite
*.sqlite3

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output

# Cache
.cache/
.parcel-cache/
EOF
    echo -e "${GREEN}✓ Created .gitignore${NC}"
fi

# Add all files
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo -e "${GREEN}✓ No new changes to commit${NC}"
else
    git commit -m "feat: setup for Vercel deployment

- Configure vercel.json for both frontend and backend
- Add security headers for frontend
- Setup environment variables for production
- Add API rewrites for seamless integration"
    echo -e "${GREEN}✓ Committed changes${NC}"
fi

echo ""
echo -e "${BLUE}📋 DEPLOYMENT INSTRUCTIONS${NC}"
echo "============================================="
echo ""
echo -e "${YELLOW}🔧 Step 1: Setup Database (Neon - Free)${NC}"
echo "1. Go to https://neon.tech"
echo "2. Sign up with GitHub"
echo "3. Create project: 'todo-app-db'"
echo "4. Copy connection string"
echo ""

echo -e "${YELLOW}🚀 Step 2: Deploy Backend${NC}"
echo "1. Go to https://vercel.com/new"
echo "2. Import this GitHub repo"
echo "3. Set Project Name: 'todo-app-api'"
echo "4. Set Root Directory: 'backend'"
echo "5. Framework: Other"
echo "6. Add Environment Variables:"
echo "   DATABASE_URL=your_neon_connection_string"
echo "   JWT_SECRET=your_jwt_secret"
echo "   OPENAI_GEMINI_MODE=false"
echo "   GEMINI_API_KEY=your_gemini_key"
echo "   CORS_ORIGINS=https://todo-app-frontend.vercel.app"
echo "7. Deploy"
echo ""

echo -e "${YELLOW}🖥️  Step 3: Deploy Frontend${NC}"
echo "1. Go to https://vercel.com/new"
echo "2. Import same GitHub repo"
echo "3. Set Project Name: 'todo-app-frontend'"
echo "4. Set Root Directory: 'frontend'"
echo "5. Framework: Next.js"
echo "6. Add Environment Variables:"
echo "   NEXT_PUBLIC_API_URL=https://todo-app-api.vercel.app"
echo "   NEXTAUTH_URL=https://todo-app-frontend.vercel.app"
echo "   NEXTAUTH_SECRET=\$(openssl rand -base64 32)"
echo "   BETTER_AUTH_URL=https://todo-app-frontend.vercel.app"
echo "   BETTER_AUTH_SECRET=\$(openssl rand -base64 32)"
echo "7. Deploy"
echo ""

echo -e "${YELLOW}🔄 Step 4: Update Backend CORS${NC}"
echo "After both deployments:"
echo "1. Go to Backend project settings"
echo "2. Update CORS_ORIGINS with actual frontend URL"
echo ""

echo -e "${GREEN}✅ Ready for deployment!${NC}"
echo ""
echo -e "${BLUE}Quick Commands:${NC}"
echo "Push to GitHub: git push origin main"
echo "Generate secrets: openssl rand -base64 32"
echo ""
echo -e "${RED}⚠️  Don't forget to:${NC}"
echo "1. Push code to GitHub first"
echo "2. Set all environment variables in Vercel"
echo "3. Update CORS after both deployments"
echo ""