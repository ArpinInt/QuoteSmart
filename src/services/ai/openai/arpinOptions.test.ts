import { describe, it, expect } from 'vitest';
import { normalizeArpinOptions } from './arpinOptions';
import {
  AdditionalArpinQuoteData,
  ExtractedQuoteData,
  ExtractedServiceItem,
  REQUIRED_SERVICE_ITEM_IDS,
} from '@/types/extraction';

function services(overrides: Partial<Record<ExtractedServiceItem['id'], Partial<ExtractedServiceItem>>> = {}) {
  return REQUIRED_SERVICE_ITEM_IDS.map((id) => ({ id, included: false, cost: null, ...overrides[id] }));
}

function option(overrides: Partial<AdditionalArpinQuoteData> = {}): AdditionalArpinQuoteData {
  return {
    companyName: 'Arpin',
    variantType: 'sea',
    baseCost: null,
    serviceItems: services(),
    shipmentWeight: null,
    shipmentVolume: null,
    transitTimeMin: null,
    transitTimeMax: null,
    insurancePercentage: null,
    quotedTotal: null,
    ...overrides,
  };
}

function arpinDocument(main: AdditionalArpinQuoteData, additional: AdditionalArpinQuoteData[] = []): ExtractedQuoteData {
  return {
    ...main,
    isArpinQuote: true,
    originalCurrency: 'USD',
    exchangeRate: null,
    additionalArpinQuotes: additional.length > 0 ? additional : undefined,
  };
}

describe('normalizeArpinOptions', () => {
  it("uses the option's quoted total as its cost and marks its priced lines as included", () => {
    const sea = option({
      baseCost: 8225,
      quotedTotal: 10307.7,
      serviceItems: services({
        crating: { included: false, cost: 387.2 },
        'origin-services': { included: true, cost: null },
      }),
      other: [{ key: 'elevator', label: 'Elevator at Origin', description: 'Elevator', value: 104 }],
    });

    const result = normalizeArpinOptions(arpinDocument(sea));

    expect(result.baseCost).toBe(10307.7);
    expect(result.serviceItems.find((s) => s.id === 'crating')).toEqual({ id: 'crating', included: true, cost: null });
    expect(result.serviceItems.find((s) => s.id === 'origin-services')?.included).toBe(true);
    expect(result.serviceItems.find((s) => s.id === 'shuttle-services')).toEqual({
      id: 'shuttle-services',
      included: false,
      cost: null,
    });
    expect(result.other).toBeUndefined();
  });

  it('keeps the extracted lines when the document states no total for the option', () => {
    const sea = option({
      baseCost: 8225,
      quotedTotal: null,
      serviceItems: services({ crating: { included: false, cost: 387.2 } }),
      other: [{ key: 'elevator', label: 'Elevator at Origin', description: 'Elevator', value: 104 }],
    });

    const result = normalizeArpinOptions(arpinDocument(sea));

    expect(result.baseCost).toBe(8225);
    expect(result.serviceItems.find((s) => s.id === 'crating')).toEqual({ id: 'crating', included: false, cost: 387.2 });
    expect(result.other).toHaveLength(1);
  });

  it('makes the container option the main quote and keeps the other options in document order', () => {
    const air = option({ variantType: 'air', quotedTotal: 9437.35 });
    const liftvans = option({ variantType: 'liftvan', quotedTotal: 7286.5 });
    const loose = option({ variantType: 'container', containerSizeFt: 20, quotedTotal: 10307.7 });

    const result = normalizeArpinOptions(arpinDocument(air, [liftvans, loose]));

    expect(result.variantType).toBe('container');
    expect(result.containerSizeFt).toBe(20);
    expect(result.baseCost).toBe(10307.7);
    expect(result.additionalArpinQuotes?.map((q) => [q.variantType, q.baseCost])).toEqual([
      ['air', 9437.35],
      ['liftvan', 7286.5],
    ]);
  });

  it('makes the larger container the main quote', () => {
    const small = option({ variantType: 'container', containerSizeFt: 20, quotedTotal: 10882.5 });
    const large = option({ variantType: 'container', containerSizeFt: 40, quotedTotal: 14475.93 });

    const result = normalizeArpinOptions(arpinDocument(small, [large]));

    expect(result.containerSizeFt).toBe(40);
    expect(result.baseCost).toBe(14475.93);
    expect(result.additionalArpinQuotes?.map((q) => q.containerSizeFt)).toEqual([20]);
  });

  it('prefers sea liftvans over air when there is no container option', () => {
    const air = option({ variantType: 'air', quotedTotal: 7030 });
    const liftvans = option({ variantType: 'liftvan', quotedTotal: 6040 });

    const result = normalizeArpinOptions(arpinDocument(air, [liftvans]));

    expect(result.variantType).toBe('liftvan');
    expect(result.additionalArpinQuotes?.map((q) => q.variantType)).toEqual(['air']);
  });

  it('keeps the document-level fields when the main option changes', () => {
    const air = option({ variantType: 'air', quotedTotal: 7030 });
    const liftvans = option({ variantType: 'liftvan', quotedTotal: 6040 });
    const doc = { ...arpinDocument(air, [liftvans]), originalCurrency: 'EUR', exchangeRate: 1.08 };

    const result = normalizeArpinOptions(doc);

    expect(result.isArpinQuote).toBe(true);
    expect(result.originalCurrency).toBe('EUR');
    expect(result.exchangeRate).toBe(1.08);
  });

  it('leaves competitor quotes untouched and drops any Arpin options', () => {
    const competitor: ExtractedQuoteData = {
      ...option({ companyName: 'Suddath', baseCost: 27967.27, quotedTotal: 29953.77 }),
      isArpinQuote: false,
      originalCurrency: 'USD',
      exchangeRate: null,
      additionalArpinQuotes: [option({ variantType: 'air', quotedTotal: 1 })],
    };

    const result = normalizeArpinOptions(competitor);

    expect(result.baseCost).toBe(27967.27);
    expect(result.additionalArpinQuotes).toBeUndefined();
  });
});
