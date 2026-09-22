require("dotenv/config");
const fs = require("fs");
const os = require("os");
const path = require("path");
const nodemailer = require("nodemailer");

const LOGO_PATH = path.join(__dirname, "..", "test-data", "Datastore_Logo.png");
const LOGO_CID = "datastore_logo_cid";

const REPORT_TIMEZONE = process.env.REPORT_TIMEZONE || "Asia/Kolkata";
const APP_NAME = process.env.REPORT_APP_NAME || "GeoWGS84 Datastore";
const TEST_ENV_NAME = process.env.TEST_ENV || process.env.NODE_ENV || "Production";
const BROWSER_NAME = process.env.REPORT_BROWSER || "Chromium";

const DIAG_DIR = path.join(process.cwd(), "diagnostics");
const VIDEO_DIR = path.join(process.cwd(), "test-results");

const fileStatCache = new Map();

function getCachedStat(filePath) {
  if (!fileStatCache.has(filePath)) {
    try {
      fileStatCache.set(filePath, fs.statSync(filePath));
    } catch (e) {
      return null;
    }
  }
  return fileStatCache.get(filePath);
}

function stripAnsi(str) {
  if (!str) return "";
  return String(str)
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
    .replace(/\x1b\][^\x07]*\x07/g, "")
    .replace(/\[(?:\d{1,3}(?:;\d{1,3})*)m/g, "")
    .trim();
}

function extractTerminalOutput(result) {
  const parts = [];
  if (result.output) {
    const raw = Buffer.isBuffer(result.output) ? result.output.toString("utf-8") : String(result.output || "");
    const cleaned = stripAnsi(raw);
    if (cleaned) parts.push(cleaned);
  }
  if (result.stdout) {
    const raw = Buffer.isBuffer(result.stdout) ? result.stdout.toString("utf-8") : String(result.stdout || "");
    const cleaned = stripAnsi(raw);
    if (cleaned) parts.push(cleaned);
  }
  if (result.stderr) {
    const raw = Buffer.isBuffer(result.stderr) ? result.stderr.toString("utf-8") : String(result.stderr || "");
    const cleaned = stripAnsi(raw);
    if (cleaned) parts.push(cleaned);
  }
  return parts.join("\n");
}

function truncateText(text, maxLines = 80) {
  if (!text) return text;
  const lines = text.split("\n");
  if (lines.length <= maxLines) return text;
  const kept = lines.slice(0, maxLines);
  const truncated = lines.length - maxLines;
  return kept.join("\n") + `\n\n... (${truncated} more lines truncated)`;
}

function formatCompletionTime(date) {
  const local = new Intl.DateTimeFormat("en-IN", {
    timeZone: REPORT_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);

  const utc = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date) + " UTC";

  return { local, utc };
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return "—";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function filterTerminalLogsForTest(terminalOutput, testTitle) {
  if (!terminalOutput || !testTitle) return terminalOutput || "";
  const lines = terminalOutput.split("\n");
  const filtered = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    filtered.push(line);
  }
  return filtered.join("\n");
}

function findVideoForTest(testTitle) {
  if (!fs.existsSync(VIDEO_DIR)) return null;
  const safeName = String(testTitle)
    .replace(/[:/\\<>?"|*]/g, "_")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
  try {
    const files = fs.readdirSync(VIDEO_DIR);
    const videoFiles = files.filter((f) => /\.(webm|mp4|mkv)$/i.test(f) && f.includes(safeName.substring(0, 40)));
    if (videoFiles.length > 0) {
      const sorted = videoFiles
        .map((f) => ({
          file: f,
          mtime: getCachedStat(path.join(VIDEO_DIR, f))?.mtimeMs || 0,
        }))
        .sort((a, b) => b.mtime - a.mtime);
      return path.join(VIDEO_DIR, sorted[0].file);
    }
  } catch (e) {}
  return null;
}

function sortTestsByDefinitionOrder(allTests) {
  function extractSortKey(title) {
    const match = title.match(/\[(?:P\d+)\]\s+([\d.]+):/);
    if (!match) return [999];
    return match[1].split(".").map((n) => parseInt(n, 10) || 0);
  }

  return [...allTests].sort((a, b) => {
    const keyA = extractSortKey(a.test.title);
    const keyB = extractSortKey(b.test.title);
    for (let i = 0; i < Math.max(keyA.length, keyB.length); i++) {
      const numA = keyA[i] || 0;
      const numB = keyB[i] || 0;
      if (numA !== numB) return numA - numB;
    }
    return 0;
  });
}

function readDiagnostics(testId, testTitle) {
  if (testId) {
    const safeId = String(testId).replace(/[:/\\<>?"|*]/g, "_").replace(/\s+/g, "_").replace(/_+/g, "_").substring(0, 150);
    const filePath = path.join(DIAG_DIR, `${safeId}.json`);
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {}
    }
  }
  if (testTitle) {
    const safeTitle = String(testTitle).replace(/[:/\\<>?"|*]/g, "_").replace(/\s+/g, "_").replace(/_+/g, "_").substring(0, 150);
    const filePath = path.join(DIAG_DIR, `${safeTitle}.json`);
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {}
    }
  }
  return null;
}

function formatInfosAsLogs(infos, testTitle = null) {
  if (!infos || infos.length === 0) return "";
  return infos
    .filter((info) => !testTitle || !info.test || info.test === testTitle)
    .map((info) => {
      const meta = info.meta && Object.keys(info.meta).length > 0 ? " " + JSON.stringify(info.meta) : "";
      const testPart = info.test ? `(${info.test})` : "";
      const flowPart = info.flow ? `[${info.flow}]` : "";
      return `[INFO] ${info.time} ${testPart} ${flowPart} - ${info.message}${meta}`;
    })
    .join("\n");
}

function clearDiagnosticsFolder() {
  if (!fs.existsSync(DIAG_DIR)) {
    fs.mkdirSync(DIAG_DIR, { recursive: true });
    return;
  }
  try {
    const files = fs.readdirSync(DIAG_DIR);
    let removed = 0;
    for (const file of files) {
      const filePath = path.join(DIAG_DIR, file);
      try {
        if (fs.lstatSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        removed++;
      } catch (e) {}
    }
    if (removed > 0) console.log(`🧹 Diagnostics cleared: ${removed} file(s)`);
  } catch (err) {
    console.warn("⚠️ Failed to clear diagnostics folder:", err.message);
  }
}

function getPlaywrightVersion() {
  try {
    return require("@playwright/test/package.json").version;
  } catch (e) {
    try {
      return require("playwright/package.json").version;
    } catch (e2) {
      return "—";
    }
  }
}

function getCommitSha() {
  const sha = process.env.GITHUB_SHA || process.env.GIT_COMMIT || process.env.CI_COMMIT_SHA || process.env.COMMIT_SHA || "";
  return sha ? sha.substring(0, 7) : "—";
}

function getEnvironmentInfo() {
  const osName = os.platform() === "win32" ? "Windows" : os.platform() === "darwin" ? "macOS" : "Linux";
  return {
    os: `${osName} (${os.release()})`,
    browser: BROWSER_NAME,
    node: process.version,
    playwright: getPlaywrightVersion(),
    commit: getCommitSha(),
    ci: process.env.CI ? "CI Pipeline" : "Local Run",
  };
}

function computeHealthScore(stats, totalTests) {
  if (!totalTests) return { score: 100, color: "#10B981", label: "PERFECT" };
  const weighted = stats.passed * 1 + stats.warning_tests * 0.75 + stats.skipped_logic_tests * 0.6 + stats.skipped * 0.5 + stats.failed * 0;
  const score = Math.round((weighted / totalTests) * 100);
  let color, label;
  if (stats.failed > 0) {
    color = "#EF4444";
    label = score >= 70 ? "AT RISK" : "CRITICAL";
  } else if (score >= 95) {
    color = "#10B981";
    label = "EXCELLENT";
  } else if (score >= 85) {
    color = "#84CC16";
    label = "GOOD";
  } else if (score >= 70) {
    color = "#F59E0B";
    label = "FAIR";
  } else {
    color = "#EF4444";
    label = "NEEDS ATTENTION";
  }
  return { score, color, label };
}

function getStyles() {
  return `
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, table, td, div, p, span { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        
        body {
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            color: #1F2937;
        }
        
        .email-container {
            background: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }
        
        .header {
            background: linear-gradient(135deg, #1E40AF 0%, #1F2937 100%);
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .logo {
            width: 72px;
            height: 72px;
            margin: 0 auto 20px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            display: inline-block;
        }
        
        .app-name {
            font-size: 32px;
            font-weight: 800;
            color: #FFFFFF;
            letter-spacing: -1px;
            margin-bottom: 8px;
        }
        
        .app-subtitle {
            font-size: 14px;
            color: #E5E7EB;
            font-weight: 500;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .status-badge {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 24px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
            border: 2px solid;
        }
        
        .status-passed {
            background: #F0FDF4;
            color: #059669;
            border-color: #86EFAC;
        }
        
        .status-failed {
            background: #FEF2F2;
            color: #DC2626;
            border-color: #FECACA;
        }
        
        .status-warning {
            background: #FFFBEB;
            color: #D97706;
            border-color: #FDE68A;
        }
        
        .section {
            padding: 32px 28px;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .section:last-child {
            border-bottom: none;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        .metric-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #E5E7EB;
            transition: all 0.3s ease;
        }
        
        .metric-card:hover {
            border-color: #D1D5DB;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .metric-label {
            font-size: 11px;
            font-weight: 700;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: 800;
            color: #1F2937;
        }
        
        .metric-sub {
            font-size: 12px;
            color: #9CA3AF;
            margin-top: 4px;
        }
        
        .stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 20px;
        }
        
        .stat-box {
            background: #FFFFFF;
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .stat-box:hover {
            border-color: #D1D5DB;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        
        .stat-emoji {
            font-size: 24px;
            margin-bottom: 8px;
        }
        
        .stat-number {
            font-size: 28px;
            font-weight: 800;
            color: #1F2937;
            line-height: 1.2;
        }
        
        .stat-label {
            font-size: 11px;
            font-weight: 600;
            color: #6B7280;
            text-transform: uppercase;
            margin-top: 6px;
            letter-spacing: 0.5px;
        }
        
        .stat-passed { border-color: #D1FAE5; background: #F0FDF4; }
        .stat-failed { border-color: #FEE2E2; background: #FEF2F2; }
        .stat-warning { border-color: #FEF3C7; background: #FFFBEB; }
        .stat-skipped { border-color: #E5E7EB; background: #F9FAFB; }
        
        .stat-passed .stat-number { color: #059669; }
        .stat-failed .stat-number { color: #DC2626; }
        .stat-warning .stat-number { color: #D97706; }
        .stat-skipped .stat-number { color: #6B7280; }
        
        .progress-bar {
            width: 100%;
            height: 12px;
            background: #E5E7EB;
            border-radius: 8px;
            overflow: hidden;
            margin-top: 16px;
        }
        
        .progress-fill {
            height: 100%;
            display: flex;
            border-radius: 8px;
        }
        
        .health-circle {
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .health-score {
            font-size: 42px;
            font-weight: 800;
            text-align: center;
            line-height: 1;
        }
        
        .health-label {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 8px;
            text-align: center;
        }
        
        .test-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        
        .test-table th {
            background: #F9FAFB;
            padding: 12px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #E5E7EB;
        }
        
        .test-table td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 13px;
        }
        
        .test-table tr:hover {
            background: #F9FAFB;
        }
        
        .test-name {
            font-weight: 600;
            color: #1F2937;
        }
        
        .test-status {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-align: center;
        }
        
        .status-pass { background: #F0FDF4; color: #059669; }
        .status-fail { background: #FEF2F2; color: #DC2626; }
        .status-warn { background: #FFFBEB; color: #D97706; }
        .status-skip { background: #F3F4F6; color: #6B7280; }
        
        .footer {
            background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
            color: #E5E7EB;
            padding: 32px 28px;
            text-align: center;
            border-top: 1px solid #374151;
        }
        
        .footer-text {
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 8px;
        }
        
        .footer-meta {
            font-size: 11px;
            color: #9CA3AF;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #374151;
        }
        
        .time-badge {
            background: #F3F4F6;
            border: 1px solid #E5E7EB;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #1F2937;
            font-family: 'JetBrains Mono', monospace;
            display: inline-block;
            margin-top: 8px;
        }
        
        .log-box {
            background: #1F2937;
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 12px;
            margin-top: 12px;
            overflow-x: auto;
        }
        
        .log-pre {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #D1D5DB;
            white-space: pre;
            line-height: 1.5;
            margin: 0;
        }
        
        @media only screen and (max-width: 600px) {
            .metric-grid { grid-template-columns: 1fr; }
            .stats-row { grid-template-columns: repeat(2, 1fr); }
            .section { padding: 20px 16px; }
            .app-name { font-size: 24px; }
            .stat-number { font-size: 22px; }
        }
    </style>`;
}

function buildHeader(logoCid, statusMeta) {
  const statusClass = statusMeta.label.includes("PASSED") ? "status-passed" : statusMeta.label.includes("FAILED") ? "status-failed" : "status-warning";
  return `
    <div class="header">
        <div class="header-content">
            <img src="cid:${logoCid}" alt="${escapeHtml(APP_NAME)}" class="logo">
            <div class="app-name">${escapeHtml(APP_NAME)}</div>
            <div class="app-subtitle">QA Test Report</div>
            <div class="status-badge ${statusClass}">${statusMeta.emoji} ${statusMeta.label}</div>
        </div>
    </div>`;
}

function buildTimeMetrics(time, wallClock, totalTests, workers) {
  return `
    <div class="section">
        <div class="section-title">⏱️ Execution Metrics</div>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-label">Completion Time</div>
                <div class="metric-value">${time.local}</div>
                <div class="metric-sub">🌐 ${time.utc}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Wall Clock Duration</div>
                <div class="metric-value">${wallClock}</div>
                <div class="metric-sub">🧩 ${totalTests} tests • ⚡ ${workers}w</div>
            </div>
        </div>
    </div>`;
}

function buildStatsSection(stats, totalTests) {
  const pPct = totalTests > 0 ? Math.round((stats.passed / totalTests) * 100) : 0;
  const fPct = totalTests > 0 ? Math.round((stats.failed / totalTests) * 100) : 0;
  const wPct = totalTests > 0 ? Math.round((stats.warning_tests / totalTests) * 100) : 0;
  const sPct = totalTests > 0 ? Math.round((stats.skipped / totalTests) * 100) : 0;

  return `
    <div class="section">
        <div class="section-title">📊 Test Results Summary</div>
        <div class="stats-row">
            <div class="stat-box stat-passed">
                <div class="stat-emoji">✅</div>
                <div class="stat-number">${stats.passed}</div>
                <div class="stat-label">Passed (${pPct}%)</div>
            </div>
            <div class="stat-box stat-failed">
                <div class="stat-emoji">❌</div>
                <div class="stat-number">${stats.failed}</div>
                <div class="stat-label">Failed (${fPct}%)</div>
            </div>
            <div class="stat-box stat-warning">
                <div class="stat-emoji">⚠️</div>
                <div class="stat-number">${stats.warning_tests}</div>
                <div class="stat-label">Warnings (${wPct}%)</div>
            </div>
            <div class="stat-box stat-skipped">
                <div class="stat-emoji">⏭️</div>
                <div class="stat-number">${stats.skipped}</div>
                <div class="stat-label">Skipped (${sPct}%)</div>
            </div>
        </div>
        
        <div class="progress-bar">
            ${pPct > 0 ? `<div style="width: ${pPct}%; background: linear-gradient(90deg, #10B981, #34D399);"></div>` : ""}
            ${fPct > 0 ? `<div style="width: ${fPct}%; background: linear-gradient(90deg, #EF4444, #F87171);"></div>` : ""}
            ${wPct > 0 ? `<div style="width: ${wPct}%; background: linear-gradient(90deg, #F59E0B, #FBBF24);"></div>` : ""}
            ${sPct > 0 ? `<div style="width: ${sPct}%; background: linear-gradient(90deg, #9CA3AF, #D1D5DB);"></div>` : ""}
        </div>
    </div>`;
}

function buildHealthScore(stats, totalTests) {
  const { score, color, label } = computeHealthScore(stats, totalTests);
  return `
    <div class="section">
        <div class="section-title">🩺 Quality Health Score</div>
        <div style="text-align: center;">
            <div class="health-circle">
                <div>
                    <div class="health-score" style="color: ${color};">${score}%</div>
                </div>
            </div>
            <div class="health-label" style="color: ${color};">${label}</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 12px;">
                Based on test status distribution and quality metrics
            </div>
        </div>
    </div>`;
}

function buildEnvironmentInfo(env, TEST_ENV_NAME) {
  return `
    <div class="section">
        <div class="section-title">🧬 Environment Configuration</div>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-label">Browser</div>
                <div class="metric-value" style="font-size: 18px;">🌐 ${env.browser}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Environment</div>
                <div class="metric-value" style="font-size: 18px;">📍 ${TEST_ENV_NAME}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Node.js</div>
                <div class="metric-value" style="font-size: 18px;">⬢ ${env.node}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Playwright</div>
                <div class="metric-value" style="font-size: 18px;">🎭 ${env.playwright}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Execution Mode</div>
                <div class="metric-value" style="font-size: 18px;">${env.ci}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Commit</div>
                <div class="metric-value" style="font-size: 18px; font-family: 'JetBrains Mono';">${env.commit}</div>
            </div>
        </div>
    </div>`;
}

function buildTestIssuesSection(allTests) {
  const sortedTests = sortTestsByDefinitionOrder(allTests);
  const issueTests = sortedTests.filter((t) => t.isFailure || t.hasWarning || t.hasSkippedLogic || t.isTestSkipped);
  
  if (issueTests.length === 0) return "";

  let tableHtml = `
    <div class="section">
        <div class="section-title">🔍 Failed/Warning Tests (${issueTests.length})</div>
        <table class="test-table">
            <thead>
                <tr>
                    <th style="width: 60%;">Test Name</th>
                    <th style="width: 20%;">File</th>
                    <th style="width: 20%;">Status</th>
                </tr>
            </thead>
            <tbody>`;

  for (const item of issueTests.slice(0, 20)) {
    const { test, isFailure, hasWarning, hasSkippedLogic } = item;
    let statusClass = "status-pass";
    let statusLabel = "PASS";
    let emoji = "✅";

    if (isFailure) {
      statusClass = "status-fail";
      statusLabel = "FAILED";
      emoji = "❌";
    } else if (hasWarning) {
      statusClass = "status-warn";
      statusLabel = "WARNING";
      emoji = "⚠️";
    } else if (hasSkippedLogic) {
      statusClass = "status-skip";
      statusLabel = "SKIPPED";
      emoji = "⏭️";
    }

    const fileName = test.location?.file ? path.basename(test.location.file) : "—";
    const cleanTitle = test.title.replace(/\[(P\d+)\]\s*/, "").substring(0, 80);

    tableHtml += `
                <tr>
                    <td class="test-name">${escapeHtml(cleanTitle)}</td>
                    <td style="font-size: 12px; color: #6B7280; font-family: 'JetBrains Mono';">${escapeHtml(fileName)}</td>
                    <td><span class="test-status ${statusClass}">${emoji} ${statusLabel}</span></td>
                </tr>`;
  }

  tableHtml += `
            </tbody>
        </table>`;
  
  if (issueTests.length > 20) {
    tableHtml += `<div style="margin-top: 12px; padding: 12px; background: #FEF2F2; border-radius: 8px; text-align: center; font-size: 12px; color: #DC2626; font-weight: 600;">
        ... and ${issueTests.length - 20} more issues (see full report)
    </div>`;
  }

  tableHtml += `</div>`;
  return tableHtml;
}

function buildFooter() {
  return `
    <div class="footer">
        <div class="footer-text">
            <strong>${escapeHtml(APP_NAME)}</strong>
        </div>
        <div class="footer-text">
            Automated QA Test Report • Playwright E2E Framework
        </div>
        <div class="footer-meta">
            This is an automated report. Please do not reply to this email.
            <br>Questions? Contact your QA team.
        </div>
    </div>`;
}

function wrapBody(inner) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${escapeHtml(APP_NAME)} - QA Report</title>
    ${getStyles()}
</head>
<body style="margin: 0; padding: 20px; background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);">
    <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
        <tr>
            <td>
                <div class="email-container">
                    ${inner}
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

class EmailReporter {
  constructor() {
    this.testRuns = new Map();
    this.stats = {
      passed: 0,
      failed: 0,
      skipped: 0,
      warning_tests: 0,
      skipped_logic_tests: 0,
    };
    this.workers = 1;
  }

  onBegin(config, suite) {
    this.workers = config.workers || 1;
    if (!process.env.CI) clearDiagnosticsFolder();
  }

  onTestEnd(test, result) {
    this.testRuns.set(test.id, { test, result });
  }

  async onEnd() {
    console.time("[REPORTER] Total time");
    console.log(`[REPORTER] Processing ${this.testRuns.size} tests...`);

    const allTests = [];
    let testIndex = 0;
    for (const { test, result } of this.testRuns.values()) {
      testIndex++;
      if (testIndex % 10 === 0) console.log(`[REPORTER] ${testIndex}/${this.testRuns.size}...`);

      const diag = readDiagnostics(test.id, test.title);

      let rawLogs = "";
      if (diag && diag.infos && diag.infos.length > 0) {
        rawLogs = stripAnsi(formatInfosAsLogs(diag.infos, test.title));
      } else {
        const terminalOut = extractTerminalOutput(result);
        if (terminalOut) {
          rawLogs = filterTerminalLogsForTest(terminalOut, test.title);
        }
      }

      if (diag && diag.browserConsole && diag.browserConsole.length > 0) {
        const browserLogs = stripAnsi(diag.browserConsole.slice(0, 30).join("\n"));
        if (browserLogs && rawLogs.length < 3000) {
          rawLogs = rawLogs ? rawLogs + "\n\n[BROWSER]\n" + browserLogs : "[BROWSER]\n" + browserLogs;
        }
      }

      let errorDetails = null;
      if (result.error) {
        errorDetails = (result.error.message || "").substring(0, 300);
      } else if (diag && diag.errors && diag.errors.length > 0) {
        errorDetails = diag.errors.slice(0, 2).map((e) => `${e.message}`).join(" | ").substring(0, 300);
      }
      if (errorDetails) errorDetails = stripAnsi(errorDetails);

      const allWarnings = diag && diag.warnings ? diag.warnings.map((w) => w.message) : [];
      const allSkippedSteps = diag && diag.skippedSteps ? diag.skippedSteps : [];

      const isFailure = result.status === "failed" || result.status === "timedOut";
      const isTestSkipped = result.status === "skipped";
      const hasWarning = allWarnings.length > 0;
      const hasSkippedLogic = allSkippedSteps.length > 0;

      const needsDetail = isFailure || hasWarning || hasSkippedLogic || isTestSkipped;
      const logMaxLines = needsDetail ? 60 : 0;
      const logs = logMaxLines > 0 ? truncateText(stripAnsi(rawLogs), logMaxLines) : "";
      const logLineCount = logs ? logs.split("\n").filter((l) => l.trim()).length : 0;

      if (isFailure) this.stats.failed++;
      else if (isTestSkipped) this.stats.skipped++;
      else if (hasWarning) this.stats.warning_tests++;
      else if (hasSkippedLogic) this.stats.skipped_logic_tests++;
      else if (result.status === "passed") this.stats.passed++;
      else this.stats.skipped++;

      const rawAttachments = result.attachments || [];
      const shouldAttach = isFailure || hasWarning || hasSkippedLogic || isTestSkipped;
      let videos = [], images = [];
      if (shouldAttach) {
        images = rawAttachments.filter((a) => a.path && /\.(png|jpg|jpeg)$/i.test(a.path));
        videos = rawAttachments.filter((a) => a.path && /\.(webm|mp4)$/i.test(a.path));
      }

      if (shouldAttach && videos.length === 0 && diag && diag.videoPath && fs.existsSync(diag.videoPath)) {
        videos.push({
          name: path.basename(diag.videoPath),
          path: diag.videoPath,
          contentType: "video/webm",
        });
      }

      if (shouldAttach && videos.length === 0) {
        const foundVideo = findVideoForTest(test.title);
        if (foundVideo && fs.existsSync(foundVideo)) {
          videos.push({
            name: path.basename(foundVideo),
            path: foundVideo,
            contentType: "video/webm",
          });
        }
      }

      allTests.push({
        test,
        result,
        logs,
        logLineCount,
        errorDetails,
        allWarnings,
        allSkippedSteps,
        videos,
        images,
        hasWarning,
        hasSkippedLogic,
        isFailure,
        isTestSkipped,
        isPassed: !isFailure && !hasWarning && !hasSkippedLogic,
        duration: result.duration || 0,
      });
    }

    const completionDate = new Date();
    const time = formatCompletionTime(completionDate);
    const totalTests = this.stats.passed + this.stats.failed + this.stats.warning_tests + this.stats.skipped_logic_tests + this.stats.skipped;

    let totalMs = 0;
    for (const item of allTests) totalMs += item.duration;
    const wallClock = formatDuration(totalMs);
    const workers = this.workers;
    const env = getEnvironmentInfo();

    function overallStatusMeta(stats) {
      if (stats.failed > 0) return { emoji: "🔴", label: "QUALITY GATE FAILED", color: "#EF4444", bg: "#FEF2F2" };
      if (stats.warning_tests > 0) return { emoji: "🟡", label: "WARNINGS DETECTED", color: "#F59E0B", bg: "#FFFBEB" };
      if (stats.skipped_logic_tests > 0 || stats.skipped > 0) return { emoji: "🟣", label: "TESTS SKIPPED", color: "#A78BFA", bg: "#F5F3FF" };
      return { emoji: "🟢", label: "QUALITY GATE PASSED", color: "#10B981", bg: "#F0FDF4" };
    }

    // EMAIL 1: DAILY SUMMARY
    if (process.env.DAILY_REPORT_EMAILS?.trim()) {
      console.log("[REPORTER] Sending DAILY email...");
      const statusMeta = overallStatusMeta(this.stats);
      const subject = `📊 ${APP_NAME}: ${this.stats.passed}✅ ${this.stats.failed}❌ ${this.stats.warning_tests}⚠️`;
      const html = wrapBody(`
                ${buildHeader(LOGO_CID, statusMeta)}
                ${buildTimeMetrics(time, wallClock, totalTests, workers)}
                ${buildStatsSection(this.stats, totalTests)}
                ${buildHealthScore(this.stats, totalTests)}
                ${buildEnvironmentInfo(env, TEST_ENV_NAME)}
                ${buildFooter()}
            `);

      try {
        await this._sendMail(process.env.DAILY_REPORT_EMAILS, subject, "", html, []);
        console.log(`✅ Daily email sent (${(html.length / 1024).toFixed(0)} KB)`);
      } catch (err) {
        console.error("❌ Daily email failed:", err.message);
      }
    }

    // EMAIL 2: FAILURE ALERT
    if (process.env.FAILURE_ALERT_EMAILS?.trim()) {
      console.log("[REPORTER] Building FAILURE ALERT email...");
      const statusMeta = overallStatusMeta(this.stats);
      const finalAttachments = [];
      let totalSize = 0;
      let videoCountAttached = 0;
      const MAX_SIZE = 14 * 1024 * 1024;
      const MAX_SINGLE_FILE = 4 * 1024 * 1024;
      const MAX_VIDEOS = 2;

      const addAttachment = (att) => {
        if (!att.path || !fs.existsSync(att.path)) return false;
        const isVideo = /\.(webm|mp4)$/i.test(att.path);
        if (isVideo && videoCountAttached >= MAX_VIDEOS) return false;
        const fstats = getCachedStat(att.path);
        if (!fstats || fstats.size > MAX_SINGLE_FILE) return false;
        if (totalSize + fstats.size > MAX_SIZE) return false;
        totalSize += fstats.size;
        if (isVideo) videoCountAttached++;
        finalAttachments.push({
          filename: att.name || path.basename(att.path),
          path: att.path,
          contentType: att.contentType || "application/octet-stream",
        });
        return true;
      };

      for (const item of allTests) {
        item.images.forEach((img) => addAttachment(img));
        item.videos.forEach((vid) => addAttachment(vid));
      }

      const subject = `${statusMeta.emoji} ${APP_NAME}: ${this.stats.passed}✅ ${this.stats.failed}❌ ${this.stats.warning_tests}⚠️`;
      const html = wrapBody(`
                ${buildHeader(LOGO_CID, statusMeta)}
                ${buildTimeMetrics(time, wallClock, totalTests, workers)}
                ${buildStatsSection(this.stats, totalTests)}
                ${buildHealthScore(this.stats, totalTests)}
                ${buildTestIssuesSection(allTests)}
                ${buildEnvironmentInfo(env, TEST_ENV_NAME)}
                ${buildFooter()}
            `);

      console.log(`[REPORTER] HTML: ${(html.length / 1024).toFixed(0)} KB, attachments: ${finalAttachments.length}, size: ${(totalSize / (1024 * 1024)).toFixed(1)} MB`);

      try {
        await this._sendMail(process.env.FAILURE_ALERT_EMAILS, subject, "", html, finalAttachments);
        console.log(`✅ FAILURE ALERT sent (${finalAttachments.length} files)`);
      } catch (err) {
        console.error("❌ FAILURE ALERT failed:", err.message);
        throw err;
      }
    }

    console.timeEnd("[REPORTER] Total time");
  }

  async _sendMail(to, subject, text, html, attachments = []) {
    if (!to?.trim()) throw new Error("No recipients");
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS required");
    }

    console.log(`[SMTP] Connecting to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}...`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 60_000,
      greetingTimeout: 30_000,
      socketTimeout: 180_000,
    });

    const finalAttachments = [...attachments];

    if (fs.existsSync(LOGO_PATH)) {
      finalAttachments.push({
        filename: "Logo.png",
        path: LOGO_PATH,
        cid: LOGO_CID,
        contentDisposition: "inline",
      });
    }

    console.log(`[SMTP] Sending: ${subject}`);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      attachments: finalAttachments,
    });

    console.log(`[SMTP] Delivered: ${info.messageId}`);
    return info;
  }
}

module.exports = EmailReporter;
