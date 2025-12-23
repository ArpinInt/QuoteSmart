'use client';

import { useState, useCallback, useMemo } from 'react';
import { QuoteData, DEFAULT_SERVICE_ITEMS, CalculatedMetrics } from '@/types/quote';
import { ExtractedQuoteData } from '@/types/extraction';
import { convertToQuoteData } from '@/types/extraction';
import QuoteHeader from '@/components/QuoteHeader';
import QuoteSetupSection from '@/components/QuoteSetupSection';
import ServiceItemsSection from '@/components/ServiceItemsSection';
import OtherCostsSection from '@/components/OtherCostsSection';
import TotalQuoteEstimatesSection from '@/components/TotalQuoteEstimatesSection';
import ComparisonMetricsSection from '@/components/ComparisonMetricsSection';
import PriceComparisonAnalysis from '@/components/PriceComparisonAnalysis';
import AIExtractionModal, { QuoteRedirectInfo } from '@/components/AIExtractionModal';
import ToastNotification from '@/components/ToastNotification';


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
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
  } | null>(null);

  const calculations = useMemo(() => {
    const calc: Record<string, CalculatedMetrics> = {};
    
    quotes.forEach(quote => {
      const baseCost = quote.baseCost || 0;
      const serviceItemsCost = quote.serviceItems
        .filter(item => !item.included)
        .reduce((sum, item) => sum + (item.cost || 0), 0);
      const otherCosts = quote.other?.reduce((sum, item) => sum + item.value, 0) || 0;
      
      const totalCost = baseCost + serviceItemsCost + otherCosts;
      
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

  const updateOtherCost = useCallback((quoteId: string, costKey: string, value: number | null) => {
    // Normalize key for comparison
    const normalizeKey = (key: string): string => {
      return key.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
    };
    const normalizedCostKey = normalizeKey(costKey);
    
    setQuotes(prev => prev.map(quote => {
      if (quote.id !== quoteId) return quote;
      
      const currentOther = quote.other || [];
      // First try exact match, then try normalized match
      let existingIndex = currentOther.findIndex(item => item.key === costKey);
      if (existingIndex < 0) {
        existingIndex = currentOther.findIndex(item => normalizeKey(item.key) === normalizedCostKey);
      }
      
      let newOther: typeof currentOther;
      
      if (value === null) {
        // If value is null (cleared), set to 0 to keep the item visible
        value = 0;
      }
      
      if (existingIndex >= 0) {
        // Update existing item (use the existing key to preserve it)
        newOther = currentOther.map((item, index) => 
          index === existingIndex ? { ...item, value: value! } : item
        );
      } else {
        // Add new item - we need to get label and description from another quote
        // Try exact key match first, then normalized match
        let sourceQuote = prev.find(q => q.other?.some(item => item.key === costKey));
        let sourceItem = sourceQuote?.other?.find(item => item.key === costKey);
        
        if (!sourceItem) {
          sourceQuote = prev.find(q => q.other?.some(item => normalizeKey(item.key) === normalizedCostKey));
          sourceItem = sourceQuote?.other?.find(item => normalizeKey(item.key) === normalizedCostKey);
        }
        
        if (sourceItem) {
          // Use the source item's key to maintain consistency
          newOther = [...currentOther, {
            key: sourceItem.key,
            label: sourceItem.label,
            description: sourceItem.description,
            value
          }];
        } else {
          // Fallback if we can't find source (shouldn't happen, but be safe)
          newOther = [...currentOther, {
            key: costKey,
            label: costKey,
            description: '',
            value
          }];
        }
      }
      
      return {
        ...quote,
        other: newOther.length > 0 ? newOther : undefined
      };
    }));
  }, []);

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

  const handleExtractWithAI = useCallback((quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setAiModalOpen(true);
  }, []);

  // Get the first unpopulated competitor quote ID
  const getFirstUnpopulatedCompetitorId = useCallback((): string | null => {
    // Find competitor quotes (non-Arpin) that haven't been populated
    const unpopulatedCompetitor = quotes.find(q => 
      q.id !== 'arpin-quote' && 
      q.baseCost === null && 
      q.serviceItems.every(item => !item.included && item.cost === null)
    );
    return unpopulatedCompetitor?.id || null;
  }, [quotes]);

  const handleAIExtract = useCallback((extractedData: ExtractedQuoteData, redirectInfo?: QuoteRedirectInfo) => {
    if (!selectedQuoteId) return;

    // Check if a competitor quote was detected in the Arpin column
    if (redirectInfo?.originalTargetWasArpin && !extractedData.isArpinQuote) {
      // Show notification that it's not an Arpin quote and was redirected
      if (redirectInfo.wasRedirected) {
        setNotification({
          message: `This quote does not appear to be an Arpin quote. It has been populated in a competitor column instead. Detected company: ${redirectInfo.detectedCompanyName}`,
          type: 'warning'
        });
      } else {
        // No competitor column available, but still notify
        setNotification({
          message: `This quote does not appear to be an Arpin quote. Detected company: ${redirectInfo.detectedCompanyName}. Please use a competitor column for this quote.`,
          type: 'warning'
        });
      }
    }

    // Determine which quote to update
    const targetQuoteId = redirectInfo?.wasRedirected ? redirectInfo.targetQuoteId : selectedQuoteId;

    // Convert extracted data to QuoteData format
    const quoteData = convertToQuoteData(
      extractedData,
      targetQuoteId,
      DEFAULT_SERVICE_ITEMS
    );

    // Update the quote with extracted data
    setQuotes(prev => prev.map(quote => 
      quote.id === targetQuoteId ? quoteData : quote
    ));
  }, [selectedQuoteId]);

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
            onExtractWithAI={handleExtractWithAI}
          />
          
          {/* Print content starts here */}
          <div className="print-content">
            <ServiceItemsSection
              quotes={quotes}
              onUpdateServiceItem={updateServiceItem}
              onUpdateCompanyName={updateCompanyName}
            />
            
            <OtherCostsSection
              quotes={quotes}
              onUpdateCompanyName={updateCompanyName}
              onUpdateOtherCost={updateOtherCost}
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

      {/* AI Extraction Modal */}
      <AIExtractionModal
        isOpen={aiModalOpen}
        onClose={() => {
          setAiModalOpen(false);
          setSelectedQuoteId(null);
        }}
        onExtract={handleAIExtract}
        quoteId={selectedQuoteId || ''}
        isArpinColumn={selectedQuoteId === 'arpin-quote'}
        getFirstUnpopulatedCompetitorId={getFirstUnpopulatedCompetitorId}
      />

      {/* Toast Notification */}
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={10000}
        />
      )}

      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <p className="text-xs text-gray-500 text-center">
          * While we strive for accurate cost categorization, our AI-generated allocations are provided for informational purposes only and cannot be guaranteed for accuracy or financial compliance.
        </p>
      </div>
    </div>
  );
}
