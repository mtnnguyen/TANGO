import { mkdir, cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out);
for (const name of ['index.html', 'public', 'src']) await cp(resolve(root,name), resolve(out,name), { recursive: true });
process.stdout.write('Built dependency-free static application in dist/\n');
