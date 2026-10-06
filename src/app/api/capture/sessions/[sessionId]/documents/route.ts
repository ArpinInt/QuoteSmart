import { getBackend, relay, unreachable } from '@/services/capture/backend';

export async function POST(
  request: Request,
  ctx: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  const { base, key } = getBackend();
  if (!key) return new Response(null, { status: 204 });
  const { sessionId } = await ctx.params;
  const form = await request.formData();
  try {
    const upstream = await fetch(`${base}/api/v1/sessions/${sessionId}/documents/`, {
      method: 'POST',
      headers: { 'X-API-Key': key }, // do NOT set Content-Type; fetch sets the multipart boundary
      body: form,
    });
    return relay(upstream);
  } catch {
    return unreachable();
  }
}
