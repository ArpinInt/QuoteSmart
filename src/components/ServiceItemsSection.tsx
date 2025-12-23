import React from 'react';
import Image from 'next/image';
import { QuoteData } from '@/types/quote';

interface ServiceItemsSectionProps {
  quotes: QuoteData[];
  onUpdateServiceItem: (quoteId: string, serviceId: string, included: boolean, cost: number | null) => void;
  onUpdateCompanyName?: (quoteId: string, companyName: string) => void;
}

// Tooltip Component
const ServiceItemTooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative inline-block group">
      <div className="cursor-help">
        <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Tooltip - positioned to the right side to avoid vertical conflicts */}
      <div className="invisible group-hover:visible absolute z-[9999] w-80 p-3 text-sm text-white bg-[var(--arpin-primary-blue)] rounded-lg shadow-xl top-1/2 left-8 transform -translate-y-1/2">
        <div className="relative">
          {children}
          {/* Arrow pointing left */}
          <div className="absolute top-1/2 -left-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-[var(--arpin-primary-blue)] transform -translate-y-1/2 -translate-x-full"></div>
        </div>
      </div>
    </div>
  );
};

const ServiceItemsSection: React.FC<ServiceItemsSectionProps> = ({
  quotes,
  onUpdateServiceItem,
  onUpdateCompanyName
}) => {
  const handleIncludedChange = (quoteId: string, serviceId: string, included: boolean) => {
    const cost = included ? null : 0;
    onUpdateServiceItem(quoteId, serviceId, included, cost);
  };

  const handleCostChange = (quoteId: string, serviceId: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    if (value === '' || (!isNaN(numericValue!) && numericValue! >= 0)) {
      onUpdateServiceItem(quoteId, serviceId, false, numericValue);
    }
  };

  const getServiceItemForQuote = (quote: QuoteData, serviceId: string) => {
    return quote.serviceItems.find(item => item.id === serviceId);
  };

  const tooltipText = "If you don't see this item specifically included in the base cost or listed in the exclusions, you may want to check with the provider if it is included and if not what is the price if needed";

  return (
    <div className="border-b border-gray-200">
      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full border-collapse table-fixed">
          {/* Table Header */}
          <thead>
            <tr>
              {/* Service Items Header */}
              <th className="bg-[var(--arpin-primary-blue)] text-white text-left px-6 py-4 font-medium text-sm border-r border-gray-300" style={{ width: '45%' }}>
                <div>
                  <div className="font-semibold font-lato">Service Items</div>
                  <div className="text-xs text-gray-100 mt-1 font-normal">
                    These items may or may not be included in the base cost, so be sure to check the quote to see if it specifies whether each cost is included in the base cost or is an exclusion. If the line item is NOT included in the base cost, ask how much each item might cost and enter here.
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
            {quotes[0]?.serviceItems.map((serviceTemplate, rowIndex) => (
              <tr key={serviceTemplate.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* Service Item Description */}
                <td className="px-6 py-4 border-r border-gray-300" style={{ width: '45%' }}>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {serviceTemplate.name}
                      </h3>
                      <ServiceItemTooltip>
                        {tooltipText}
                      </ServiceItemTooltip>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{serviceTemplate.subtext}</p>
                  </div>
                </td>

                {/* Quote Columns */}
                {quotes.map((quote) => {
                  const serviceItem = getServiceItemForQuote(quote, serviceTemplate.id);
                  const isArpin = quote.id === 'arpin-quote';
                  if (!serviceItem) return null;

                  return (
                    <td key={quote.id} className={`px-4 py-4 text-center border-r border-gray-300 ${isArpin ? 'bg-blue-50' : ''}`}>
                      <div className="space-y-2">
                        {/* Checkbox with label */}
                        <div className="flex flex-col items-center">
                          <input
                            type="checkbox"
                            checked={serviceItem.included}
                            onChange={(e) => handleIncludedChange(quote.id, serviceTemplate.id, e.target.checked)}
                            className="h-4 w-4 text-[var(--arpin-primary-blue)] focus:ring-[var(--arpin-primary-blue)] border-gray-300 rounded"
                          />
                          <div className="text-xs text-gray-600 mt-1">Included in base</div>
                        </div>

                        {/* Cost Input */}
                        {!serviceItem.included && (
                          <div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">$</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={serviceItem.cost ?? ''}
                                onChange={(e) => handleCostChange(quote.id, serviceTemplate.id, e.target.value)}
                                className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        )}

                        {/* Included Indicator */}
                        {serviceItem.included && (
                          <div className="text-xs text-[var(--arpin-green)] font-medium">
                            ✓ Included
                          </div>
                        )}
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

export default ServiceItemsSection; 