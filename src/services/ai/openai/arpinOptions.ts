import {
  AdditionalArpinQuoteData,
  ArpinOptionType,
  ExtractedQuoteData,
  ExtractedQuotePayload,
} from '@/types/extraction';

type ArpinOption = ExtractedQuotePayload & {
  variantType?: ArpinOptionType | null;
  containerSizeFt?: number | null;
};

/**
 * Arpin sums every priced line of an option into its "Estimated ... Charges"
 * total. When the document states that total, it is the option's cost: its
 * priced lines are part of it, so none of them is added again on top.
 */
function applyQuotedTotal<T extends ArpinOption>(option: T): T {
  if (option.quotedTotal == null || !(option.quotedTotal > 0)) return option;
  return {
    ...option,
    baseCost: option.quotedTotal,
    serviceItems: option.serviceItems.map((item) =>
      !item.included && item.cost !== null ? { ...item, included: true, cost: null } : item
    ),
    other: undefined,
  };
}

/**
 * Which option becomes the main Arpin column (lower first): a full container,
 * the larger the better, then sea liftvans, then other sea, then unlabeled,
 * then air.
 */
function rank(option: ArpinOption): [number, number] {
  switch (option.variantType) {
    case 'container':
      return [0, -(option.containerSizeFt ?? 0)];
    case 'liftvan':
      return [1, 0];
    case 'sea':
      return [2, 0];
    case 'air':
      return [4, 0];
    default:
      return [3, 0];
  }
}

function isBetter(a: ArpinOption, b: ArpinOption): boolean {
  const [ra, sa] = rank(a);
  const [rb, sb] = rank(b);
  return ra < rb || (ra === rb && sa < sb);
}

/**
 * Normalizes the Arpin options of an extracted document: each option's cost is
 * its quoted total, the best-ranked option becomes the main quote and the other
 * options keep their document order. Competitor quotes carry no Arpin options.
 */
export function normalizeArpinOptions(data: ExtractedQuoteData): ExtractedQuoteData {
  if (!data.isArpinQuote) {
    return { ...data, additionalArpinQuotes: undefined };
  }

  const { isArpinQuote, originalCurrency, exchangeRate, additionalArpinQuotes, ...main } = data;
  const options: ArpinOption[] = [main, ...(additionalArpinQuotes ?? [])].map(applyQuotedTotal);

  const primaryIndex = options.reduce(
    (best, option, index) => (isBetter(option, options[best]) ? index : best),
    0
  );
  const primary = options[primaryIndex];
  const rest: AdditionalArpinQuoteData[] = options
    .filter((_, index) => index !== primaryIndex)
    .map((option) => ({ ...option, variantType: option.variantType ?? 'sea' }));

  return {
    ...primary,
    isArpinQuote,
    originalCurrency,
    exchangeRate,
    variantType: primary.variantType ?? null,
    containerSizeFt: primary.containerSizeFt ?? null,
    additionalArpinQuotes: rest.length > 0 ? rest : undefined,
  };
}
