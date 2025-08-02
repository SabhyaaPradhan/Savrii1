// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import session from "express-session";
// import type { Express, RequestHandler } from "express";
// import connectPg from "connect-pg-simple";
// import { storage } from "./storage";

// // Extend Express session type to include returnTo
// declare module "express-session" {
//   interface SessionData {
//     returnTo?: string;
//   }
// }

// if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
//   throw new Error("Missing required Google OAuth credentials: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
// }

// export function getSession() {
//   const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
//   const pgStore = connectPg(session);
//   const sessionStore = new pgStore({
//     conString: process.env.DATABASE_URL,
//     createTableIfMissing: false,
//     ttl: sessionTtl,
//     tableName: "sessions",
//   });
  
//   return session({
//     secret: process.env.SESSION_SECRET!,
//     store: sessionStore,
//     resave: true, // Force session save on every request
//     saveUninitialized: true, // Save uninitialized sessions
//     cookie: {
//       httpOnly: true,
//       secure: false, // Allow cookies in development over HTTP
//       maxAge: sessionTtl,
//       sameSite: "lax",
//       path: "/", // Explicitly set path
//       // Don't set domain to allow cookies to work on any domain
//       domain: undefined,
//     },
//     name: "savrii.session", // Custom session name
//   });
// }

// // Get the correct domain for OAuth callback
// const getCallbackURL = () => {
//   // In production, use the custom domain
//   return 'https://www.savrii.com/auth/google/callback';
// };

// // Google OAuth Strategy
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID!,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//   callbackURL: getCallbackURL()
// }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
//   try {
//     // Extract user info from Google profile
//     const googleUser = {
//       id: profile.id,
//       email: profile.emails?.[0]?.value || "",
//       firstName: profile.name?.givenName || "",
//       lastName: profile.name?.familyName || "",
//       profileImageUrl: profile.photos?.[0]?.value || "",
//       accessToken,
//       refreshToken
//     };
//
//     // Create or update user in database
//     const user = await storage.upsertUser(googleUser);
//     
//     return done(null, user);
//   } catch (error) {
//     console.error("Google auth error:", error);
//     return done(error, null);
//   }
// }));

// Google OAuth temporarily disabled
export function setupAuth(app) {
  // No-op: Google OAuth is disabled for now
}