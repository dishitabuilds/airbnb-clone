/**
 * Builds the submission archive.
 *
 * Includes source, agent/skill configs, docs and the architecture diagram.
 * Excludes node_modules, build output, git history, the reference capture
 * (measurement data, not code) and local QA artefacts.
 *
 * Run: node scripts/package.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const NAME = 'airbnb-clone-submission';
const STAGE = path.join(ROOT, '.package', NAME);
const ZIP = path.join(ROOT, `${NAME}.zip`);

const EXCLUDE = new Set([
  'node_modules', '.next', '.git', '.reference', '.package',
  'qa-output', 'dev.log', 'out', '.vercel', `${NAME}.zip`,
]);

function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    if (entry.name.endsWith('.tsbuildinfo')) continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copy(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

fs.rmSync(path.join(ROOT, '.package'), { recursive: true, force: true });
fs.rmSync(ZIP, { force: true });
copy(ROOT, STAGE);

// Sanity: the deliverables the brief asks for must actually be in the bundle.
const required = [
  'README.md',
  'docs/PROMPTS.md',
  'docs/architecture.png',
  'docs/architecture.pdf',
  'docs/architecture.html',
  '.claude/agents/pixel-builder.md',
  '.claude/agents/interaction-a11y.md',
  '.claude/agents/visual-qa.md',
  '.claude/agents/code-quality.md',
  '.claude/skills/clone-fidelity/SKILL.md',
  'src/app/page.tsx',
  'public/assets/fonts/AirbnbCerealVF.woff2',
];
const missing = required.filter((f) => !fs.existsSync(path.join(STAGE, f)));
if (missing.length) {
  console.error('MISSING from archive:\n  ' + missing.join('\n  '));
  process.exit(1);
}

// Windows PowerShell's Compress-Archive writes backslash path separators, which the ZIP
// spec forbids (APPNOTE 4.4.17.1). Windows tolerates it; on macOS and Linux every entry
// then extracts as one flat file with literal backslashes in its name. bsdtar ships with
// Windows 10+, macOS and most Linux distros, and writes separators correctly.
const TAR = process.platform === 'win32'
  ? path.join(process.env.SystemRoot || 'C:\Windows', 'System32', 'tar.exe')
  : 'tar';

execFileSync(TAR, ['-a', '-c', '-f', ZIP, '-C', path.dirname(STAGE), NAME], {
  stdio: 'inherit',
});

fs.rmSync(path.join(ROOT, '.package'), { recursive: true, force: true });

const count = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true, recursive: true }).filter((e) => e.isFile()).length;
console.log(`\nwrote ${path.basename(ZIP)}  (${(fs.statSync(ZIP).size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`all ${required.length} required deliverables present`);
void count;
