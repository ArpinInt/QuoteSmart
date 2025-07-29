import React from 'react';
import { QuoteData } from '@/types/quote';

interface QuoteSetupSectionProps {
  quotes: QuoteData[];
  onAddQuote: () => void;
  onRemoveQuote: (quoteId: string) => void;
  onUpdateCompanyName: (quoteId: string, companyName: string) => void;
  onUpdateBaseCost: (quoteId: string, baseCost: number | null) => void;
  onClearAll: () => void;
}

const QuoteSetupSection: React.FC<QuoteSetupSectionProps> = ({
  quotes,
  onAddQuote,
  onRemoveQuote,
  onUpdateCompanyName,
  onUpdateBaseCost,
  onClearAll
}) => {
  const handleBaseCostChange = (quoteId: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    if (value === '' || (!isNaN(numericValue!) && numericValue! >= 0)) {
      onUpdateBaseCost(quoteId, numericValue);
    }
  };

  const nonArpinQuotes = quotes.filter(q => q.id !== 'arpin-quote');
  const hasArpin = quotes.some(q => q.id === 'arpin-quote');

  return (
    <div className="border-b border-gray-200">
      {/* Header Section */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-[var(--arpin-primary-blue)] font-lato">Quote Setup</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-medium">
              {nonArpinQuotes.length} of 4 competitor quotes {hasArpin && '+ Arpin'}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClearAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--arpin-primary-blue)] transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
              {nonArpinQuotes.length < 4 && (
                <button
                  onClick={onAddQuote}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--arpin-primary-blue)] hover:bg-[var(--arpin-medium-blue)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--arpin-primary-blue)] transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Quote
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Enter company names and their base moving costs. Base cost typically includes basic transportation 
          service but may exclude additional services listed below.
        </p>
      </div>

      {/* Quote Setup Cards */}
      <div className="p-6">
        <div className="overflow-x-auto horizontal-scroll">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${quotes.length}, minmax(280px, 1fr))` }}>
            {quotes.map((quote) => {
              const isArpin = quote.id === 'arpin-quote';
              const displayIndex = isArpin ? null : nonArpinQuotes.findIndex(q => q.id === quote.id) + 1;
              
              return (
                <div 
                  key={quote.id} 
                  className={`rounded-lg border-2 p-5 transition-colors ${
                    isArpin 
                      ? 'bg-blue-50 border-[var(--arpin-primary-blue)]' 
                      : 'bg-gray-50 border-gray-200 hover:border-[var(--arpin-light-blue)]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isArpin ? 'bg-[var(--arpin-primary-blue)]' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-600">
                        {isArpin ? 'Arpin Quote' : `Quote ${displayIndex}`}
                      </span>
                    </div>
                    {!isArpin && nonArpinQuotes.length > 2 && (
                      <button
                        onClick={() => onRemoveQuote(quote.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove quote"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Company Name Input */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={quote.companyName}
                      onChange={(e) => onUpdateCompanyName(quote.id, e.target.value)}
                      disabled={isArpin}
                      className={`w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent ${
                        isArpin ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                      }`}
                      placeholder={isArpin ? 'Arpin International' : 'Enter company name'}
                    />
                  </div>

                  {/* Base Cost Input */}
                  <div className="mb-3">
                    <label 
                      htmlFor={`base-cost-${quote.id}`}
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Base Moving Cost
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg font-medium">$</span>
                      </div>
                      <input
                        id={`base-cost-${quote.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={quote.baseCost ?? ''}
                        onChange={(e) => handleBaseCostChange(quote.id, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white text-gray-900 font-medium text-lg"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  {/* Display formatted cost */}
                  {quote.baseCost !== null && (
                    <div className="text-sm text-gray-600 font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(quote.baseCost)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-t border-blue-200 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> The base cost should be the primary moving fee before any additional services. 
              If a quote includes services like packing or storage, those should be noted in the service items section below.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSetupSection; 