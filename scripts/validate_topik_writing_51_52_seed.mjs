import { readSeedSource, validateSeedSource } from './topikWriting5152Seed.mjs';

const report = validateSeedSource(readSeedSource());
console.log(JSON.stringify(report.counts, null, 2));
if (report.issues.length) {
  console.error(report.issues.join('\n'));
  process.exitCode = 1;
}
