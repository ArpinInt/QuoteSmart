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
      <div className="bg-[var(--arpin-primary-blue)] px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white font-lato">Quote Setup</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={onClearAll}
                className="inline-flex items-center px-3 py-1.5 border border-white text-sm font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-[var(--arpin-primary-blue)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
              {nonArpinQuotes.length < 4 && (
                <button
                  onClick={onAddQuote}
                  className="inline-flex items-center px-3 py-1.5 border border-white text-sm font-medium rounded-md text-[var(--arpin-primary-blue)] bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
                >
                  <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Quote
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-white opacity-90">
          Enter company names and their base moving costs. Base cost typically includes basic transportation 
          service but may exclude additional services listed below.
        </p>
      </div>

      {/* Quote Setup Cards */}
      <div className="p-4 mb-4">
        <div className="overflow-x-auto horizontal-scroll">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${quotes.length}, minmax(280px, 1fr))` }}>
            {quotes.map((quote) => {
              const isArpin = quote.id === 'arpin-quote';
              const displayIndex = isArpin ? null : nonArpinQuotes.findIndex(q => q.id === quote.id) + 1;
              
              return (
                <div 
                  key={quote.id} 
                  className={`rounded-lg border-2 p-3 transition-colors ${
                    isArpin 
                      ? 'bg-blue-50 border-[var(--arpin-primary-blue)]' 
                      : 'bg-gray-50 border-gray-200 hover:border-[var(--arpin-light-blue)]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isArpin ? 'bg-[var(--arpin-primary-blue)]' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm text-gray-600 ${isArpin ? 'font-bold' : 'font-medium'}`}>
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
                  <div className="mb-3">
                    {isArpin ? (
                      <div className="w-full px-2 py-1.5 flex items-center">
                        <img 
                          src="/arpin-logo.webp" 
                          alt="Arpin International" 
                          className="h-8 w-auto"
                        />
                      </div>
                    ) : (
                      <>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={quote.companyName}
                          onChange={(e) => onUpdateCompanyName(quote.id, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white"
                          placeholder="Enter company name"
                        />
                      </>
                    )}
                  </div>

                  {/* Thin Divider Line */}
                  <div className="my-3">
                    <div className="w-full h-px bg-gray-200"></div>
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
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm font-medium">$</span>
                      </div>
                      <input
                        id={`base-cost-${quote.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={quote.baseCost ?? ''}
                        onChange={(e) => handleBaseCostChange(quote.id, e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--arpin-primary-blue)] focus:border-transparent bg-white text-gray-900 font-medium text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  {/* Display formatted cost */}
                  {quote.baseCost !== null && (
                    <div className="text-xs text-gray-600 font-medium">
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
    </div>
  );
};

export default QuoteSetupSection; 