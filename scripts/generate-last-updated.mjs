// Builds src/data/lastUpdated.generated.json: route -> ISO date of the most
// recent commit that touched that .mdx file. Deliberately git-log-based, not
// filesystem mtime -- a fresh clone/CI checkout resets every file's mtime to
// checkout time, which would make every page show the same "last updated"
// date. `git log --name-only` walks history newest-first, so the first
// commit seen touching a given file IS its most recent touch; one process
// walking the whole history once is also far cheaper than one `git log`
// invocation per file (208 files, at the time of writing).
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'src', 'data', 'lastUpdated.generated.json');

// -c safe.directory='*' -- CI checks out the repo as one user and runs git
// as another (GitHub Actions' container UID mismatch), which git treats as
// a "dubious ownership" security risk and refuses by default. Scoped
// inline to this one invocation, not a global/system git config change.
const raw = execSync('git -c safe.directory=\'*\' log --format="C:%H|%aI" --name-only -- src/content/docs/', {
  cwd: root,
  maxBuffer: 1024 * 1024 * 64,
}).toString();

const lastUpdated = {};
let currentDate = null;

for (const line of raw.split('\n')) {
  if (line.startsWith('C:')) {
    currentDate = line.slice(2).split('|')[1];
    continue;
  }
  const path = line.trim();
  if (!path.endsWith('.mdx') || !currentDate) continue;

  const rel = path.replace(/^src\/content\/docs\//, '').replace(/\.mdx$/, '');
  const route = `/docs/${rel}`;
  if (!(route in lastUpdated)) lastUpdated[route] = currentDate; // first occurrence = most recent (newest-first log)
}

writeFileSync(output, JSON.stringify(lastUpdated, null, 2) + '\n');
console.log(`generate-last-updated: wrote ${Object.keys(lastUpdated).length} routes to src/data/lastUpdated.generated.json`);
