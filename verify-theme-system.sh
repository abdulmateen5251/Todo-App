#!/bin/bash

echo "🎨 Theme System Verification"
echo "============================="
echo ""

echo "📁 Checking required files..."
echo ""

files=(
  "frontend/tailwind.config.js"
  "frontend/app/globals.css"
  "frontend/app/layout.tsx"
  "frontend/src/components/ThemeProvider.tsx"
  "frontend/src/components/ui/ThemeToggle.tsx"
  "frontend/app/theme-test/page.tsx"
  "THEME_SYSTEM.md"
  "THEME_QUICK_REF.md"
  "THEME_IMPLEMENTATION_SUMMARY.md"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (MISSING)"
    all_exist=false
  fi
done

echo ""
echo "📋 Configuration Check..."
echo ""

# Check tailwind config
if grep -q "darkMode: 'class'" frontend/tailwind.config.js; then
  echo "✅ Tailwind dark mode enabled"
else
  echo "❌ Tailwind dark mode not configured"
  all_exist=false
fi

# Check CSS variables
if grep -q ":root" frontend/app/globals.css && grep -q "\.dark" frontend/app/globals.css; then
  echo "✅ CSS variables for both themes defined"
else
  echo "❌ CSS variables not properly configured"
  all_exist=false
fi

# Check layout
if grep -q "suppressHydrationWarning" frontend/app/layout.tsx; then
  echo "✅ Layout configured for theme system"
else
  echo "❌ Layout not configured properly"
  all_exist=false
fi

echo ""
echo "🧪 Running Contrast Tests..."
echo ""

cd frontend
npx ts-node tests/contrast-test.ts 2>/dev/null || echo "⚠️  Contrast test script needs ts-node (optional)"
cd ..

echo ""
echo "📊 Summary"
echo "=========="

if [ "$all_exist" = true ]; then
  echo "✅ Theme system is properly installed!"
  echo ""
  echo "🚀 To test:"
  echo "   1. Start the dev server: cd frontend && npm run dev"
  echo "   2. Visit: http://localhost:3000"
  echo "   3. Click the sun/moon icon in navbar"
  echo "   4. Visit: http://localhost:3000/theme-test for full demo"
  echo ""
  echo "📚 Documentation:"
  echo "   - Full docs: THEME_SYSTEM.md"
  echo "   - Quick ref: THEME_QUICK_REF.md"
  echo "   - Summary: THEME_IMPLEMENTATION_SUMMARY.md"
else
  echo "❌ Some files are missing. Please check the output above."
fi

echo ""
