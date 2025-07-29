import React from 'react';
import { QuoteData, CalculatedMetrics } from '@/types/quote';

interface PriceAnalysisSectionProps {
  quotes: QuoteData[];
  calculations: Record<string, CalculatedMetrics>;
}

const PriceAnalysisSection: React.FC<PriceAnalysisSectionProps> = ({
  quotes,
  calculations
}) => {
  const hasUnknownCosts = quotes.some(quote => 
    quote.serviceItems.some(item => !item.included && item.cost === null)
  );

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 font-lato">Price Analysis & Service Comparison</h2>
        <p className="text-sm text-gray-600">
          Detailed breakdown of performance metrics and service inclusions across all companies.
        </p>
      </div>

      <div className="p-6">
        {/* Performance Metrics */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-[var(--arpin-primary-blue)] mb-4 font-lato">Performance Metrics</h3>
          <div className="overflow-x-auto horizontal-scroll">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 font-lato">Company</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 font-lato">Total Cost</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 font-lato">Per Pound</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 font-lato">Per Cubic Foot</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 font-lato">Transit Time</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 font-lato">Insurance</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote, index) => {
                  const calc = calculations[quote.id];
                  const isArpin = quote.id === 'arpin-quote';
                  
                  return (
                    <tr key={quote.id} className={`border-b border-gray-200 ${isArpin ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {quote.companyName || `Company ${index + 1}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">
                        {calc ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(calc.totalCost) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">
                        {calc?.pricePerPound ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(calc.pricePerPound) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">
                        {calc?.pricePerCubicFoot ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(calc.pricePerCubicFoot) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">
                        {quote.transitTimeMin && quote.transitTimeMax
                          ? `${quote.transitTimeMin}-${quote.transitTimeMax} days`
                          : quote.transitTimeMin
                          ? `${quote.transitTimeMin}+ days`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">
                        {quote.insurancePercentage ? `${quote.insurancePercentage}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Comparison */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-[var(--arpin-primary-blue)] mb-4 font-lato">Service Inclusions Overview</h3>
          <div className="overflow-x-auto horizontal-scroll">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 font-lato">Service</th>
                  {quotes.map((quote, index) => (
                    <th key={quote.id} className={`px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 font-lato ${quote.id === 'arpin-quote' ? 'bg-blue-100' : ''}`}>
                      {quote.companyName || `Company ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes[0]?.serviceItems.map((serviceTemplate, rowIndex) => (
                  <tr key={serviceTemplate.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {serviceTemplate.name}
                    </td>
                    {quotes.map((quote) => {
                      const serviceItem = quote.serviceItems.find(item => item.id === serviceTemplate.id);
                      const isArpin = quote.id === 'arpin-quote';
                      
                      return (
                        <td key={quote.id} className={`px-4 py-4 text-center ${isArpin ? 'bg-blue-50' : ''}`}>
                          {serviceItem?.included ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Included
                            </span>
                          ) : serviceItem?.cost ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(serviceItem.cost)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Unknown
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warnings */}
        {hasUnknownCosts && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800">Incomplete Cost Information</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Some services have unknown costs, which could significantly impact the final price. 
                  Contact the moving companies to get complete pricing information for accurate comparison.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAnalysisSection; 