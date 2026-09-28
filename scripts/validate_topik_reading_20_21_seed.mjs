import { readSeedSource, validateSeedSource } from './topikReading2021Seed.mjs';

const report = validateSeedSource(readSeedSource());
if (report.issues.length) throw new Error(report.issues.join('\n'));
console.log(JSON.stringify(report.counts, null, 2));
