import React from 'react';
import { QuoteData, CalculatedMetrics } from '@/types/quote';

interface TotalQuoteEstimatesSectionProps {
  quotes: QuoteData[];
  calculations: Record<string, CalculatedMetrics>;
}

const TotalQuoteEstimatesSection: React.FC<TotalQuoteEstimatesSectionProps> = ({
  quotes,
  calculations
}) => {
  const getLowestTotal = () => {
    const totals = quotes.map(quote => calculations[quote.id]?.totalCost || 0);
    return Math.min(...totals);
  };

  const lowestTotal = getLowestTotal();

  return (
    <div className="border-b border-gray-200">
      {/* Header Section */}
      <div className="bg-[var(--arpin-primary-blue)] px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-white mb-2 font-lato">Total Quote Estimates</h2>
        <p className="text-sm text-gray-100">
          Comparison of total estimated costs including base costs and additional services.
        </p>
      </div>

      <div className="p-6">
        {/* Total Cost Summary Cards */}
        <div className="overflow-x-auto horizontal-scroll">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${quotes.length}, minmax(280px, 1fr))` }}>
            {quotes.map((quote, index) => {
              const calc = calculations[quote.id];
              const isLowest = calc && calc.totalCost === lowestTotal && lowestTotal > 0;
              const isArpin = quote.id === 'arpin-quote';
              
              return (
                <div 
                  key={quote.id} 
                  className={`rounded-lg p-6 border-2 transition-colors ${
                    isLowest 
                      ? 'border-[var(--arpin-green)] bg-green-50' 
                      : isArpin
                      ? 'border-[var(--arpin-primary-blue)] bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-[var(--arpin-light-blue)]'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-[var(--arpin-primary-blue)] mb-2 font-lato">
                      {quote.companyName || `Company ${index + 1}`}
                    </h4>
                    <div className={`text-3xl font-bold mb-2 ${isLowest ? 'text-[var(--arpin-green)]' : 'text-gray-900'}`}>
                      {calc ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(calc.totalCost) : '$0.00'}
                    </div>
                    {isLowest && lowestTotal > 0 && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Lowest Total
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalQuoteEstimatesSection; 