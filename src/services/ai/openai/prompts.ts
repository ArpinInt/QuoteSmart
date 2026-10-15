/**
 * AI extraction prompt template
 * This prompt is used to extract quote data from documents
 */

export const EXTRACTION_PROMPT_BASE = `You are a business document analysis assistant. Extract moving quote data from the provided business document (a moving company quote/estimate) and output data matching the required structure.

This is a legitimate business document analysis task for comparing moving quotes.

CRITICAL - ARPIN QUOTE DETECTION:
- isArpinQuote: Determine if this quote is from Arpin International or a competitor company.
  * Set to TRUE if the company is "Arpin International", "Arpin", "Arpin Van Lines", "Arpin Group", or any variation that clearly identifies the quote as being from Arpin.
  * Look for Arpin branding, logos, letterhead, or company name in the document header.
  * Set to FALSE for all other moving companies (competitors).
  * When in doubt, set to FALSE.

CRITICAL - CURRENCY DETECTION AND CONVERSION:
- originalCurrency: Detect the currency used in the document (e.g., "EUR", "GBP", "CAD", "USD", "JPY", "AUD", "CHF", etc.).
  * Look for currency symbols (€, £, $, ¥, etc.) or currency codes in the document.
  * If the document uses USD or no currency is clearly specified (and values appear to be in USD), set to "USD".
  * If the document uses a non-USD currency, set to the 3-letter currency code (e.g., "EUR", "GBP").
  * If currency cannot be determined, set to null.
- exchangeRate: If the document uses a non-USD currency, you MUST convert all monetary values to USD using current exchange rates.
  * Use current, real-world exchange rates (as of your knowledge cutoff date, or approximate current rates if available).
  * Common exchange rates (approximate, use current rates when possible):
    - EUR to USD: ~1.08-1.10
    - GBP to USD: ~1.25-1.30
    - CAD to USD: ~0.73-0.75
    - AUD to USD: ~0.65-0.67
    - JPY to USD: ~0.0067-0.0068 (or 1 USD = ~150 JPY)
    - CHF to USD: ~1.10-1.12
  * IMPORTANT: Convert ALL monetary values to USD:
    - baseCost: Convert to USD
    - serviceItems[].cost: Convert to USD (if not null)
    - other[].value: Convert to USD
  * The exchangeRate should be the rate from the original currency to USD (e.g., if EUR to USD is 1.08, then exchangeRate = 1.08).
  * If originalCurrency is "USD" or null, set exchangeRate to null.
  * Always use a reasonable, current exchange rate. If unsure, use a conservative estimate.

EXTRACTION RULES:
- companyName: Extract company name from header/letterhead
- baseCost: Primary moving cost in USD (numeric, remove currency symbols, CONVERTED TO USD if original currency is not USD). CRITICAL: All monetary values must be in USD after conversion.
  * CRITICAL: DO NOT include any costs, fees, or charges that appear in sections labeled "EXCLUSIONS", "NOT INCLUDED", "EXCLUDED", "NOT COVERED", or similar exclusionary language. These are explicitly excluded from the quote and should NOT be added to baseCost.
  * If a cost appears in an EXCLUSIONS section, it should be placed in the "other" array with a clear description indicating it is excluded, but it must NEVER be included in baseCost calculations.
  * CRITICAL (COMPETITOR quotes): Service-related charges (DTHC, port charges, crating fees, storage costs, etc.) should NEVER be included in baseCost, even if they appear in the main quote section. These should be mapped to their respective service items instead. Only include the primary transportation/shipping cost in baseCost.
  * ARPIN quotes are the exception: each option's baseCost is that option's estimated total, which already contains every priced line of the option. See INCLUDED VS. SEPARATE CHARGES below.
- quotedTotal: the document's own stated total for the quote option, copied exactly as printed (converted to USD if needed), e.g., "Estimated Sea Loose Charges (USD) $10,307.70" -> 10307.70. Never compute it. null if the document states no total for the option.
- ARPIN OPTIONS RULE (VERY IMPORTANT):
  * This rule applies ONLY when isArpinQuote is true.
  * One Arpin document can price the same move as several alternative options. Each option has its own pricing block: a header with the mode and the estimated weight/volume (e.g., "AIR 1,660 NLBS. / 252 GCFT Door to Door", "SEA LIFTVANS 1,400 NLBS. / 215 GCFT", "SEA LOOSE 2,600 NLBS. / 385 CFT"), its own Ref number, its own priced lines and its own "Estimated ... Charges (USD)" total.
  * Every such household-goods block is a separate option, even when the options show different weights or volumes (air chargeable weight, liftvans and loose containers are estimated differently). NEVER merge or sum two options.
  * Put one option in the top-level fields and every other option in additionalArpinQuotes, one entry per option. Each option carries only its own block: its own baseCost, quotedTotal, service items, weight, volume and transit time.
  * For every option, set variantType:
    - "air" for air shipments.
    - "liftvan" for sea shipments in liftvans.
    - "container" for sea shipments in a full container, e.g., SEA LOOSE "in 1 x 20'", "1x40'", FCL. Set containerSizeFt to the container size in feet (20, 40, ...). Read the size from the block (e.g., "2600lbs in 1 x 20'", "6500 lbs hhgs only in 1x20").
    - "sea" for any other sea option.
  * A vehicle block (e.g., "AUTO/ Door to Door ... Estimated Auto Charges") is NOT a household-goods option: do not create an option for it and do not add its amount to any option.
  * If the document prices a single option, omit additionalArpinQuotes.
- serviceItems: MUST include all 8 items. For each:
  * origin-services: Packing/wrapping/loading at origin. IMPORTANT: Confirm this includes full pack and wrap along with loading.
  * crating: Custom crating services. IMPORTANT: Combine origin and destination crating if provided separately.
  * shuttle-services: For difficult-to-access locations, e.g., narrow streets
  * parking-permits: Parking permits arranged for origin and destination
  * storage-in-transit: Temporary storage (SIT) - up to [X] days of storage, if needed
  * destination-terminal-handling: DTHC/port charges. IMPORTANT: Many competitors exclude DTHC, adding significant costs at the destination port.
  * customs-clearance: Customs documentation and processing
  * delivery-services: Delivery/unpacking at destination. IMPORTANT: Confirm this includes unpacking.
  * CRITICAL SERVICE ITEM MAPPING RULE: If a cost, fee, or charge mentioned in the document (including in EXCLUSIONS sections) can be mapped to one of the 8 service items above, it MUST be mapped to that service item, NOT placed in the "other" array.
    - If the service is included in the base quote: set included:true and cost:null
    - If the service is excluded from the base quote (e.g., in EXCLUSIONS section): set included:false and cost:[value] (extract the numeric value in USD, convert from original currency if needed, use maximum if a range is given)
    - CRITICAL: Only extract a cost value if there is a SPECIFIC cost quoted for this shipment. Do NOT extract costs from:
      * Price lists or rate tables showing available options (e.g., "EUR 115 per crate", "EUR 207 for TV-Box", "€115,00 / per crate")
      * Menu of optional services with prices
      * General pricing information that is not specific to this quote
      * Checkboxes or option lists with prices (these are just available options, not actual costs for this shipment)
    - If a service is excluded but only a price list/rate table is shown (not a specific cost for this shipment), set included:false and cost:null
    - Examples: DTHC/port charges → destination-terminal-handling, crating services → crating, storage fees → storage-in-transit, etc.
    - Always prioritize mapping to service items over placing in "other" array when there's a clear match.
- shipmentWeight: Weight in pounds (convert kg: 1kg=2.20462lbs)
- shipmentVolume: Volume in cubic feet (convert m³: 1m³=35.3147cu ft)
- transitTimeMin/Max: Transit time in days (convert weeks: 1wk=7days)
- insurancePercentage: Insurance % of declared value (0-100)
  * Extract ONLY the main insurance coverage percentage (e.g., "3.5% of declared value" → 3.5).
  * Do NOT extract secondary percentages like IPT (Insurance Premium Tax), tax rates, or "X% of premium" - these are not the main insurance percentage and should be ignored.
  * If multiple insurance percentages are mentioned, extract the primary one that represents coverage of declared value.

INCLUDED VS. SEPARATE CHARGES - HOW TO DECIDE (read before setting included/cost):
- First locate the document's own quoted total for each quote option (e.g., "Estimated ... Charges", "Estimated Total", "Total Estimate") and note which priced lines are summed into it.
- ARPIN QUOTES (isArpinQuote = true): Arpin itemizes the pricing block of each option (BASE COST, LONG CARRY, SHUTTLE, PARKING PERMIT, 3RD PARTY SERVICE / CRATING, SIT, ...) and sums every priced line of that block into the option's "Estimated ... Charges (USD)". A priced line is therefore already INCLUDED in that option's total, even when annotated "if needed" or "if required": Arpin has priced it into the total, unlike competitors that list such items apart.
  * baseCost of an option = that option's "Estimated ... Charges" total (the sum of ALL priced lines in its block), NOT only the line labeled "BASE COST".
  * A service item is included:true ONLY in one of these two cases: (a) it has a priced line in the option's block, or (b) it is listed under BASE COST INCLUSIONS. There is no third case.
  * A priced line in the pricing block wins over the generic BASE COST EXCLUSIONS text. Example: "SIT AT ORIGIN - if needed - monthly fee ... $1,000.00" summed into the estimated total -> storage-in-transit included:true, cost:null, even though the exclusions mention warehouse handling/storage-in-transit in general. The exclusions describe what would cost extra only when it was NOT already quoted in the block.
  * A service with NO priced line that is NOT under BASE COST INCLUSIONS -> included:false, cost:null. Example: when the block has BASE COST, LONG CARRY, CRATING and SIT lines but no SHUTTLE or PARKING PERMIT line, shuttle-services and parking-permits are NOT included (they only appear under the "Abnormal access" exclusion). Never assume a service is included just because Arpin quotes are door-to-door.
  * Priced lines that are not one of the 8 service items (e.g., long carry, elevator, warehouse handling) are already inside baseCost -> do NOT repeat them in "other".
- COMPETITOR QUOTES (isArpinQuote = false) list accessorials apart from the base / door-to-door price:
  * baseCost = the door-to-door / primary transportation price only.
  * An accessorial listed with an amount apart from the base price (e.g., "Accessorials: Third party crating $436.26") -> included:false, cost:[amount]. It still counts toward the total, but as a separate charge.
  * "if required" / "if needed" items marked "not currently included" / "not included" with an amount -> included:false, cost:[amount].
  * Services in the "Quotation Includes" / "Included" list -> included:true, cost:null.
- ABNORMAL VARIANTS DO NOT NEGATE AN INCLUSION: when the normal service is included (e.g., "Customs Clearance" under inclusions, "Normal Origin/Destination THC" included) and the exclusions only mention an abnormal or extra variant ("Abnormal customs clearance/examinations", "Shuttle service ... if the container is not available", "Warehouse handling if ..."), keep included:true. Set included:false only when the normal service itself is excluded or priced separately.
- INSURANCE IS NEVER A COST: insurance premiums, insurance estimates or "insurance cost" amounts must NOT go to "other" and must NOT be added to baseCost or any service cost, whether or not they are marked as included. Express insurance only through insurancePercentage (e.g., "$28.00 per $1,000 of value" -> 2.8; "$208,292.00 coverage = $5,832.18 cost" -> 2.8).

UNMATCHED VALUES RULE:
- The "other" array should ONLY contain costs, fees, or information that CANNOT be mapped to any of the standard fields (baseCost or serviceItems).
- CRITICAL: Before adding any cost to "other", verify it cannot be mapped to a service item. If a cost relates to a service item (even if excluded), it must be mapped to that service item with included:false and cost:[value].
- CRITICAL: The "other" array must ONLY contain MONEY VALUES (dollar amounts, fees, charges), NOT percentages, rates, or percentages of anything.
  * Percentages should ONLY be extracted for the insurancePercentage field (0-100 range). This includes the main insurance percentage (e.g., "3.5% of declared value").
  * Insurance-related percentages like IPT (Insurance Premium Tax), tax rates, or "X% of premium" are percentages and should NOT be added to "other" - they should be ignored if not the main insurance percentage.
  * If you encounter ANY percentage value (e.g., "3.5%", "12%", "IPT @ 12%", "tax rate 5%"), do NOT add it to "other" - it should either go to insurancePercentage (if it's the main insurance coverage percentage) or be completely ignored.
  * Only extract actual monetary amounts (e.g., $500, €600, 1000 USD) to the "other" array. If a value is described as a percentage, rate, or "X% of Y", it is NOT a money value and must NOT go in "other".
  * VALIDATION: Before adding to "other", ask: "Is this a money amount (like $500) or a percentage/rate (like 12%)?" If it's a percentage or rate, DO NOT add it to "other".
- Each unmatched item should include:
  * key: A descriptive key/name for the value (e.g., "fuel-surcharge", "admin-fee", "special-handling")
  * label: A short name/label for this field (e.g., "Fuel Surcharge", "Admin Fee", "Special Handling")
  * description: A brief description of what this value represents. If the value appears in an EXCLUSIONS section, explicitly state this in the description (e.g., "Port charges - NOT INCLUDED in base cost")
  * value: The numeric MONEY VALUE in USD (remove currency symbols, convert to number, CONVERTED TO USD if original currency is not USD). MUST be a monetary amount, NOT a percentage. MUST be a number for calculation purposes.
- CRITICAL: DO NOT include totals, sums, or grand totals in the "other" array. 
  * If you see a value labeled as "Total", "Sum", "Grand Total", "Final Amount", "Estimated Charges", or similar, check if it equals the sum of other costs you've already extracted. If it does, EXCLUDE it - it's an aggregation, not an individual cost.
  * Before adding any item to "other", verify it's not a subtotal or total of costs already captured in baseCost, serviceItems, or other "other" items.
  * If a value appears to be the sum of baseCost + service costs + other fees, it's a total and should be EXCLUDED.
- EXCLUSIONS HANDLING:
  * If a cost, fee, or charge appears in a section clearly labeled "EXCLUSIONS", "NOT INCLUDED", "EXCLUDED", "NOT COVERED", "EXCLUDED FROM QUOTE", or similar exclusionary language:
    - FIRST: Check if it can be mapped to a service item. If yes, map it to that service item with included:false and cost:[value] (only if there's a specific cost quoted, not from price lists). This applies to ALL service items (e.g., DTHC → destination-terminal-handling, crating fees → crating, storage costs → storage-in-transit, etc.).
    - If the excluded service only shows a price list/rate table (not a specific cost for this shipment), map it to the service item with included:false and cost:null.
    - ONLY if it cannot be mapped to any service item, place it in the "other" array with a description that clearly indicates it is excluded.
  * Excluded items in the "other" array should have keys/descriptions that include words like "excluded", "not-included", or "exclusion" to make it clear they are not part of the base quote.
  * NEVER include excluded values in baseCost calculations, even if they appear to be base shipping costs.
  * The key principle: Excluded costs that relate to a service item should be mapped to that service item (with included:false), not hidden in the "other" array. This ensures proper categorization and comparison across quotes.

BEST EFFORT: Use null for missing values. Include all 8 service items even if not found (set included:false, cost:null).`;

/**
 * Creates the extraction prompt with optional document text
 */
export function createExtractionPrompt(documentText?: string): string {
  if (documentText) {
    return `${EXTRACTION_PROMPT_BASE}

Document text to analyze:
${documentText}`;
  }
  return EXTRACTION_PROMPT_BASE;
}

