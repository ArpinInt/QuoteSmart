'use client';

import { useCallback, useEffect, useRef } from 'react';
import { QuoteData, CalculatedMetrics } from '@/types/quote';
import { createSession, saveQuoteData, uploadDocument } from '@/services/capture';
import { isEmptyComparison } from '@/services/capture/isEmptyComparison';
import { buildQuoteDataPayload } from '@/services/capture/buildQuoteDataPayload';

const DEBOUNCE_MS = 1500;

export function useSessionCapture(): {
  capture: (quotes: QuoteData[], calculations: Record<string, CalculatedMetrics>) => void;
  captureDocument: (file: File) => void;
} {
  const sessionIdRef = useRef<string | null>(null);
  const creatingRef = useRef<Promise<string | null> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lazily create a session exactly once. If creation fails (returns null),
  // creatingRef is cleared so a later call retries — capture self-heals.
  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (sessionIdRef.current) return sessionIdRef.current;
    if (!creatingRef.current) {
      creatingRef.current = createSession().then((id) => {
        sessionIdRef.current = id;
        creatingRef.current = null;
        return id;
      });
    }
    return creatingRef.current;
  }, []);

  const capture = useCallback(
    (quotes: QuoteData[], calculations: Record<string, CalculatedMetrics>) => {
      if (isEmptyComparison(quotes)) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const id = await ensureSession();
        if (!id) return;
        await saveQuoteData(id, buildQuoteDataPayload(quotes, calculations));
      }, DEBOUNCE_MS);
    },
    [ensureSession],
  );

  const captureDocument = useCallback(
    async (file: File) => {
      const id = await ensureSession();
      if (!id) return;
      await uploadDocument(id, file);
    },
    [ensureSession],
  );

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { capture, captureDocument };
}
