/**
 * Playwright E2E Instrumentation Helpers
 * Lightweight, opt‑in diagnostics to debug hanging tests / flaky waits.
 * Enable via environment variable: DEBUG_E2E=1 (logs) or DEBUG_E2E=verbose (adds DOM/network snapshots)
 */
import { Page } from '@playwright/test';

interface AttachOptions {
  network?: boolean;
  console?: boolean;
  domSnapshots?: boolean;
  requests?: boolean;
}

export function attachDebugInstrumentation(page: Page, opts: AttachOptions = {}) {
  const level = process.env.DEBUG_E2E || '';
  const verbose = level.toLowerCase() === 'verbose';
  const enabled = !!level;
  if (!enabled) return;

  const options: Required<AttachOptions> = {
    network: opts.network ?? true,
    console: opts.console ?? true,
    domSnapshots: opts.domSnapshots ?? verbose,
    requests: opts.requests ?? true,
  };

  if (options.console) {
    page.on('console', msg => {
      // Avoid noise from verbose logs unless verbose mode
      if (!verbose && ['debug', 'info'].includes(msg.type())) return;
      // eslint-disable-next-line no-console
      console.log(`📢 [browser:${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => {
      // eslint-disable-next-line no-console
      console.error('🛑 [pageerror]', err);
    });
  }

  if (options.network) {
    page.on('requestfailed', req => {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  [requestfailed] ${req.method()} ${req.url()} -> ${req.failure()?.errorText}`);
    });
    page.on('response', async resp => {
      const status = resp.status();
      if (status >= 400) {
        // eslint-disable-next-line no-console
        console.warn(`🚨 [response ${status}] ${resp.url()}`);
      }
    });
  }

  if (options.domSnapshots) {
    // Periodic DOM snapshot (lightweight) for diagnosing stalls
    const interval = setInterval(async () => {
      if (page.isClosed()) {
        clearInterval(interval);
        return;
      }
      try {
        const title = await page.title().catch(() => 'n/a');
        const bodyText = await page.locator('body').innerText({ timeout: 500 }).catch(() => '');
        // eslint-disable-next-line no-console
        console.log(`🩺 [dom-snapshot] title="${title}" body[0..120]="${bodyText.slice(0, 120)}"`);
      } catch {
        /* ignore */
      }
    }, 5000);
  }

  // Quick helper to await a condition with logging
  (page as any).waitForCondition = async function (label: string, predicate: () => Promise<boolean>, timeoutMs = 5000, pollMs = 200) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        if (await predicate()) {
          // eslint-disable-next-line no-console
          console.log(`✅ [condition] ${label} satisfied in ${Date.now() - start}ms`);
          return true;
        }
      } catch (e) {
        // swallow predicate errors, keep polling
      }
      await page.waitForTimeout(pollMs);
    }
    // eslint-disable-next-line no-console
    console.warn(`⏱️  [condition-timeout] ${label} after ${timeoutMs}ms`);
    return false;
  };
}

export type DebugPage = Page & { waitForCondition?: (label: string, predicate: () => Promise<boolean>, timeoutMs?: number, pollMs?: number) => Promise<boolean> };
