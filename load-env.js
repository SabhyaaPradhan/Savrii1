import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

console.log('Environment variables loaded successfully!');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('TOGETHER_API_KEY:', process.env.TOGETHER_API_KEY ? 'Set' : 'Not set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not set');