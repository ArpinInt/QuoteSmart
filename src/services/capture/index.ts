/**
 * Client-side capture service. Talks only to same-origin /api/capture/* Route
 * Handlers (which hold the backend key server-side). Every call is
 * fire-and-forget: failures resolve to null/void, never throw.
 */

export async function createSession(): Promise<string | null> {
  try {
    const res = await fetch('/api/capture/sessions', { method: 'POST' });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.session_id ?? null;
  } catch {
    return null;
  }
}

export async function saveQuoteData(sessionId: string, quoteData: unknown): Promise<void> {
  try {
    await fetch(`/api/capture/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote_data: quoteData }),
    });
  } catch {
    /* fire-and-forget */
  }
}

export async function uploadDocument(sessionId: string, file: File): Promise<void> {
  try {
    const form = new FormData();
    form.append('file', file);
    await fetch(`/api/capture/sessions/${sessionId}/documents`, { method: 'POST', body: form });
  } catch {
    /* fire-and-forget */
  }
}
