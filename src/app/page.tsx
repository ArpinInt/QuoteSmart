'use client';

import { useState, useCallback, useMemo } from 'react';
import { QuoteData, DEFAULT_SERVICE_ITEMS, CalculatedMetrics } from '@/types/quote';
import QuoteHeader from '@/components/QuoteHeader';
import QuoteSetupSection from '@/components/QuoteSetupSection';
import ServiceItemsSection from '@/components/ServiceItemsSection';
import TotalQuoteEstimatesSection from '@/components/TotalQuoteEstimatesSection';
import ComparisonMetricsSection from '@/components/ComparisonMetricsSection';
import PriceComparisonAnalysis from '@/components/PriceComparisonAnalysis';


const createDefaultQuote = (id: string, companyName: string): QuoteData => ({
  id,
  companyName,
  baseCost: null,
  serviceItems: DEFAULT_SERVICE_ITEMS.map(item => ({
    ...item,
    included: false,
    cost: null
  })),
  shipmentWeight: null,
  shipmentVolume: null,
  transitTimeMin: null,
  transitTimeMax: null,
  insurancePercentage: null
});

const createArpinQuote = (): QuoteData => ({
  id: 'arpin-quote',
  companyName: 'Arpin International',
  baseCost: null,
  serviceItems: DEFAULT_SERVICE_ITEMS.map(item => ({
    ...item,
    included: false, // Don't default all services as included for Arpin
    cost: null
  })),
  shipmentWeight: null,
  shipmentVolume: null,
  transitTimeMin: null,
  transitTimeMax: null,
  insurancePercentage: null
});

export default function QuoteComparisonTool() {
  const [quotes, setQuotes] = useState<QuoteData[]>([
    createArpinQuote(), // Arpin first
    createDefaultQuote('quote-1', 'Company 1'),
    createDefaultQuote('quote-2', 'Company 2')
  ]);

  const calculations = useMemo(() => {
    const calc: Record<string, CalculatedMetrics> = {};
    
    quotes.forEach(quote => {
      const baseCost = quote.baseCost || 0;
      const serviceItemsCost = quote.serviceItems
        .filter(item => !item.included)
        .reduce((sum, item) => sum + (item.cost || 0), 0);
      
      const totalCost = baseCost + serviceItemsCost;
      
      calc[quote.id] = {
        totalCost,
        pricePerPound: quote.shipmentWeight ? totalCost / quote.shipmentWeight : null,
        pricePerCubicFoot: quote.shipmentVolume ? totalCost / quote.shipmentVolume : null
      };
    });
    
    return calc;
  }, [quotes]);

  const addQuote = useCallback(() => {
    const nonArpinQuotes = quotes.filter(q => q.id !== 'arpin-quote');
    if (nonArpinQuotes.length < 4) { // Allow up to 4 non-Arpin quotes + Arpin
      const newId = `quote-${Date.now()}`;
      const newQuote = createDefaultQuote(newId, `Company ${nonArpinQuotes.length + 1}`);
      setQuotes(prev => {
        const arpin = prev.find(q => q.id === 'arpin-quote');
        const others = prev.filter(q => q.id !== 'arpin-quote');
        return [arpin!, ...others, newQuote]; // Keep Arpin at the beginning
      });
    }
  }, [quotes]);

  const removeQuote = useCallback((quoteId: string) => {
    // Don't allow removing Arpin quote
    if (quoteId === 'arpin-quote') return;
    
    const nonArpinQuotes = quotes.filter(q => q.id !== 'arpin-quote');
    if (nonArpinQuotes.length > 2) {
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
    }
  }, [quotes]);

  const updateQuote = useCallback((quoteId: string, updates: Partial<QuoteData>) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === quoteId ? { ...quote, ...updates } : quote
    ));
  }, []);

  const updateCompanyName = useCallback((quoteId: string, companyName: string) => {
    // Don't allow changing Arpin's name
    if (quoteId === 'arpin-quote') return;
    updateQuote(quoteId, { companyName });
  }, [updateQuote]);

  const updateBaseCost = useCallback((quoteId: string, baseCost: number | null) => {
    updateQuote(quoteId, { baseCost });
  }, [updateQuote]);

  const updateServiceItem = useCallback((quoteId: string, serviceId: string, included: boolean, cost: number | null) => {
    setQuotes(prev => prev.map(quote => {
      if (quote.id !== quoteId) return quote;
      
      return {
        ...quote,
        serviceItems: quote.serviceItems.map(item => 
          item.id === serviceId ? { ...item, included, cost } : item
        )
      };
    }));
  }, []);

  const updateShipmentDetails = useCallback((quoteId: string, field: 'shipmentWeight' | 'shipmentVolume', value: number | null) => {
    updateQuote(quoteId, { [field]: value });
  }, [updateQuote]);

  const updateTransitTime = useCallback((quoteId: string, min: number | null, max: number | null) => {
    updateQuote(quoteId, { transitTimeMin: min, transitTimeMax: max });
  }, [updateQuote]);

  const updateInsurance = useCallback((quoteId: string, percentage: number | null) => {
    updateQuote(quoteId, { insurancePercentage: percentage });
  }, [updateQuote]);

  const clearAllQuotes = useCallback(() => {
    setQuotes([
      createArpinQuote(), // Arpin first
      createDefaultQuote('quote-1', 'Company 1'),
      createDefaultQuote('quote-2', 'Company 2')
    ]);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FFFDF9'}}>
      <QuoteHeader />
      
      <div className="main-content max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="shadow-sm border border-gray-200" style={{backgroundColor: '#FFFDF9'}}>
          <QuoteSetupSection
            quotes={quotes}
            onAddQuote={addQuote}
            onRemoveQuote={removeQuote}
            onUpdateCompanyName={updateCompanyName}
            onUpdateBaseCost={updateBaseCost}
            onClearAll={clearAllQuotes}
          />
          
          {/* Print content starts here */}
          <div className="print-content">
            <ServiceItemsSection
              quotes={quotes}
              onUpdateServiceItem={updateServiceItem}
              onUpdateCompanyName={updateCompanyName}
            />
            
            <TotalQuoteEstimatesSection
              quotes={quotes}
              calculations={calculations}
            />
            
            <ComparisonMetricsSection
              quotes={quotes}
              calculations={calculations}
              onUpdateShipmentDetails={updateShipmentDetails}
              onUpdateTransitTime={updateTransitTime}
              onUpdateInsurance={updateInsurance}
            />
            
            <PriceComparisonAnalysis
              quotes={quotes}
              calculations={calculations}
            />
          </div>
        </div>
        
        {/* Print Button */}
        <div className="mt-8 flex justify-center print-button">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200"
            style={{ backgroundColor: 'var(--arpin-orange)' }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
