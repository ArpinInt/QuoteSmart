import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { ExtractedQuoteData, ExtractedOtherItem, REQUIRED_SERVICE_ITEM_IDS } from '@/types/extraction';
import { createExtractionPrompt } from './prompts';
import { getMimeTypeFromExtension } from './utils';

// Zod schema matching ExtractedQuoteData interface
const extractedQuoteDataSchema = z.object({
  companyName: z.string().describe('The moving company name extracted from the quote document'),
  baseCost: z.number().nullable().describe('Base moving cost (primary transportation fee) in USD, or null if not found. If multiple shipping methods are present (e.g., air and sea), sum all base costs together to get the total baseCost. All monetary values must be converted to USD if the original currency is not USD.'),
  serviceItems: z.array(
    z.object({
      id: z.enum([
        'origin-services',
        'crating',
        'shuttle-services',
        'parking-permits',
        'storage-in-transit',
        'destination-terminal-handling',
        'customs-clearance',
        'delivery-services'
      ]).describe(`Service item ID - must be one of the 8 required service items:
        - origin-services: Packing/wrapping/loading at origin (confirm includes full pack and wrap along with loading)
        - crating: Custom crating services (combine origin and destination crating if provided separately)
        - shuttle-services: For difficult-to-access locations, e.g., narrow streets
        - parking-permits: Parking permits arranged for origin and destination
        - storage-in-transit: Temporary storage (SIT) - up to [X] days of storage, if needed
        - destination-terminal-handling: DTHC/port charges (many competitors exclude DTHC, adding significant costs at destination port)
        - customs-clearance: Customs documentation and processing
        - delivery-services: Delivery/unpacking at destination (confirm includes unpacking)`),
      included: z.boolean().describe('true if service is included in base cost, false if separate charge'),
      cost: z.number().nullable().describe('Cost of service in USD if not included (null if included or not found). Must be converted to USD if original currency is not USD.')
    })
  )
    .length(8, 'Must include exactly 8 service items')
    .refine(
      (items) => {
        const ids = items.map(item => item.id);
        return REQUIRED_SERVICE_ITEM_IDS.every(id => ids.includes(id));
      },
      { message: 'Must include all 8 required service items' }
    )
    .describe('Array of exactly 8 service items - all must be present even if not found in document'),
  shipmentWeight: z.number().nullable().describe('Estimated shipment weight in pounds (lbs), or null if not found'),
  shipmentVolume: z.number().nullable().describe('Estimated shipment volume in cubic feet (cu ft), or null if not found'),
  transitTimeMin: z.number().nullable().describe('Minimum transit time in days, or null if not found'),
  transitTimeMax: z.number().nullable().describe('Maximum transit time in days, or null if not found'),
  insurancePercentage: z.number().nullable().refine(
    (val) => val === null || (val >= 0 && val <= 100),
    { message: 'Insurance percentage must be between 0 and 100, or null' }
  ).describe('Insurance coverage as percentage of declared value (0-100), or null if not found'),
  other: z.array(
    z.object({
      key: z.string().describe('A descriptive key/name for the unmatched value (e.g., "fuel-surcharge", "admin-fee")'),
      label: z.string().describe('A short name/label for this field (e.g., "Fuel Surcharge", "Admin Fee")'),
      description: z.string().describe('A brief description of what this value represents'),
      value: z.number().describe('The numeric value in USD (remove currency symbols, convert to number, converted to USD if original currency is not USD)')
    })
  ).optional().describe('Array of unmatched values that could not be matched with certainty to the standard fields. Include any costs, fees, or information found in the document that does not fit the standard extraction fields. All values must be numeric and in USD.'),
  isArpinQuote: z.boolean().describe('Whether the quote is from Arpin International (true) or a competitor company (false). Look for Arpin branding, logos, letterhead, or company name variations like "Arpin International", "Arpin", "Arpin Van Lines", "Arpin Group". Set to false for all other companies.'),
  originalCurrency: z.string().nullable().describe('The 3-letter currency code used in the original document (e.g., "EUR", "GBP", "USD", "CAD", "JPY", "AUD", "CHF"). Set to "USD" if the document uses USD or no currency is clearly specified. Set to null if currency cannot be determined.'),
  exchangeRate: z.number().nullable().describe('The exchange rate used to convert from originalCurrency to USD (e.g., 1.08 for EUR to USD). This is the rate from originalCurrency to USD. If originalCurrency is "USD" or null, set to null. Must be a positive number if originalCurrency is not "USD" or null.')
});

// Re-export constants from utils for server-side use
export { SUPPORTED_FILE_TYPES, SUPPORTED_EXTENSIONS } from './utils';

/**
 * File input type for document extraction
 */
export type FileInput = 
  | { type: 'buffer'; data: Buffer; mimeType: string }
  | { type: 'file'; file: File }
  | { type: 'path'; path: string; mimeType?: string };

// Re-export utilities for server-side use
export { isSupportedMimeType, isSupportedExtension, getMimeTypeFromExtension } from './utils';

/**
 * Safety net: Filters out obvious totals from the "other" array.
 * The prompt should handle most cases, but this catches clear mistakes.
 * Simplified to only check:
 * 1. Strong keyword matches (total, sum, etc.)
 * 2. Grand total matches (baseCost + services + all other costs)
 */
function filterOutTotals(data: ExtractedQuoteData): ExtractedQuoteData {
  if (!data.other || data.other.length === 0) {
    return data;
  }

  // Calculate base components
  let baseComponentsTotal = 0;
  if (data.baseCost !== null) {
    baseComponentsTotal += data.baseCost;
  }
  data.serviceItems.forEach(item => {
    if (!item.included && item.cost !== null) {
      baseComponentsTotal += item.cost;
    }
  });
  
  const otherArray = data.other;
  const filteredOther = otherArray.filter((item, index) => {
    // 1. Check for strong total keywords
    const totalKeywords = ['total', 'sum', 'grand total', 'final amount', 'subtotal'];
    const hasTotalKeyword = totalKeywords.some(keyword => 
      item.key.toLowerCase().includes(keyword) || 
      item.description.toLowerCase().includes(keyword)
    );
    
    if (hasTotalKeyword) {
      return false;
    }
    
    // 2. Check if it matches the grand total (baseCost + services + all other costs)
    const otherCostsExcludingThis = otherArray
      .filter((_, i) => i !== index)
      .reduce((sum, otherItem) => sum + otherItem.value, 0);
    
    const expectedGrandTotal = baseComponentsTotal + otherCostsExcludingThis;
    if (expectedGrandTotal > 0) {
      const tolerance = Math.abs(expectedGrandTotal * 0.01); // 1% tolerance
      if (Math.abs(item.value - expectedGrandTotal) <= tolerance) {
        return false;
      }
    }
    
    return true;
  });
  
  return {
    ...data,
    other: filteredOther.length > 0 ? filteredOther : undefined
  };
}

/**
 * Consolidates base costs from the "other" array into the main baseCost.
 * If multiple shipping methods have base costs (e.g., air and sea), they should be summed.
 * IMPORTANT: Excludes items that are marked as exclusions or appear in EXCLUSIONS sections.
 */
function consolidateBaseCosts(data: ExtractedQuoteData): ExtractedQuoteData {
  if (!data.other || data.other.length === 0) {
    return data;
  }

  // Look for base cost patterns in the "other" array
  const baseCostPatterns = [
    'base-cost',
    'base cost',
    'basecost',
    'base',
    'transportation',
    'shipping base',
    'freight base'
  ];

  // Exclusion keywords that indicate an item should NOT be included in baseCost
  const exclusionKeywords = [
    'excluded',
    'exclusion',
    'not included',
    'not-included',
    'not covered',
    'excluded from',
    'excluded from quote',
    'not part of',
    'exclusions'
  ];

  // Items that should NEVER be consolidated into baseCost (always remain separate)
  // These are typically separate charges that should be shown as distinct line items
  const neverConsolidatePatterns = [
    'dthc',
    'destination terminal',
    'terminal handling',
    'port charges',
    'port charge',
    'nvocc',
    'dthc-nvocc'
  ];

  const baseCostItems: Array<{ item: ExtractedOtherItem; index: number }> = [];
  
  data.other.forEach((item, index) => {
    const keyLower = item.key.toLowerCase();
    const descLower = item.description.toLowerCase();
    const labelLower = item.label.toLowerCase();
    
    // CRITICAL: Skip items that should never be consolidated (like DTHC, terminal handling)
    const shouldNeverConsolidate = neverConsolidatePatterns.some(pattern => 
      keyLower.includes(pattern) || 
      descLower.includes(pattern) || 
      labelLower.includes(pattern)
    );
    
    if (shouldNeverConsolidate) {
      // Skip this item - it should remain as a separate line item
      return;
    }
    
    // CRITICAL: Skip items that are marked as exclusions
    const isExcluded = exclusionKeywords.some(keyword => 
      keyLower.includes(keyword) || 
      descLower.includes(keyword) || 
      labelLower.includes(keyword)
    );
    
    if (isExcluded) {
      // Skip this item - it's an exclusion and should not be added to baseCost
      return;
    }
    
    // Check if this looks like a base cost
    const isBaseCost = baseCostPatterns.some(pattern => 
      keyLower.includes(pattern) || descLower.includes(pattern)
    );
    
    if (isBaseCost) {
      baseCostItems.push({ item, index });
    }
  });

  // If we found base costs in "other", consolidate them
  if (baseCostItems.length > 0) {
    const additionalBaseCost = baseCostItems.reduce((sum, { item }) => sum + item.value, 0);
    const newBaseCost = (data.baseCost || 0) + additionalBaseCost;
    
    // Remove base cost items from "other" array
    const remainingOther = data.other.filter((_, index) => 
      !baseCostItems.some(({ index: baseIndex }) => baseIndex === index)
    );
    
    return {
      ...data,
      baseCost: newBaseCost,
      other: remainingOther.length > 0 ? remainingOther : undefined
    };
  }

  return data;
}

/**
 * Extracts quote data from a document using AI
 * @param options - Extraction options (object with documentText and/or file)
 * @param options.documentText - Optional text content of the quote document
 * @param options.file - Optional file (PDF, image, etc.) to extract data from
 * @returns Extracted quote data matching the ExtractedQuoteData interface
 * 
 * @example
 * // With text only
 * const data = await extractQuoteData({ documentText: '...' });
 * 
 * @example
 * // With file only
 * const data = await extractQuoteData({ 
 *   file: { type: 'file', file: fileObject } 
 * });
 * 
 * @example
 * // With both text and file
 * const data = await extractQuoteData({ 
 *   documentText: '...',
 *   file: { type: 'buffer', data: buffer, mimeType: 'application/pdf' }
 * });
 * 
 * @see SUPPORTED_FILE_TYPES for list of supported file types
 * Supported formats: PDF, JPEG, PNG, GIF, WebP, TXT, CSV
 */
export async function extractQuoteData(options: {
  documentText?: string;
  file?: FileInput;
}): Promise<ExtractedQuoteData> {
  const { documentText, file } = options;

  // Check if API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. ' +
      'Please set it in your .env.local file: OPENAI_API_KEY=your-api-key-here'
    );
  }

  // Force GPT-4o model
  const modelName = 'gpt-4o';

  // Create prompt text
  const promptText = createExtractionPrompt(documentText);

  // Prepare file data if provided
  let fileData: Buffer | null = null;
  let mediaType: string | null = null;

  if (file) {
    if (file.type === 'buffer') {
      fileData = file.data;
      mediaType = file.mimeType;
    } else if (file.type === 'file') {
      // Convert File to Buffer
      const arrayBuffer = await file.file.arrayBuffer();
      fileData = Buffer.from(arrayBuffer);
      mediaType = file.file.type || getMimeTypeFromExtension(file.file.name) || 'application/pdf';
    } else {
      // file.type === 'path'
      const fs = await import('fs');
      fileData = fs.readFileSync(file.path);
      mediaType = file.mimeType || getMimeTypeFromExtension(file.path) || 'application/pdf';
    }

    // Validate file type (warn but don't fail - let OpenAI handle it)
    const { isSupportedMimeType } = await import('./utils');
    if (!isSupportedMimeType(mediaType)) {
      // File type validation - let OpenAI handle unsupported types
    }
  }

  try {
    let object: ExtractedQuoteData;

    if (fileData && mediaType) {
      // Check if this is a text file (CSV, TXT) that should be read as text
      const isTextFile = mediaType === 'text/plain' || mediaType === 'text/csv';
      
      if (isTextFile) {
        // Read text file content and include it in the prompt
        const fileText = fileData.toString('utf-8');
        const promptWithFileText = createExtractionPrompt(fileText);
        
        // Use simple prompt format with text content
        const result = await generateObject({
          model: openai(modelName),
          schema: extractedQuoteDataSchema,
          prompt: promptWithFileText,
          temperature: 0, // Set to 0 for deterministic outputs
          maxRetries: 2,
        });
        object = result.object;
      } else {
        // For images and PDFs, use vision API
        // Convert buffer to base64 data URL for OpenAI API
        const base64Data = fileData.toString('base64');
        const dataUrl = `data:${mediaType};base64,${base64Data}`;
        
        // For PDFs, use 'image' type as GPT-4o vision supports PDFs
        // For images, also use 'image' type
        const imageType = mediaType === 'application/pdf' ? 'image' : 'image';
        
        // Use messages format for file support (works for images and PDFs with gpt-4o vision)
        const result = await generateObject({
          model: openai(modelName),
          schema: extractedQuoteDataSchema,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: promptText },
                { type: imageType, image: dataUrl }
              ]
            }
          ],
          temperature: 0, // Set to 0 for deterministic outputs
          maxRetries: 2,
        });
        object = result.object;
      }
    } else {
      // Use simple prompt format when no file
      const result = await generateObject({
        model: openai(modelName),
        schema: extractedQuoteDataSchema,
        prompt: promptText,
        temperature: 0, // Set to 0 for deterministic outputs
        maxRetries: 2,
      });
      object = result.object;
    }
    
    // Consolidate base costs from "other" array (e.g., air + sea base costs)
    const consolidatedObject = consolidateBaseCosts(object);
    
    // Filter out totals from the "other" array to prevent double-counting
    const filteredObject = filterOutTotals(consolidatedObject);
    
    return filteredObject;
  } catch (error: unknown) {
    // Enhanced error handling for API key and quota issues
    const errorMsg = (error && typeof error === 'object' && 'message' in error) 
      ? String(error.message) 
      : String(error || '');
    const errorCode = (error && typeof error === 'object' && 'statusCode' in error)
      ? error.statusCode
      : (error && typeof error === 'object' && 'code' in error)
      ? error.code
      : undefined;

    // Check for refusal responses - parse responseBody if it's a string
    const responseBody = (error && typeof error === 'object' && 'responseBody' in error)
      ? error.responseBody
      : (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'body' in error.response)
      ? error.response.body
      : '';
    let parsedResponse: unknown = null;
    
    if (typeof responseBody === 'string') {
      try {
        parsedResponse = JSON.parse(responseBody);
      } catch {
        // If parsing fails, check the string directly
      }
    } else if (typeof responseBody === 'object') {
      parsedResponse = responseBody;
    }
    
    const errorData = (error && typeof error === 'object' && 'data' in error)
      ? error.data
      : (error && typeof error === 'object' && 'cause' in error && error.cause && typeof error.cause === 'object' && 'value' in error.cause)
      ? error.cause.value
      : parsedResponse || {};
    
    // Check if the response contains a refusal
    const parsedResponseObj = parsedResponse && typeof parsedResponse === 'object' ? parsedResponse as Record<string, unknown> : null;
    const errorDataObj = errorData && typeof errorData === 'object' ? errorData as Record<string, unknown> : null;
    const hasRefusal = 
      (typeof responseBody === 'string' && responseBody.includes('refusal')) ||
      (parsedResponseObj?.output && Array.isArray(parsedResponseObj.output) && parsedResponseObj.output[0] && typeof parsedResponseObj.output[0] === 'object' && 'content' in parsedResponseObj.output[0] && Array.isArray(parsedResponseObj.output[0].content) && parsedResponseObj.output[0].content[0] && typeof parsedResponseObj.output[0].content[0] === 'object' && 'type' in parsedResponseObj.output[0].content[0] && parsedResponseObj.output[0].content[0].type === 'refusal') ||
      (errorDataObj?.output && Array.isArray(errorDataObj.output) && errorDataObj.output[0] && typeof errorDataObj.output[0] === 'object' && 'content' in errorDataObj.output[0] && Array.isArray(errorDataObj.output[0].content) && errorDataObj.output[0].content[0] && typeof errorDataObj.output[0].content[0] === 'object' && 'type' in errorDataObj.output[0].content[0] && errorDataObj.output[0].content[0].type === 'refusal') ||
      errorMsg.includes('refusal') ||
      errorMsg.includes("I'm sorry, I can't assist");
    
    if (hasRefusal) {
      throw new Error(
        'The AI model refused to process this document. This may be due to content filtering or the document format. ' +
        'Please try with a different document or contact support if the issue persists.'
      );
    }
    
    // Check for invalid JSON response errors
    if (errorMsg.includes('Invalid JSON response') || errorMsg.includes('AI_APICallError')) {
      throw new Error(
        'Invalid response from OpenAI API. The model may have refused the request or returned an unexpected format. ' +
        'Please try again or contact support if the issue persists.'
      );
    }
    
    const errorMessage = (error && typeof error === 'object' && 'message' in error) ? String(error.message) : '';
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      throw new Error(
        'OpenAI API authentication failed. Please check your OPENAI_API_KEY. ' +
        `Error: ${errorMessage}`
      );
    }
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      throw new Error(
        'OpenAI API rate limit exceeded. Please try again later. ' +
        `Error: ${errorMessage}`
      );
    }
    if (errorMsg.includes('insufficient_quota') || errorMsg.includes('quota') || errorCode === 429) {
      throw new Error(
        'Insufficient quota error. GPT-4o requires a paid OpenAI account. ' +
        `Error: ${errorMessage}`
      );
    }
    if (errorMsg.includes('invalid_api_key')) {
      throw new Error(
        'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable. ' +
        `Error: ${errorMessage}`
      );
    }
    if (errorMsg.includes('model_not_found') || errorMsg.includes('does not exist')) {
      throw new Error(
        `Model "${modelName}" not found or not available for your account. ` +
        `Error: ${errorMessage}`
      );
    }
    throw new Error(
      `Failed to extract quote data: ${errorMsg}`
    );
  }
}
