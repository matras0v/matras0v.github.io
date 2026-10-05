/* Shared same-origin transport. accepted=true means mail transport handoff, not inbox receipt. */
const RequestClient = (() => {
  const endpoint = typeof window !== 'undefined' && typeof window.PT_REQUEST_ENDPOINT === 'string' ? window.PT_REQUEST_ENDPOINT : '';
  const endpointOK = url => /^\/api\/[a-zA-Z0-9/_-]+(?:\.php)?$/.test(url);
  const configured = Boolean(endpoint && endpointOK(endpoint) && !(typeof location !== 'undefined' && /(^|\.)github\.io$/i.test(location.hostname)));
  async function send(payload, options = {}) {
    const url = options.endpoint ?? endpoint;
    if (!url) throw new Error('NEEDS_ENDPOINT');
    if (!endpointOK(url)) throw new Error('INVALID_ENDPOINT');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
    try {
      const response = await (options.fetch ?? fetch)(url, {
        method: 'POST', credentials: 'same-origin', signal: controller.signal,
        headers: {'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('SERVER_ERROR');
      const result = await response.json();
      if (!result || result.accepted !== true || typeof result.requestId !== 'string' || result.requestId !== payload.requestId || result.delivery !== 'mail_transport_accepted') throw new Error('NOT_CONFIRMED');
      return {requestId: result.requestId};
    } finally { clearTimeout(timer); }
  }
  return {configured, send};
})();
if (typeof module !== 'undefined') module.exports = RequestClient;
