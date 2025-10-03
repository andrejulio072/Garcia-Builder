#!/bin/bash
# Quick Logo Test Script for Garcia Builder

echo "🧪 Garcia Builder - Logo Test Script"
echo "===================================="

# Test 1: Check if logo files exist
echo "📁 Testing logo file existence..."
if [ -f "Logo Files/For Web/logo-nobackground-500.png" ]; then
    echo "✅ Logo file exists"
else
    echo "❌ Logo file not found"
fi

# Test 2: Check for old references in HTML files
echo "🔍 Scanning for old logo references..."
old_refs=$(grep -r "assets/logo.png" *.html 2>/dev/null | wc -l)
if [ "$old_refs" -eq 0 ]; then
    echo "✅ No old logo references found"
else
    echo "⚠️  Found $old_refs old logo references"
    grep -r "assets/logo.png" *.html 2>/dev/null
fi

# Test 3: Check CSS for white backgrounds
echo "🎨 Checking CSS for white backgrounds..."
white_bg=$(grep -r "background.*#fff" css/global.css 2>/dev/null | grep -v "fff3cd" | wc -l)
if [ "$white_bg" -eq 0 ]; then
    echo "✅ No white backgrounds found in logo styles"
else
    echo "⚠️  Found white backgrounds in CSS"
fi

# Test 4: Count logo instances
echo "📊 Counting logo instances..."
total_logos=$(grep -r "logo-nobackground-500.png" *.html 2>/dev/null | wc -l)
echo "📈 Found $total_logos logo references in HTML files"

# Test 5: Check path consistency
echo "🔗 Checking path consistency..."
inconsistent=$(grep -r "logo files/For Web" *.html 2>/dev/null | wc -l)
if [ "$inconsistent" -eq 0 ]; then
    echo "✅ All logo paths are consistent"
else
    echo "⚠️  Found $inconsistent inconsistent paths (lowercase 'logo files')"
fi

echo ""
echo "🎯 Test Summary:"
echo "=================="
if [ "$old_refs" -eq 0 ] && [ "$white_bg" -eq 0 ] && [ "$inconsistent" -eq 0 ]; then
    echo "🎉 All tests PASSED! Logo implementation is clean!"
    echo "📊 Total logo instances: $total_logos"
    echo "🌐 Ready for production!"
else
    echo "⚠️  Some issues found. Please review above."
fi

echo ""
echo "🚀 Next steps:"
echo "- Open http://localhost:8000/test-logo-validation.html for visual tests"
echo "- Open http://localhost:8000/test-performance.html for performance tests"
echo "- Check individual pages for logo appearance"