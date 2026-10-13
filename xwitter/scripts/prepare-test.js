import { rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const file=path.resolve('data/xwitter.test.db');
mkdirSync(path.dirname(file),{recursive:true});
for(const ending of ['', '-shm', '-wal'])rmSync(file+ending,{force:true});
process.env.DB_PATH=file;
await import('../src/seed.js');
