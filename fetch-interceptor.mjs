const originalFetch = globalThis.fetch;
globalThis.fetch = async function(url, options) {
  if (url.toString().includes('portal.qwen.ai') || url.toString().includes('qwen.ai/api')) {
    console.error("\n===== FETCH =====");
    console.error("URL:", url);
    console.error("Method:", options?.method || "GET");
    console.error("Headers:", JSON.stringify(options?.headers || {}, null, 2));
    if (options?.body && typeof options.body === 'string') {
      console.error("Body:", options.body.substring(0, 3000));
    }
    console.error("=================\n");
  }
  return originalFetch.call(this, url, options);
};
