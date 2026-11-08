import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { TestInfo } from "@playwright/test";

/**
 * Test artifact output (M3.1-R).
 *
 * Every file a spec produces goes to `testInfo.outputPath(...)`, which Playwright makes unique per
 * test, retry and worker, so no two tests (or parallel workers) ever write the same path.
 *
 * The committed review samples under `docs/samples/` are NOT rewritten by normal test runs any more.
 * Refresh them deliberately with `UPDATE_SAMPLES=1 npm run test:admin`.
 */
export const updateSamples = process.env.UPDATE_SAMPLES === "1";

// Windows can briefly hold a just-written file (indexer, antivirus, an open preview). These codes are
// transient; anything else is a real failure and is rethrown immediately.
const TRANSIENT = new Set(["EBUSY", "EPERM", "EACCES", "UNKNOWN", "EMFILE"]);
async function retrying<T>(action: () => Promise<T>, attempts = 5): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try { return await action(); } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? "";
      if (!TRANSIENT.has(code) || attempt >= attempts) throw error;
      await new Promise(resolve => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }
}

/**
 * Save a test artifact under the test's own output directory.
 * `relative` mirrors the docs/samples layout (e.g. "payment-history/UMRAH-invoice.pdf");
 * with `{ sample: true }` and UPDATE_SAMPLES=1 the file is also copied to docs/samples/<relative>.
 */
export async function saveArtifact(testInfo: TestInfo, relative: string, data: Uint8Array | string, options: { sample?: boolean } = {}) {
  const target = testInfo.outputPath(relative);
  await mkdir(dirname(target), { recursive: true });
  await retrying(() => writeFile(target, data));
  if (options.sample && updateSamples) {
    const sample = join("docs", "samples", relative);
    await mkdir(dirname(sample), { recursive: true });
    await retrying(() => copyFile(target, sample));
  }
  return target;
}
