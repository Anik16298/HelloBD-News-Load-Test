const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const reportName = 'HelloBD_Load_Test_Report';

async function generateReports() {
    const reportPath = path.join(__dirname, 'report.json');
    if (!fs.existsSync(reportPath)) {
        console.error('report.json not found! Run a test first (e.g., npm run test:extreme).');
        process.exit(1);
    }

    let data;
    try {
        data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch (e) {
        console.error('Failed to parse report.json:', e);
        process.exit(1);
    }

    const { aggregate = {}, intermediate = [], config = {} } = data;
    const counters = aggregate.counters || {};
    const summaries = aggregate.summaries || {};
    const rt = summaries['http.response_time'] || { min: 0, median: 0, p95: 0, p99: 0, max: 0 };

    // Duration Calculation (in seconds)
    const durationSeconds = (aggregate.lastMetricAt - aggregate.firstMetricAt) / 1000 || 180;
    const targetUrl = config.target || "https://hellobd.news";
    const totalRequests = counters['http.requests'] || 0;
    const okRequests = counters['http.codes.200'] || 0;
    const successRate = totalRequests > 0 ? ((okRequests / totalRequests) * 100).toFixed(2) : 0;

    // Timeline Data
    const timelineLabels = intermediate.map((_, i) => `${i * 10}s`);
    const timelineRps = intermediate.map(m => (m.counters['http.requests'] || 0) / 10);
    const timelineLatencies = intermediate.map(m => m.summaries['http.response_time']?.p95 || 0);

    // Endpoint Analysis
    const endpoints = Object.keys(summaries)
        .filter(k => k.startsWith('plugins.metrics-by-endpoint.response_time.'))
        .map(k => {
            const name = k.replace('plugins.metrics-by-endpoint.response_time.', '');
            const s = summaries[k];
            // Try to find status codes for this endpoint
            const baseKey = `plugins.metrics-by-endpoint.${name}`;
            const ok = counters[`${baseKey}.codes.200`] || 0;
            const total = Object.keys(counters)
                .filter(ck => ck.startsWith(`${baseKey}.codes.`))
                .reduce((acc, ck) => acc + counters[ck], 0) || ok;

            return {
                name,
                p50: s.median || 0,
                p95: s.p95 || 0,
                successRate: total > 0 ? ((ok / total) * 100).toFixed(1) : '100.0'
            };
        });

    // If no endpoints detected by plugin, use aggregate
    if (endpoints.length === 0) {
        endpoints.push({
            name: 'Generic Endpoints (Aggregate)',
            p50: rt.median,
            p95: rt.p95,
            successRate: successRate
        });
    }

    // Determine Status
    let statusText = 'EXCELLENT';
    let statusColor = '#10b981';
    let statusEmoji = '✅';
    if (successRate < 90) {
        statusText = 'CRITICAL';
        statusColor = '#ef4444';
        statusEmoji = '🔴';
    } else if (successRate < 98) {
        statusText = 'DEGRADED';
        statusColor = '#f59e0b';
        statusEmoji = '⚠️';
    }

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const avgRps = (totalRequests / durationSeconds).toFixed(1);
    const safeRps = (parseFloat(avgRps) * 0.8).toFixed(1);

    // 1. Generate TXT Summary
    const txtReport = `************************************************************
             HelloBD NEWS: CATEGORY WISE LOAD TEST REPORT
************************************************************

OVERALL STATUS: ${statusEmoji} ${statusText}
REPORT GENERATE DATE: ${today}

1. TEST DETAILS & METHODOLOGY
--------------------------------------
The test simulated a progressive load on the category pages with 9 defined phases:
- Warmup: 30s, 100 users/sec
- Push: 30s, 150 users/sec
- Hard Push: 30s, 250 users/sec
- Overload: 30s, 350 users/sec
- Extreme: 30s, 500 users/sec
- Brutal: 30s, 650 users/sec
- Savage: 30s, 800 users/sec
- Catastrophic: 30s, 900 users/sec
- Max Load: 30s, 1000 users/sec

- **Total Duration:** ${Math.round(durationSeconds)} Seconds
- **Average Request Rate:** ${(avgRps * 60).toFixed(0)} requests every minute
- **Total Traffic Volume:** ${totalRequests} Total Requests

2. VISITOR SUCCESS & FAILURE BREAKDOWN
------------------------------------------
Network traffic analysis results:

- **SUCCESSFUL ENTRANCES:** ${okRequests} (${successRate}% of all visitors)
- **FAILED ATTEMPTS:** ${totalRequests - okRequests} (${(100 - successRate).toFixed(2)}% of all visitors)
- **DAILY PROJECTION:** Based on current traffic patterns, if this load continues for 
  just 1 hour, potential visitor loss would exceed ${((totalRequests - okRequests) * (3600 / durationSeconds)).toFixed(0).toLocaleString()}.

3. LOSS CALCULATION BY SITE SECTION
---------------------------------------
Failure rate analysis by category:

${endpoints.map(e => `- **${e.name.toUpperCase()}:** ${(100 - parseFloat(e.successRate)).toFixed(1)}% Failure Rate (${e.p95}ms Tail Latency)`).join('\n')}

*Observation: ${successRate > 99 ? 'The site is holding up perfectly under this load.' : 'There is noticeable stress on certain endpoints as load increases.'}*

4. PROBLEM IDENTIFICATION (ANALYSIS)
------------------------------------------
Server response time analysis:
- **Speed Test:** The median response time was **${rt.median}ms**.
- **Stress Test:** The P95 (slowest 5%) reached **${rt.p95}ms**.
- **Observation:** ${totalRequests - okRequests > 0 ? 'The server is returning some errors under pressure.' : 'No errors were detected during this specific test run.'}

5. CALCULATED CAPACITY LIMITS
---------------------------------
Operational zones based on test data:

- ✅ **SAFE ZONE:** Up to ${safeRps} Requests Per Second.
- ⚠️ **WARNING ZONE:** Over ${avgRps} Requests Per Second.

6. RECOMMENDED FIXES (ACTION PLAN)
----------------------------------------
1. Ensure the category pages are properly cached at the Edge (CDN).
2. Monitor database query execution times for category filters.
3. Consider horizontal scaling if arrival rates exceed 50 users/sec.
`;

    fs.writeFileSync(path.join(__dirname, 'HelloBD_Load_Test_Report.txt'), txtReport);

    // 2. Generate HTML Report
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Load Test Report - Category Validation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; color: #333; line-height: 1.6; padding: 40px; }
        .container { max-width: 900px; margin: auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .status-box { padding: 15px; border-radius: 4px; margin: 20px 0; font-weight: bold; text-align: center; font-size: 1.2em; }
        .status-critical { background: #fee2e2; color: #991b1b; }
        .status-degraded { background: #fef3c7; color: #92400e; }
        .status-excellent { background: #dcfce7; color: #166534; }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: #f8fafc; padding: 20px; border-left: 4px solid #3498db; }
        .stat-card h3 { margin: 0; font-size: 0.9em; color: #64748b; text-transform: uppercase; }
        .stat-card p { margin: 10px 0 0; font-size: 1.8em; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; }
        pre { background: #1e293b; color: #f8fafc; padding: 20px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Category Page Validation Report</h1>
        <div class="status-box status-${statusText.toLowerCase()}">
            Status: ${statusEmoji} ${statusText}
        </div>
        
        <div class="stat-grid">
            <div class="stat-card"><h3>Success Rate</h3><p>${successRate}%</p></div>
            <div class="stat-card"><h3>Avg Latency</h3><p>${rt.median}ms</p></div>
            <div class="stat-card"><h3>P95 Latency</h3><p>${rt.p95}ms</p></div>
            <div class="stat-card"><h3>Total Requests</h3><p>${totalRequests}</p></div>
        </div>

        <h2>Endpoint Breakdown</h2>
        <table>
            <thead>
                <tr>
                    <th>Endpoint</th>
                    <th>Median</th>
                    <th>P95</th>
                    <th>Success Rate</th>
                </tr>
            </thead>
            <tbody>
                ${endpoints.map(e => `
                <tr>
                    <td><code>${e.name}</code></td>
                    <td>${e.p50}ms</td>
                    <td>${e.p95}ms</td>
                    <td>${e.successRate}%</td>
                </tr>`).join('')}
            </tbody>
        </table>

        <div style="page-break-before: always;"></div>
        <h2>Full Text Summary</h2>
        <pre>${txtReport}</pre>
    </div>
</body>
</html>`;

    const htmlPath = path.join(__dirname, `${reportName}.html`);
    fs.writeFileSync(htmlPath, html);
    console.log(`HTML Report generated: ${reportName}.html`);

    // Only attempt PDF generation if playwright is available and working
    try {
        await generatePDF(htmlPath);
    } catch (err) {
        console.warn('PDF generation failed (Playwright installed?):', err.message);
    }
}

async function generatePDF(htmlPath) {
    const pdfPath = path.join(__dirname, `${reportName}.pdf`);
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Load the local HTML file
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

    // Generate PDF
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await browser.close();
    console.log(`PDF Report generated: ${reportName}.pdf`);
}

generateReports().catch(console.error);
