import { describe, it, expect } from 'vitest';
import { applyArpinExtraction, getArpinOptionLabel, PRIMARY_ARPIN_ID } from './arpinOptions';
import { QuoteData, DEFAULT_SERVICE_ITEMS } from '@/types/quote';
import {
  AdditionalArpinQuoteData,
  ArpinOptionType,
  ExtractedQuoteData,
  REQUIRED_SERVICE_ITEM_IDS,
} from '@/types/extraction';

function column(id: string, companyName: string, baseCost: number | null = null): QuoteData {
  return {
    id,
    companyName,
    baseCost,
    serviceItems: DEFAULT_SERVICE_ITEMS.map((i) => ({ ...i, included: false, cost: null })),
    shipmentWeight: null,
    shipmentVolume: null,
    transitTimeMin: null,
    transitTimeMax: null,
    insurancePercentage: null,
  };
}

function option(
  variantType: ArpinOptionType,
  baseCost: number,
  containerSizeFt: number | null = null
): AdditionalArpinQuoteData {
  return {
    companyName: 'Arpin',
    variantType,
    containerSizeFt,
    baseCost,
    serviceItems: REQUIRED_SERVICE_ITEM_IDS.map((id) => ({ id, included: false, cost: null })),
    shipmentWeight: null,
    shipmentVolume: null,
    transitTimeMin: null,
    transitTimeMax: null,
    insurancePercentage: null,
  };
}

function arpinDocument(main: AdditionalArpinQuoteData, additional: AdditionalArpinQuoteData[] = []): ExtractedQuoteData {
  return {
    ...main,
    companyName: 'Arpin International',
    isArpinQuote: true,
    originalCurrency: 'USD',
    exchangeRate: null,
    additionalArpinQuotes: additional.length > 0 ? additional : undefined,
  };
}

const initialColumns = () => [
  column(PRIMARY_ARPIN_ID, 'Arpin International'),
  column('quote-1', 'Company 1', 5000),
  column('quote-2', 'Company 2'),
];

describe('getArpinOptionLabel', () => {
  it.each([
    ['air', null, 'Arpin Air'],
    ['liftvan', null, 'Arpin Liftvans'],
    ['sea', null, 'Arpin Sea'],
    ['container', 40, 'Arpin 40ft'],
    ['container', null, 'Arpin Container'],
  ] as const)('labels %s (%s ft) as %s', (variantType, size, label) => {
    expect(getArpinOptionLabel(variantType, size)).toBe(label);
  });
});

describe('applyArpinExtraction', () => {
  it('adds one column per Arpin option, labeled by how each option ships', () => {
    const doc = arpinDocument(option('container', 10307.7, 20), [option('air', 9437.35), option('liftvan', 7286.5)]);

    const result = applyArpinExtraction(initialColumns(), doc, PRIMARY_ARPIN_ID);

    expect(result.map((q) => [q.id, q.companyName, q.baseCost])).toEqual([
      [PRIMARY_ARPIN_ID, 'Arpin 20ft', 10307.7],
      ['arpin-variant-air', 'Arpin Air', 9437.35],
      ['arpin-variant-liftvan', 'Arpin Liftvans', 7286.5],
      ['quote-1', 'Company 1', 5000],
      ['quote-2', 'Company 2', null],
    ]);
  });

  it('keeps the extracted company name when the document has a single option', () => {
    const doc = arpinDocument(option('container', 10307.7, 20));

    const result = applyArpinExtraction(initialColumns(), doc, PRIMARY_ARPIN_ID);

    expect(result.map((q) => [q.id, q.companyName])).toEqual([
      [PRIMARY_ARPIN_ID, 'Arpin International'],
      ['quote-1', 'Company 1'],
      ['quote-2', 'Company 2'],
    ]);
  });

  it('replaces the option columns of a previously extracted Arpin document', () => {
    const first = applyArpinExtraction(
      initialColumns(),
      arpinDocument(option('container', 14475.93, 40), [option('container', 10882.5, 20)]),
      PRIMARY_ARPIN_ID
    );

    const result = applyArpinExtraction(
      first,
      arpinDocument(option('liftvan', 6040), [option('air', 7030)]),
      PRIMARY_ARPIN_ID
    );

    expect(result.map((q) => q.id)).toEqual([PRIMARY_ARPIN_ID, 'arpin-variant-air', 'quote-1', 'quote-2']);
  });

  it('gives options of the same kind distinct columns', () => {
    const doc = arpinDocument(option('container', 3, 40), [option('air', 1), option('air', 2)]);

    const result = applyArpinExtraction(initialColumns(), doc, PRIMARY_ARPIN_ID);

    expect(result.slice(1, 3).map((q) => [q.id, q.companyName, q.baseCost])).toEqual([
      ['arpin-variant-air', 'Arpin Air', 1],
      ['arpin-variant-air-2', 'Arpin Air 2', 2],
    ]);
  });

  it('fills only the target column when the document goes to a competitor column', () => {
    const start = applyArpinExtraction(
      initialColumns(),
      arpinDocument(option('container', 3, 40), [option('air', 1)]),
      PRIMARY_ARPIN_ID
    );
    const competitor: ExtractedQuoteData = {
      ...option('sea', 4200),
      companyName: 'Suddath',
      isArpinQuote: false,
      originalCurrency: 'USD',
      exchangeRate: null,
    };

    const result = applyArpinExtraction(start, competitor, 'quote-2');

    expect(result.map((q) => [q.id, q.companyName, q.baseCost])).toEqual([
      [PRIMARY_ARPIN_ID, 'Arpin 40ft', 3],
      ['arpin-variant-air', 'Arpin Air', 1],
      ['quote-1', 'Company 1', 5000],
      ['quote-2', 'Suddath', 4200],
    ]);
  });
});
