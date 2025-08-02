import type { RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";

// Extend Express session type to include returnTo
declare module "express-session" {
  interface SessionData {
    returnTo?: string;
  }
}

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? ".savrii.com" : undefined,
    },
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Setup authentication
export async function setupAuth(app: any) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Configure Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Get the correct domain for OAuth callback
    const getCallbackURL = () => {
      if (process.env.NODE_ENV === 'production') {
        return 'https://www.savrii.com/api/auth/google/callback';
      } else {
        return 'http://localhost:3000/api/auth/google/callback';
      }
    };
    
    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        };
        
        // Create or update user in database
        const user = await storage.upsertUser(googleUser);
        
        return done(null, user);
      } catch (error) {
        console.error("Google auth error:", error);
        return done(error, null);
      }
    }));
  } else {
    console.warn("Google OAuth credentials not found. Google login will not work.");
  }
  
  // Login endpoint
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      // In development mode, allow any credentials
      if (process.env.NODE_ENV === 'development') {
        // Create or get user
        const user = await storage.upsertUser({
          id: email, // Use email as ID for simplicity
          email,
          firstName: email.split('@')[0],
          lastName: '',
          profileImageUrl: '',
        });
        
        req.login(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          res.json({ message: "Login successful", user });
        });
      } else {
        // In production, this should validate against the database
        // TODO: Implement proper authentication with password hashing
        return res.status(501).json({ message: "Production authentication not implemented" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.get('/api/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });
  
  // Google OAuth routes
  app.get('/api/auth/google', (req, res, next) => {
    // Save the return URL if provided
    if (req.query.returnTo) {
      req.session.returnTo = req.query.returnTo as string;
    }
    
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });
  
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { 
      failureRedirect: '/auth?error=google-auth-failed'
    }),
    (req, res) => {
      // Redirect to the saved return URL or default to home
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      res.redirect(returnTo);
    }
  );
}