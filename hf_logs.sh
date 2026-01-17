#!/bin/bash
# Quick Hugging Face Logs Viewer
# Usage: ./hf_logs.sh [container|build|status|all]

set -e

if [ -z "$HF_TOKEN" ]; then
    echo "❌ Error: HF_TOKEN environment variable not set"
    echo "Set it with: export HF_TOKEN='your_token_here'"
    echo ""
    echo "Get your token from: https://huggingface.co/settings/tokens"
    exit 1
fi

SPACE="AbdulMateen5251/hacton"
LOG_TYPE="${1:-all}"

echo "🚀 Accessing Hugging Face Space Logs"
echo "Space: $SPACE"
echo "─────────────────────────────────────"

# Container Logs
if [ "$LOG_TYPE" = "all" ] || [ "$LOG_TYPE" = "container" ]; then
    echo ""
    echo "📦 Container Logs (Streaming)..."
    echo "─────────────────────────────────────"
    curl -N \
        -H "Authorization: Bearer $HF_TOKEN" \
        "https://huggingface.co/api/spaces/$SPACE/logs/run" \
        --max-time 30 2>/dev/null || echo "No container logs available"
    echo ""
fi

# Build Logs
if [ "$LOG_TYPE" = "all" ] || [ "$LOG_TYPE" = "build" ]; then
    echo ""
    echo "🔨 Build Logs (Streaming)..."
    echo "─────────────────────────────────────"
    curl -N \
        -H "Authorization: Bearer $HF_TOKEN" \
        "https://huggingface.co/api/spaces/$SPACE/logs/build" \
        --max-time 30 2>/dev/null || echo "No build logs available"
    echo ""
fi

# Status
if [ "$LOG_TYPE" = "all" ] || [ "$LOG_TYPE" = "status" ]; then
    echo ""
    echo "📋 Space Status..."
    echo "─────────────────────────────────────"
    curl -s \
        -H "Authorization: Bearer $HF_TOKEN" \
        "https://huggingface.co/api/spaces/$SPACE" | python3 -m json.tool | head -20
    echo ""
fi

echo "✅ Done!"
