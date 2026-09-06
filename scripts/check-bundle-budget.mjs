import { createGzip } from "node:zlib";
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";

const assetsDir = join(process.cwd(), "dist", "assets");
const reportPath = join(process.cwd(), "dist", "bundle-budget-report.json");
const KIB = 1024;

// Per-chunk budgets tuned to realistic sizes with headroom, instead of a single flat
// limit (a flat raw==gzip limit made the gzip check dead — gzip is always < raw < limit).
// gzip is what users download, so it is the primary gate; raw guards parse cost.
const budgets = [
  // React + router + TanStack Query — loaded at first paint via the root provider.
  { name: "vendor-core", prefix: "vendor-core-", maxRawBytes: 300 * KIB, maxGzipBytes: 95 * KIB, required: true },
  // @xyflow/react — lazy, loads with enterprise/orders-live.
  { name: "vendor-flow", prefix: "vendor-flow-", maxRawBytes: 220 * KIB, maxGzipBytes: 75 * KIB, required: true },
  // lodash-es + date-fns + zod. Chart.js MUST NOT be here (see assertChartIsSplit). If it
  // regresses back into this chunk it jumps ~285KB/94KB and trips this budget.
  {
    name: "vendor-analytics",
    prefix: "vendor-analytics-",
    maxRawBytes: 150 * KIB,
    maxGzipBytes: 45 * KIB,
    required: true,
  },
  // App entry chunk.
  { name: "app-entry", prefix: "index-", maxRawBytes: 60 * KIB, maxGzipBytes: 20 * KIB, required: true },
];

// A signature that only appears in Chart.js's compiled controllers.
const CHART_SIGNATURE = /BarController|LineController/;

/**
 * Guard for optimization #1: Chart.js is dynamically imported and must live in its own
 * lazy chunk, never in an eagerly-loaded vendor chunk. Fails the build if the signature
 * leaks into vendor-core or vendor-analytics (which would mean the dynamic import was
 * collapsed back into an eager one by a manualChunks change).
 */
function assertChartIsSplit(jsFiles) {
  const eagerViolations = [];
  let chartChunk = null;

  for (const file of jsFiles) {
    const contents = readFileSync(join(assetsDir, file), "utf-8");
    if (!CHART_SIGNATURE.test(contents)) continue;

    if (file.startsWith("vendor-core-") || file.startsWith("vendor-analytics-")) {
      eagerViolations.push(`chart.js code found in eager chunk ${file} (it must be lazily split)`);
    } else {
      chartChunk = file;
    }
  }

  if (!chartChunk && eagerViolations.length === 0) {
    eagerViolations.push("no chunk containing chart.js was found (expected a lazy chart chunk)");
  }

  return eagerViolations;
}

async function gzipSize(filePath) {
  let total = 0;
  const counter = new (class extends Writable {
    _write(chunk, _encoding, callback) {
      total += chunk.length;
      callback();
    }
  })();

  await pipeline(createReadStream(filePath), createGzip(), counter);
  return total;
}

function formatBytes(value) {
  return `${(value / 1024).toFixed(2)} KiB`;
}

async function main() {
  if (!existsSync(assetsDir)) {
    console.error("Bundle assets not found. Run `npm run build` first.");
    process.exit(1);
  }

  const files = readdirSync(assetsDir).filter((file) => file.endsWith(".js"));
  const violations = [];
  const results = [];

  // Optimization guard: chart.js must remain lazily split.
  violations.push(...assertChartIsSplit(files));

  for (const budget of budgets) {
    const matched = files.find((file) => file.startsWith(budget.prefix));

    if (!matched) {
      if (budget.required) {
        violations.push(`${budget.name}: missing chunk with prefix ${budget.prefix}`);
      }
      continue;
    }

    const filePath = join(assetsDir, matched);
    const rawBytes = statSync(filePath).size;
    const gzipBytes = await gzipSize(filePath);

    const item = {
      chunk: matched,
      budget: budget.name,
      rawBytes,
      gzipBytes,
      maxRawBytes: budget.maxRawBytes,
      maxGzipBytes: budget.maxGzipBytes,
      rawOk: rawBytes <= budget.maxRawBytes,
      gzipOk: gzipBytes <= budget.maxGzipBytes,
    };

    results.push(item);

    if (!item.rawOk) {
      violations.push(
        `${budget.name}: raw size ${formatBytes(rawBytes)} exceeds limit ${formatBytes(budget.maxRawBytes)}`
      );
    }

    if (!item.gzipOk) {
      violations.push(
        `${budget.name}: gzip size ${formatBytes(gzipBytes)} exceeds limit ${formatBytes(budget.maxGzipBytes)}`
      );
    }
  }

  mkdirSync(join(process.cwd(), "dist"), { recursive: true });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        results,
        violations,
      },
      null,
      2
    )
  );

  if (violations.length > 0) {
    console.error("Bundle budget violations detected:\n");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  const summary = JSON.parse(readFileSync(reportPath, "utf-8"));
  console.log(`Bundle budgets passed. Report: ${reportPath}`);
  console.log(`Checked chunks: ${summary.results.length}`);
}

await main();
