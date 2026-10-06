import { QuoteData } from '@/types/quote';
import { isQuoteEmpty } from '@/services/quotes/quoteState';

/** True while no quote carries any real data yet (initial/reset state). */
export function isEmptyComparison(quotes: QuoteData[]): boolean {
  return quotes.every(isQuoteEmpty);
}
