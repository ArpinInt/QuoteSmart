import React from 'react';
import { QuoteData, CalculatedMetrics } from '@/types/quote';

interface PriceComparisonAnalysisProps {
  quotes: QuoteData[];
  calculations: Record<string, CalculatedMetrics>;
}

const PriceComparisonAnalysis: React.FC<PriceComparisonAnalysisProps> = ({ quotes, calculations }) => {
  // Check if any quote has unknown costs (excluded items with null cost)
  const hasUnknownCosts = quotes.some(quote => 
    quote.serviceItems.some(item => !item.included && item.cost === null)
  );

  // Calculate the lowest values for each metric
  const getLowestValues = () => {
    const totalCosts = quotes.map(quote => calculations[quote.id]?.totalCost || 0).filter(cost => cost > 0);
    const pricesPerPound = quotes.map(quote => calculations[quote.id]?.pricePerPound).filter(price => price !== null && price !== undefined) as number[];
    const pricesPerCubicFoot = quotes.map(quote => calculations[quote.id]?.pricePerCubicFoot).filter(price => price !== null && price !== undefined) as number[];
    
    return {
      lowestTotal: totalCosts.length > 0 ? Math.min(...totalCosts) : null,
      lowestPerPound: pricesPerPound.length > 0 ? Math.min(...pricesPerPound) : null,
      lowestPerCubicFoot: pricesPerCubicFoot.length > 0 ? Math.min(...pricesPerCubicFoot) : null
    };
  };

  const { lowestTotal, lowestPerPound, lowestPerCubicFoot } = getLowestValues();

  // Function to get labels for a quote
  const getQuoteLabels = (quote: QuoteData) => {
    const calc = calculations[quote.id];
    if (!calc) return { labels: [], isBestPrice: false };

    const labels: string[] = [];
    let categoriesChecked = 0;
    let categoriesWon = 0;

    // Check total cost
    if (lowestTotal && calc.totalCost > 0) {
      categoriesChecked++;
      if (calc.totalCost === lowestTotal) {
        labels.push("Lowest Total");
        categoriesWon++;
      }
    }

    // Check price per pound
    if (lowestPerPound && calc.pricePerPound) {
      categoriesChecked++;
      if (calc.pricePerPound === lowestPerPound) {
        labels.push("Lowest per lb.");
        categoriesWon++;
      }
    }

    // Check price per cubic foot
    if (lowestPerCubicFoot && calc.pricePerCubicFoot) {
      categoriesChecked++;
      if (calc.pricePerCubicFoot === lowestPerCubicFoot) {
        labels.push("Lowest per cu ft");
        categoriesWon++;
      }
    }

    // Only show "Best Price" if won ALL applicable categories
    const isBestPrice = categoriesChecked > 0 && categoriesWon === categoriesChecked;

    return { labels, isBestPrice };
  };

  return (
    <div className="border-b border-gray-200">
      {/* Header Section */}
      <div className="bg-[var(--arpin-primary-blue)] px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-white mb-2 font-lato">Price Comparison Analysis</h2>
        <p className="text-sm text-gray-100">
          Detailed breakdown of base costs, service inclusions, totals, and shipment details across all quotes.
        </p>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">Service Item</th>
                {quotes.map((quote, index) => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <th key={quote.id} className={`text-center py-3 px-4 font-semibold min-w-[150px] ${
                      hasAnyLabel 
                        ? 'text-[var(--arpin-green)] bg-green-100 border-2 border-[var(--arpin-green)]' 
                        : 'text-[var(--arpin-primary-blue)] bg-gray-50'
                    }`}>
                      {quote.companyName || `Company ${index + 1}`}
                      {(labels.length > 0 || isBestPrice) && (
                        <div className="flex flex-col items-center mt-1 space-y-1">
                          {isBestPrice ? (
                            <div className="flex items-center justify-center">
                              <svg className="h-4 w-4 mr-1 text-[var(--arpin-green)]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-xs font-medium text-[var(--arpin-green)]">Best Price</span>
                            </div>
                          ) : (
                            labels.map((label, labelIndex) => (
                              <div key={labelIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <svg className="h-3 w-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{label}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Base Cost Row */}
              <tr className="border-b border-gray-100 bg-blue-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Base Cost</td>
                {quotes.map(quote => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <td key={quote.id} className={`py-3 px-4 text-center font-semibold ${
                      hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' : ''
                    }`}>
                      {quote.baseCost !== null 
                        ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(quote.baseCost)
                        : '-'
                      }
                    </td>
                  );
                })}
              </tr>

              {/* Total Cost Row */}
              <tr className="border-b border-gray-100 bg-green-50">
                <td className="py-3 px-4 font-bold text-gray-900">Total Cost</td>
                {quotes.map(quote => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <td key={quote.id} className={`py-3 px-4 text-center font-bold ${
                      hasAnyLabel 
                        ? 'text-[var(--arpin-green)] bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' 
                        : 'text-[var(--arpin-green)]'
                    }`}>
                      {calculations[quote.id] ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(calculations[quote.id].totalCost) : '$0.00'}
                    </td>
                  );
                })}
              </tr>
              
              {/* Service Items */}
              {quotes[0]?.serviceItems.map((serviceItem, itemIndex) => (
                <tr key={serviceItem.id} className={`border-b border-gray-100 ${itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium text-gray-900">{serviceItem.name}</span>
                      <div className="text-xs text-gray-500 mt-1">{serviceItem.subtext}</div>
                    </div>
                  </td>
                  {quotes.map(quote => {
                    const item = quote.serviceItems.find(si => si.id === serviceItem.id);
                    const { labels, isBestPrice } = getQuoteLabels(quote);
                    const hasAnyLabel = labels.length > 0 || isBestPrice;
                    
                    if (!item) {
                      return (
                        <td key={quote.id} className={`py-3 px-4 text-center ${
                          hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' : ''
                        }`}>
                          -
                        </td>
                      );
                    }
                    
                    return (
                      <td key={quote.id} className={`py-3 px-4 text-center ${
                        hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' : ''
                      }`}>
                        {item.included ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Included
                          </span>
                        ) : item.cost !== null ? (
                          <span className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(item.cost)}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            hasAnyLabel 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Unknown*
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* White spacing row */}
              <tr className="bg-white">
                <td className="py-4 px-4 bg-white"></td>
                {quotes.map(quote => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <td key={quote.id} className={`py-4 px-4 ${
                      hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' : 'bg-white'
                    }`}></td>
                  );
                })}
              </tr>

              {/* Shipment Details Section Header */}
              <tr className="border-b border-gray-200 bg-gray-100">
                <td className="py-2 px-4 font-semibold text-gray-700 text-sm">
                  Shipment Details
                </td>
                {quotes.map(quote => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <td key={quote.id} className={`py-2 px-4 font-semibold text-gray-700 text-sm ${
                      hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' : 'bg-gray-100'
                    }`}>
                    </td>
                  );
                })}
              </tr>

              {/* Shipment Weight */}
              <tr className="border-b border-gray-100 bg-white">
                <td className="py-3 px-4 font-medium text-gray-900">Estimated Shipment Weight</td>
                {quotes.map(quote => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <td key={quote.id} className={`py-3 px-4 text-center ${
                      hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' : ''
                    }`}>
                      {quote.shipmentWeight !== null 
                        ? `${quote.shipmentWeight.toLocaleString()} lbs`
                        : '-'
                      }
                    </td>
                  );
                })}
              </tr>

              {/* Shipment Volume */}
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">Estimated Shipment Volume</td>
                {quotes.map(quote => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <td key={quote.id} className={`py-3 px-4 text-center ${
                      hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' : ''
                    }`}>
                      {quote.shipmentVolume !== null 
                        ? `${quote.shipmentVolume.toLocaleString()} cu ft`
                        : '-'
                      }
                    </td>
                  );
                })}
              </tr>

              {/* Insurance Coverage */}
              <tr className="border-b border-gray-100 bg-white">
                <td className="py-3 px-4 font-medium text-gray-900">Insurance Coverage</td>
                {quotes.map(quote => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <td key={quote.id} className={`py-3 px-4 text-center ${
                      hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)]' : ''
                    }`}>
                      {quote.insurancePercentage !== null 
                        ? `${quote.insurancePercentage}%`
                        : '-'
                      }
                    </td>
                  );
                })}
              </tr>

              {/* Transit Time */}
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">Transit Time</td>
                {quotes.map(quote => {
                  const { labels, isBestPrice } = getQuoteLabels(quote);
                  const hasAnyLabel = labels.length > 0 || isBestPrice;
                  return (
                    <td key={quote.id} className={`py-3 px-4 text-center ${
                      hasAnyLabel ? 'bg-green-100 border-l-2 border-r-2 border-[var(--arpin-green)] border-b-2' : ''
                    }`}>
                      {quote.transitTimeMin !== null && quote.transitTimeMax !== null 
                        ? quote.transitTimeMin === quote.transitTimeMax
                          ? `${quote.transitTimeMin} days`
                          : `${quote.transitTimeMin}-${quote.transitTimeMax} days`
                        : quote.transitTimeMin !== null 
                          ? `${quote.transitTimeMin}+ days`
                          : quote.transitTimeMax !== null
                            ? `Up to ${quote.transitTimeMax} days`
                            : '-'
                      }
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footnote for unknown costs */}
        {hasUnknownCosts && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-gray-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-800">*Note on Unknown Costs</p>
                <p className="text-sm text-gray-700 mt-1">
                  Some excluded services have unknown costs. Please contact the moving companies to obtain pricing for these items to complete your comparison.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparisonAnalysis;