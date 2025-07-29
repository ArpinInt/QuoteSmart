# Arpin QuoteSmart - Moving Quote Comparison Tool

A sophisticated web application built for Arpin International that allows users to transparently compare moving quotes from different companies. The tool highlights hidden fees and service differences that customers often miss until it's too late.

![Arpin QuoteSmart](public/quotes-smart.webp)

## 🚚 What This Tool Does

QuoteSmart helps customers make informed decisions when choosing a moving company by:

- **Comparing Multiple Quotes**: Side-by-side comparison of up to 5 moving companies (4 competitors + Arpin)
- **Service Transparency**: Detailed breakdown of what's included vs. what costs extra
- **Hidden Fee Detection**: Highlights commonly excluded services like DTHC, customs clearance, and shuttle services
- **Cost Analysis**: Calculates total costs, price per pound, and price per cubic foot
- **Print-Ready Reports**: Generate professional comparison reports for decision-making

## 🏗️ Technical Architecture

### Tech Stack

- **Framework**: Next.js 15.4.3 with React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with custom Arpin brand colors
- **Build Tool**: Turbopack (Next.js dev mode)
- **Deployment**: Optimized for Vercel

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Arpin brand colors
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main quote comparison page
├── components/            # React components
│   ├── QuoteHeader.tsx           # Header with Arpin branding
│   ├── QuoteSetupSection.tsx     # Quote management controls
│   ├── ServiceItemsSection.tsx   # Service comparison grid
│   ├── TotalQuoteEstimatesSection.tsx  # Cost summaries
│   ├── ComparisonMetricsSection.tsx    # Detailed metrics
│   ├── PriceComparisonAnalysis.tsx     # Analysis and recommendations
│   └── Footer.tsx               # Footer component
└── types/
    └── quote.ts           # TypeScript interfaces and default data
```

### Key Components Explained

#### **QuoteData Interface** (`src/types/quote.ts`)
Defines the structure for each moving quote:
- Company information and base costs
- Service items with inclusion status and pricing
- Shipment details (weight, volume, transit time)
- Insurance information

#### **Main Application** (`src/app/page.tsx`)
- State management for multiple quotes using React hooks
- Real-time calculations for cost metrics
- Quote CRUD operations (add, remove, update)
- Print functionality for generating reports

#### **Service Items** 
8 standard moving services are compared:
1. **Origin Services** - Packing and loading
2. **Crating** - Special item protection
3. **Shuttle Services** - Difficult access locations
4. **Parking Permits** - Urban logistics
5. **Storage-in-Transit (SIT)** - Temporary storage
6. **Destination Terminal Handling (DTHC)** - Port fees
7. **Customs Clearance** - International moves
8. **Delivery Services** - Unpacking and placement

### Brand Integration

The application uses Arpin's complete brand palette:
- **Primary Blue** (`#21386d`) - Trust and stability
- **Sky Blue** (`#3099cc`) - Modern communication
- **Vibrant Orange** (`#fa5723`) - Brand accent
- Custom CSS variables ensure consistent branding

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd comparison-tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code analysis

## 🌐 Deploying to Vercel

Vercel is the recommended deployment platform for this Next.js application. Follow these steps:

### Method 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Confirm project directory
   - Link to existing project or create new one
   - Choose production deployment

4. **Access your deployed application**:
   Vercel will provide a URL like `https://comparison-tool-xxx.vercel.app`

### Method 2: Deploy via Vercel Dashboard

1. **Push code to Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

3. **Configure deployment**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables** (if needed):
   This project doesn't require environment variables, but you can add them in the Vercel dashboard under Project Settings > Environment Variables.

5. **Deploy**:
   Click "Deploy" and wait for the build to complete

### Method 3: Deploy via GitHub Integration

1. **Connect GitHub repository to Vercel**:
   - In Vercel dashboard, select "Import Git Repository"
   - Choose your GitHub repository
   - Configure build settings (auto-detected for Next.js)

2. **Automatic deployments**:
   - Every push to `main` branch triggers a production deployment
   - Pull requests create preview deployments
   - Rollback capability available in Vercel dashboard

### Production Optimization

The application is pre-configured for optimal Vercel deployment:

- **Static Assets**: Images in `/public` are automatically optimized
- **Bundle Optimization**: Next.js automatically code-splits for faster loading
- **Edge Functions**: Serverless functions deploy to Vercel Edge Network
- **Analytics**: Add Vercel Analytics with `@vercel/analytics` package if needed

### Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate**:
   - Automatically provisioned by Vercel
   - No additional configuration required

## 🔗 WordPress Integration

This QuoteSmart tool can be integrated with Arpin's existing WordPress website. Here are the recommended approaches:

### Method 1: Direct Link from Resources Page (Recommended)

Add a prominent link in your WordPress site's resources section:

**WordPress Admin Steps:**
1. Navigate to **Pages > Resources** (or relevant page)
2. Add a new section or button linking to your deployed QuoteSmart tool
3. Use compelling call-to-action text like:
   - "Compare Moving Quotes with QuoteSmart™"
   - "Transparent Quote Comparison Tool"
   - "See What Other Movers Don't Include"

**Example WordPress HTML/Block:**
```html
<div class="quote-smart-cta">
  <h3>Compare Moving Quotes Transparently</h3>
  <p>Use our QuoteSmart™ tool to see what's really included in your moving estimate.</p>
  <a href="https://your-quotesmart-domain.vercel.app" 
     class="btn btn-primary" 
     target="_blank">
    Launch QuoteSmart Tool →
  </a>
</div>
```

### Method 2: Subdomain Integration

Set up QuoteSmart on a subdomain for seamless brand experience:

1. **Configure Custom Domain in Vercel:**
   - Domain: `quotesmart.arpinintl.com`
   - Add CNAME record pointing to Vercel

2. **Update WordPress Navigation:**
   ```php
   // Add to WordPress theme's functions.php or menu
   add_filter('wp_nav_menu_items', function($items, $args) {
       if ($args->theme_location == 'primary') {
           $items .= '<li><a href="https://quotesmart.arpinintl.com">Quote Comparison</a></li>';
       }
       return $items;
   }, 10, 2);
   ```

### Method 3: Iframe Embedding (Alternative)

Embed QuoteSmart directly in a WordPress page:

**Create WordPress Page:**
1. Create new page: "Quote Comparison Tool"
2. Add custom HTML block:

```html
<div style="width: 100%; height: 800px; border: none;">
  <iframe 
    src="https://your-quotesmart-domain.vercel.app"
    width="100%" 
    height="100%" 
    frameborder="0"
    title="QuoteSmart Comparison Tool">
  </iframe>
</div>
```

**WordPress CSS (in theme customizer):**
```css
.quotesmart-embed {
  min-height: 100vh;
  padding: 0;
  margin: 0;
}

.quotesmart-embed iframe {
  width: 100%;
  height: 100vh;
  border: none;
}
```

### Method 4: WordPress Plugin Integration

For advanced integration, create a custom WordPress plugin:

**Plugin Structure:**
```php
<?php
/*
Plugin Name: Arpin QuoteSmart Integration
Description: Integrates QuoteSmart comparison tool with WordPress
Version: 1.0
*/

// Add QuoteSmart shortcode
function arpin_quotesmart_shortcode($atts) {
    $attributes = shortcode_atts([
        'height' => '800px',
        'url' => 'https://your-quotesmart-domain.vercel.app'
    ], $atts);
    
    return sprintf(
        '<iframe src="%s" width="100%%" height="%s" frameborder="0"></iframe>',
        esc_url($attributes['url']),
        esc_attr($attributes['height'])
    );
}
add_shortcode('quotesmart', 'arpin_quotesmart_shortcode');

// Add admin menu
function arpin_quotesmart_admin_menu() {
    add_options_page(
        'QuoteSmart Settings',
        'QuoteSmart',
        'manage_options',
        'quotesmart-settings',
        'arpin_quotesmart_settings_page'
    );
}
add_action('admin_menu', 'arpin_quotesmart_admin_menu');
```

### SEO and Analytics Integration

**1. Update WordPress SEO:**
```php
// Add structured data for the quote tool
function add_quotesmart_schema() {
    if (is_page('quote-comparison')) {
        echo '<script type="application/ld+json">';
        echo json_encode([
            "@context" => "https://schema.org",
            "@type" => "WebApplication",
            "name" => "Arpin QuoteSmart",
            "description" => "Moving quote comparison tool",
            "url" => "https://quotesmart.arpinintl.com",
            "applicationCategory" => "BusinessApplication"
        ]);
        echo '</script>';
    }
}
add_action('wp_head', 'add_quotesmart_schema');
```

**2. Google Analytics Integration:**
- Add the same GA tracking code to both WordPress and QuoteSmart
- Set up cross-domain tracking for unified user journey analytics

### Marketing Integration

**WordPress Widget for Homepage:**
```php
// Custom widget for promoting QuoteSmart
class Arpin_QuoteSmart_Widget extends WP_Widget {
    function widget($args, $instance) {
        echo $args['before_widget'];
        echo '<div class="quotesmart-promo">';
        echo '<h4>Get Transparent Moving Quotes</h4>';
        echo '<p>See what other companies hide until it\'s too late.</p>';
        echo '<a href="https://quotesmart.arpinintl.com" class="btn">Compare Quotes</a>';
        echo '</div>';
        echo $args['after_widget'];
    }
}
register_widget('Arpin_QuoteSmart_Widget');
```

### Brand Consistency

Ensure visual consistency between WordPress site and QuoteSmart:

1. **Match Typography:** Use same fonts in both applications
2. **Color Scheme:** Verify Arpin brand colors are identical
3. **Navigation:** Include WordPress site navigation in QuoteSmart if using subdomain
4. **Footer:** Add consistent footer with WordPress site links

### Security Considerations

1. **HTTPS:** Ensure both WordPress and QuoteSmart use SSL
2. **Content Security Policy:** Update WordPress CSP headers if using iframe
3. **Cross-Origin:** Configure CORS if needed for API calls between sites

## 🎨 Customization

### Brand Colors
Modify colors in `src/app/globals.css`:
```css
:root {
  --arpin-primary-blue: #21386d;
  --arpin-orange: #fa5723;
  /* Add your brand colors */
}
```

### Service Items
Update default services in `src/types/quote.ts`:
```typescript
export const DEFAULT_SERVICE_ITEMS = [
  // Modify or add service items
];
```

### Company Branding
Replace logos in `/public/` directory and update references in components.

## 📱 Print Functionality

The application includes print-optimized styling:
- Clean layout for physical reports
- Proper page breaks
- Company branding preserved
- Professional formatting

## 🔧 Troubleshooting

### Common Build Issues

1. **Type Errors**: Ensure all TypeScript interfaces are properly defined
2. **Image Optimization**: Verify all images in `/public` are accessible
3. **CSS Variables**: Check that all custom CSS variables are defined

### Vercel-Specific Issues

1. **Build Timeout**: Contact Vercel support for increased build limits if needed
2. **Function Size**: Optimize bundle size if serverless functions exceed limits
3. **Domain Configuration**: Verify DNS settings for custom domains

## 📄 License

This project is proprietary to Arpin International. All rights reserved.

## 🤝 Support

For technical support or questions about this application, contact the Arpin International development team.

---

**Built with ❤️ for transparent moving experiences**
