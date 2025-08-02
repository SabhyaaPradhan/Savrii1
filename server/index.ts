import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Log environment variables for debugging
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('TOGETHER_API_KEY:', process.env.TOGETHER_API_KEY);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve favicon with correct MIME type
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.sendFile(path.resolve('public/favicon.ico'));
});

app.get('/favicon.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.resolve('public/favicon.png'));
});

// Domain redirection middleware - redirect all traffic to www.savrii.com
app.use((req, res, next) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  
  // Only redirect in production and only for non-API routes
  if (process.env.NODE_ENV === 'production' && 
      host && 
      host !== 'www.savrii.com' && 
      !req.path.includes('/api/')) {
    return res.redirect(301, `https://www.savrii.com${req.url}`);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Override any static file serving for root path to ensure React app loads
app.get('/', (req, res, next) => {
  // Always prioritize React app over any static files
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
