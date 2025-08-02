# Savrii - AI Customer Support Platform

A modern AI-powered customer support platform built with React, TypeScript, and Express.js.

## Features

- 🤖 AI-powered customer response generation
- 🎨 Custom brand voice and tone management
- 📊 Real-time analytics and insights
- 🔐 Secure authentication system
- 💳 Integrated billing and subscription management
- 📧 Email integration and management
- 🎯 Custom prompts and workflows
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (via Neon)
- **AI**: Together.ai (Llama 3.1 8B)
- **Authentication**: Session-based auth
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Together.ai API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/savrii.git
cd savrii
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
TOGETHER_API_KEY=your_together_ai_api_key
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment

### GitHub Pages

The app is configured to deploy automatically to GitHub Pages when you push to the main branch.

1. Push your changes to the main branch
2. GitHub Actions will automatically build and deploy the app
3. The app will be available at `https://yourusername.github.io/savrii`

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. The built files will be in the `dist/public` directory
3. Deploy the contents of `dist/public` to your web server

## Project Structure

```
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── index.html         # Entry point
├── server/                # Backend Express app
│   ├── routes/            # API route handlers
│   ├── auth.ts            # Authentication logic
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
└── public/                # Static assets
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `GET /api/logout` - User logout
- `GET /api/auth/user` - Get current user

### AI Generation
- `POST /api/generate` - Generate AI response
- `GET /api/conversations` - Get user conversations

### Custom Prompts
- `GET /api/custom-prompts` - Get user prompts
- `POST /api/custom-prompts` - Create new prompt

### Brand Voice
- `GET /api/brand-voice` - Get brand voice settings
- `POST /api/brand-voice` - Update brand voice

### Analytics
- `GET /api/analytics` - Get user analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@savrii.com or create an issue in this repository. 