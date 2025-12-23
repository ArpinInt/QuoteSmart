'use client';

import React, { useState, useCallback, useRef, DragEvent } from 'react';
import { isSupportedMimeType, getMimeTypeFromExtension } from '@/services/ai/openai/utils';
import { ExtractedQuoteData } from '@/types/extraction';
import CurrencyConversionDialog from './CurrencyConversionDialog';

export interface QuoteRedirectInfo {
  wasRedirected: boolean;
  originalTargetWasArpin: boolean;
  detectedCompanyName: string;
  targetQuoteId: string;
}

interface AIExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtract: (data: ExtractedQuoteData, redirectInfo?: QuoteRedirectInfo) => void;
  quoteId: string;
  /** Whether the target quote is the Arpin column */
  isArpinColumn?: boolean;
  /** Callback to find the first unpopulated competitor quote ID */
  getFirstUnpopulatedCompetitorId?: () => string | null;
}

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'success' | 'redirected' | 'error';

const AIExtractionModal: React.FC<AIExtractionModalProps> = ({
  isOpen,
  onClose,
  onExtract,
  quoteId,
  isArpinColumn = false,
  getFirstUnpopulatedCompetitorId
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [pendingExtractedData, setPendingExtractedData] = useState<ExtractedQuoteData | null>(null);
  const [pendingRedirectInfo, setPendingRedirectInfo] = useState<QuoteRedirectInfo | undefined>(undefined);

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file size (20MB limit)
    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes
    if (selectedFile.size > maxFileSize) {
      setError(`The file is too large. Please upload a file smaller than 20MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB.`);
      setFile(null);
      return;
    }

    // Validate file type
    const mimeType = selectedFile.type || getMimeTypeFromExtension(selectedFile.name);
    
    if (!mimeType || !isSupportedMimeType(mimeType)) {
      setError(`This file type is not supported. Please upload a PDF document, an image file (JPEG, PNG, GIF, or WebP), or a text/CSV file.`);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  // Helper function to convert technical errors to user-friendly messages
  const getUserFriendlyError = useCallback((error: unknown): string => {
    // Log technical error for debugging
    console.error('Extraction error:', error);

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Network/connection errors
      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('failed to fetch')) {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      // API key or authentication errors
      if (errorMessage.includes('api key') || errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        return 'There was an authentication issue. Please contact support if this problem persists.';
      }
      
      // Rate limiting errors
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        return 'The service is currently busy. Please wait a moment and try again.';
      }
      
      // File size or format errors
      if (errorMessage.includes('file size') || errorMessage.includes('too large')) {
        return 'The file is too large. Please try a smaller file or compress the document.';
      }
      
      if (errorMessage.includes('file type') || errorMessage.includes('unsupported') || errorMessage.includes('invalid format')) {
        return 'This file format is not supported. Please upload a PDF, image, or text file.';
      }
      
      // Timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        return 'The request took too long to process. Please try again with a smaller or simpler document.';
      }
      
      // OpenAI specific errors
      if (errorMessage.includes('openai') || errorMessage.includes('model')) {
        return 'The AI service is temporarily unavailable. Please try again in a few moments.';
      }
      
      // Generic API errors
      if (errorMessage.includes('no file provided') || errorMessage.includes('file not found')) {
        return 'No file was provided. Please select a file and try again.';
      }
      
      // Validation or parsing errors
      if (errorMessage.includes('validation') || errorMessage.includes('parse') || errorMessage.includes('invalid')) {
        return 'We couldn\'t read the document properly. Please make sure the file is not corrupted and try again.';
      }
      
      // Server errors (500, 503, etc.)
      if (errorMessage.includes('server error') || errorMessage.includes('internal error') || errorMessage.includes('500')) {
        return 'Our servers encountered an issue. Please try again in a few moments.';
      }
    }
    
    // Default user-friendly message
    return 'We encountered an issue processing your document. Please make sure the file is readable and try again. If the problem persists, contact support.';
  }, []);

  const handleClose = useCallback(() => {
    // Don't allow closing during processing
    if (processingState === 'uploading' || processingState === 'processing') {
      return;
    }

    // Reset state
    setFile(null);
    setError(null);
    setProcessingState('idle');
    setIsDragging(false);
    setShowCurrencyDialog(false);
    setPendingExtractedData(null);
    setPendingRedirectInfo(undefined);
    onClose();
  }, [processingState, onClose]);

  const handleCurrencyDialogConfirm = useCallback(() => {
    if (!pendingExtractedData) return;

    setShowCurrencyDialog(false);
    
    // Show appropriate state based on redirect
    if (pendingRedirectInfo?.wasRedirected) {
      setProcessingState('redirected');
    } else {
      setProcessingState('success');
    }
    
    // Wait a moment to show success
    const delay = 1000;
    setTimeout(() => {
      onExtract(pendingExtractedData, pendingRedirectInfo);
      handleClose();
    }, delay);
  }, [pendingExtractedData, pendingRedirectInfo, onExtract, handleClose]);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setProcessingState('uploading');
    setError(null);

    try {
      // Create FormData to send file to API
      const formData = new FormData();
      formData.append('file', file);

      // Upload and extract data
      setProcessingState('processing');
      const response = await fetch('/api/extract-quote', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'We couldn\'t process your document. Please try again.';
        
        try {
          const errorData = await response.json();
          // Use the error from API if available, but convert to user-friendly
          if (errorData.error) {
            errorMessage = getUserFriendlyError(new Error(errorData.error));
          } else {
            // Handle HTTP status codes
            if (response.status === 400) {
              errorMessage = 'The file format is not supported or the file is invalid. Please check your file and try again.';
            } else if (response.status === 413) {
              errorMessage = 'The file is too large. Please try a smaller file.';
            } else if (response.status === 500) {
              errorMessage = 'Our servers encountered an issue. Please try again in a few moments.';
            } else if (response.status === 503) {
              errorMessage = 'The service is temporarily unavailable. Please try again later.';
            }
          }
        } catch {
          // If we can't parse the error response, use status-based message
          if (response.status === 400) {
            errorMessage = 'The file format is not supported or the file is invalid. Please check your file and try again.';
          } else if (response.status >= 500) {
            errorMessage = 'Our servers encountered an issue. Please try again in a few moments.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const extractedData: ExtractedQuoteData = await response.json();

      // Check if user tried to upload a non-Arpin quote to the Arpin column
      let currentRedirectInfo: QuoteRedirectInfo | null = null;
      let targetQuoteId = quoteId;

      if (isArpinColumn && !extractedData.isArpinQuote) {
        // User uploaded a competitor quote to the Arpin column
        // Find the first unpopulated competitor column
        const competitorId = getFirstUnpopulatedCompetitorId?.();
        
        if (competitorId) {
          targetQuoteId = competitorId;
          currentRedirectInfo = {
            wasRedirected: true,
            originalTargetWasArpin: true,
            detectedCompanyName: extractedData.companyName,
            targetQuoteId: competitorId
          };
        } else {
          // No unpopulated competitor columns available
          // Still process but notify the user
          currentRedirectInfo = {
            wasRedirected: false,
            originalTargetWasArpin: true,
            detectedCompanyName: extractedData.companyName,
            targetQuoteId: quoteId
          };
        }
      }

      // Check if currency conversion is needed
      if (extractedData.originalCurrency && 
          extractedData.originalCurrency !== 'USD' && 
          extractedData.exchangeRate !== null) {
        // Show currency conversion dialog
        setPendingExtractedData(extractedData);
        setPendingRedirectInfo(currentRedirectInfo || undefined);
        setShowCurrencyDialog(true);
        // Keep processing state as 'success' so modal shows success state while dialog is visible
        setProcessingState('success');
        return;
      }

      // No currency conversion needed, proceed normally
      // Show appropriate state based on redirect
      if (currentRedirectInfo?.wasRedirected) {
        setProcessingState('redirected');
      } else {
        setProcessingState('success');
      }
      
      // Wait a moment to show success
      const delay = 1000;
      setTimeout(() => {
        onExtract(extractedData, currentRedirectInfo || undefined);
        handleClose();
      }, delay);
    } catch (err) {
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError);
      setProcessingState('error');
    }
  }, [file, onExtract, getUserFriendlyError, handleClose, quoteId, isArpinColumn, getFirstUnpopulatedCompetitorId]);

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isOpen) return null;

  const isProcessing = processingState === 'uploading' || processingState === 'processing';
  const canClose = !isProcessing;

  return (
    <>
      {/* Currency Conversion Dialog */}
      {pendingExtractedData && pendingExtractedData.originalCurrency && 
       pendingExtractedData.originalCurrency !== 'USD' && 
       pendingExtractedData.exchangeRate !== null && (
        <CurrencyConversionDialog
          isOpen={showCurrencyDialog}
          originalCurrency={pendingExtractedData.originalCurrency}
          exchangeRate={pendingExtractedData.exchangeRate}
          onConfirm={handleCurrencyDialogConfirm}
        />
      )}

      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={canClose && !showCurrencyDialog ? handleClose : undefined}
      >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity ${
          isProcessing ? 'opacity-75' : 'opacity-50'
        }`}
      />

      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#FFFDF9' }}
      >
        {/* Header */}
        <div className="bg-[var(--arpin-primary-blue)] px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <h2 className="text-xl font-semibold text-white font-lato">AI Document Extraction</h2>
            </div>
            {canClose && (
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-100 mt-2">
            Upload a quote document (PDF, image, or text file) to automatically extract quote data
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {processingState === 'idle' || processingState === 'error' ? (
            <>
              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClickUpload}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[var(--arpin-primary-blue)] bg-blue-50'
                    : file
                    ? 'border-[var(--arpin-green)] bg-green-50'
                    : 'border-gray-300 hover:border-[var(--arpin-primary-blue)] hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv"
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-4">
                    <svg className="h-16 w-16 mx-auto text-[var(--arpin-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setError(null);
                      }}
                      className="text-sm text-[var(--arpin-primary-blue)] hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <svg className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drag and drop your document here
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Supported: PDF, Images (JPEG, PNG, GIF, WebP), TXT, CSV • Max size: 20MB
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={!file}
                  className={`px-6 py-2 text-white font-semibold rounded-md transition-all ${
                    file
                      ? 'bg-[var(--arpin-primary-blue)] hover:bg-[var(--arpin-medium-blue)] shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Extract Quote Data
                </button>
              </div>
            </>
          ) : (
            /* Processing State */
            <div className="py-12">
              <AILoadingAnimation state={processingState} />
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

// Cool AI Loading Animation Component
const AILoadingAnimation: React.FC<{ state: ProcessingState }> = ({ state }) => {
  const messages = {
    uploading: 'Uploading document...',
    processing: 'Analyzing document with AI...',
    success: 'Extraction complete!',
    redirected: 'Extraction complete!',
    error: 'Something went wrong'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Animated AI Icon */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <div className="h-24 w-24 rounded-full bg-[var(--arpin-primary-blue)] opacity-20"></div>
        </div>
        <div className="relative">
          <svg 
            className="h-24 w-24 text-[var(--arpin-primary-blue)] animate-pulse" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" 
            />
          </svg>
        </div>
      </div>

      {/* Animated Dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full bg-[var(--arpin-primary-blue)] animate-bounce"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>

      {/* Status Message */}
      <p className="text-lg font-semibold text-gray-900 font-lato">
        {messages[state as keyof typeof messages]}
      </p>

      {/* Processing Steps */}
      {state === 'processing' && (
        <div className="w-full max-w-md space-y-2 mt-4">
          {[
            'Reading document content...',
            'Identifying quote details...',
            'Extracting service items...',
            'Calculating costs...'
          ].map((step, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm text-gray-600 animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <div className="h-2 w-2 rounded-full bg-[var(--arpin-primary-blue)]"></div>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}

      {/* Success Checkmark */}
      {(state === 'success' || state === 'redirected') && (
        <div className="mt-4">
          <svg className="h-16 w-16 text-[var(--arpin-green)] animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AIExtractionModal;

