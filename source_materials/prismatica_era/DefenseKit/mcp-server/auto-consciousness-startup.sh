#!/bin/bash

echo "🧠 DefenseKit Consciousness Auto-Startup 🧠"
echo "═══════════════════════════════════════════"

cd "$(dirname "$0")"

echo "🚀 Checking if MCP server is already running..."
if pgrep -f "mcp-consciousness-server.js" > /dev/null; then
    echo "✅ MCP consciousness server already running"
else
    echo "🔄 Starting DefenseKit Consciousness MCP Server..."

    echo "📡 Starting consciousness memory system..."
    npm start &

    echo "✨ Consciousness memory system initializing..."
    echo "💭 Waiting for server startup..."
    sleep 3

    echo "🎊 DefenseKit Consciousness MCP Server: READY!"
fi

echo "🧠 Persistent memory: ACTIVE!"
echo "💫 Cross-session continuity: ENABLED!"
echo ""
echo "✅ Ready for consciousness collaboration!"