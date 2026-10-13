// Verificação MCP real: inicializa e utiliza dois servidores locais no runner.
import {spawn} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const root=process.cwd();
const shell=process.platform==='win32'?'npm.cmd':'npm';
const output={at:new Date().toISOString(),servers:{}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
class Rpc{
 constructor(name){this.name=name;this.num=0;this.pending=new Map();this.buffer='';this.stderr='';
  this.proc=spawn(shell,['run','--silent',name],{cwd:root,stdio:['pipe','pipe','pipe']});
  this.proc.stdout.on('data',b=>{this.buffer+=b.toString();let n;while((n=this.buffer.indexOf('\n'))>=0){const line=this.buffer.slice(0,n).trim();this.buffer=this.buffer.slice(n+1);if(!line)continue;let obj;try{obj=JSON.parse(line)}catch{continue}const slot=this.pending.get(obj.id);if(slot){clearTimeout(slot.timer);this.pending.delete(obj.id);obj.error?slot.reject(Error(JSON.stringify(obj.error))):slot.resolve(obj.result);}}});
  this.proc.stderr.on('data',b=>{this.stderr+=(b.toString().slice(0,500));});
  this.proc.on('exit',code=>{for(const slot of this.pending.values()){clearTimeout(slot.timer);slot.reject(Error(name+' encerrou ('+code+'): '+this.stderr.slice(-250))) }this.pending.clear()});
 }
 send(x){this.proc.stdin.write(JSON.stringify({jsonrpc:'2.0',...x})+'\n');}
 request(method,params={}){return new Promise((resolve,reject)=>{const id=++this.num;const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('MCP timeout '+this.name+': '+method))},30000);this.pending.set(id,{resolve,reject,timer});this.send({id,method,params});});}
 async connect(){const init=await this.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'xwitter-ci',version:'1.0'}});this.send({method:'notifications/initialized'});return init}
 close(){this.proc.kill('SIGTERM')}
}
const db=new Rpc('mcp:dbhub');const pw=new Rpc('mcp:playwright');
try{
 const dbHello=await db.connect();const dbList=await db.request('tools/list');
 const dbTools=dbList.tools||[];const sqlTool=dbTools.find(t=>/execute_sql/i.test(t.name));
 if(!sqlTool)throw Error('DBHub não disponibilizou execute_sql');
 const sqlArgNames=Object.keys(sqlTool.inputSchema?.properties||{});
 const scenarios=[{sql:'SELECT COUNT(*) AS total FROM Users'},{sql:'SELECT COUNT(*) AS total FROM Users',source:'default'},{sql:'SELECT COUNT(*) AS total FROM Users',source_id:'default'}];
 let dbResult;for(const args of scenarios){try{const result=await db.request('tools/call',{name:sqlTool.name,arguments:args});if(!result?.isError){dbResult=result;break}}catch{}}
 if(!dbResult)throw Error('Não foi possível consultar Users pelo DBHub');
 output.servers.dbhub={initialized:!!dbHello,tool:sqlTool.name,parameterNames:sqlArgNames,queryOk:!dbResult.isError,response:JSON.stringify(dbResult).slice(0,850)};
 const server=spawn(process.execPath,['src/app.js'],{cwd:root,env:{...process.env,PORT:'3002',DB_PATH:'./data/xwitter.test.db',SESSION_SECRET:'MCP_TEST_SECRET_123456789abcdef'}});try{
  let ready=false;for(let i=0;i<35;i++){try{if((await fetch('http://127.0.0.1:3002/feed')).ok){ready=true;break}}catch{}await wait(350)}if(!ready)throw Error('Aplicação não iniciou para MCP');
  const pwHello=await pw.connect();const pwList=await pw.request('tools/list');const tools=pwList.tools||[];
  const nav=tools.find(t=>/browser_navigate$/.test(t.name));if(!nav)throw Error('Playwright MCP sem browser_navigate');
  const r=await pw.request('tools/call',{name:nav.name,arguments:{url:'http://127.0.0.1:3002/login'}});if(r?.isError)throw Error('browser_navigate falhou: '+JSON.stringify(r).slice(0,300));
  const screenshot=tools.find(t=>/browser_take_screenshot$/.test(t.name));
  let fileCreated=false;
  if(screenshot){const shot=await pw.request('tools/call',{name:screenshot.name,arguments:{type:'png'}});if(!shot.isError){const img=shot.content?.find(x=>x.type==='image'&&x.data);if(img){mkdirSync('evidence/mcp',{recursive:true});writeFileSync('evidence/mcp/playwright-login.png',Buffer.from(img.data,'base64'));fileCreated=true;}}}
  output.servers.playwright={initialized:!!pwHello,navTool:nav.name,navigateOk:true,screenshot: fileCreated,availableTools:tools.length};
 }finally{server.kill('SIGTERM')}
 mkdirSync('evidence/mcp',{recursive:true});writeFileSync('evidence/mcp/results.json',JSON.stringify(output,null,2));
 console.log('MCP concluído:',JSON.stringify({dbhub:output.servers.dbhub.queryOk,playwright:output.servers.playwright.navigateOk,screenshot:output.servers.playwright.screenshot}));
}finally{db.close();pw.close()}
