import type { Express, Request } from "express";
import { createServer, type Server } from "http";

// Extend Express Request to include user property
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { generateClientReply } from "./openai";
import { 
  generateRequestSchema, 
  updateUserSchema, 
  insertAiResponseSchema, 
  users, 
  customPrompts, 
  insertCustomPromptSchema,
  brandVoiceProfiles,
  brandVoiceSamples,
  brandVoiceGuidelines,
  insertBrandVoiceSampleSchema,
  insertBrandVoiceGuidelinesSchema,
  workflows,
  insertWorkflowSchema,
  updateWorkflowSchema,
  insertWebhookSchema,
  type User
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { z } from "zod";
import { registerBillingRoutes } from "./routes/billing";
import { seedInboxDemoData } from "./demo-data";
import { smtpConfigSchema } from "@shared/email-schemas";
import { google } from 'googleapis';
import crypto from 'crypto';

// Encryption utilities for secure token storage
const ENCRYPTION_KEY = process.env.SESSION_SECRET || 'your-32-character-secret-key';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Security helper to ensure user isolation
function requireAuthUser(req: any): string {
  if (!req.isAuthenticated() || !req.user || !req.user.id) {
    throw new Error("Unauthorized: No authenticated user");
  }
  return req.user.id as string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Return basic user info without database dependency for now
      res.json({
        id: req.user.id,
        email: req.user.email || '',
        firstName: req.user.firstName || '',
        lastName: req.user.lastName || ''
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Plan management
  app.post('/api/user/plan', async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const { plan } = req.body;
      
      if (!['free_trial', 'starter', 'pro'].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }
      
      const updatedUser = await storage.updateUserPlan(userId, plan);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user plan:", error);
      res.status(500).json({ message: "Failed to update user plan" });
    }
  });

  // AI Response generation
  app.post("/api/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const { prompt, tone = "professional", context = "general" } = req.body;

      // Validate input
      const validation = generateRequestSchema.safeParse({ 
        clientMessage: prompt, 
        queryType: context, 
        tone 
      });

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.errors 
        });
      }

      // Get user's daily usage
      const dailyUsage = await storage.getTodayResponseCount(userId);
      
      // Get user's plan limits
      const user = await storage.getUser(userId);
      let limit = 50; // Default free tier limit
      
      if (user?.plan === 'pro') {
        limit = 1000;
      } else if (user?.plan === 'starter') {
        limit = 200;
      }

      // Check if user is in trial period
      if (user?.trialEnd && new Date() > user.trialEnd) {
        limit = 0; // No queries after trial expires
      }

      if (limit > 0 && dailyUsage >= limit) {
        return res.status(429).json({ 
          message: "Monthly usage limit exceeded",
          upgradeRequired: true 
        });
      }

      // Generate AI response using OpenAI
      const aiResponse = await generateClientReply(prompt, tone);
      
      // Store the conversation
      await storage.createAiResponse({
        userId,
        clientMessage: prompt,
        aiResponse: aiResponse.response,
        tone: tone,
        queryType: context,
        confidence: aiResponse.confidence,
        generationTime: aiResponse.generationTime
      });

      res.json({
        response: aiResponse.response,
        confidence: aiResponse.confidence / 100, // Convert to decimal for frontend
        usage: {
          used: dailyUsage + 1,
          limit: limit
        }
      });
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ message: "Error generating response" });
    }
  });

  // Get user conversations
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const conversations = await storage.getUserResponses(userId);
      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  // Register billing routes
  registerBillingRoutes(app);

  // Custom prompts routes
  app.get("/api/custom-prompts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const prompts = await storage.getUserCustomPrompts(userId);
      res.json(prompts);
    } catch (error: any) {
      console.error("Error fetching custom prompts:", error);
      res.status(500).json({ message: "Failed to fetch custom prompts" });
    }
  });

  app.post("/api/custom-prompts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const promptData = req.body;
      
      const validation = insertCustomPromptSchema.safeParse(promptData);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid prompt data", 
          errors: validation.error.errors 
        });
      }

      const prompt = await storage.createCustomPrompt(userId, validation.data);
      res.json(prompt);
    } catch (error: any) {
      console.error("Error creating custom prompt:", error);
      res.status(500).json({ message: "Failed to create custom prompt" });
    }
  });

  // Brand voice routes
  app.get("/api/brand-voice", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const profile = await storage.getUserBrandVoiceProfile(userId);
      const samples = await storage.getUserBrandVoiceSamples(userId);
      const guidelines = await storage.getBrandVoiceGuidelines(userId);

      res.json({ 
        profile: profile || null,
        samples,
        guidelines: guidelines || null
      });
    } catch (error: any) {
      console.error("Error fetching brand voice:", error);
      res.status(500).json({ message: "Failed to fetch brand voice" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Reviews routes
  app.post("/api/reviews", async (req: any, res) => {
    try {
      const reviewData = req.body;
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get("/api/reviews", async (req: any, res) => {
    try {
      const reviews = await storage.getPublicReviews();
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Contact routes
  app.post("/api/contact", async (req: any, res) => {
    try {
      const contactData = req.body;
      const contact = await storage.createContactMessage(contactData);
      res.json(contact);
    } catch (error: any) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to create contact message" });
    }
  });

  // Demo data seeding
  app.post("/api/seed-demo-data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      await seedInboxDemoData(userId);
      res.json({ message: "Demo data seeded successfully" });
    } catch (error: any) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ message: "Failed to seed demo data" });
    }
  });

  // Create HTTP server
  const server = createServer(app);
  
  return server;
}
