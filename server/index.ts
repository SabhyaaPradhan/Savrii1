import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

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

// Domain redirection middleware - allow custom domains
// Only redirect unwanted domains, not all domains
app.use((req, res, next) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';

  // List of allowed domains (add your custom domain here)
  const allowedDomains = [
    'www.savrii.com',
    'savrii.com',
    'localhost:5000',
    'localhost:3000'
    // Add your custom domain here, e.g., 'yourdomain.com', 'www.yourdomain.com'
  ];

  // Only redirect in production for specific unwanted domains
  if (process.env.NODE_ENV === 'production' &&
      host &&
      !allowedDomains.some(domain => host.includes(domain)) &&
      !req.path.includes('/auth/') &&
      !req.path.includes('/api/') &&
      // Only redirect clearly unwanted domains like default platform domains
      (host.includes('.replit.dev') || host.includes('.repl.co'))) {
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

    // Only send response if headers haven't been sent already
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    console.error("Express error handler:", err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
