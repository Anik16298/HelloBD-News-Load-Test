# HelloBD News — Load Test Suite

A comprehensive load testing suite for [hellobd.news](https://hellobd.news) using **Artillery.io**, covering category page validation under extreme traffic conditions.

---

## 📁 Project Structure

```
hellobd-load-test/
├── extreme-load-test.yml        # Category page load test (100–1000 users/sec, 9 phases)
├── load-test.yml                # General load test scenarios (smoke, load, stress)
├── generate-report.js           # Unified report generator (HTML + PDF + TXT)
├── package.json                 # Project dependencies & npm scripts
├── HelloBD_Load_Test_Report.txt  # Latest plain-text summary report
├── HelloBD_Load_Test_Report.html # Latest HTML report
├── HelloBD_Load_Test_Report.pdf  # Latest PDF report
├── HelloBD_Load_Test_Report.md   # Detailed markdown results with tables & analysis
└── README.md
```

---

## 🚀 Quick Start

### Install dependencies
```bash
npm install
npx playwright install
```

### Run the Extreme Load Test (100–1000 users)
```bash
npm run test:extreme
```

### Generate HTML + PDF Reports
```bash
npm run report
```

### Run test + generate report in one command
```bash
npm run full-extreme-test
```

---

## 📊 Test Phases (Extreme Load Test)

| Phase        | Duration | Users/sec |
|--------------|----------|-----------|
| Warmup       | 30s      | 100       |
| Push         | 30s      | 150       |
| Hard Push    | 30s      | 250       |
| Overload     | 30s      | 350       |
| Extreme      | 30s      | 500       |
| Brutal       | 30s      | 650       |
| Savage       | 30s      | 800       |
| Catastrophic | 30s      | 900       |
| Max Load     | 30s      | 1000      |

---

## 🔍 Scenarios Tested

- `/category/international`
- `/category/bangladesh`
- `/category/sports`

---

## 📈 Reports Generated

After running `npm run report`, the following files are created:

- **`HelloBD_Load_Test_Report.html`** — Full visual HTML report with stats and endpoint breakdown
- **`HelloBD_Load_Test_Report.pdf`** — PDF version of the HTML report (for sharing/presentation)
- **`HelloBD_Load_Test_Report.txt`** — Plain-text summary with analysis and recommendations

---

## 🛠 Other Test Scripts

```bash
npm run test:smoke    # Smoke test
npm run test:load     # Standard load test
npm run test:stress   # Stress test
```

---

*Architected by <a href="https://github.com/Anik16298">Anik Chakraborty</a> --> <a href="https://hellobd.news">HelloBD News</a> Test Audit*
