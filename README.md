# Savrii - AI Client Communication Platform

## Overview

Savrii is a complete, production-ready SaaS web application designed for coaches, consultants, and freelancers to generate AI-powered client responses. The platform features a modern React frontend with dark/light mode theming, Express.js backend with Replit Auth, Supabase database, and advanced GSAP-style animations.

## 🚀 Features

### Core Functionality
- **AI-Powered Response Generation**: GPT-4o integration for intelligent client communication
- **Multi-Plan System**: Starter (50 queries), Pro (5,000 queries), Enterprise (unlimited)
- **Real-Time Analytics**: Usage tracking, confidence scoring, performance metrics
- **Export/Import System**: Multiple formats (JSON, CSV, TXT, PDF) with drag-and-drop support
- **Custom Prompts**: Create, manage, and share custom response templates

### Platform Features
- **Authentication**: Secure Replit Auth with session management
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Dark/Light Themes**: Complete theming system with localStorage persistence
- **14+ Dashboard Pages**: Comprehensive feature set with plan-based restrictions
- **Real-Time Data**: All features use authentic database queries (no mock data)

### Technical Features
- **3D Animations**: Three.js integration for dynamic visual elements
- **GSAP Animations**: Professional page transitions and micro-interactions
- **TypeScript**: Full type safety across frontend and backend
- **Modern Stack**: React 18, Express.js, Drizzle ORM, TailwindCSS

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS + Shadcn/ui components
- **State Management**: TanStack React Query
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion + GSAP + Three.js
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth (OpenID Connect)
- **AI Integration**: OpenAI GPT-4o
- **Session Storage**: PostgreSQL-backed sessions

### Database & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM with TypeScript schemas
- **Migrations**: Drizzle Kit for schema management
- **Hosting**: Replit Deployments

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Supabase account
- OpenAI API key
- Replit account (for auth)

### Environment Variables
```bash
DATABASE_URL=your_supabase_connection_string
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
```

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/Sabhyaa-Pradhan/Savrii.git
cd Savrii
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase database**
```bash
npm run db:push
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🏗 Project Structure

```
savrii/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express.js backend
│   ├── routes/             # API route handlers
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   └── index.ts           # Server entry point
├── shared/                 # Shared TypeScript schemas
│   ├── schema.ts          # Drizzle database schemas
│   └── plans.ts           # Subscription plan definitions
└── migrations/            # Database migrations
```

## 🎨 Design System

### Color Palette (Mossy Hollow Theme)
- **Primary**: Emerald/Green tones
- **Secondary**: Natural earth tones
- **Accents**: Complementary forest colors

### Typography
- **Headers**: Playfair Display (elegant serif)
- **Body**: Inter (clean sans-serif)
- **Brand**: Poppins (Savrii logo)

### Animations
- **Page Transitions**: Framer Motion
- **3D Elements**: Three.js geometries
- **Micro-interactions**: GSAP timeline animations
- **Loading States**: Custom skeletons and spinners

## 📊 Database Schema

### Core Tables
- `users` - User accounts and plan management
- `ai_responses` - Generated response history
- `custom_prompts` - User-created templates
- `export_history` - Export/import tracking
- `reviews` - User feedback and ratings
- `sessions` - Authentication sessions

### Analytics Tables
- `usage_stats` - Daily usage tracking
- `confidence_scores` - AI response quality metrics
- `performance_logs` - System performance data

## 🔐 Authentication Flow

1. User initiates login via Replit Auth
2. OpenID Connect handles authentication
3. User data synchronized with Supabase
4. Session created and stored in database
5. Frontend receives user state via protected API

## 🤖 AI Integration

### OpenAI GPT-4o Integration
- **Model**: Latest GPT-4o (May 2024 release)
- **Features**: Context-aware responses, tone customization
- **Rate Limiting**: Plan-based daily request limits
- **Confidence Scoring**: Response quality assessment

### Response Generation Flow
1. User inputs client message and selects tone
2. Frontend validates input and checks usage limits
3. Backend processes request through OpenAI API
4. Response generated with confidence scoring
5. Usage statistics updated in database

## 📈 Plan Management

### Subscription Tiers
- **Starter Free**: 50 queries/day, 14-day trial
- **Pro ($29/month)**: 5,000 queries/month + advanced features
- **Enterprise ($99/month)**: Unlimited queries + premium features

### Feature Gating
- Plan-based access control throughout application
- Trial expiration enforcement
- Usage limit tracking and enforcement
- Upgrade prompts and billing integration ready

## 🔄 Export/Import System

### Supported Formats
- **JSON**: Structured conversation data
- **CSV**: Spreadsheet format with headers
- **TXT**: Plain text conversations
- **PDF**: Formatted document export

### Features
- Drag-and-drop file upload
- File validation and size limits (10MB)
- Export history tracking
- Configurable filters and date ranges

## 🚀 Deployment

### Replit Deployment
1. Connect your GitHub repository to Replit
2. Configure environment variables in Replit Secrets
3. Run `npm run db:push` to set up database
4. Deploy using Replit Deployments

### Production Considerations
- HTTPS enforced with secure session cookies
- Database connection pooling via Supabase
- Request logging and performance monitoring
- Error handling and user feedback systems

## 🧪 Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run db:studio    # Open database studio
```

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration for code consistency
- Prettier for code formatting
- Git hooks for pre-commit validation

## 📝 API Documentation

### Authentication Endpoints
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/callback` - Handle auth callback
- `POST /api/logout` - User logout

### Core API Endpoints
- `POST /api/generate` - Generate AI response
- `GET /api/replies/recent` - Get recent responses
- `GET /api/usage/stats` - Get usage statistics
- `POST /api/export/conversations` - Export data
- `POST /api/import/conversations` - Import data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- Supabase for database infrastructure
- Replit for hosting and authentication
- Vercel for UI components inspiration
- Three.js community for 3D graphics

## 📞 Support

For support and questions:
- Email: hello@savrii.com
- Website: https://www.savrii.com
- Documentation: [Project Wiki](https://github.com/your-username/savrii/wiki)

---

**Built with ❤️ for the coaching and consulting community**
