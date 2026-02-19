# HelloBD News Load Test Suite 🚀

[![Artillery](https://img.shields.io/badge/Tested%20With-Artillery-FF6B00?style=for-the-badge)](https://www.artillery.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Site](https://img.shields.io/badge/Target-hellobd.news-0A66C2?style=for-the-badge)](https://hellobd.news)

A comprehensive load testing suite for [hellobd.news](https://hellobd.news) powered by [**Artillery**](https://www.artillery.io/).

## ✨ Why This Repo

- Simulates realistic and extreme traffic profiles
- Validates critical homepage and category endpoints
- Produces clean, shareable reports (HTML, PDF, TXT, MD)
- Supports smoke, load, pure, stress, and extreme modes

## ⚡ Quick Start

```bash
npm install
npx playwright install
npm run full-extreme-test
```

## 🧭 Test Modes

| Mode | Command | Purpose |
|---|---|---|
| Smoke | `npm run test:smoke` | Fast health check |
| Load | `npm run test:load` | Normal production-like load |
| Pure | `npm run test:pure` | Sustained high throughput |
| Stress | `npm run test:stress` | Aggressive ramp and pressure |
| Extreme | `npm run test:extreme` | 9-phase 100 to 1000 users/sec |

## 🧰 Utility Scripts

| Command | Description |
|---|---|
| `npm run report` | Generate reports from `report.json` |
| `npm run full-extreme-test` | Run extreme test and generate reports |
| `npm run check-site` | Quick header check for `https://hellobd.news` |

## 📊 Extreme Test Phases

| Phase | Duration | Users/sec |
|---|---|---|
| Warmup | 30s | 100 |
| Push | 30s | 150 |
| Hard Push | 30s | 250 |
| Overload | 30s | 350 |
| Extreme | 30s | 500 |
| Brutal | 30s | 650 |
| Savage | 30s | 800 |
| Catastrophic | 30s | 900 |
| Max Load | 30s | 1000 |

## 🎯 Key Endpoints Covered

- `/`
- `/category/bangladesh`
- `/category/international`
- `/category/sports`
- `/category/entertainment`
- `/privacy-policy`

## 📄 Generated Reports

After `npm run report`, the suite generates:

- `HelloBD_Load_Test_Report.html` - Visual dashboard report
- `HelloBD_Load_Test_Report.pdf` - Share-ready PDF report
- `HelloBD_Load_Test_Report.txt` - Quick plain-text summary
- `HelloBD_Load_Test_Report.md` - Detailed markdown analysis

## 📁 Project Structure

```text
hellobd-load-test/
|-- extreme-load-test.yml
|-- load-test.yml
|-- generate-report.js
|-- package.json
|-- HelloBD_Load_Test_Report.html
|-- HelloBD_Load_Test_Report.pdf
|-- HelloBD_Load_Test_Report.txt
|-- HelloBD_Load_Test_Report.md
`-- README.md
```

## 🛠️ Tech Stack

- [Artillery](https://www.artillery.io/)
- [artillery-plugin-metrics-by-endpoint](https://www.npmjs.com/package/artillery-plugin-metrics-by-endpoint)
- [Playwright](https://playwright.dev/)

---

Maintained by [Anik Chakraborty](https://github.com/Anik16298) for HelloBD performance testing.