#!/bin/bash
# Unified Sonar Suite - Local Test Runner (Bash)
# Agent Kilo - CI/CD Automation Architect

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "======================================================================"
echo "  🚀 UNIFIED SONAR SUITE - LOCAL TEST RUNNER"
echo "======================================================================"
echo ""

# Track start time
START_TIME=$(date +%s)

# Create reports directory if it doesn't exist
mkdir -p tests/ux-sonar/reports
mkdir -p tests/ux-sonar/baselines

# Function to run a sonar test
run_sonar() {
    local name=$1
    local command=$2
    local start=$(date +%s)

    echo -e "${BLUE}🔍 Running $name...${NC}"

    if $command; then
        local end=$(date +%s)
        local duration=$((end - start))
        echo -e "${GREEN}✅ $name completed in ${duration}s${NC}"
        echo ""
        return 0
    else
        local end=$(date +%s)
        local duration=$((end - start))
        echo -e "${YELLOW}⚠️ $name completed with warnings in ${duration}s${NC}"
        echo ""
        return 1
    fi
}

# Track failures
FAILURES=0

# Step 1: Run browser-based sonars (parallel if possible)
echo -e "${BLUE}📡 Phase 1: Browser Sonars${NC}"
echo "----------------------------------------------------------------------"

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Dev server not detected on http://localhost:3000${NC}"
    echo -e "${YELLOW}   Starting dev server in background...${NC}"
    npm run dev > /dev/null 2>&1 &
    DEV_SERVER_PID=$!
    echo "   Waiting for server to be ready..."
    npx wait-on http://localhost:3000 --timeout 60000 || {
        echo -e "${RED}❌ Failed to start dev server${NC}"
        exit 1
    }
    STOP_SERVER=true
else
    echo -e "${GREEN}✅ Dev server already running${NC}"
    STOP_SERVER=false
fi
echo ""

run_sonar "UX Sonar" "npm run test:ux-sonar" || ((FAILURES++))
run_sonar "Design Sonar" "npm run test:design-sonar" || ((FAILURES++))
run_sonar "Journey Sonar" "npm run test:journey-sonar" || ((FAILURES++))

# Stop dev server if we started it
if [ "$STOP_SERVER" = true ]; then
    echo -e "${BLUE}Stopping dev server...${NC}"
    kill $DEV_SERVER_PID 2>/dev/null || true
    echo ""
fi

# Step 2: Run static analysis sonars
echo -e "${BLUE}📊 Phase 2: Static Analysis Sonars${NC}"
echo "----------------------------------------------------------------------"

run_sonar "Code Sonar" "npm run test:code-sonar" || ((FAILURES++))
run_sonar "Semantic Sonar" "npm run test:semantic-sonar" || ((FAILURES++))

# Step 3: Run state sonar
echo -e "${BLUE}🔄 Phase 3: State Machine Sonar${NC}"
echo "----------------------------------------------------------------------"

run_sonar "State Sonar" "npm run test:state-sonar" || ((FAILURES++))

# Step 4: Generate unified dashboard
echo -e "${BLUE}📈 Phase 4: Dashboard Generation${NC}"
echo "----------------------------------------------------------------------"

if npm run generate:dashboard; then
    echo -e "${GREEN}✅ Dashboard generated successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Dashboard generation completed with warnings${NC}"
    ((FAILURES++))
fi
echo ""

# Step 5: Apply quality gates
echo -e "${BLUE}🚪 Phase 5: Quality Gates${NC}"
echo "----------------------------------------------------------------------"

if npm run quality:gates; then
    GATE_STATUS="${GREEN}✅ PASSED${NC}"
    GATE_EXIT=0
else
    GATE_STATUS="${RED}❌ FAILED${NC}"
    GATE_EXIT=1
    ((FAILURES++))
fi

# Calculate total time
END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))
MINUTES=$((TOTAL_DURATION / 60))
SECONDS=$((TOTAL_DURATION % 60))

# Final summary
echo ""
echo "======================================================================"
echo "  📊 SONAR SUITE SUMMARY"
echo "======================================================================"
echo ""
echo -e "Quality Gates: $GATE_STATUS"
echo -e "Failed Steps: ${FAILURES}"
echo -e "Total Duration: ${MINUTES}m ${SECONDS}s"
echo ""

# Show dashboard location
if [ -f "tests/ux-sonar/reports/sonar-dashboard.html" ]; then
    DASHBOARD_PATH=$(realpath tests/ux-sonar/reports/sonar-dashboard.html)
    echo -e "${GREEN}📊 Dashboard available at:${NC}"
    echo "   file://${DASHBOARD_PATH}"
    echo ""
fi

# Show quality gate report location
if [ -f "tests/ux-sonar/reports/quality-gates-report.md" ]; then
    echo -e "${BLUE}📝 Reports generated:${NC}"
    echo "   - Dashboard: tests/ux-sonar/reports/sonar-dashboard.html"
    echo "   - Quality Gates: tests/ux-sonar/reports/quality-gates-report.md"
    echo "   - System Health: tests/ux-sonar/reports/system-health-report.json"
    echo ""
fi

echo "======================================================================"
echo ""

# Exit with appropriate code
if [ $GATE_EXIT -eq 0 ]; then
    echo -e "${GREEN}✨ Sonar Suite Complete - All Gates Passed! ✨${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️ Sonar Suite Complete - Some Gates Failed${NC}"
    exit 1
fi
