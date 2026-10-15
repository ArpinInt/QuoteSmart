import { QuoteData, DEFAULT_SERVICE_ITEMS } from '@/types/quote';
import { ArpinOptionType, ExtractedQuoteData, convertToQuoteData } from '@/types/extraction';

export const PRIMARY_ARPIN_ID = 'arpin-quote';
export const ARPIN_VARIANT_PREFIX = 'arpin-variant-';

export const isArpinFamilyQuote = (quoteId: string): boolean =>
  quoteId === PRIMARY_ARPIN_ID || quoteId.startsWith(ARPIN_VARIANT_PREFIX);

export const isCompetitorQuote = (quoteId: string): boolean => !isArpinFamilyQuote(quoteId);

const sanitizeContainerSize = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const normalized = Math.round(value);
  return normalized > 0 ? normalized : null;
};

const getArpinVariantId = (variantType: ArpinOptionType, containerSizeFt?: number | null): string => {
  if (variantType === 'container') {
    return `${ARPIN_VARIANT_PREFIX}container-${sanitizeContainerSize(containerSizeFt) ?? 'small'}`;
  }
  return `${ARPIN_VARIANT_PREFIX}${variantType}`;
};

/** Column label for an Arpin option, e.g. "Arpin Air", "Arpin Liftvans", "Arpin 20ft". */
export const getArpinOptionLabel = (variantType: ArpinOptionType, containerSizeFt?: number | null): string => {
  switch (variantType) {
    case 'air':
      return 'Arpin Air';
    case 'liftvan':
      return 'Arpin Liftvans';
    case 'sea':
      return 'Arpin Sea';
    case 'container': {
      const size = sanitizeContainerSize(containerSizeFt);
      return size !== null ? `Arpin ${size}ft` : 'Arpin Container';
    }
  }
};

/**
 * The columns an Arpin document fills: the main option in the primary Arpin
 * column and one variant column per other option. With several options every
 * column is labeled by how it ships; a single option keeps the extracted name.
 */
export function buildArpinOptionColumns(extracted: ExtractedQuoteData): { primary: QuoteData; variants: QuoteData[] } {
  const primary = convertToQuoteData(extracted, PRIMARY_ARPIN_ID, DEFAULT_SERVICE_ITEMS);
  const options = extracted.additionalArpinQuotes ?? [];
  if (options.length === 0) return { primary, variants: [] };

  const usedIds = new Set<string>();
  const usedLabels = new Set<string>();
  const variants = options.map((option) => {
    const baseId = getArpinVariantId(option.variantType, option.containerSizeFt);
    const baseLabel = getArpinOptionLabel(option.variantType, option.containerSizeFt);
    let id = baseId;
    let label = baseLabel;
    for (let n = 2; usedIds.has(id) || usedLabels.has(label); n++) {
      id = `${baseId}-${n}`;
      label = `${baseLabel} ${n}`;
    }
    usedIds.add(id);
    usedLabels.add(label);
    return { ...convertToQuoteData(option, id, DEFAULT_SERVICE_ITEMS), companyName: label };
  });

  return {
    primary: {
      ...primary,
      companyName: getArpinOptionLabel(extracted.variantType ?? 'sea', extracted.containerSizeFt),
    },
    variants,
  };
}

/**
 * Applies an extracted document to the comparison columns. An Arpin document
 * extracted into the primary Arpin column replaces every Arpin column, so the
 * options of a previously extracted document do not linger. Any other
 * extraction fills only its target column.
 */
export function applyArpinExtraction(
  quotes: QuoteData[],
  extracted: ExtractedQuoteData,
  targetQuoteId: string
): QuoteData[] {
  if (targetQuoteId !== PRIMARY_ARPIN_ID || !extracted.isArpinQuote) {
    const quoteData = convertToQuoteData(extracted, targetQuoteId, DEFAULT_SERVICE_ITEMS);
    return quotes.map((quote) => (quote.id === targetQuoteId ? quoteData : quote));
  }

  const { primary, variants } = buildArpinOptionColumns(extracted);
  const competitors = quotes.filter((quote) => isCompetitorQuote(quote.id));
  return [primary, ...variants, ...competitors];
}
