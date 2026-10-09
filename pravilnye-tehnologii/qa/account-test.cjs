/* Offline boundary tests only. Not a claim of live Supabase verification. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('account.js','utf8');
for(const config of [{},{url:'https://example.supabase.co',publishableKey:'service_role_must_not_be_used'}]){
 let renders=0;const handlers={};const c={window:{PT_AUTH_CONFIG:config},URLSearchParams,URL,location:{hash:'#/account',search:'',href:'https://example.com/shop/#/account'},view:{},esc:s=>String(s).replace(/</g,'&lt;'),render:()=>renders++,document:{addEventListener:(type,fn)=>handlers[type]=fn}};
 vm.createContext(c);vm.runInContext(source,c,{importModuleDynamically:()=>{throw Error('Must not load authentication with missing/invalid public config');}});
 const html=c.view.account();assert(html.includes('Вход и регистрация пока не подключены'));assert(html.includes('<fieldset disabled>'));assert(!html.includes('data-account-action="save"'));assert(renders>0);
 handlers.click({target:{closest:selector=>selector==='[data-account-mode]'?{dataset:{accountMode:'register'}}:null}});assert(c.view.account().includes('Создать аккаунт'));
}
const fn=source.slice(source.indexOf('function validState'),source.indexOf('const callback'));
const c={P:[['one'],['two']]};vm.createContext(c);vm.runInContext(fn,c);
assert.deepEqual(JSON.parse(JSON.stringify(c.validState({cart:{0:2,1:-1,2:1,'__proto__':9},favorites:[0,0,9,'1']}))),{cart:{0:2},favorites:[0]});
assert.deepEqual(JSON.parse(JSON.stringify(c.validState({cart:{0:1000},favorites:{bad:true}}))),{cart:{},favorites:[]});
console.log('PASS: unconfigured/invalid auth remains disabled; no SDK load, tabs, cloud ID/quantity validation. Live auth/RLS needs external setup.');
