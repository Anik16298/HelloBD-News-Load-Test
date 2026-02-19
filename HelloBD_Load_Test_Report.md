# HelloBD News Load Test Results

> **Test Date:** February 19, 2026  
> **Target:** [https://hellobd.news](https://hellobd.news)  
> **Tool:** [Artillery.io](https://www.artillery.io/)  
> **Test Type:** Extreme Category Page Load Test (100-1000 users/sec)

---

## Overall Status: CRITICAL

The server was heavily overloaded during the extreme profile. At peak load, the service returned very low successful response volume and high timeout/error rates.

---

## Test Summary

| Metric | Value |
|---|---|
| Total Duration | 280 seconds |
| Total Requests | 141,501 |
| Successful Requests (HTTP 200) | 634 (0.45%) |
| Failed Requests | 140,867 (99.55%) |
| Avg Request Rate | 30,270 req/min |
| Median Response Time | 4,316.6 ms |
| P95 Response Time | 9,999.2 ms |
| Safe Zone (RPS) | <= 403.6 req/sec |
| Warning Zone (RPS) | > 504.5 req/sec |

---

## Test Phases

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
| Max Load | 30s | 1,000 |

---

## Endpoint Breakdown

| Endpoint | Success Rate | Failure Rate | P95 Tail Latency |
|---|---|---|---|
| /category/international | 0.37% | 99.63% | 9,801.2 ms |
| /category/bangladesh | 0.46% | 99.54% | 9,801.2 ms |
| /category/sports | 0.54% | 99.46% | 9,801.2 ms |

---

## Error Distribution

| Error Type | Count |
|---|---|
| ETIMEDOUT | 138,584 |
| EADDRINUSE | 2,292 |
| ECONNRESET | 13 |

---

## Key Findings

1. System stability drops sharply under this extreme profile.
2. Tail latency reached the 10-second boundary (P95/P99 near 9,999 ms).
3. Most requests failed at connection/timeout level, not only application response level.
4. Endpoint behavior is consistently degraded across all tested categories.

---

## Recommended Actions

1. Add strong CDN caching for category pages and anonymous traffic.
2. Optimize backend/database paths serving category listing endpoints.
3. Tune server and OS networking limits to reduce timeout/socket pressure.
4. Add autoscaling or load balancing for high burst traffic windows.
5. Run a staged capacity test to identify stable max RPS before extreme testing.

---

## Full Reports

- [`HelloBD_Load_Test_Report.html`](./HelloBD_Load_Test_Report.html) - Visual HTML report
- [`HelloBD_Load_Test_Report.pdf`](./HelloBD_Load_Test_Report.pdf) - PDF version
- [`HelloBD_Load_Test_Report.txt`](./HelloBD_Load_Test_Report.txt) - Plain text summary

---

Generated from `report.json` using the HelloBD load testing suite.
