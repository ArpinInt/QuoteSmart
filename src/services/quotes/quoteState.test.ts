import { describe, it, expect } from 'vitest';
import { isQuoteEmpty, getPopulatedQuotes } from './quoteState';
import { QuoteData, DEFAULT_SERVICE_ITEMS } from '@/types/quote';

function emptyQuote(id: string): QuoteData {
  return {
    id,
    companyName: id,
    baseCost: null,
    serviceItems: DEFAULT_SERVICE_ITEMS.map((i) => ({ ...i, included: false, cost: null })),
    shipmentWeight: null,
    shipmentVolume: null,
    transitTimeMin: null,
    transitTimeMax: null,
    insurancePercentage: null,
  };
}

describe('isQuoteEmpty', () => {
  it('is true for a freshly created column', () => {
    expect(isQuoteEmpty(emptyQuote('quote-2'))).toBe(true);
  });

  it('is true when only the company name was edited', () => {
    const q = emptyQuote('quote-2');
    q.companyName = 'Suddath';
    expect(isQuoteEmpty(q)).toBe(true);
  });

  it('is false when a base cost is set', () => {
    const q = emptyQuote('quote-2');
    q.baseCost = 1000;
    expect(isQuoteEmpty(q)).toBe(false);
  });

  it('is false when a service is included', () => {
    const q = emptyQuote('quote-2');
    q.serviceItems[0].included = true;
    expect(isQuoteEmpty(q)).toBe(false);
  });

  it('is false when a service has a cost', () => {
    const q = emptyQuote('quote-2');
    q.serviceItems[0].cost = 50;
    expect(isQuoteEmpty(q)).toBe(false);
  });

  it('is false when shipment, transit or insurance data is present', () => {
    const weight = emptyQuote('a');
    weight.shipmentWeight = 500;
    const transit = emptyQuote('b');
    transit.transitTimeMax = 30;
    const insurance = emptyQuote('c');
    insurance.insurancePercentage = 3;
    expect(isQuoteEmpty(weight)).toBe(false);
    expect(isQuoteEmpty(transit)).toBe(false);
    expect(isQuoteEmpty(insurance)).toBe(false);
  });

  it('is false when an other-cost entry exists', () => {
    const q = emptyQuote('quote-2');
    q.other = [{ key: 'x', label: 'X', description: '', value: 10 }];
    expect(isQuoteEmpty(q)).toBe(false);
  });
});

describe('getPopulatedQuotes', () => {
  it('drops empty competitor columns and keeps the original order', () => {
    const arpin = emptyQuote('arpin-quote');
    arpin.baseCost = 25824.2;
    const suddath = emptyQuote('quote-1');
    suddath.baseCost = 27967.27;
    const untouched = emptyQuote('quote-2');
    expect(getPopulatedQuotes([arpin, suddath, untouched]).map((q) => q.id)).toEqual([
      'arpin-quote',
      'quote-1',
    ]);
  });

  it('keeps a populated column even when it sits after empty ones', () => {
    const arpin = emptyQuote('arpin-quote');
    arpin.baseCost = 100;
    const empty = emptyQuote('quote-1');
    const later = emptyQuote('quote-2');
    later.baseCost = 200;
    expect(getPopulatedQuotes([arpin, empty, later]).map((q) => q.id)).toEqual([
      'arpin-quote',
      'quote-2',
    ]);
  });

  it('returns an empty list in the initial all-empty state', () => {
    expect(getPopulatedQuotes([emptyQuote('arpin-quote'), emptyQuote('quote-1')])).toEqual([]);
  });
});
