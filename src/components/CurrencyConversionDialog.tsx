'use client';

import React from 'react';

interface CurrencyConversionDialogProps {
  isOpen: boolean;
  originalCurrency: string;
  exchangeRate: number;
  onConfirm: () => void;
}

const CurrencyConversionDialog: React.FC<CurrencyConversionDialogProps> = ({
  isOpen,
  originalCurrency,
  exchangeRate,
  onConfirm
}) => {
  if (!isOpen) return null;

  // Format currency name for display
  const getCurrencyName = (code: string): string => {
    const currencyNames: Record<string, string> = {
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'CAD': 'Canadian Dollar',
      'AUD': 'Australian Dollar',
      'JPY': 'Japanese Yen',
      'CHF': 'Swiss Franc',
      'USD': 'US Dollar'
    };
    return currencyNames[code] || code;
  };

  // Format exchange rate for display (e.g., "1.08" or "0.75")
  const formattedRate = exchangeRate.toFixed(4);
  const rateDisplay = `1 ${originalCurrency} = ${formattedRate} USD`;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        // Don't close on backdrop click - user must click OK
        e.stopPropagation();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Dialog */}
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#FFFDF9' }}
      >
        {/* Header */}
        <div className="bg-[var(--arpin-primary-blue)] px-6 py-4 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-white font-lato">Currency Conversion Notice</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-gray-700">
              The quote you uploaded is in <strong className="font-semibold">{getCurrencyName(originalCurrency)} ({originalCurrency})</strong>.
            </p>
            
            <p className="text-gray-700">
              For comparison purposes, we are converting all monetary values to <strong className="font-semibold">US Dollars (USD)</strong> using the current exchange rate:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-center text-lg font-semibold text-[var(--arpin-primary-blue)]">
                {rateDisplay}
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Exchange rates fluctuate over time. Future changes in exchange rates may impact the accuracy of this comparison.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onConfirm}
              className="px-6 py-2 text-white font-semibold rounded-md transition-all bg-[var(--arpin-primary-blue)] hover:bg-[var(--arpin-medium-blue)] shadow-lg hover:shadow-xl"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConversionDialog;

