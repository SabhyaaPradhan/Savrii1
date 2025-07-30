# Savrii - AI Client Communication Platform

## Overview

Savrii is a complete, production-ready SaaS web application designed for coaches, consultants, and freelancers to generate AI-powered client responses. The platform features a modern React frontend with dark/light mode theming, Express.js backend with Replit Auth, PostgreSQL database, and advanced GSAP-style animations. Users can generate professional responses instantly with intelligent prompts and customizable tones.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

✓ Enhanced project to "Savrii" brand (renamed from ClientReply AI)
✓ Implemented complete dark/light mode theming with localStorage persistence
✓ Added GSAP-style animations throughout the application:
  - Animated navbar with scroll behavior and sticky positioning
  - Hero section text reveals with staggered animations
  - Pricing cards with fade-in and hover effects
  - Smooth page transitions using Framer Motion
✓ Improved responsive design for all screen sizes
✓ Enhanced visual aesthetics with gradients, hover effects, and improved contrast
✓ Fixed all TypeScript compilation errors
✓ Connected OpenAI API for AI response generation
✓ Integrated Replit Auth with PostgreSQL session storage
✓ Set up complete database schema with usage tracking
✓ Built comprehensive dashboard with sidebar navigation system:
  - Responsive sidebar with 7 main pages (Dashboard, Templates, Prompt Builder, Analytics, Settings, Billing, Contact)
  - Daily usage tracker with gamified progress and upgrade prompts
  - AI confidence panel with performance metrics and scoring
  - Recent replies history with copy-to-clipboard functionality
  - Tone training system for custom brand voice development
  - Quick actions panel and integration links (Zapier, Gmail)
  - User profile dropdown with avatar, settings, and logout
  - Loading skeletons, toast notifications, and smooth animations
✓ Applied Playfair Display + Poppins typography consistently across all components
✓ Maintained navbar and footer structure for both authenticated and non-authenticated states
✓ Created comprehensive Analytics page with Recharts integration:
  - Real-time usage metrics and daily/weekly/total response tracking
  - Trial progress indicators with upgrade prompts when near limits
  - Interactive charts: daily usage trends, popular templates pie chart, activity heatmaps
  - Performance metrics: confidence scoring, generation time, success rates
  - Responsive design with dark/light mode support
✓ Built complete Billing & Plans page with Stripe-ready architecture:
  - Current plan display with feature lists and renewal dates
  - Usage overview with progress bars and limit tracking
  - Plan upgrade/downgrade interface with pricing comparison
  - Payment method management and billing history display
  - Trial countdown and upgrade prompts for free users
  - Cancellation and plan change functionality
✓ **COMPLETED REAL-TIME DATA INTEGRATION (January 26, 2025)**:
  - Replaced ALL mock/fake data with real database queries
  - Added comprehensive database schema: reviews, contact messages, enhanced analytics tracking
  - Updated storage layer with real analytics methods (daily usage, template usage, activity heatmaps)
  - Modified server routes to fetch authentic user data from PostgreSQL database
  - Analytics page now shows actual user response data, confidence scores, and usage patterns
  - Billing page displays real user plan information and usage statistics
✓ **ADDED REVIEW FUNCTIONALITY**:
  - Built complete ReviewsSection component with star ratings and user feedback
  - Integrated review submission with authentication and form validation
  - Added reviews display on landing page with real-time data fetching
  - Implemented review management with public/private visibility controls
✓ **ENHANCED CONTACT PAGE**:
  - Created professional contact form with comprehensive validation
  - Connected contact form to real API endpoint for message storage
  - Added contact information cards with support hours and communication options
  - Implemented success states and error handling for contact submissions
✓ **COMPLETED MOSSY HOLLOW THEME IMPLEMENTATION (January 26, 2025)**:
  - Successfully replaced all indigo/purple color schemes with natural green/emerald palette
  - Updated navbar, landing page, dashboard, and all components to earth-tone Mossy hollow theme
  - Replaced Poppins font with Inter (as Aeonik replacement) across entire platform
  - Removed all AI-related icons (Bot) and replaced with natural alternatives (Leaf, MessageSquare)
  - Updated color gradients from indigo-purple to green-emerald throughout application
  - Applied consistent "Smart Response" branding instead of "AI Response" terminology
  - Maintained dark/light mode compatibility with new color palette
  - **UPDATED (January 26, 2025)**: Changed Savrii logo font from Inter to Poppins across all components
  - Fixed contact page double footer issue and removed Bot icon from footer branding
  - **UPDATED (January 26, 2025)**: Changed all headers to use Playfair Display font while keeping Inter for body text and Poppins for Savrii logo
✓ **IMPLEMENTED GSAP REVEALER ANIMATION SYSTEM (January 26, 2025)**:
  - Added GSAP-based revealer animation with two full-screen divs (.revealer.r-1 and .revealer.r-2)
  - Implemented sequential slide-up reveal effect using gsap.to() transitions with expo.inOut easing
  - Created smooth, timed animation that matches CodeGrid landing page reveal style
  - Fixed GSAP staggerFrom deprecation issues with modern fromTo syntax for timeline animations
  - Added proper z-index layering and transform origins for smooth animation performance
  - Integrated revealer animation with existing block reveal and hero content animations
  - Added accessibility support for users who prefer reduced motion
  - Fixed reveal block visibility issue - green overlay now properly disappears after animation completes
  - **UPDATED (January 26, 2025)**: Simplified to only upward revealer animation, removed sideways block reveal
  - **UPDATED (January 26, 2025)**: Removed "Loading" text for cleaner animation experience
  - **UPDATED (January 26, 2025)**: Fixed navbar timing to appear only after revealer blocks complete sliding
  - **UPDATED (January 26, 2025)**: Enhanced to 8 AI-themed revealer animation system with authentic Google AI images:
    - Replaced Pexels images with 8 authentic Google AI research images from Google sources
    - Images include: Google Imagen research samples, DeepDream neural network visualizations, Google AI blog content
    - Staggered animation sequence with decreasing delay intervals for cascading reveal effect
    - Professional AI technology aesthetics aligned with Savrii's smart response platform branding
✓ **IMPLEMENTED RESPONSIVE TESTIMONIAL SLIDER (January 27, 2025)**:
  - Built fully responsive testimonial slider with proper breakpoint handling (3 on desktop ≥1024px, 1 on mobile <768px)
  - Added smooth auto-sliding every 4 seconds with hover pause and touch/swipe gestures for mobile navigation
  - Enhanced UI with larger mobile dots, hidden arrows on mobile, and 700ms smooth transitions with ease-in-out timing
  - Testimonials automatically reset when switching between mobile/desktop breakpoints
✓ **UPDATED DOMAIN CONFIGURATION (January 27, 2025)**:
  - Updated all domain references from https://savrii.com to https://www.savrii.com
  - Updated Open Graph meta tags, Twitter Card tags, canonical URLs, and Schema.org structured data
  - Updated SEO references across landing page, about page, FAQ page, and contact page
  - Maintained email address as hello@savrii.com (without www subdomain)
✓ **IMPLEMENTED CUSTOM LOGO INTEGRATION (January 27, 2025)**:
  - Replaced all plan icons in pricing page with user-provided custom green hexagonal "S" logo
  - Updated auth page to use custom logo instead of Bot icon
  - Fixed pricing page theme consistency by replacing remaining indigo/purple gradients with green/emerald
  - Added comprehensive SEO metadata to pricing and auth pages with proper structured data
  - Removed green background containers from logo displays - logo now shows as-is
  - Fixed all purple/indigo buttons and links in auth page to use green theme
✓ **FIXED AUTHENTICATION DOMAIN REDIRECTS (January 27, 2025)**:
  - Updated authentication system to prioritize www.savrii.com custom domain over replit.app
  - Modified login/callback routes to use current request host for domain matching
  - Changed successful login redirect from "/" to "/dashboard" for better UX
  - Updated session cookie configuration with proper domain settings (.savrii.com for production)
  - Added sameSite: "lax" for better cross-domain compatibility
  - Fixed logout redirect to maintain current domain instead of switching to replit.app
✓ **IMPLEMENTED COMPLETE SUBSCRIPTION SYSTEM WITH TRIAL ENFORCEMENT (January 27, 2025)**:
  - Corrected subscription plan structure: Starter Free (50 queries/day, 14-day trial), Pro & Enterprise (unlimited queries)
  - Added trial expiration logic that blocks feature access after 14 days for Starter users
  - Enhanced feature gating system with FeatureGate component showing trial expiration warnings
  - Updated usage tracker to display exact days remaining in trial for Starter plan users
  - Implemented proper trial period calculation and enforcement in backend API routes
  - Added comprehensive upgrade prompts throughout dashboard when trial expires or for Pro features
  - Modified sidebar to show trial countdown with color-coded urgency indicators
  - Enhanced billing page to reflect unlimited queries for Pro/Enterprise plans only
✓ **COMPLETED CUSTOM PROMPTS FUNCTIONALITY (January 27, 2025)**:
  - Built comprehensive Custom Prompts page with full CRUD operations (create, read, update, delete)
  - Added custom_prompts database table with proper schema and relationships
  - Implemented complete API endpoints for prompt management with authentication
  - Created responsive UI with search, filtering, categorization, and tag management
  - Added FeatureGate component for proper Pro plan access control (fixed feature name mapping)
  - Integrated prompts page with sidebar navigation and routing system
  - Enabled favorite/unfavorite, duplicate, and copy-to-clipboard functionality
  - Built comprehensive form validation and error handling
  - Added proper plan-based restrictions: free for Starter users, full access for Pro/Enterprise users
✓ **COMPLETED GMAIL EMAIL INTEGRATION SYSTEM (January 28, 2025)**:
  - Created comprehensive email integration architecture with PostgreSQL database schema
  - Built email integrations page with Gmail App Password setup and SMTP/IMAP configuration
  - Fixed React hooks ordering error in inbox page that was causing crashes
  - Added proper access control - inbox requires email integration to access features
  - **UPDATED (January 28, 2025)**: Replaced complex OAuth 2.0 with simple Gmail App Password approach
  - Created user-friendly Gmail setup form with step-by-step App Password generation instructions
  - Implemented direct SMTP/IMAP connection using Gmail's smtp.gmail.com and imap.gmail.com servers
  - Added comprehensive error handling and success feedback for Gmail App Password connections
  - Users now connect Gmail by generating App Password in Google Account settings (much simpler than OAuth)
  - Set Outlook as "Coming Soon" status per user request (focusing on Gmail first)
  - Gmail integration now works without domain verification or OAuth consent screen issues
✓ **CRITICAL SECURITY FIX - USER ISOLATION IMPLEMENTED (January 28, 2025)**:
  - Fixed critical security vulnerability where users could access other users' data
  - Implemented strict user isolation with requireAuthUser() helper function across all API endpoints
  - Enhanced authentication middleware with comprehensive security logging and audit trails
  - Replaced 50+ insecure user ID references with secure authentication checks
  - Added real-time AI confidence metrics using authentic user data instead of placeholder values
  - Built /api/analytics/confidence endpoint with user-specific confidence calculations
  - Updated AI Confidence Panel to display real performance metrics from user's actual responses
  - Each user now sees only their own emails, conversations, analytics, and AI responses
  - Added security audit logging for all user data access attempts
✓ **IMPLEMENTED CUSTOM FAVICON AND BRANDING (January 29, 2025)**:
  - Added custom Savrii logo favicon (green hexagonal "S" design) to improve brand recognition
  - Created favicon.png file in public directory using user's provided logo
  - Updated HTML head with simple favicon link: `<link rel="icon" type="image/png" href="/favicon.png">`
  - Simplified implementation for immediate display in browser tabs across all devices
  - Favicon now displays consistently with Savrii brand identity on Replit domain

✓ **ENHANCED DYNAMIC FEATURE SECTION WITH INTERACTIVE DEMO (January 29, 2025)**:
  - Created dynamic GSAP-powered "Transform customer communication" feature section with scroll-triggered animations
  - Replaced generic emoji icons with unique Lucide React icons for each social platform
  - **IMPLEMENTED ZOHO DESK-STYLE INTERACTIVE DEMO**: Mobile mockup now displays different interface screenshots when hovering over feature buttons
  - Built 5 unique interface screens: AI Response Generator (suggestion panels), Smart Tone Adapter (tone selection), Context Analysis (emotion detection), Multi-Channel Hub (platform overview), Real-Time Analytics (performance metrics)
  - Each feature hover instantly changes mobile screen content with smooth transitions and platform-specific UI elements
  - Applied responsive light/dark mode text coloring for optimal readability in both themes
  - Removed gradient background per user preference for cleaner appearance
  - Added active state highlighting for currently selected feature with emerald accent colors

✓ **FIXED TRIAL DAY COUNTER PROGRESSION (January 29, 2025)**:
  - Fixed trial day counter that was stuck on "Day 1" for all starter plan users regardless of trial progression
  - Implemented calendar-day-based trial calculation that rolls over at midnight (00:00) instead of elapsed time
  - Updated API to calculate currentTrialDay based on date differences, not time differences
  - Enhanced TrialCountdownDisplay component to show proper trial progression (Day 1, Day 2, Day 3, etc.)
  - Updated UsageTracker Badge component to display "Day X of 14-day trial" instead of "days left in trial"
  - Added getCurrentTrialDay utility function for consistent trial day calculations across the app
  - Trial counter now only displays for starter plan users and accurately reflects trial progression

⚠️ **ACTIVE ISSUE - OAUTH SESSION PERSISTENCE (January 28, 2025)**:
  - Google OAuth authentication working but session cookies not persisting between browser requests
  - Server successfully authenticates users and creates sessions (confirmed in logs)
  - Client-side requests receive 401 Unauthorized despite valid server-side sessions
  - Root cause: Session cookie domain/path configuration preventing proper browser cookie sharing
  - Multiple browser tabs/sessions causing session ID conflicts
  - Implemented session save callbacks and domain fixes but issue persists
  - **IMMEDIATE PRIORITY**: Fix session cookie configuration for proper OAuth flow completion

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with Shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Theme System**: Custom context-based theme provider with dark/light mode support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **AI Integration**: OpenAI GPT-4o for response generation

### Database Architecture
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions table
- **User Management**: Automatic user creation/updates on authentication
- **Security**: Secure cookie-based sessions with HTTP-only flags

### AI Response Generation
- **Model**: OpenAI GPT-4o (latest available model)
- **Features**: 
  - Customizable tone settings (professional, friendly, casual)
  - Context-aware response generation
  - Confidence scoring for generated responses
  - Response time tracking
- **Rate Limiting**: Plan-based daily request limits

### User Plan Management
- **Tiers**: Free Trial (50 responses), Starter (unlimited), Pro (advanced features)
- **Billing**: Multi-currency support (INR, USD, EUR)
- **Usage Tracking**: Daily request counting with automatic reset

### UI Component System
- **Library**: Radix UI primitives with custom styling
- **Design System**: Consistent spacing, typography, and color schemes
- **Responsive**: Mobile-first design with adaptive layouts
- **Animations**: Framer Motion for smooth transitions

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect handles authentication
3. User data synchronized with local database
4. Session created and stored in PostgreSQL
5. Frontend receives user state via protected API endpoint

### AI Generation Flow
1. User inputs client message and selects tone
2. Frontend validates input and checks usage limits
3. Backend processes request through OpenAI API
4. Response generated with confidence scoring
5. Usage statistics updated in database
6. Response returned to frontend with metadata

### State Management
- **Server State**: TanStack React Query with automatic caching
- **Client State**: React context for theme and authentication
- **Form State**: React Hook Form for complex form handling
- **URL State**: Wouter for navigation and routing

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **OpenAI API**: GPT-4o model for AI response generation
- **Replit Auth**: Authentication and user management

### Development Tools
- **Vite**: Development server and build tooling
- **TypeScript**: Type safety across the stack
- **ESBuild**: Production bundling for server code
- **PostCSS**: CSS processing with Autoprefixer

### UI Libraries
- **Radix UI**: Accessible component primitives
- **TailwindCSS**: Utility-first styling framework
- **Framer Motion**: Animation and gesture library
- **Lucide React**: Icon library

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static files served from build output directory

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **OpenAI**: `OPENAI_API_KEY` for AI service access
- **Auth**: Replit Auth configuration via environment variables
- **Sessions**: `SESSION_SECRET` for secure session management

### Production Considerations
- **Serving**: Express serves both API and static frontend files
- **Database**: Connection pooling via Neon serverless
- **Security**: HTTPS enforced, secure session cookies
- **Monitoring**: Request logging with performance metrics

The application follows a clean separation of concerns with shared TypeScript schemas between frontend and backend, ensuring type safety across the entire stack. The architecture supports both development and production environments with appropriate optimizations for each.