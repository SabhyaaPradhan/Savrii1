import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const isDatabaseAvailable = !!process.env.DATABASE_URL &&
  process.env.DATABASE_URL !== "postgresql://user:pass@localhost:5432/placeholder";

if (!isDatabaseAvailable) {
  console.warn("DATABASE_URL not properly configured. Some features will use fallback data.");
  // Set a dummy URL to prevent crashes, but we'll handle errors gracefully
  process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/placeholder";
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
  max: 1
});

export const db = drizzle({ client: pool, schema });

// Export flag to check if database is available
export { isDatabaseAvailable };
