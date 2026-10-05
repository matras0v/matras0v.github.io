const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../../request-client.js'),'utf8');
const get=(endpoint='',hostname='production.example')=>{const c={window:{PT_REQUEST_ENDPOINT:endpoint},location:{hostname},module:{exports:{}},AbortController,setTimeout,clearTimeout};vm.createContext(c);vm.runInContext(source,c);return c.module.exports;};
(async()=>{
 const p={requestId:'11111111-1111-4111-8111-111111111111'},url='/api/request.php',client=get(url);
 assert.equal(client.configured,true);assert.equal(get().configured,false);assert.equal(get(url,'matras0v.github.io').configured,false);assert.equal(get('https://evil.invalid/api').configured,false);
 await assert.rejects(get().send(p),/NEEDS_ENDPOINT/);
 await assert.rejects(client.send(p,{endpoint:'https://evil.invalid'}),/INVALID_ENDPOINT/);
 await assert.rejects(client.send(p,{fetch:async()=>({ok:false})}),/SERVER_ERROR/);
 for(const response of [{accepted:true,requestId:p.requestId},{accepted:false,requestId:p.requestId},{accepted:true,requestId:'other',delivery:'mail_transport_accepted'}]){
  await assert.rejects(client.send(p,{fetch:async()=>({ok:true,json:async()=>response})}),/NOT_CONFIRMED/);
 }
 let captured;const result=await client.send(p,{fetch:async(u,o)=>{captured={u,o};return {ok:true,json:async()=>({accepted:true,requestId:p.requestId,delivery:'mail_transport_accepted'})};}});
 assert.equal(result.requestId,p.requestId);assert.equal(captured.u,url);assert.equal(captured.o.credentials,'same-origin');assert.deepEqual(JSON.parse(captured.o.body),p);
 await assert.rejects(client.send(p,{timeoutMs:1,fetch:(u,o)=>new Promise((resolve,reject)=>o.signal.addEventListener('abort',()=>reject(new Error('ABORT'))))}),/ABORT/);
 console.log('PASS: shared client config, Pages fallback, status/identity contract, same-origin POST, abort');
})();
