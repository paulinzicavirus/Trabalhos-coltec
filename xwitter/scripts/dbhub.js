import { spawn } from 'node:child_process';
import path from 'node:path';
const entry=path.resolve('node_modules/@bytebase/dbhub/dist/index.js');
const db=path.resolve(process.env.DB_PATH||'./data/xwitter.test.db').replaceAll('\\','/');
const dsn='sqlite:///'+db.replace(/^\//,'');
const child=spawn(process.execPath,[entry,'--transport','stdio','--dsn',dsn],{stdio:'inherit'});
child.on('exit',(code)=>process.exit(code||0));
