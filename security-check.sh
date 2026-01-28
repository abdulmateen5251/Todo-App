#!/bin/bash
# Security Verification Script
# Run this to ensure your API keys are protected

echo "🔒 Security Audit Report"
echo "========================"
echo ""

# Check 1: .env in .gitignore
echo "1️⃣  Checking .gitignore..."
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo "   ✅ .env is in .gitignore (Protected)"
else
    echo "   ❌ .env is NOT in .gitignore (UNSAFE!)"
    echo "      Add '.env' to your .gitignore file"
fi
echo ""

# Check 2: .env tracked by git
echo "2️⃣  Checking git tracking..."
if [ -z "$(git ls-files .env 2>/dev/null)" ]; then
    echo "   ✅ .env is NOT tracked by git (Safe)"
else
    echo "   ❌ .env is tracked by git (UNSAFE!)"
    echo "      Run: git rm --cached .env"
fi
echo ""

# Check 3: .env.example exists
echo "3️⃣  Checking template file..."
if [ -f .env.example ]; then
    echo "   ✅ .env.example exists (Good practice)"
else
    echo "   ⚠️  .env.example not found"
    echo "      Consider creating a template file"
fi
echo ""

# Check 4: Hardcoded secrets in code
echo "4️⃣  Scanning for hardcoded secrets..."
SECRET_COUNT=0

# Check for OpenAI keys
if grep -r "sk-proj-" backend/src/ frontend/src/ 2>/dev/null | grep -v ".pyc" | grep -v "__pycache__" | grep -v "node_modules" > /dev/null; then
    echo "   ❌ Found hardcoded OpenAI keys in code!"
    SECRET_COUNT=$((SECRET_COUNT + 1))
fi

# Check for Gemini keys (but exclude .env file)
if grep -r "AIza" backend/src/ frontend/src/ 2>/dev/null | grep -v ".pyc" | grep -v "__pycache__" | grep -v "node_modules" | grep -v ".env" > /dev/null; then
    echo "   ⚠️  Found potential Gemini keys in code"
    SECRET_COUNT=$((SECRET_COUNT + 1))
fi

if [ $SECRET_COUNT -eq 0 ]; then
    echo "   ✅ No hardcoded secrets found (Clean)"
fi
echo ""

# Check 5: .env file exists
echo "5️⃣  Checking configuration..."
if [ -f .env ]; then
    echo "   ✅ .env file exists"
    
    # Check if it has real keys or placeholders
    if grep -q "your-.*-key-here" .env; then
        echo "   ⚠️  .env contains placeholder keys"
        echo "      Replace with your actual API keys"
    else
        echo "   ✅ .env appears to have real keys configured"
    fi
else
    echo "   ⚠️  .env file not found"
    echo "      Copy .env.example to .env and fill in your keys"
fi
echo ""

# Final summary
echo "========================"
echo "📊 Security Score"
echo "========================"
SAFE_COUNT=0

grep -q "^\.env$" .gitignore 2>/dev/null && SAFE_COUNT=$((SAFE_COUNT + 1))
[ -z "$(git ls-files .env 2>/dev/null)" ] && SAFE_COUNT=$((SAFE_COUNT + 1))
[ -f .env.example ] && SAFE_COUNT=$((SAFE_COUNT + 1))
[ $SECRET_COUNT -eq 0 ] && SAFE_COUNT=$((SAFE_COUNT + 1))

echo ""
if [ $SAFE_COUNT -eq 4 ]; then
    echo "🟢 EXCELLENT - All security checks passed!"
    echo "   Your API keys are protected."
    echo "   Safe to commit and push to GitHub."
elif [ $SAFE_COUNT -ge 2 ]; then
    echo "🟡 GOOD - Most checks passed"
    echo "   Review warnings above and fix if needed."
else
    echo "🔴 ATTENTION NEEDED - Security issues found"
    echo "   Fix the issues above before pushing to GitHub!"
fi
echo ""
echo "Score: $SAFE_COUNT/4 checks passed"
echo "========================"
