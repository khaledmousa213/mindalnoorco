/**
 * Cloudflare Worker entry. Serves the built SPA from the ASSETS binding and
 * handles the one dynamic route, POST /api/quote-notify.
 */
import { handleQuoteNotify, type QuoteNotifyEnv } from './quote-notify';

interface Env extends QuoteNotifyEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/quote-notify') {
      return handleQuoteNotify(request, env);
    }

    // Everything else: static assets, with SPA fallback to index.html
    // (configured via assets.not_found_handling in wrangler.jsonc).
    return env.ASSETS.fetch(request);
  },
};
