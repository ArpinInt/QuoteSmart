import { describe, it, expect, vi, afterEach } from 'vitest';
import { createSession, saveQuoteData, uploadDocument } from './index';

afterEach(() => vi.unstubAllGlobals());

describe('createSession', () => {
  it('returns session_id from a 2xx JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ session_id: 'x1' }), { status: 201, headers: { 'content-type': 'application/json' } }),
    ));
    expect(await createSession()).toBe('x1');
  });

  it('returns null on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    expect(await createSession()).toBeNull();
  });

  it('returns null on a 204 no-op (capture disabled)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    expect(await createSession()).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    expect(await createSession()).toBeNull();
  });
});

describe('saveQuoteData', () => {
  it('PATCHes {quote_data} and never throws', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(saveQuoteData('s1', { a: 1 })).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/capture/sessions/s1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ quote_data: { a: 1 } }),
    }));
  });

  it('swallows fetch errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    await expect(saveQuoteData('s1', {})).resolves.toBeUndefined();
  });
});

describe('uploadDocument', () => {
  it('POSTs multipart FormData to the documents route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['x'], 'q.pdf', { type: 'application/pdf' });
    await uploadDocument('s1', file);
    expect(fetchMock).toHaveBeenCalledWith('/api/capture/sessions/s1/documents', expect.objectContaining({ method: 'POST' }));
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBeInstanceOf(FormData);
  });

  it('swallows fetch errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    const file = new File(['x'], 'q.pdf', { type: 'application/pdf' });
    await expect(uploadDocument('s1', file)).resolves.toBeUndefined();
  });
});
