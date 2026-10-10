/* Configured owner backend only. Success requires a durable server record, never just email. */
const RequestClient = (() => {
  const endpoint=typeof window!=='undefined'&&typeof window.PT_REQUEST_ENDPOINT==='string'?window.PT_REQUEST_ENDPOINT:'';
  const valid=url=>/^\/api\/[a-zA-Z0-9/_-]+\.php$/.test(url)||/^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?\/api\/[a-zA-Z0-9/_-]+\.php$/.test(url);
  const configured=Boolean(endpoint&&valid(endpoint)&&(!endpoint.startsWith('/')||!/(^|\.)github\.io$/i.test(location.hostname)));
  async function call(url,options={}){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),options.timeoutMs??20000);
    try{const headers={'Accept':'application/json'};if(options.payload)headers['Content-Type']='application/json';if(options.token)headers.Authorization='Bearer '+options.token;
      const response=await(options.fetch??fetch)(url,{method:options.payload?'POST':'GET',credentials:'omit',signal:controller.signal,headers,...(options.payload?{body:JSON.stringify(options.payload)}:{})});
      if(!response.ok)throw new Error(response.status===401?'SIGN_IN_REQUIRED':'SERVER_ERROR');return await response.json();
    }finally{clearTimeout(timer);}
  }
  async function send(payload,options={}){
    const url=options.endpoint??endpoint;if(!url)throw new Error('NEEDS_ENDPOINT');if(!valid(url)||url!==endpoint)throw new Error('INVALID_ENDPOINT');
    const result=await call(url,{...options,payload});
    if(!result||result.accepted!==true||result.persisted!==true||result.requestId!==payload.requestId||!['sent','queued','sending','unknown'].includes(result.notification)||typeof result.createdAt!=='string')throw new Error('NOT_CONFIRMED');
    return result;
  }
  async function history(token){if(!configured||!token)throw new Error('NEEDS_ENDPOINT');const result=await call(endpoint.replace(/\/[^/]+\.php$/,'/orders.php'),{token});if(!Array.isArray(result?.orders))throw new Error('NOT_CONFIRMED');return result.orders;}
  return {configured,send,history};
})();
if(typeof module!=='undefined')module.exports=RequestClient;
