import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { isDatabaseAvailable } from "./db";

// Extend Express session type to include returnTo
declare module "express-session" {
  interface SessionData {
    returnTo?: string;
  }
}

// Check for Google OAuth credentials but don't crash the app if missing
const hasGoogleCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

if (!hasGoogleCredentials) {
  console.warn("Warning: Google OAuth credentials not found. Google authentication will be disabled.");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  let sessionStore;

  if (isDatabaseAvailable) {
    // Use PostgreSQL store when database is available
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  } else {
    // Use memory store when database is not available
    console.log("Using memory store for sessions (database unavailable)");
    const MemStore = MemoryStore(session);
    sessionStore = new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    store: sessionStore,
    resave: true, // Force session save on every request
    saveUninitialized: true, // Save uninitialized sessions
    cookie: {
      httpOnly: true,
      secure: false, // Allow cookies in development over HTTP
      maxAge: sessionTtl,
      sameSite: "lax",
      path: "/", // Explicitly set path
      // Don't set domain to allow cookies to work on any domain
      domain: undefined,
    },
    name: "savrii.session", // Custom session name
  });
}

// Get the correct domain for OAuth callback
const getCallbackURL = () => {
  // In development, use the Replit dev domain
  if (process.env.NODE_ENV === 'development') {
    return 'https://63fdb543-6b9f-4796-92d9-980d5a2c95a1-00-2r8z5z1khoka3.janeway.replit.dev/auth/google/callback';
  }
  // In production, use the custom domain
  return 'https://www.savrii.com/auth/google/callback';
};

// Google OAuth Strategy
// Only set up Google OAuth strategy if credentials are available
if (hasGoogleCredentials) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: getCallbackURL()
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Extract user info from Google profile
      const googleUser = {
        id: profile.id,
        email: profile.emails?.[0]?.value || "",
        firstName: profile.name?.givenName || "",
        lastName: profile.name?.familyName || "",
        profileImageUrl: profile.photos?.[0]?.value || "",
        accessToken,
        refreshToken
      };

      // Create or update user in database
      const user = await storage.upsertUser(googleUser);
      
      return done(null, user);
    } catch (error) {
      console.error("Google auth error:", error);
      return done(error, null);
    }
  }));
}

// Serialize/deserialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(null, false);
  }
});

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  // Only set up Google OAuth routes if credentials are available
  if (hasGoogleCredentials) {
    app.get("/auth/google", (req, res, next) => {
      // Store return URL in session if provided
      if (req.query.returnTo) {
        req.session.returnTo = decodeURIComponent(req.query.returnTo as string);
      }
      
      passport.authenticate("google", {
        scope: ["profile", "email"]
      })(req, res, next);
    });

    app.get("/auth/google/callback", 
      passport.authenticate("google", { failureRedirect: "/auth?error=auth_failed" }),
      (req, res) => {
        // Successful authentication, redirect to callback page that will handle client-side routing
        console.log("Authentication successful, user:", req.user);
        console.log("Session ID:", req.sessionID);
        
        // Save the session explicitly before redirecting
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.redirect("/auth?error=session_error");
          }
          
          // Check for return URL in session or query params
          const returnTo = req.session.returnTo || req.query.returnTo || "/dashboard";
          delete req.session.returnTo; // Clear it after use
          
          console.log("Redirecting to auth callback with returnTo:", returnTo);
          
          // Redirect to intermediate page that will handle client-side authentication
          res.redirect(`/auth-callback?returnTo=${encodeURIComponent(returnTo)}`);
        });
      }
    );
  } else {
    // Provide fallback routes when Google OAuth is not configured
    app.get("/auth/google", (req, res) => {
      res.status(503).json({ error: "Google OAuth not configured" });
    });

    app.get("/auth/google/callback", (req, res) => {
      res.status(503).json({ error: "Google OAuth not configured" });
    });
  }

  // Legacy login route for backward compatibility
  app.get("/api/login", (req, res) => {
    res.redirect("/auth/google");
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Session destroy failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Simple logout redirect for GET requests
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.clearCookie("connect.sid");
        res.redirect("/");
      });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
