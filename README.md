# 🚀 HelloBD News: Advanced Load Testing Suite

![Load Test Badge](https://img.shields.io/badge/Test%20Engine-Artillery.io-blueviolet?style=for-the-badge&logo=artillery)
![Status Badge](https://img.shields.io/badge/Status-Critical-red?style=for-the-badge)
![Coverage Badge](https://img.shields.io/badge/Coverage-Full%20Site-green?style=for-the-badge)

A premium, high-performance load testing suite designed to stress-test and analyze the infrastructure of `https://hellobd.news/`. This suite simulates realistic user behavior from casual browsing to massive viral traffic spikes.

---

## 📋 Project Overview

This project was built to identify the exact breaking point of the HelloBD News platform. It uses a **Stepped Load Strategy** (100 to 1,000 concurrent users) to benchmark stability, latency, and connection handling.

### ✨ Key Features
- **🎯 Multi-Section Coverage:** Homepage, News Categories, and Policy pages.
- **📈 Stepped Ramp-up:** Smoothly increases load to find the "Danger Zone."
- **📊 Intelligence Reporting:** Generates both technical JSON data and human-friendly visual HTML reports.
- **🧠 First-Person Audit:** Includes a personalized breakdown of the site's "Entrance Gate" capacity.

---

## ⚡ Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run the "Stress Step" Test (100-1,000 Users)
This is the most powerful test in the suite, ramping up in 10 distinct phases.
```bash
npm run test:stepped
```

### 3. Generate Visual Report
```bash
npm run report
```
*Open `report.html` in your browser to see interactive charts.*

---

## 🚦 Test Levels

| Command | Intensity | Purpose |
| :--- | :--- | :--- |
| `npm run test:smoke` | 🟢 Low | Quick verification of site availability. |
| `npm run test:load` | 🟡 Medium | Standard peak-hour traffic simulation. |
| `npm run test:stepped` | 🔴 High | **(Recommended)** 100 to 1,000 user ramp-up. |
| `npm run test:stress` | 🔥 Extreme | Pushes the server to its absolute physical limits. |

---

## 🧐 The "Plain English" Problem
From my latest audit, the site has a fast "interior" but a tiny "front door." 

> **The Mall Metaphor:** Our site is like a fast-service restaurant with a security guard at the door. The chefs (backend) are fast, but the guard (server limits) starts pushing people away as soon as a crowd forms.

- **Safe Limit:** 10 Visitors/Sec ✅
- **Warning Zone:** 15 Visitors/Sec ⚠️
- **Danger Zone:** 20+ Visitors/Sec ❌

---

## 📂 Project Anatomy

- `load-test.yml`: The "brain" of the test – defines scenarios and load phases.
- `generate-report.js`: Custom script that turns raw data into a beautiful HTML dashboard.
- `LOAD_TEST_REPORT_SUMMARY.txt`: A personalized, easy-to-read memo of the latest findings.
- `LOAD_TEST_RESULTS.md`: Detailed technical analysis for developers.

---

## ⚠️ Important Disclaimer
**Load testing without permission is considered a DoS attack.** Ensure you have explicit authorization from the owner of `hellobd.news` before running high-intensity scripts.

---
*Created by <a href="https://github.com/Anik16298">Anik Chakraborty</a> - HelloBD News Performance Audit 2026*
