import React from 'react';
import Image from 'next/image';

const QuoteHeader: React.FC = () => {
  return (
    <div className="quote-header">
      {/* Arpin Navigation Header */}
      <div className="bg-white text-gray-800 shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center" style={{ height: '88px' }}>
            {/* Logo */}
            <div className="flex items-center">
              <a 
                href="https://www.arpinintl.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-all duration-200 hover:drop-shadow-md"
                style={{ filter: 'hover:drop-shadow(0 4px 8px var(--arpin-sky-blue))' }}
              >
                <Image
                  src="/arpin-logo.webp"
                  alt="Arpin International Movers"
                  width={120}
                  height={40}
                  className="h-8 w-auto transition-all duration-200"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="py-8" style={{backgroundColor: '#FFFDF9'}}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* QuoteSmart Branding */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-1 bg-[var(--arpin-orange)] mr-3"></div>
              <div className="text-center">
                <Image
                  src="/quotes-smart.webp"
                  alt="QuoteSmart by Arpin"
                  width={160}
                  height={64}
                  className="h-12 w-auto"
                />
              </div>
              <div className="w-12 h-1 bg-[var(--arpin-orange)] ml-3"></div>
            </div>
            
            {/* Main Heading */}
            <h2 className="text-4xl font-black text-[var(--arpin-primary-blue)] mb-4 leading-none font-lato">
              Most Quotes Miss Fees<br />
              You won&apos;t See<br />
              Until it&apos;s Too Late.
            </h2>
            
            {/* Orange Divider Line */}
            <div className="w-72 h-px bg-[var(--arpin-orange)] mx-auto mb-4"></div>
            
            {/* Feature Points */}
            <div className="flex items-center justify-center space-x-3 mb-4 text-xs text-gray-700">
              <div className="flex items-center">
                <svg className="h-3 w-3 text-[var(--arpin-sky-blue)] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No Commitment
              </div>
              <div className="flex items-center">
                <svg className="h-3 w-3 text-[var(--arpin-sky-blue)] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No Spam
              </div>
              <div className="flex items-center">
                <svg className="h-3 w-3 text-[var(--arpin-sky-blue)] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No Headaches
              </div>
              <div className="flex items-center">
                <svg className="h-3 w-3 text-[var(--arpin-sky-blue)] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No Surprises
              </div>
            </div>
            
            {/* Description */}
            <div className="max-w-3xl mx-auto">
              <p className="text-base text-gray-700">
                Use Arpin&apos;s QuoteSmart™ to compare what&apos;s included in your moving estimate. Enter the 
                companies you would like to compare to Arpin, check off the services they include, and see how 
                Arpin stands apart with transparency and full-service value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteHeader; 