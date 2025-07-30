import { ReactNode } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
  children?: ReactNode;
}

export function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = "https://www.savrii.com/og-image.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData,
  children
}: SEOHeadProps) {
  const fullTitle = title.includes("Savrii") ? title : `${title} | Savrii`;
  const baseUrl = "https://www.savrii.com";
  
  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={`${baseUrl}${canonicalUrl}`} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Savrii" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />
      <meta name="twitter:creator" content="@savrii" />
      <meta name="twitter:site" content="@savrii" />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Savrii" />
      <meta name="publisher" content="Savrii" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
      
      {/* Additional head elements */}
      {children}
    </>
  );
}

// Pre-configured SEO components for common pages
export function BrandVoiceSEO() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Savrii Brand Voice Training",
    "applicationCategory": "BusinessApplication",
    "description": "Train AI to perfectly match your brand's voice and communication style with advanced machine learning",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "provider": {
      "@type": "Organization",
      "name": "Savrii",
      "url": "https://www.savrii.com"
    },
    "featureList": [
      "Brand voice analysis and training",
      "Tone characteristic mapping",
      "Custom communication guidelines", 
      "Voice consistency testing",
      "Multi-sample training",
      "Real-time feedback"
    ]
  };
  
  return (
    <SEOHead
      title="Brand Voice Training - AI-Powered Communication Consistency"
      description="Train AI to match your brand's unique voice and communication style. Upload samples, set guidelines, and ensure consistent brand messaging across all communications."
      keywords="brand voice training, AI communication, brand consistency, tone analysis, communication guidelines, brand messaging, voice analysis, AI training"
      canonicalUrl="/brand-voice"
      ogTitle="Train AI to Match Your Brand Voice | Savrii"
      ogDescription="Advanced brand voice training system that analyzes your communication style and trains AI to maintain perfect brand consistency across all messages."
      structuredData={structuredData}
    />
  );
}

export function DashboardSEO() {
  return (
    <SEOHead
      title="Dashboard - Smart Client Communication Hub"
      description="Access your AI-powered communication dashboard. View analytics, manage responses, track usage, and optimize your client communication workflows."
      keywords="communication dashboard, AI responses, client management, analytics, usage tracking"
      canonicalUrl="/dashboard"
      ogTitle="Communication Dashboard | Savrii"
      ogDescription="Centralized hub for managing AI-powered client communications with real-time analytics and workflow optimization."
    />
  );
}

export function IntegrationsSEO() {
  return (
    <SEOHead
      title="Email Integrations - Connect Gmail, Outlook & SMTP"
      description="Seamlessly connect your email accounts with Savrii. Support for Gmail, Outlook, and custom SMTP configurations for AI-powered email responses."
      keywords="email integration, Gmail integration, Outlook integration, SMTP setup, email automation, AI email responses"
      canonicalUrl="/integrations"
      ogTitle="Email Integrations - Connect Your Email | Savrii"
      ogDescription="Connect Gmail, Outlook, and custom email accounts to power your AI communication workflows with secure, reliable integrations."
    />
  );
}

export function AnalyticsSEO() {
  return (
    <SEOHead
      title="Analytics & Insights - Communication Performance Metrics"
      description="Comprehensive analytics for your AI-powered communications. Track response quality, usage patterns, engagement metrics, and optimization opportunities."
      keywords="communication analytics, AI metrics, response analytics, engagement tracking, performance insights, communication optimization"
      canonicalUrl="/analytics"
      ogTitle="Communication Analytics & Insights | Savrii"
      ogDescription="Deep insights into your AI communication performance with detailed analytics, trends, and optimization recommendations."
    />
  );
}