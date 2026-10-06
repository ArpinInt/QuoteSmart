import { describe, it, expect } from 'vitest';
import { isEmptyComparison } from './isEmptyComparison';
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

describe('isEmptyComparison', () => {
  it('is true for the default all-null state', () => {
    expect(isEmptyComparison([emptyQuote('arpin-quote'), emptyQuote('quote-1')])).toBe(true);
  });

  it('is false when a base cost is set', () => {
    const q = emptyQuote('quote-1');
    q.baseCost = 1000;
    expect(isEmptyComparison([emptyQuote('arpin-quote'), q])).toBe(false);
  });

  it('is false when a service is included', () => {
    const q = emptyQuote('quote-1');
    q.serviceItems[0].included = true;
    expect(isEmptyComparison([q])).toBe(false);
  });

  it('is false when a service has a cost', () => {
    const q = emptyQuote('quote-1');
    q.serviceItems[0].cost = 50;
    expect(isEmptyComparison([q])).toBe(false);
  });

  it('is false when shipment/transit/insurance data is present', () => {
    const q = emptyQuote('quote-1');
    q.shipmentWeight = 500;
    expect(isEmptyComparison([q])).toBe(false);
  });

  it('is false when an other-cost entry exists', () => {
    const q = emptyQuote('quote-1');
    q.other = [{ key: 'x', label: 'X', description: '', value: 10 }];
    expect(isEmptyComparison([q])).toBe(false);
  });
});
