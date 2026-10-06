import { getBackend, relay, unreachable, forwardedClientHeaders } from '@/services/capture/backend';

export async function POST(request: Request): Promise<Response> {
  const { base, key } = getBackend();
  if (!key) return new Response(null, { status: 204 });
  try {
    const upstream = await fetch(`${base}/api/v1/sessions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
        ...forwardedClientHeaders(request),
      },
      body: '{}',
    });
    return relay(upstream);
  } catch {
    return unreachable();
  }
}
