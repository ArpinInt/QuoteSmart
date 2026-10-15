/**
 * Type definitions for quote data extraction
 * These types match the QuoteData interface structure exactly
 */

export interface ExtractedServiceItem {
  id: 'origin-services' | 'crating' | 'shuttle-services' | 'parking-permits' | 
      'storage-in-transit' | 'destination-terminal-handling' | 'customs-clearance' | 'delivery-services';
  included: boolean;
  cost: number | null;
}

export interface ExtractedOtherItem {
  key: string;
  label: string;
  description: string;
  value: number;
}

export interface ExtractedQuotePayload {
  companyName: string;
  baseCost: number | null;
  serviceItems: ExtractedServiceItem[];
  shipmentWeight: number | null;
  shipmentVolume: number | null;
  transitTimeMin: number | null;
  transitTimeMax: number | null;
  insurancePercentage: number | null;
  other?: ExtractedOtherItem[];
  /** The document's own total for this quote option in USD (e.g. "Estimated Sea Loose Charges (USD)"); null if none is stated */
  quotedTotal?: number | null;
}

/**
 * How an Arpin option ships the goods: "air"; "liftvan" (sea, in liftvans);
 * "container" (sea, in a full container, e.g. sea loose in 1x20'); "sea" when
 * the document gives no more detail.
 */
export type ArpinOptionType = 'air' | 'sea' | 'liftvan' | 'container';

export interface AdditionalArpinQuoteData extends ExtractedQuotePayload {
  /** Display label for the generated Arpin variant column */
  companyName: string;
  variantType: ArpinOptionType;
  /** For container options, the container size in feet (e.g. 20, 40) */
  containerSizeFt?: number | null;
}

export interface ExtractedQuoteData extends ExtractedQuotePayload {
  /** Whether the quote is from Arpin International (true) or a competitor (false) */
  isArpinQuote: boolean;
  /** Original currency code (e.g., 'EUR', 'GBP', 'USD'). If null or 'USD', no conversion was needed. */
  originalCurrency: string | null;
  /** Exchange rate used for conversion (e.g., 1.08 for EUR to USD). If null, no conversion was needed. */
  exchangeRate: number | null;
  /** Arpin only: how the main option ships; labels its column when the document has several options */
  variantType?: ArpinOptionType | null;
  /** Arpin only: container size in feet of the main option, if it is a container option */
  containerSizeFt?: number | null;
  /** Arpin only: the other options priced in the same document, one column each */
  additionalArpinQuotes?: AdditionalArpinQuoteData[];
}

/**
 * Valid service item IDs that must be included in extraction output
 */
export const REQUIRED_SERVICE_ITEM_IDS = [
  'origin-services',
  'crating',
  'shuttle-services',
  'parking-permits',
  'storage-in-transit',
  'destination-terminal-handling',
  'customs-clearance',
  'delivery-services'
] as const;

/**
 * Validates that extracted quote data has all required service items
 */
export function validateExtractedQuoteData(data: ExtractedQuoteData): boolean {
  // Check that all 8 service items are present
  const extractedIds = data.serviceItems.map(item => item.id);
  const missingIds = REQUIRED_SERVICE_ITEM_IDS.filter(id => !extractedIds.includes(id));
  
  if (missingIds.length > 0) {
    console.error(`Missing service items: ${missingIds.join(', ')}`);
    return false;
  }
  
  // Check for duplicate IDs
  const uniqueIds = new Set(extractedIds);
  if (uniqueIds.size !== extractedIds.length) {
    console.error('Duplicate service item IDs found');
    return false;
  }
  
  return true;
}

/**
 * Converts extracted quote data to QuoteData format (adds id field)
 */
export function convertToQuoteData(
  extracted: ExtractedQuotePayload,
  id: string,
  serviceItemTemplates: Array<{ id: string; name: string; subtext: string }>
): import('./quote').QuoteData {
  return {
    id,
    companyName: extracted.companyName,
    baseCost: extracted.baseCost,
    serviceItems: REQUIRED_SERVICE_ITEM_IDS.map(serviceId => {
      const extractedItem = extracted.serviceItems.find(item => item.id === serviceId);
      const template = serviceItemTemplates.find(t => t.id === serviceId);
      
      return {
        id: serviceId,
        name: template?.name || serviceId,
        subtext: template?.subtext || '',
        included: extractedItem?.included ?? false,
        cost: extractedItem?.cost ?? null
      };
    }),
    shipmentWeight: extracted.shipmentWeight,
    shipmentVolume: extracted.shipmentVolume,
    transitTimeMin: extracted.transitTimeMin,
    transitTimeMax: extracted.transitTimeMax,
    insurancePercentage: extracted.insurancePercentage,
    other: extracted.other
  };
}

