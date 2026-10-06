import { describe, it, expect, vi, afterEach } from 'vitest';
import { POST } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function req(headers?: Record<string, string>): Request {
  return new Request('http://local/api/capture/sessions', { method: 'POST', headers });
}

describe('POST /api/capture/sessions', () => {
  it('returns 204 when no API key is configured', async () => {
    vi.stubEnv('CAPTURE_API_KEY', '');
    const res = await POST(req());
    expect(res.status).toBe(204);
  });

  it('forwards to the backend with X-API-Key and mirrors the session_id', async () => {
    vi.stubEnv('CAPTURE_API_KEY', 'secret');
    vi.stubEnv('BACKEND_API_URL', 'http://backend.test');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ session_id: 'abc' }), { status: 201, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(req());

    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend.test/api/v1/sessions/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-API-Key': 'secret' }),
      }),
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ session_id: 'abc' });
  });

  it("relays the browser's User-Agent and client IP so the backend records the real user", async () => {
    vi.stubEnv('CAPTURE_API_KEY', 'secret');
    vi.stubEnv('BACKEND_API_URL', 'http://backend.test');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ session_id: 'abc' }), { status: 201, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await POST(req({ 'user-agent': 'Mozilla/5.0 (RealBrowser)', 'x-forwarded-for': '203.0.113.9' }));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend.test/api/v1/sessions/',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-API-Key': 'secret',
          'User-Agent': 'Mozilla/5.0 (RealBrowser)',
          'X-Forwarded-For': '203.0.113.9',
        }),
      }),
    );
  });

  it('returns 502 when the backend is unreachable', async () => {
    vi.stubEnv('CAPTURE_API_KEY', 'secret');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const res = await POST(req());
    expect(res.status).toBe(502);
  });
});
