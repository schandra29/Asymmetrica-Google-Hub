@echo off
REM Unified Sonar Suite - Local Test Runner (Windows Batch)
REM Agent Kilo - CI/CD Automation Architect

setlocal enabledelayedexpansion

echo.
echo ======================================================================
echo   UNIFIED SONAR SUITE - LOCAL TEST RUNNER
echo ======================================================================
echo.

REM Track start time
set START_TIME=%time%

REM Create reports directory if it doesn't exist
if not exist "tests\ux-sonar\reports" mkdir "tests\ux-sonar\reports"
if not exist "tests\ux-sonar\baselines" mkdir "tests\ux-sonar\baselines"

REM Track failures
set FAILURES=0

REM Step 1: Check if dev server is running
echo Phase 1: Browser Sonars
echo ----------------------------------------------------------------------
echo.

curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    echo [WARNING] Dev server not detected on http://localhost:3000
    echo           Starting dev server in background...
    start /B npm run dev > nul 2>&1
    echo           Waiting for server to be ready...
    npx wait-on http://localhost:3000 --timeout 60000
    if errorlevel 1 (
        echo [ERROR] Failed to start dev server
        exit /b 1
    )
    set STOP_SERVER=true
) else (
    echo [OK] Dev server already running
    set STOP_SERVER=false
)
echo.

REM Run UX Sonar
echo [RUN] UX Sonar...
call npm run test:ux-sonar
if errorlevel 1 (
    echo [WARNING] UX Sonar completed with warnings
    set /a FAILURES+=1
) else (
    echo [OK] UX Sonar completed
)
echo.

REM Run Design Sonar
echo [RUN] Design Sonar...
call npm run test:design-sonar
if errorlevel 1 (
    echo [WARNING] Design Sonar completed with warnings
    set /a FAILURES+=1
) else (
    echo [OK] Design Sonar completed
)
echo.

REM Run Journey Sonar
echo [RUN] Journey Sonar...
call npm run test:journey-sonar
if errorlevel 1 (
    echo [WARNING] Journey Sonar completed with warnings
    set /a FAILURES+=1
) else (
    echo [OK] Journey Sonar completed
)
echo.

REM Stop dev server if we started it
if "!STOP_SERVER!"=="true" (
    echo Stopping dev server...
    taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm*" > nul 2>&1
    echo.
)

REM Step 2: Run static analysis sonars
echo Phase 2: Static Analysis Sonars
echo ----------------------------------------------------------------------
echo.

REM Run Code Sonar
echo [RUN] Code Sonar...
call npm run test:code-sonar
if errorlevel 1 (
    echo [WARNING] Code Sonar completed with warnings
    set /a FAILURES+=1
) else (
    echo [OK] Code Sonar completed
)
echo.

REM Run Semantic Sonar
echo [RUN] Semantic Sonar...
call npm run test:semantic-sonar
if errorlevel 1 (
    echo [WARNING] Semantic Sonar completed with warnings
    set /a FAILURES+=1
) else (
    echo [OK] Semantic Sonar completed
)
echo.

REM Step 3: Run state sonar
echo Phase 3: State Machine Sonar
echo ----------------------------------------------------------------------
echo.

echo [RUN] State Sonar...
call npm run test:state-sonar
if errorlevel 1 (
    echo [WARNING] State Sonar completed with warnings
    set /a FAILURES+=1
) else (
    echo [OK] State Sonar completed
)
echo.

REM Step 4: Generate unified dashboard
echo Phase 4: Dashboard Generation
echo ----------------------------------------------------------------------
echo.

call npm run generate:dashboard
if errorlevel 1 (
    echo [WARNING] Dashboard generation completed with warnings
    set /a FAILURES+=1
) else (
    echo [OK] Dashboard generated successfully
)
echo.

REM Step 5: Apply quality gates
echo Phase 5: Quality Gates
echo ----------------------------------------------------------------------
echo.

call npm run quality:gates
if errorlevel 1 (
    set GATE_STATUS=[FAILED]
    set GATE_EXIT=1
    set /a FAILURES+=1
) else (
    set GATE_STATUS=[PASSED]
    set GATE_EXIT=0
)

REM Calculate total time
set END_TIME=%time%

REM Final summary
echo.
echo ======================================================================
echo   SONAR SUITE SUMMARY
echo ======================================================================
echo.
echo Quality Gates: !GATE_STATUS!
echo Failed Steps: !FAILURES!
echo.

REM Show dashboard location
if exist "tests\ux-sonar\reports\sonar-dashboard.html" (
    echo [OK] Dashboard available at:
    echo     file:///%CD%\tests\ux-sonar\reports\sonar-dashboard.html
    echo.
)

REM Show quality gate report location
if exist "tests\ux-sonar\reports\quality-gates-report.md" (
    echo [OK] Reports generated:
    echo     - Dashboard: tests\ux-sonar\reports\sonar-dashboard.html
    echo     - Quality Gates: tests\ux-sonar\reports\quality-gates-report.md
    echo     - System Health: tests\ux-sonar\reports\system-health-report.json
    echo.
)

echo ======================================================================
echo.

REM Exit with appropriate code
if !GATE_EXIT! equ 0 (
    echo [SUCCESS] Sonar Suite Complete - All Gates Passed!
    exit /b 0
) else (
    echo [WARNING] Sonar Suite Complete - Some Gates Failed
    exit /b 1
)
