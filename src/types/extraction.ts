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

export interface ExtractedQuoteData {
  companyName: string;
  baseCost: number | null;
  serviceItems: ExtractedServiceItem[];
  shipmentWeight: number | null;
  shipmentVolume: number | null;
  transitTimeMin: number | null;
  transitTimeMax: number | null;
  insurancePercentage: number | null;
  other?: ExtractedOtherItem[];
  /** Whether the quote is from Arpin International (true) or a competitor (false) */
  isArpinQuote: boolean;
  /** Original currency code (e.g., 'EUR', 'GBP', 'USD'). If null or 'USD', no conversion was needed. */
  originalCurrency: string | null;
  /** Exchange rate used for conversion (e.g., 1.08 for EUR to USD). If null, no conversion was needed. */
  exchangeRate: number | null;
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
  extracted: ExtractedQuoteData, 
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

