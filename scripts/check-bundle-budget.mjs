import { createGzip } from "node:zlib";
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";

const assetsDir = join(process.cwd(), "dist", "assets");
const reportPath = join(process.cwd(), "dist", "bundle-budget-report.json");
const BUDGET_LIMIT_KIB = 500;
const BUDGET_LIMIT_BYTES = BUDGET_LIMIT_KIB * 1024;

const budgets = [
  {
    name: "vendor-core",
    prefix: "vendor-core-",
    maxRawBytes: BUDGET_LIMIT_BYTES,
    maxGzipBytes: BUDGET_LIMIT_BYTES,
    required: true,
  },
  {
    name: "vendor-flow",
    prefix: "vendor-flow-",
    maxRawBytes: BUDGET_LIMIT_BYTES,
    maxGzipBytes: BUDGET_LIMIT_BYTES,
    required: true,
  },
  {
    name: "vendor-analytics",
    prefix: "vendor-analytics-",
    maxRawBytes: BUDGET_LIMIT_BYTES,
    maxGzipBytes: BUDGET_LIMIT_BYTES,
    required: true,
  },
  {
    name: "app-entry",
    prefix: "index-",
    maxRawBytes: BUDGET_LIMIT_BYTES,
    maxGzipBytes: BUDGET_LIMIT_BYTES,
    required: true,
  },
];

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
