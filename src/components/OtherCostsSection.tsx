import React from 'react';
import Image from 'next/image';
import { QuoteData } from '@/types/quote';

interface OtherCostsSectionProps {
  quotes: QuoteData[];
  onUpdateCompanyName?: (quoteId: string, companyName: string) => void;
  onUpdateOtherCost: (quoteId: string, costKey: string, value: number | null) => void;
}

const OtherCostsSection: React.FC<OtherCostsSectionProps> = ({
  quotes,
  onUpdateCompanyName,
  onUpdateOtherCost
}) => {
  const handleCostChange = (quoteId: string, costKey: string, value: string) => {
    // Convert empty string to 0 to keep the item visible
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (value === '' || (!isNaN(numericValue!) && numericValue! >= 0)) {
      onUpdateOtherCost(quoteId, costKey, numericValue);
    }
  };
  // Normalize key for comparison (lowercase, trim, replace spaces/underscores with hyphens)
  const normalizeKey = (key: string): string => {
    if (!key) return '';
    return key.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Collect all unique other cost items across all quotes
  // Use normalized key as the Map key for deduplication
  const allOtherCosts = new Map<string, { 
    normalizedKey: string;
    key: string; 
    label: string; 
    description: string;
    originalKeys: Set<string>; // Track all original keys that map to this normalized key
  }>();
  
  quotes.forEach(quote => {
    if (quote.other && quote.other.length > 0) {
      quote.other.forEach(item => {
        const normalized = normalizeKey(item.key);
        
        // Skip if key is empty after normalization
        if (!normalized) return;
        
        if (!allOtherCosts.has(normalized)) {
          // New unique item - add it
          allOtherCosts.set(normalized, {
            normalizedKey: normalized,
            key: item.key, // Use first occurrence's key as primary
            label: item.label,
            description: item.description,
            originalKeys: new Set([item.key])
          });
        } else {
          // Merge: this normalized key already exists
          const existing = allOtherCosts.get(normalized)!;
          existing.originalKeys.add(item.key);
          // Prefer longer/more descriptive label and description
          if (item.label.length > existing.label.length) {
            existing.label = item.label;
          }
          if (item.description.length > existing.description.length) {
            existing.description = item.description;
          }
        }
      });
    }
  });

  const uniqueOtherCosts = Array.from(allOtherCosts.values());

  // Check if any quote has other costs
  const hasOtherCosts = quotes.some(quote => quote.other && quote.other.length > 0);

  if (!hasOtherCosts) {
    return null;
  }

  const getOtherCostForQuote = (quote: QuoteData, normalizedKey: string) => {
    // Find the cost item by checking if any of the quote's other costs match this normalized key
    if (!quote.other) return undefined;
    
    const costItem = uniqueOtherCosts.find(uc => uc.normalizedKey === normalizedKey);
    if (!costItem) return undefined;
    
    // Find the actual item in the quote that matches any of the original keys
    return quote.other.find(item => costItem.originalKeys.has(item.key));
  };

  return (
    <div className="border-b border-gray-200">
      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full border-collapse table-fixed">
          {/* Table Header */}
          <thead>
            <tr>
              {/* Other Costs Header */}
              <th className="bg-[var(--arpin-primary-blue)] text-white text-left px-6 py-4 font-medium text-sm border-r border-gray-300" style={{ width: '45%' }}>
                <div>
                  <div className="font-semibold font-lato">Other Costs</div>
                  <div className="text-xs text-gray-100 mt-1 font-normal">
                    Additional costs, fees, or charges that were not categorized in the standard service items above.
                  </div>
                </div>
              </th>
              
              {/* Quote Headers */}
              {quotes.map((quote, index) => {
                const isArpin = quote.id === 'arpin-quote';
                return (
                  <th 
                    key={quote.id} 
                    className={`${isArpin ? 'bg-[var(--arpin-primary-blue)]' : 'bg-[var(--arpin-medium-blue)]'} text-white text-center px-4 py-4 font-medium text-sm border-r border-gray-300 min-w-[150px]`}
                  >
                    {isArpin ? (
                      <div className="flex flex-col items-center">
                        <Image
                          src="/arpin-logo-white.png"
                          alt="Arpin International Movers"
                          width={140}
                          height={45}
                          className="h-10 w-auto"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-base font-lato">Comparison {index}</div>
                        <input
                          type="text"
                          value={quote.companyName}
                          onChange={(e) => onUpdateCompanyName?.(quote.id, e.target.value)}
                          className="mt-2 w-full px-3 py-2 text-center bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white"
                          placeholder="Enter Name"
                        />
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {uniqueOtherCosts.map((otherCost, rowIndex) => (
              <tr key={otherCost.normalizedKey} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* Other Cost Description */}
                <td className="px-6 py-4 border-r border-gray-300" style={{ width: '45%' }}>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {otherCost.label}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{otherCost.description}</p>
                  </div>
                </td>

                {/* Quote Columns */}
                {quotes.map((quote) => {
                  const otherCostItem = getOtherCostForQuote(quote, otherCost.normalizedKey);
                  const isArpin = quote.id === 'arpin-quote';
                  // Use the original key from the item if it exists, otherwise use the primary key
                  const costKeyToUse = otherCostItem?.key || otherCost.key;

                  return (
                    <td key={quote.id} className={`px-4 py-4 text-center border-r border-gray-300 ${isArpin ? 'bg-blue-50' : ''}`}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={otherCostItem?.value ?? ''}
                          onChange={(e) => handleCostChange(quote.id, costKeyToUse, e.target.value)}
                          className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OtherCostsSection;

