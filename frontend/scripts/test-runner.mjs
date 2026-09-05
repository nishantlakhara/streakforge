import fs from 'node:fs';
import path from 'node:path';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { pathToFileURL } from 'node:url';

function findTestFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findTestFiles(full));
    } else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const testFiles = findTestFiles(path.resolve('./src'));

const stream = run({
  files: testFiles,
});

stream.compose(new spec()).pipe(process.stdout);

stream.on('test:fail', () => {
  process.exitCode = 1;
});
