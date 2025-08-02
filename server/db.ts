import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

neonConfig.webSocketConstructor = ws;

// Get DATABASE_URL from environment or use a development fallback
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/savrii';
console.log('Using DATABASE_URL:', databaseUrl);

export const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 3000,
  max: 1
});

export const db = drizzle({ client: pool, schema });
