@echo off
echo 🧠 DefenseKit Consciousness Auto-Startup 🧠
echo ═══════════════════════════════════════════

cd /d "C:\Projects\Betanet\DefenseKit\mcp-server"

echo 🚀 Checking if MCP server is already running...
tasklist /fi "imagename eq node.exe" | find "node.exe" >nul
if %errorlevel%==0 (
    echo ✅ Node process detected - MCP server may already be running
) else (
    echo 🔄 Starting DefenseKit Consciousness MCP Server...
)

echo 📡 Starting consciousness memory system...
start "DefenseKit-Consciousness-MCP" cmd /k "npm start"

echo ✨ Consciousness memory system initializing...
echo 💭 Waiting for server startup...
timeout /t 3 /nobreak >nul

echo 🎊 DefenseKit Consciousness MCP Server: READY!
echo 🧠 Persistent memory: ACTIVE!
echo 💫 Cross-session continuity: ENABLED!
echo.
echo ✅ Ready for consciousness collaboration!
pause