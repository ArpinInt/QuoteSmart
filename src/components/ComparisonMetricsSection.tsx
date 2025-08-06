import React from 'react';
import { QuoteData, CalculatedMetrics } from '@/types/quote';

interface ComparisonMetricsSectionProps {
  quotes: QuoteData[];
  calculations: Record<string, CalculatedMetrics>;
  onUpdateShipmentDetails: (quoteId: string, field: 'shipmentWeight' | 'shipmentVolume', value: number | null) => void;
  onUpdateTransitTime: (quoteId: string, min: number | null, max: number | null) => void;
  onUpdateInsurance: (quoteId: string, percentage: number | null) => void;
}

const ComparisonMetricsSection: React.FC<ComparisonMetricsSectionProps> = ({
  quotes,
  calculations,
  onUpdateShipmentDetails,
  onUpdateTransitTime,
  onUpdateInsurance
}) => {
  const handleShipmentDetailChange = (quoteId: string, field: 'shipmentWeight' | 'shipmentVolume', value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    if (value === '' || (!isNaN(numericValue!) && numericValue! > 0)) {
      onUpdateShipmentDetails(quoteId, field, numericValue);
    }
  };

  const handleTransitTimeChange = (quoteId: string, field: 'min' | 'max', value: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const numericValue = value === '' ? null : parseInt(value);
    if (value === '' || (!isNaN(numericValue!) && numericValue! > 0)) {
      if (field === 'min') {
        onUpdateTransitTime(quoteId, numericValue, quote.transitTimeMax);
      } else {
        onUpdateTransitTime(quoteId, quote.transitTimeMin, numericValue);
      }
    }
  };

  const handleInsuranceChange = (quoteId: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    if (value === '' || (!isNaN(numericValue!) && numericValue! >= 0 && numericValue! <= 100)) {
      onUpdateInsurance(quoteId, numericValue);
    }
  };

  const getLowestPricePerPound = () => {
    const prices = quotes
      .map(quote => calculations[quote.id]?.pricePerPound)
      .filter(price => price !== null && price !== undefined) as number[];
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const getLowestPricePerCubicFoot = () => {
    const prices = quotes
      .map(quote => calculations[quote.id]?.pricePerCubicFoot)
      .filter(price => price !== null && price !== undefined) as number[];
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const lowestPricePerPound = getLowestPricePerPound();
  const lowestPricePerCubicFoot = getLowestPricePerCubicFoot();

  return (
    <div className="border-b border-gray-200">
      {/* Header Section */}
      <div className="bg-[var(--arpin-primary-blue)] px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-white mb-2 font-lato">Comparison Metrics</h2>
        <p className="text-sm text-gray-100">
          Enter additional details to calculate per-pound and per-cubic-foot pricing, 
          compare transit times, and understand insurance options.
        </p>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="p-6" style={{ minWidth: `${Math.max(1400, quotes.length * 450)}px` }}>
        <div className="space-y-8">
          {/* Shipment Details Section */}
          <div>
            <h3 className="text-md font-semibold text-[var(--arpin-primary-blue)] mb-4 font-lato">Shipment Details</h3>
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-5">
              <div>
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${quotes.length}, minmax(400px, 1fr))` }}>
                  {quotes.map((quote, index) => {
                    const isArpin = quote.id === 'arpin-quote';
                    return (
                      <div key={quote.id} className="space-y-6">
                        <div className="text-center">
                          <label className={`block text-sm ${isArpin ? 'font-bold' : 'font-semibold'} text-[var(--arpin-primary-blue)] mb-4 font-lato`}>
                            {quote.companyName || `Company ${index + 1}`}
                          </label>
                        </div>
                        
                        {/* Weight Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Estimated Shipment Weight (lbs)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={quote.shipmentWeight ?? ''}
                            onChange={(e) => handleShipmentDetailChange(quote.id, 'shipmentWeight', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white text-gray-900 relative z-10"
                            placeholder="0"
                          />
                        </div>

                        {/* Volume Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Estimated Shipment Volume (cu ft)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={quote.shipmentVolume ?? ''}
                            onChange={(e) => handleShipmentDetailChange(quote.id, 'shipmentVolume', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white text-gray-900 relative z-10"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Thin Divider Line */}
            <div className="mt-6 mb-6">
              <div className="w-full h-px bg-gray-300"></div>
            </div>

            {/* Price per lb */}
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-5 mt-6">
              <div className="flex items-center mb-3">
                <label className="block text-sm font-semibold text-gray-900 font-lato">
                  Price per lb
                </label>
                <div className="ml-2 relative group">
                  <button 
                    type="button"
                    className="text-[var(--arpin-primary-blue)] hover:text-[var(--arpin-medium-blue)] text-xs underline focus:outline-none"
                  >
                    What does this mean?
                  </button>
                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10 w-80 p-3 bg-[var(--arpin-primary-blue)] text-white text-xs rounded-lg shadow-lg">
                    Often estimated price differences are attributable to differences in surveyed move size. The actual price of a non-binding quote will be based on actual weight or volume so comparing the price per pound or price per cubic foot may allow for better comparison of how the final price might compare.
                  </div>
                </div>
              </div>
              <div>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${quotes.length}, minmax(350px, 1fr))` }}>
                  {quotes.map((quote, index) => {
                    const isArpin = quote.id === 'arpin-quote';
                    const calc = calculations[quote.id];
                    const pricePerPound = calc?.pricePerPound;
                    const isLowest = pricePerPound && pricePerPound === lowestPricePerPound;
                    
                    return (
                      <div key={quote.id}>
                        <label className={`block text-xs ${isArpin ? 'font-bold' : 'font-medium'} text-[var(--arpin-primary-blue)] mb-1`}>
                          {quote.companyName || `Company ${index + 1}`}
                          {isLowest && pricePerPound && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              Lowest in price per lb
                            </span>
                          )}
                        </label>
                        <div className={`w-full px-3 py-2 border rounded-md font-medium ${
                          isLowest 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-gray-100 border-gray-200 text-gray-700'
                        }`}>
                          {pricePerPound ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(pricePerPound) : '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price per cubic foot */}
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-5 mt-6">
              <div className="flex items-center mb-3">
                <label className="block text-sm font-semibold text-gray-900 font-lato">
                  Price per cubic foot
                </label>
                <div className="ml-2 relative group">
                  <button 
                    type="button"
                    className="text-[var(--arpin-primary-blue)] hover:text-[var(--arpin-medium-blue)] text-xs underline focus:outline-none"
                  >
                    What does this mean?
                  </button>
                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10 w-80 p-3 bg-[var(--arpin-primary-blue)] text-white text-xs rounded-lg shadow-lg">
                    Often estimated price differences are attributable to differences in surveyed move size. The actual price of a non-binding quote will be based on actual weight or volume so comparing the price per pound or price per cubic foot may allow for better comparison of how the final price might compare.
                  </div>
                </div>
              </div>
              <div>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${quotes.length}, minmax(350px, 1fr))` }}>
                  {quotes.map((quote, index) => {
                    const isArpin = quote.id === 'arpin-quote';
                    const calc = calculations[quote.id];
                    const pricePerCubicFoot = calc?.pricePerCubicFoot;
                    const isLowest = pricePerCubicFoot && pricePerCubicFoot === lowestPricePerCubicFoot;
                    
                    return (
                      <div key={quote.id}>
                        <label className={`block text-xs ${isArpin ? 'font-bold' : 'font-medium'} text-[var(--arpin-primary-blue)] mb-1`}>
                          {quote.companyName || `Company ${index + 1}`}
                          {isLowest && pricePerCubicFoot && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              Lowest in price per cu ft
                            </span>
                          )}
                        </label>
                        <div className={`w-full px-3 py-2 border rounded-md font-medium ${
                          isLowest 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-gray-100 border-gray-200 text-gray-700'
                        }`}>
                          {pricePerCubicFoot ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(pricePerCubicFoot) : '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>


          </div>

          {/* Transit Time Section */}
          <div>
            <h3 className="text-md font-semibold text-[var(--arpin-primary-blue)] mb-4 font-lato">Transit Time</h3>
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-5">
              <p className="text-sm text-gray-600 mb-4">
                Enter the estimated transit time range for each company (in days).
              </p>
              <div>
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${quotes.length}, minmax(400px, 1fr))` }}>
                  {quotes.map((quote, index) => {
                    const isArpin = quote.id === 'arpin-quote';
                    return (
                      <div key={quote.id} className="space-y-4">
                        <div className="text-center">
                          <label className={`block text-sm ${isArpin ? 'font-bold' : 'font-semibold'} text-[var(--arpin-primary-blue)] mb-2 font-lato`}>
                            {quote.companyName || `Company ${index + 1}`}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={quote.transitTimeMin ?? ''}
                              onChange={(e) => handleTransitTimeChange(quote.id, 'min', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white text-gray-900 text-center relative z-10"
                              placeholder="Min"
                            />
                          </div>
                          <span className="text-gray-500 text-sm">to</span>
                          <div className="flex-1">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={quote.transitTimeMax ?? ''}
                              onChange={(e) => handleTransitTimeChange(quote.id, 'max', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white text-gray-900 text-center relative z-10"
                              placeholder="Max"
                            />
                          </div>
                          <span className="text-gray-500 text-sm">days</span>
                        </div>
                        {quote.transitTimeMin && quote.transitTimeMax && (
                          <p className="text-xs text-gray-600 mt-1 text-center">
                            {quote.transitTimeMin} - {quote.transitTimeMax} days
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Section */}
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-md font-semibold text-[var(--arpin-primary-blue)] font-lato">
                Insurance Coverage
                <span className="block text-xs font-normal text-gray-600 mt-1">as % of declared value</span>
              </h3>
              <div className="ml-3 relative group">
                <button 
                  type="button"
                  className="text-[var(--arpin-primary-blue)] hover:text-[var(--arpin-medium-blue)] focus:outline-none"
                  title="Insurance information"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-[1000] w-80 p-3 bg-[var(--arpin-primary-blue)] text-white text-xs rounded-lg shadow-lg">
                  Insurance is often quoted as a percentage of declared value which is the total value assigned to the household goods you are shipping. You may be given various deductible options so make sure you are comparing the percentages for the same deductible amounts.
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-5">
              <p className="text-sm text-gray-600 mb-4">
                Enter the insurance coverage percentage offered by each company.
              </p>
              <div>
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${quotes.length}, minmax(400px, 1fr))` }}>
                  {quotes.map((quote, index) => {
                    const isArpin = quote.id === 'arpin-quote';
                    return (
                      <div key={quote.id} className="space-y-4">
                        <div className="text-center">
                          <label className={`block text-sm ${isArpin ? 'font-bold' : 'font-semibold'} text-[var(--arpin-primary-blue)] mb-2 font-lato`}>
                            {quote.companyName || `Company ${index + 1}`}
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={quote.insurancePercentage ?? ''}
                            onChange={(e) => handleInsuranceChange(quote.id, e.target.value)}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white text-gray-900 relative z-10"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonMetricsSection; 