# 📊 Sonar Suite Dashboard

**The unified control panel for all 6 Sonar systems.**

## 🎯 Quick Start

### View the Dashboard
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Generate Dashboard
```bash
# From ux-sonar directory
cd ..
node test-dashboard-generation.js
```

## 📁 Directory Structure

```
dashboard/
├── index.html                    # Generated dashboard (view this!)
├── templates/
│   └── main-dashboard.html       # HTML template
├── styles/
│   └── sonar-dashboard.css       # Stylesheet
├── report-aggregator.ts          # Data collection & aggregation
├── sparkline-generator.ts        # Trend visualization
└── praise-mode-detector.ts       # Positive signal detection
```

## 🎨 Dashboard Features

- **System Health Metric (SHM):** North star metric (0-1 scale)
- **6 Sonar Cards:** UX, Design, Code, Semantic, Journey, State
- **Praise Mode:** Celebrates achievements and wins
- **Alerts:** Critical issues and warnings
- **Regime Distribution:** Visual breakdown of system state
- **Sparklines:** Trend visualization for metrics
- **Responsive Design:** Works on desktop, tablet, mobile
- **Dark Mode:** Automatic theme detection

## 🔧 Configuration

The dashboard automatically loads data from:
- `tests/ux-sonar/reports/` - UX Sonar reports
- Future: Design, Code, Semantic, Journey, State sonar reports

## 📊 Metrics Displayed

### System Health Metric (SHM)
Weighted average of all sonars:
- UX: 25%
- Design: 25%
- Code: 12.5%
- Semantic: 12.5%
- Journey: 12.5%
- State: 12.5%

### Regimes
- **Exploration** (<0.7): Yellow - finding issues, experimental
- **Optimization** (0.7-0.85): Blue - improving metrics
- **Stabilization** (>0.85): Green - maintaining excellence

## 🎉 Praise Signals

Automatically detected positive achievements:
- High FPS (60 FPS)
- Low CLS (<0.05)
- Zero impossible states
- Excellent accessibility
- Fast time-to-wow
- And 20+ more...

## ⚠️ Alerts

Critical issues and warnings:
- Low FPS (<30 FPS)
- High CLS (>0.1)
- Bundle size issues
- Flow problems
- And more...

## 🔗 Integration

To add a new sonar to the dashboard:

1. Save reports to `tests/ux-sonar/reports/<sonar-name>/`
2. Update `ReportAggregator.load<SonarName>Reports()` in `report-aggregator.ts`
3. Define report interface
4. Run dashboard generation

See `AGENT_FOXTROT_MISSION_COMPLETE.md` for detailed integration guide.

## 📖 Documentation

- **Mission Report:** `../AGENT_FOXTROT_MISSION_COMPLETE.md`
- **Test Suite:** `../tests/dashboard.spec.ts`
- **Generator:** `../dashboard-generator.ts`

## 🚀 Next Steps

1. View `index.html` in browser
2. Review dashboard layout and metrics
3. Integrate other sonars (Design, Code, etc.)
4. Add to CI/CD pipeline
5. Implement drill-down navigation

---

**Built by:** Agent Foxtrot - Dashboard Architect
**Protocol:** Asymmetrica - Better Math for Everyone!
**Status:** Production Ready ✅
