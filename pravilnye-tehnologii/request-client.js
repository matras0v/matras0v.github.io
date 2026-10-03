/* Public configuration only. Set a same-origin /api/enquiries endpoint AFTER the
 * client approves hosting/processing and a real inbox receipt is verified.
 * Former FormSubmit integration was not verified and silently ignored failures.
 * Contract: POST JSON -> 2xx {accepted:true, requestId:string}, only after durable
 * server storage. Server must validate/reprice SKUs, rate-limit and deduplicate. */
const RequestClient = (() => {
  const endpoint = '';
  async function send(payload, options = {}) {
    const url = options.endpoint ?? endpoint;
    if (!url) throw new Error('NEEDS_ENDPOINT');
    if (!/^\/api\/[a-zA-Z0-9/_-]+$/.test(url)) throw new Error('INVALID_ENDPOINT');
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
      if (result.accepted !== true || typeof result.requestId !== 'string' || !result.requestId.trim()) throw new Error('NOT_CONFIRMED');
      return {requestId: result.requestId};
    } finally { clearTimeout(timer); }
  }
  return {configured: Boolean(endpoint), send};
})();
if (typeof module !== 'undefined') module.exports = RequestClient;
