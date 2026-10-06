import { describe, it, expect, vi, afterEach } from 'vitest';
import { getBackend, relay, unreachable, forwardedClientHeaders } from './backend';

afterEach(() => vi.unstubAllEnvs());

describe('getBackend', () => {
  it('falls back to localhost + empty key', () => {
    vi.stubEnv('BACKEND_API_URL', '');
    vi.stubEnv('CAPTURE_API_KEY', '');
    expect(getBackend()).toEqual({ base: 'http://127.0.0.1:8000', key: '' });
  });

  it('reads configured values', () => {
    vi.stubEnv('BACKEND_API_URL', 'http://backend.test');
    vi.stubEnv('CAPTURE_API_KEY', 'secret');
    expect(getBackend()).toEqual({ base: 'http://backend.test', key: 'secret' });
  });
});

describe('relay', () => {
  it('mirrors status and passes through content-type and retry-after', async () => {
    const upstream = new Response('{"ok":true}', {
      status: 429,
      headers: { 'content-type': 'application/json', 'retry-after': '30' },
    });
    const res = await relay(upstream);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('30');
    expect(await res.text()).toBe('{"ok":true}');
  });
});

describe('forwardedClientHeaders', () => {
  it('relays User-Agent and X-Forwarded-For when present', () => {
    const req = new Request('http://local/api/capture/sessions', {
      method: 'POST',
      headers: { 'user-agent': 'Mozilla/5.0 (Test Browser)', 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
    });
    expect(forwardedClientHeaders(req)).toEqual({
      'User-Agent': 'Mozilla/5.0 (Test Browser)',
      'X-Forwarded-For': '203.0.113.9, 10.0.0.1',
    });
  });

  it('omits headers that are absent', () => {
    const req = new Request('http://local/api/capture/sessions', { method: 'POST' });
    const h = forwardedClientHeaders(req);
    expect(h['X-Forwarded-For']).toBeUndefined();
    // Note: fetch/undici may inject a default user-agent; only assert XFF is absent.
  });
});

describe('unreachable', () => {
  it('is a 502 JSON response', async () => {
    const res = unreachable();
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'capture_unreachable' });
  });
});
