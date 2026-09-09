/**
 * POST /api/quote-notify — emails the site owner when a visitor submits a quote
 * or contact request. The browser has already written the request to Firestore,
 * so this is best-effort: it returns 200 unless the body is malformed, and does
 * nothing when the Resend env vars are absent.
 *
 * Set in Cloudflare (Workers & Pages -> your project -> Settings -> Variables):
 *   RESEND_API_KEY    - API key from https://resend.com
 *   QUOTE_NOTIFY_TO   - where to send notifications, e.g. sales@mindalnoor.com
 *   QUOTE_NOTIFY_FROM - a verified Resend sender, e.g. "Mind Alnoor <site@mindalnoor.com>"
 */

export interface QuoteNotifyEnv {
  RESEND_API_KEY?: string;
  QUOTE_NOTIFY_TO?: string;
  QUOTE_NOTIFY_FROM?: string;
}

interface QuotePayload {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  message?: string;
  source?: string;
  products?: { id: string; name: string }[];
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

export async function handleQuoteNotify(
  request: Request,
  env: QuoteNotifyEnv,
): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405);
  }

  let payload: QuotePayload;
  try {
    payload = (await request.json()) as QuotePayload;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  if (!payload || typeof payload.email !== 'string' || typeof payload.name !== 'string') {
    return json({ ok: false, error: 'missing_fields' }, 400);
  }

  if (!env.RESEND_API_KEY || !env.QUOTE_NOTIFY_TO || !env.QUOTE_NOTIFY_FROM) {
    return json({ ok: true, emailed: false });
  }

  const products = (payload.products ?? []).map((p) => p.name).join(', ') || '—';
  const rows: [string, string][] = [
    ['Name', payload.name ?? ''],
    ['Email', payload.email ?? ''],
    ['Phone', payload.phone ?? ''],
    ['Organization', payload.organization ?? ''],
    ['Products', products],
    ['Source', payload.source ?? ''],
    ['Message', payload.message ?? ''],
  ];

  const html = `
    <h2>New quote request</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="color:#64748b"><strong>${k}</strong></td><td>${escapeHtml(v || '—')}</td></tr>`,
        )
        .join('')}
    </table>
    <p style="color:#94a3b8;font-size:12px">Request ID: ${escapeHtml(payload.id ?? 'n/a')}</p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.QUOTE_NOTIFY_FROM,
        to: [env.QUOTE_NOTIFY_TO],
        reply_to: payload.email,
        subject: `Quote request from ${payload.name}${
          payload.organization ? ` (${payload.organization})` : ''
        }`,
        html,
      }),
    });
    return json({ ok: true, emailed: res.ok, status: res.status });
  } catch {
    return json({ ok: true, emailed: false });
  }
}
