import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[var(--arpin-navy-blue)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Contact Info - Column 1 */}
          <div>
            <Image
              src="/arpin-logo-white.png"
              alt="Arpin International Logo"
              width={150}
              height={60}
              className="mb-4"
            />
            <div className="text-sm text-gray-300 space-y-1">
              <p>W. Warwick, RI - USA</p>
              <p>
                <a 
                  href="mailto:arpininfo@arpinintl.com" 
                  className="hover:text-[var(--arpin-light-blue)] transition-colors"
                >
                  arpininfo@arpinintl.com
                </a>
              </p>
            </div>
          </div>

          {/* Company Section - Column 2 */}
          <div>
            <h3 className="font-lato font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.arpinintl.com/about-arpin-international-group/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  About Us
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/careers/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Careers
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/contact/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services Section - Column 3 */}
          <div>
            <h3 className="font-lato font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.arpinintl.com/corporate/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Employee Relocation
                </a>
              </li>
              <li>
                <a href="/services/corporate-moves" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors">
                  Corporate Moves
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/arpin-international-family-movers/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Residential COD
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/storage/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Storage
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/vehicles/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Vehicles
                </a>
              </li>
            </ul>
          </div>

          {/* Popular Destinations Section - Column 4 */}
          <div>
            <h3 className="font-lato font-bold text-lg mb-4">Popular Destinations</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-argentina-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Argentina
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-belgium-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Belgium from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-benelux-and-dach-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Benelux and DACH
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-brazil-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Brazil from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-canada-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Canada from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-costa-rica-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Costa Rica from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-france-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to France from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-ireland-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Ireland from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-italy-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Italy from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-mexico-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Mexico from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-the-netherlands-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Netherlands from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-singapore-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Singapore from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-spain-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Spain from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-switzerland-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to Switzerland from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-uae-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to UAE from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-usa-to-the-uk-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to the UK from USA
                </a>
              </li>
              <li>
                <a href="https://www.arpinintl.com/moving-from-the-uk-to-the-usa-trusted-international-movers/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                  Moving to the USA from UK
                </a>
              </li>
            </ul>
          </div>

          {/* Popular Origins Section - Column 5 */}
          <div>
            <h3 className="font-lato font-bold text-lg mb-4">Popular Origins</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Atlanta</li>
              <li>Boston</li>
              <li>Dallas</li>
              <li>Denver</li>
              <li>Houston</li>
              <li>Ithaca</li>
              <li>Las Vegas</li>
              <li>Los Angeles</li>
              <li>Miami</li>
              <li>Nashville</li>
              <li>New York</li>
              <li>Sacramento</li>
              <li>San Diego</li>
              <li>San Francisco</li>
              <li>Seattle</li>
              <li>Washington DC</li>
            </ul>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mt-12">
          <h3 className="font-lato font-bold text-lg mb-4">Follow Us :</h3>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com/arpininternationalgroup/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">Facebook</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/arpin-international-group/" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://x.com/Arpin_Group/status/1747241809854546070" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">X (Twitter)</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@arpininternational" className="text-gray-300 hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">YouTube</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[var(--arpin-medium-blue)] mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p>Copyright © {new Date().getFullYear()} AIG, All rights reserved. Powered by Arpin Creative</p>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="https://www.arpinintl.com/terms-of-use/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                Terms of use
              </a>
              <a href="https://www.arpinintl.com/privacy-policy/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                Global Privacy Policy
              </a>
              <a href="https://www.arpinintl.com/anti-bribery-policy/" className="hover:text-[var(--arpin-light-blue)] transition-colors" target="_blank" rel="noopener noreferrer">
                Anti Bribery Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 