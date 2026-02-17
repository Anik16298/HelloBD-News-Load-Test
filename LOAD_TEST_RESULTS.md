# HelloBD Load Test Results: Stepped Strategy (100-1000 Users)

## 1. Overview
This report analyzes the performance of `https://hellobd.news/` under a stepped load increase from **100 to 1000 simulated concurrent users** (Arrival rate 10/s to 100/s). The test evaluated each major section of the site to identify specific bottlenecks.

## 2. Executive Summary
- **Overall Status:** 🔴 **CRITICAL FAILURE**
- **Success Rate:** 61.2%
- **Stability:** Extremely unstable under moderate to high load.
- **Primary Bottleneck:** Connection Resets (`ECONNRESET`) indicating infrastructure-level rejection of traffic.

## 3. Key Metrics (Aggregated)
| Metric | Value | Interpretation |
| :--- | :--- | :--- |
| **Total Requests Processed** | 16,500 | Full test suite executed. |
| **Successful 200 OK** | 10,094 | Only 61% of users successfully reached the site. |
| **Total Failures** | 6,406 | Mostly `ECONNRESET`. |
| **Median Latency (P50)** | 102 ms | Excellent (when connection succeeds). |
| **95th Percentile (P95)** | 1,274 ms | Good responsiveness for successful hits. |
| **Max Response Time** | 5,726 ms | Some requests suffered significant lag. |

## 4. Section-wise Breakdown
| Resource Path | Success Rate | Median Latency | Tail Latency (P95) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/` (Homepage) | 60.8% | 94.6 ms | 1,249 ms | High failure volume. |
| `/category/bangladesh` | 61.1% | 108.9 ms | 1,249 ms | Consistent with site average. |
| `/category/international` | 61.6% | 111.1 ms | 1,326 ms | Slightly higher latency. |
| `/category/sports` | 63.0% | 111.1 ms | 1,176 ms | Best success rate (but small sample). |
| `/privacy-policy` | 60.8% | 90.9 ms | 1,274 ms | Static page also failing connections. |

## 5. Failure Analysis: The "ECONNRESET" Crisis
The test shows a massive amount of `ECONNRESET` errors across all endpoints, including static ones like the privacy policy. 
- **Symptoms:** Connections are dropped before the HTTP handshake or shortly after.
- **Cause:** This is typically caused by the server or a Load Balancer/WAF (Web Application Firewall) hitting a concurrency limit. 
- **Observation:** The site handles **10 users/sec** with some errors, but by **50 users/sec**, the failure rate becomes catastrophic.

## 6. Capacity & Recommendations
- **Site Capacity:** **12 RPS (Requests Per Second)** is the safe limit.
- **Warning Level:** **10 RPS**. Errors begin to manifest.
- **Recommended Actions:**
  1. **Infrastructure Upgrade:** The server needs more bandwidth or higher connection limits in the web server configuration (e.g., `worker_connections` in Nginx).
  2. **Rate Limiting Review:** Check if the site is misidentifying load test traffic as a DDoS attack and dropping connections.
  3. **Edge Caching:** Moving category pages to a CDN would reduce the number of direct connections the origin server has to handle.

## 7. Conclusion
While the backend application is very fast (low latency), the **delivery infrastructure is fragile**. It cannot support the requested 1000 concurrent users. Scaling the connection handling capacity is mandatory for high-traffic scenarios.
