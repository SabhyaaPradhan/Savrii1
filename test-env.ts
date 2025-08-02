import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('TOGETHER_API_KEY:', process.env.TOGETHER_API_KEY);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);