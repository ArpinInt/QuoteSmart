/** Server-only helpers shared by the /api/capture/* Route Handlers. */

export function getBackend(): { base: string; key: string } {
  return {
    base: process.env.BACKEND_API_URL || 'http://127.0.0.1:8000',
    key: process.env.CAPTURE_API_KEY || '',
  };
}

/** Mirror an upstream backend response, passing through the headers that matter. */
export async function relay(upstream: Response): Promise<Response> {
  const headers = new Headers();
  const ct = upstream.headers.get('content-type');
  if (ct) headers.set('content-type', ct);
  const ra = upstream.headers.get('retry-after');
  if (ra) headers.set('retry-after', ra);
  const body = await upstream.text();
  return new Response(body || null, { status: upstream.status, headers });
}

/**
 * Headers that carry the real end-user's identity to the backend. The backend
 * captures IP/user-agent server-side on session create; since we proxy
 * server-side, we must relay the original browser's `User-Agent` and the client
 * IP via `X-Forwarded-For` (the backend trusts the first XFF hop), otherwise it
 * would record this Next.js server instead of the user.
 */
export function forwardedClientHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const ua = request.headers.get('user-agent');
  if (ua) headers['User-Agent'] = ua;
  const xff = request.headers.get('x-forwarded-for');
  if (xff) headers['X-Forwarded-For'] = xff;
  return headers;
}

export function unreachable(): Response {
  return new Response(JSON.stringify({ error: 'capture_unreachable' }), {
    status: 502,
    headers: { 'content-type': 'application/json' },
  });
}
