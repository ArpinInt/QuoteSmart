import { getBackend, relay, unreachable } from '@/services/capture/backend';

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  const { base, key } = getBackend();
  if (!key) return new Response(null, { status: 204 });
  const { sessionId } = await ctx.params;
  const body = await request.text();
  try {
    const upstream = await fetch(`${base}/api/v1/sessions/${sessionId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body,
    });
    return relay(upstream);
  } catch {
    return unreachable();
  }
}
