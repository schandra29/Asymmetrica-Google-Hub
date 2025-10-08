// Use reporter types from playwright internal export path
// Fallback to loose typing to avoid version-specific type breakages
// (We only log diagnostics; strict types unnecessary.)
type FullConfig = any;
type Suite = any;
type TestCase = any;
type TestResult = any;
interface Reporter { [k: string]: any }

/**
 * Lightweight diagnostic reporter.
 * Enable with env DIAG_REPORTER=1 to see lifecycle timing + slow phase detection.
 */
export default class DiagnosticReporter implements Reporter {
  private startTime = 0;
  private suiteStart = new Map<string, number>();
  private testStart = new Map<string, number>();

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    // eslint-disable-next-line no-console
    console.log(`🧪 [diag] Test run start. Total tests: ${suite.allTests().length}`);
  }

  onTestBegin(test: TestCase) {
    const id = test.id;
    this.testStart.set(id, Date.now());
    // eslint-disable-next-line no-console
    console.log(`▶️  [diag] START ${test.titlePath().join(' › ')}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const id = test.id;
    const started = this.testStart.get(id) || Date.now();
    const dur = Date.now() - started;
    const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    const slow = dur > 10000 ? ' 🐢' : '';
    // eslint-disable-next-line no-console
    console.log(`${statusIcon} [diag] END ${test.title} (${dur}ms)${slow}`);
    if (result.status !== 'passed' && result.errors?.length) {
      result.errors.forEach((e: any, idx: number) => {
        // eslint-disable-next-line no-console
        console.error(`   ↳ error[${idx}] ${e.message}`);
      });
    }
  }

  onEnd() {
    const dur = Date.now() - this.startTime;
    // eslint-disable-next-line no-console
    console.log(`🏁 [diag] Run complete in ${dur}ms`);
  }
}
