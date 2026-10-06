import { QuoteData } from '@/types/quote';

/**
 * True while a quote column carries no real data: nothing extracted, nothing typed.
 * The company name is not data (it is an editable label), so renaming an empty
 * column does not make it part of the comparison.
 */
export function isQuoteEmpty(q: QuoteData): boolean {
  return (
    q.baseCost === null &&
    q.shipmentWeight === null &&
    q.shipmentVolume === null &&
    q.transitTimeMin === null &&
    q.transitTimeMax === null &&
    q.insurancePercentage === null &&
    (!q.other || q.other.length === 0) &&
    q.serviceItems.every((s) => !s.included && s.cost === null)
  );
}

/**
 * The quotes that take part in the comparison: every column that has data.
 * Empty competitor columns (e.g. a second competitor that was never loaded)
 * are left out so the analysis compares only the quotes that exist.
 */
export function getPopulatedQuotes(quotes: QuoteData[]): QuoteData[] {
  return quotes.filter((q) => !isQuoteEmpty(q));
}
