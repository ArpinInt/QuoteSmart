import { describe, it, expect } from 'vitest';
import { buildQuoteDataPayload } from './buildQuoteDataPayload';
import { QuoteData } from '@/types/quote';

function quote(overrides: Partial<QuoteData>): QuoteData {
  return {
    id: 'q',
    companyName: 'C',
    baseCost: null,
    serviceItems: [],
    shipmentWeight: null,
    shipmentVolume: null,
    transitTimeMin: null,
    transitTimeMax: null,
    insurancePercentage: null,
    ...overrides,
  };
}

describe('buildQuoteDataPayload', () => {
  it('includes the full quotes + calculations losslessly', () => {
    const quotes = [quote({ id: 'arpin-quote', baseCost: 100 })];
    const calc = { 'arpin-quote': { totalCost: 100, pricePerPound: null, pricePerCubicFoot: null } };
    const out = buildQuoteDataPayload(quotes, calc);
    expect(out.quotes).toEqual(quotes);
    expect(out.calculations).toEqual(calc);
  });

  it('surfaces the Arpin quote figures as top-level typed columns the backend understands', () => {
    const arpinServices = [{ id: 'x', name: 'X', subtext: '', included: true, cost: 10 }];
    const quotes = [
      quote({
        id: 'arpin-quote',
        baseCost: 32445,
        shipmentWeight: 14805,
        shipmentVolume: 2277.69,
        insurancePercentage: 2,
        transitTimeMin: 5,
        transitTimeMax: 7,
        serviceItems: arpinServices,
      }),
      quote({ id: 'quote-1', baseCost: 19575 }),
    ];
    const out = buildQuoteDataPayload(quotes, {});
    expect(out.base_cost).toBe(32445);
    expect(out.shipment_weight).toBe(14805);
    expect(out.shipment_volume).toBe(2277.69);
    expect(out.insurance).toBe(2);
    expect(out.transit_time).toBe('5-7 days');
    expect(out.service_line_items).toEqual(arpinServices);
  });

  it('formats a single-bound transit time', () => {
    const out = buildQuoteDataPayload([quote({ id: 'arpin-quote', transitTimeMin: 6 })], {});
    expect(out.transit_time).toBe('6 days');
  });

  it('emits null/empty typed columns when the Arpin figures are absent', () => {
    const out = buildQuoteDataPayload([quote({ id: 'arpin-quote' })], {});
    expect(out.base_cost).toBeNull();
    expect(out.shipment_weight).toBeNull();
    expect(out.transit_time).toBe('');
  });

  it('falls back to the first quote when there is no explicit Arpin quote', () => {
    const out = buildQuoteDataPayload([quote({ id: 'quote-1', baseCost: 500 })], {});
    expect(out.base_cost).toBe(500);
  });
});
