require('dotenv/config')
const fs = require('fs')
const path = require('path')
import { test as base, expect } from '@playwright/test';
import { 
    setContext, clearContext, getWarnings, clearWarnings, getErrors, clearErrors, 
    getArtifacts, clearArtifacts, getSkippedSteps, clearSkippedSteps,
    persistDiagnosticsSummary, captureScreenshot, setPageRef, clearPageRef,
    saveMapScreenshot, clearInfos
} from '../utils/helpers';

export { expect }; 

export const test = base.extend({
});

test.beforeEach(async ({ page }, testInfo) => {
  clearWarnings();
  clearErrors();
  clearArtifacts();
  clearSkippedSteps();
  clearInfos();
  setPageRef(page);

  setContext({ testcase: testInfo.title, testFile: testInfo.file });

  const browserConsole = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (!text || text.length === 0) return;
    
    const loc = msg.location();
    const urlSnippet = loc && loc.url 
      ? ` (${loc.url.split('/').pop()}${loc.lineNumber ? ':' + loc.lineNumber : ''})` 
      : '';
    
    browserConsole.push(`[${type.toUpperCase()}]${urlSnippet} ${text}`);
  });

  page.on('pageerror', err => {
    browserConsole.push(`[PAGE_ERROR] ${err.message || String(err)}`);
  });

  page._browserConsole = browserConsole;
});

test.afterEach(async ({ page }, testInfo) => {
  const warnings = getWarnings();
  const errors = getErrors();
  const skippedSteps = getSkippedSteps();
  
  const hasIssues = errors.length > 0 || warnings.length > 0 || skippedSteps.length > 0;
  const isFailure = testInfo.status !== 'passed';
  const isSkipped = testInfo.status === 'skipped';

  // ★ DEBUG: Log what we captured
  console.log(`[DIAG-DEBUG] testId="${testInfo.testId}" title="${testInfo.title}" warnings=${warnings.length} errors=${errors.length} skipped=${skippedSteps.length} status=${testInfo.status}`);

  if ((hasIssues || isFailure || isSkipped) && !page.isClosed()) {
    try {
      if (getArtifacts().length === 0) {
        const reason = isSkipped ? 'TEST_SKIPPED' 
                      : errors.length > 0 ? 'ERROR_CAPTURED' 
                      : warnings.length > 0 ? 'WARNING_CAPTURED'
                      : 'FAILURE_CAPTURED';
        await captureScreenshot(page, testInfo.title, reason);
      }
      if (skippedSteps.length > 0 || isFailure) {
        await saveMapScreenshot(page, testInfo.title, 'final_state', true);
      }
    } catch (e) {
      console.warn('Screenshot capture in afterEach failed:', e.message);
    }
  }

  let videoPath = null;
  if ((hasIssues || isFailure || isSkipped) && !page.isClosed()) {
    try {
      const video = page.video();
      if (video) {
        videoPath = await video.path();
      }
    } catch (e) {}
  }

  const artifacts = getArtifacts();
  if (artifacts.length > 0) {
      for (const filePath of artifacts) {
          try {
              await testInfo.attach('screenshot', { path: filePath });
          } catch (e) { console.warn('Failed to attach artifact', filePath); }
      }
  }

  if (videoPath && (hasIssues || isFailure || isSkipped)) {
    try {
      await testInfo.attach('video', { path: videoPath });
    } catch (e) {}
  }

  const browserConsole = page._browserConsole || [];
  
  // ★ KEY FIX: Persist warnings/skippedSteps with the FULL test title as alternative ID
  persistDiagnosticsSummary({ 
      status: testInfo.status, 
      duration: testInfo.duration,
      testId: testInfo.testId,
      testTitle: testInfo.title,       // ★ ADD: also save by title
      browserConsole: browserConsole,
      videoPath: videoPath
  });

  // ★ DEBUG: Verify the file was actually written
  const fs2 = await import('fs');
  const path2 = await import('path');
  const diagDir = path2.join(process.cwd(), 'diagnostics');
  const safeId = String(testInfo.testId).replace(/[:/\\<>?"|*]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').substring(0, 150);
  const expectedFile = path2.join(diagDir, `${safeId}.json`);
  const exists = fs2.existsSync(expectedFile);
  console.log(`[DIAG-DEBUG] File ${exists ? 'EXISTS' : 'MISSING'}: ${expectedFile}`);
  if (exists) {
    const content = JSON.parse(fs2.readFileSync(expectedFile, 'utf-8'));
    console.log(`[DIAG-DEBUG] File contains: warnings=${content.warnings?.length || 0} errors=${content.errors?.length || 0} skippedSteps=${content.skippedSteps?.length || 0}`);
  }

  clearPageRef();
  clearContext();
});