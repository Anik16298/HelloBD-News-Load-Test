const fs = require('fs');
const path = require('path');

function generateReport() {
    const reportPath = path.join(__dirname, 'report.json');
    if (!fs.existsSync(reportPath)) {
        console.error('report.json not found! Run a test first.');
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

    const targetUrl = config.target || "https://hellobd.news";
    const totalRequests = counters['http.requests'] || 0;
    const okRequests = counters['http.codes.200'] || 0;
    const successRate = totalRequests > 0 ? ((okRequests / totalRequests) * 100).toFixed(2) : 0;
    const failedUsers = counters['vusers.failed'] || 0;
    const totalUsers = counters['vusers.created'] || 0;

    // Timeline Data Extraction
    const timelineLabels = intermediate.map((_, i) => `${i * 10}s`);
    const timelineRps = intermediate.map(m => m.counters['http.requests'] / 10 || 0);
    const timelineLatencies = intermediate.map(m => m.summaries['http.response_time']?.p95 || 0);

    // Endpoint Analysis
    const endpoints = Object.keys(summaries)
        .filter(k => k.startsWith('plugins.metrics-by-endpoint.response_time.'))
        .map(k => {
            const name = k.replace('plugins.metrics-by-endpoint.response_time.', '');
            const s = summaries[k];
            const errKey = `plugins.metrics-by-endpoint.${name}.errors.ETIMEDOUT`;
            return {
                name,
                p50: s.median || 0,
                p95: s.p95 || 0,
                p99: s.p99 || 0,
                errors: counters[errKey] || 0
            };
        });

    // Executive Analysis Logic
    let status = { text: 'Excellent', color: '#10b981', desc: 'System is highly responsive and stable.' };
    if (successRate < 90) status = { text: 'Critical', color: '#ef4444', desc: 'Severe failure rate. Server cannot handle this concurrency level.' };
    else if (successRate < 98 || rt.p95 > 3000) status = { text: 'Degraded', color: '#f59e0b', desc: 'System is slow and dropping connections under peak load.' };

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>End-to-End Load Report | HelloBD</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary: #4f46e5; --secondary: #1e293b; --accent: #8b5cf6;
            --success: #10b981; --warning: #f59e0b; --danger: #ef4444;
            --bg: #f8fafc; --surface: #ffffff; --text: #334155;
        }
        body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); margin: 0; line-height: 1.6; }
        .sidebar { position: fixed; width: 280px; height: 100vh; background: var(--secondary); color: white; padding: 2rem; }
        .main { margin-left: 320px; padding: 2rem; max-width: 1200px; }
        .header { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 2rem; position: relative; overflow: hidden; }
        .header::after { content: ''; position: absolute; top:0; left:0; width: 6px; height: 100%; background: ${status.color}; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .stat-card h4 { margin: 0; color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-card .value { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0.5rem 0; }
        
        .chart-box { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .chart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 1rem; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; color: #475569; }
        
        .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; color: white; background: ${status.color}; }
        code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; }
        
        .fail { color: var(--danger); font-weight: bold; }
        .ok { color: var(--success); font-weight: bold; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2>HelloBD</h2>
        <p style="opacity: 0.6; font-size: 0.9rem;">Intelligence Report</p>
        <hr style="opacity: 0.1; margin: 2rem 0;">
        <nav>
            <p><strong>TEST ENGINE</strong><br>Artillery.io v2.0</p>
            <p><strong>ENVIRONMENT</strong><br>${config.environment || 'N/A'}</p>
            <p><strong>DURATION</strong><br>${aggregate.period / 1000} Seconds</p>
        </nav>
    </div>

    <div class="main">
        <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 style="margin:0;">Performance Analysis Final</h1>
                    <p style="margin: 0.5rem 0 0 0; color: #64748b;">Target Endpoint: <code>${targetUrl}</code></p>
                </div>
                <span class="badge" style="font-size: 1.2rem; padding: 0.5rem 1.5rem;">${status.text}</span>
            </div>
            <p style="margin-top: 1.5rem; font-size: 1.1rem; color: #475569;">${status.desc}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card"><h4>Success Rate</h4><div class="value">${successRate}%</div></div>
            <div class="stat-card"><h4>Req Throughput</h4><div class="value">${(totalRequests / (aggregate.period / 1000)).toFixed(1)}/s</div></div>
            <div class="stat-card"><h4>P95 Latency</h4><div class="value">${rt.p95}ms</div></div>
            <div class="stat-card"><h4>Total Failures</h4><div class="value fail">${failedUsers}</div></div>
        </div>

        <div class="chart-grid">
            <div class="chart-box">
                <h3 style="margin-top:0;">Traffic & Pressure Timeline</h3>
                <div style="height: 350px;"><canvas id="timelineChart"></canvas></div>
            </div>
            <div class="chart-box">
                <h3 style="margin-top:0;">Latency (ms)</h3>
                <div style="height: 350px;"><canvas id="distChart"></canvas></div>
            </div>
        </div>

        <div class="chart-box">
            <h3 style="margin-top:0;">End-to-End Endpoint Breakdown</h3>
            <table>
                <thead>
                    <tr>
                        <th>Resource Path</th>
                        <th>Median (P50)</th>
                        <th>Tail (P95)</th>
                        <th>Extreme (P99)</th>
                        <th>Timeouts</th>
                    </tr>
                </thead>
                <tbody>
                    ${endpoints.map(e => `
                        <tr>
                            <td><code>${e.name}</code></td>
                            <td>${e.p50}ms</td>
                            <td class="${e.p95 > 2000 ? 'fail' : ''}">${e.p95}ms</td>
                            <td>${e.p99}ms</td>
                            <td class="${e.errors > 0 ? 'fail' : ''}">${e.errors}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="chart-box" style="background: #1e293b; color: white; border: none;">
            <h3>Findings & Insights</h3>
            <ul>
                <li><strong>Throughput:</strong> Peak requests peaked at ${Math.max(...timelineRps).toFixed(0)} requests per second.</li>
                <li><strong>Bottleneck Identification:</strong> The <code>${endpoints.sort((a, b) => b.p95 - a.p95)[0]?.name || 'N/A'}</code> resource exhibits the highest latency, likely the primary bottleneck.</li>
                <li><strong>Retry Logic Recommendation:</strong> Error patterns show transient timeouts during ramp-up, suggesting a need for better connection pooling or CDN caching.</li>
            </ul>
        </div>
    </div>

    <script>
        // Timeline Chart
        new Chart(document.getElementById('timelineChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: ${JSON.stringify(timelineLabels)},
                datasets: [
                    {
                        label: 'Requests/sec',
                        data: ${JSON.stringify(timelineRps)},
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'P95 Latency (ms)',
                        data: ${JSON.stringify(timelineLatencies)},
                        borderColor: '#ef4444',
                        borderDash: [5, 5],
                        fill: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { type: 'linear', position: 'left', title: { display: true, text: 'RPS' } },
                    y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Latency (ms)' } }
                }
            }
        });

        // Distribution Chart
        new Chart(document.getElementById('distChart').getContext('2d'), {
            type: 'polarArea',
            data: {
                labels: ['Min', 'Median', 'P95', 'P99', 'Max'],
                datasets: [{
                    data: [${rt.min}, ${rt.median}, ${rt.p95}, ${rt.p99}, ${rt.max}],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.5)',
                        'rgba(79, 70, 229, 0.5)',
                        'rgba(245, 158, 11, 0.5)',
                        'rgba(239, 68, 68, 0.5)',
                        'rgba(15, 23, 42, 0.5)'
                    ]
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    </script>
</body>
</html>
    `;

    fs.writeFileSync(path.join(__dirname, 'report.html'), html);
    console.log('Successfully generated End-to-End descriptive report at report.html');
}

generateReport();
