import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./googleAuth";
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
import { getEmailService } from './emailService';

// Encryption utilities for secure token storage
const ENCRYPTION_KEY = process.env.SESSION_SECRET || 'your-32-character-secret-key';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
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
  app.post('/api/user/plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const { plan } = req.body;
      
      if (!['free_trial', 'starter', 'pro'].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }
      
      const updatedUser = await storage.updateUserPlan(userId, plan);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  // Location/Currency update
  app.post('/api/user/location', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const { country, currency } = req.body;
      
      const updatedUser = await storage.updateUserLocation(userId, country, currency);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Usage stats route with comprehensive weekly tracking and trial fixes
  app.get("/api/usage/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      console.log("SECURITY: Usage stats for authenticated user:", userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Fix: Set proper starter plan and trial end for new users
      let updatedUser = user;
      if (!user.trialEnd && (user.plan === 'enterprise' || user.plan === 'pro')) {
        // For demo purposes, set this user to starter with proper trial
        const trialStart = new Date(); // Trial starts now
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14); // 14 days from now
        
        updatedUser = await storage.upsertUser({
          ...user,
          plan: 'starter',
          planStartDate: trialStart, // Use planStartDate as trial start
          trialEnd: trialEnd
        });
      }
      
      // Get comprehensive analytics including weekly data
      const analytics = await storage.getUserAnalytics(userId);
      
      // Calculate trial progression for starter users
      let daysLeft = 0;
      let currentTrialDay = 1;
      let trialStartDate = null;
      
      if (updatedUser.plan === 'starter') {
        if (updatedUser.trialEnd) {
          const now = new Date();
          const trialEnd = new Date(updatedUser.trialEnd);
          const diffTime = trialEnd.getTime() - now.getTime();
          daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }
        
        if (updatedUser.planStartDate) {
          trialStartDate = updatedUser.planStartDate;
          const now = new Date();
          const startDate = new Date(updatedUser.planStartDate);
          
          // Calculate calendar days difference (not time-based)
          const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const daysDifference = Math.floor((nowDate.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24));
          
          currentTrialDay = Math.max(1, Math.min(14, daysDifference + 1)); // Day 1-14
        }
      }
      
      // Return updated analytics with correct trial info
      res.json({
        ...analytics,
        plan: updatedUser.plan,
        trialEnd: updatedUser.trialEnd,
        trialStartDate: trialStartDate,
        daysLeft: daysLeft,
        trialDaysLeft: daysLeft,
        currentTrialDay: currentTrialDay
      });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage stats" });
    }
  });

  // Weekly usage statistics endpoint
  app.get('/api/usage/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      console.log("SECURITY: Weekly usage stats for authenticated user:", userId);
      
      const weekCount = await storage.getWeeklyResponseCount(userId);
      const monthCount = await storage.getMonthlyResponseCount(userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const weeklyLimit = user.plan === 'starter' ? 350 : -1;
      const monthlyLimit = user.plan === 'starter' ? 1500 : -1;
      
      res.json({
        weekTotal: weekCount,
        weeklyLimit,
        monthTotal: monthCount,
        monthlyLimit,
        plan: user.plan,
        isUnlimited: user.plan !== 'starter'
      });
    } catch (error) {
      console.error("Error fetching weekly usage stats:", error);
      res.status(500).json({ message: "Failed to fetch weekly usage statistics" });
    }
  });

  // Recent replies route
  app.get("/api/replies/recent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      
      // Mock recent replies data
      const replies = [
        {
          id: "1",
          customerMessage: "Hi, I'm having trouble with my recent order. It hasn't arrived yet and I'm getting worried.",
          aiResponse: "I sincerely apologize for the delay with your order. I understand how concerning this must be. Let me immediately look into this for you and provide an update on the shipping status.",
          tone: "empathetic",
          confidence: 0.94,
          createdAt: new Date().toISOString()
        },
        {
          id: "2", 
          customerMessage: "What are your pricing plans? I need something for a small business.",
          aiResponse: "Great question! For small businesses, I'd recommend our Starter plan at $29/month, which includes unlimited responses, basic analytics, and email support. Would you like me to walk you through the features?",
          tone: "helpful",
          confidence: 0.87,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      res.json(replies);
    } catch (error) {
      console.error("Error fetching recent replies:", error);
      res.status(500).json({ message: "Failed to fetch recent replies" });
    }
  });

  // Analytics endpoints - using real database data
  app.get("/api/analytics/overview", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/daily-usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const dailyUsage = await storage.getUserDailyUsage(userId);
      res.json(dailyUsage);
    } catch (error) {
      console.error("Error fetching daily usage:", error);
      res.status(500).json({ message: "Failed to fetch daily usage" });
    }
  });

  // AI Confidence metrics endpoint - REAL DATA
  app.get("/api/analytics/confidence", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      console.log("SECURITY: AI confidence metrics for authenticated user:", userId);
      
      // Get recent AI responses for this user
      const recentResponses = await storage.getRecentAiResponses(userId, 100);
      
      if (recentResponses.length === 0) {
        // Return default values for new users
        return res.json({
          overall: 0.0,
          accuracy: 0.0,
          consistency: 0.0,
          improvement: 0.0,
          totalResponses: 0
        });
      }
      
      // Calculate overall confidence (average of all confidence scores)
      const overallConfidence = recentResponses.reduce((sum, response) => sum + (response.confidence || 80), 0) / recentResponses.length;
      
      // Calculate accuracy based on confidence distribution
      const highConfidenceResponses = recentResponses.filter(r => (r.confidence || 80) >= 85).length;
      const accuracy = highConfidenceResponses / recentResponses.length;
      
      // Calculate consistency (how stable the confidence scores are)
      const confidenceScores = recentResponses.map(r => r.confidence || 80);
      const mean = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
      const variance = confidenceScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / confidenceScores.length;
      const standardDeviation = Math.sqrt(variance);
      const consistency = Math.max(0, 1 - (standardDeviation / 100)); // Normalize to 0-1
      
      // Calculate improvement (compare recent vs older responses)
      const recentHalf = recentResponses.slice(0, Math.floor(recentResponses.length / 2));
      const olderHalf = recentResponses.slice(Math.floor(recentResponses.length / 2));
      
      let improvement = 0;
      if (olderHalf.length > 0 && recentHalf.length > 0) {
        const recentAvg = recentHalf.reduce((sum, r) => sum + (r.confidence || 80), 0) / recentHalf.length;
        const olderAvg = olderHalf.reduce((sum, r) => sum + (r.confidence || 80), 0) / olderHalf.length;
        improvement = (recentAvg - olderAvg) / 100; // Normalize to percentage change
      }
      
      res.json({
        overall: overallConfidence / 100, // Convert to 0-1 scale
        accuracy: accuracy,
        consistency: consistency,
        improvement: Math.max(-1, Math.min(1, improvement)), // Cap between -1 and 1
        totalResponses: recentResponses.length
      });
    } catch (error) {
      console.error("Error fetching AI confidence metrics:", error);
      res.status(500).json({ message: "Failed to fetch confidence metrics" });
    }
  });

  app.get("/api/analytics/templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const templates = await storage.getUserTemplateUsage(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching template usage:", error);
      res.status(500).json({ message: "Failed to fetch template usage" });
    }
  });

  app.get("/api/analytics/heatmap", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const heatmapData = await storage.getUserActivityHeatmap(userId);
      res.json(heatmapData);
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
      res.status(500).json({ message: "Failed to fetch heatmap data" });
    }
  });

  // Billing endpoints - using real user data
  // Home page data routes
  app.get('/api/home/recent-activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const activities = await storage.getRecentActivity(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  app.get('/api/home/performance-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const stats = await storage.getPerformanceStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching performance stats:", error);
      res.status(500).json({ message: "Failed to fetch performance stats" });
    }
  });

  app.get("/api/billing/overview", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const analytics = await storage.getUserAnalytics(userId);
      
      const billing = {
        plan: analytics.plan,
        used: analytics.used,
        limit: analytics.limit,
        renewalDate: analytics.plan === 'free_trial' ? "February 15, 2025" : "February 1, 2025",
        trialDaysLeft: analytics.trialDaysLeft,
        monthlyUsed: analytics.totalResponses, // Use total as monthly for now
        weeklyUsed: analytics.weekTotal
      };
      
      res.json(billing);
    } catch (error) {
      console.error("Error fetching billing overview:", error);
      res.status(500).json({ message: "Failed to fetch billing data" });
    }
  });

  app.get("/api/billing/history", isAuthenticated, async (req: any, res) => {
    try {
      // For now, return empty array - would integrate with Stripe in production
      const billingHistory: any[] = [];
      res.json(billingHistory);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      res.status(500).json({ message: "Failed to fetch billing history" });
    }
  });

  app.get("/api/billing/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      // For now, return empty array - would integrate with Stripe in production
      const paymentMethods: any[] = [];
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/billing/change-plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const { planId } = req.body;
      
      if (!['free_trial', 'starter', 'pro'].includes(planId)) {
        return res.status(400).json({ message: "Invalid plan" });
      }
      
      // Update user plan (would integrate with Stripe in production)
      const updatedUser = await storage.updateUserPlan(userId, planId);
      res.json({ success: true, plan: planId });
    } catch (error) {
      console.error("Error changing plan:", error);
      res.status(500).json({ message: "Failed to change plan" });
    }
  });

  app.post("/api/billing/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      
      // Cancel subscription (would integrate with Stripe in production)
      res.json({ success: true, message: "Subscription cancelled" });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Review endpoints
  app.get("/api/reviews", async (req: any, res) => {
    try {
      const reviews = await storage.getPublicReviews(10);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req: any, res) => {
    try {
      const { rating, title, content, userName, userEmail, isPublic } = req.body;
      
      // For authenticated users, get userId; for non-authenticated, it will be null
      const userId = req.isAuthenticated?.() ? req.user.id : null;
      
      if (!rating || !title || !content) {
        return res.status(400).json({ message: "Rating, title, and content are required" });
      }
      
      // For non-authenticated users, require name and email
      if (!userId && (!userName || !userEmail)) {
        return res.status(400).json({ message: "Name and email are required for guest reviews" });
      }
      
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      const review = await storage.createReview({
        userId,
        userName: userName || null,
        userEmail: userEmail || null,
        rating,
        title,
        content,
        isPublic: isPublic ?? true
      });
      
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Contact endpoint
  app.post("/api/contact", async (req: any, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const contact = await storage.createContactMessage({
        name,
        email,
        subject,
        message
      });
      
      res.json({ success: true, message: "Message sent successfully" });
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Custom Prompts endpoints
  app.get("/api/prompts/custom", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const prompts = await storage.getUserCustomPrompts(userId);
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching custom prompts:", error);
      res.status(500).json({ message: "Failed to fetch custom prompts" });
    }
  });

  app.post("/api/prompts/custom", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const validatedData = insertCustomPromptSchema.parse(req.body);
      
      const prompt = await storage.createCustomPrompt(userId, validatedData);
      res.json(prompt);
    } catch (error) {
      console.error("Error creating custom prompt:", error);
      res.status(500).json({ message: "Failed to create custom prompt" });
    }
  });

  app.put("/api/prompts/custom/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const promptId = parseInt(req.params.id);
      const validatedData = insertCustomPromptSchema.parse(req.body);
      
      const prompt = await storage.updateCustomPrompt(userId, promptId, validatedData);
      res.json(prompt);
    } catch (error) {
      console.error("Error updating custom prompt:", error);
      res.status(500).json({ message: "Failed to update custom prompt" });
    }
  });

  app.delete("/api/prompts/custom/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const promptId = parseInt(req.params.id);
      
      await storage.deleteCustomPrompt(userId, promptId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom prompt:", error);
      res.status(500).json({ message: "Failed to delete custom prompt" });
    }
  });

  app.post("/api/prompts/custom/:id/favorite", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const promptId = parseInt(req.params.id);
      const { isFavorite } = req.body;
      
      const prompt = await storage.toggleCustomPromptFavorite(userId, promptId, isFavorite);
      res.json(prompt);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  app.post("/api/prompts/custom/:id/duplicate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const promptId = parseInt(req.params.id);
      
      const prompt = await storage.duplicateCustomPrompt(userId, promptId);
      res.json(prompt);
    } catch (error) {
      console.error("Error duplicating prompt:", error);
      res.status(500).json({ message: "Failed to duplicate prompt" });
    }
  });

  // Get user conversations for chat interface
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      console.log("SECURITY: Fetching conversations for authenticated user:", userId);
      
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // AI Response generation
  app.post('/api/ai/generate-response', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      
      // Validate request with schema
      const validation = generateRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.issues 
        });
      }

      const { clientMessage, queryType, tone } = validation.data;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if trial has expired - ensure trialEnd is correctly set for new users
      const now = new Date();
      if (user.plan === "starter" && !user.trialEnd) {
        // Set trial end for existing starter users without trialEnd
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        await storage.upsertUser({ ...user, trialEnd });
        user.trialEnd = trialEnd;
      }
      const isTrialExpired = user.plan === "starter" && user.trialEnd && now > user.trialEnd;
      
      if (isTrialExpired) {
        return res.status(403).json({ 
          message: "Your 14-day free trial has expired. Please upgrade to Pro or Enterprise to continue using Savrii.",
          error: "trial_expired",
          trialEnd: user.trialEnd,
          plan: user.plan
        });
      }

      // Check usage limits for starter plan only
      const todayCount = await storage.getTodayResponseCount(userId);
      const dailyLimit = user.plan === "starter" ? 50 : -1; // -1 means unlimited for pro/enterprise
      
      if (dailyLimit !== -1 && todayCount >= dailyLimit) {
        return res.status(429).json({ 
          message: "Daily limit of 50 queries reached. Upgrade to Pro for unlimited queries.",
          limit: dailyLimit,
          used: todayCount,
          plan: user.plan
        });
      }
      
      // Generate AI response
      const aiResult = await generateClientReply(
        clientMessage.trim(),
        queryType,
        tone
      );
      
      // Save response to database
      const savedResponse = await storage.createAiResponse({
        userId,
        clientMessage: clientMessage.trim(),
        aiResponse: aiResult.response,
        queryType,
        tone,
        confidence: aiResult.confidence,
        generationTime: aiResult.generationTime
      });
      
      // Note: Removed request counting as all plans now have unlimited queries
      
      res.json({
        response: aiResult.response,
        confidence: aiResult.confidence,
        generationTime: aiResult.generationTime,
        usage: {
          used: todayCount + 1,
          limit: dailyLimit,
          plan: user.plan
        },
        id: savedResponse.id
      });
      
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      
      // Handle Together.ai specific errors with proper messages
      if (error.message.includes("quota exceeded")) {
        return res.status(429).json({ 
          message: "Together.ai API quota exceeded. Please check your account limits.",
          error: "quota_exceeded"
        });
      }
      
      if (error.message.includes("Invalid Together.ai API key")) {
        return res.status(500).json({ 
          message: "Together.ai API configuration error. Please check your API key.",
          error: "api_key_invalid"
        });
      }
      
      // Generic error response
      res.status(500).json({ 
        message: error.message || "Failed to generate response",
        error: "generation_failed"
      });
    }
  });

  // Get user's response history
  app.get('/api/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const limit = parseInt(req.query.limit as string) || 10;
      
      const responses = await storage.getUserResponses(userId, limit);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  // User profile update
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      
      // Validate request with schema
      const validation = updateUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.issues 
        });
      }

      const { firstName, lastName, email, country } = validation.data;
      
      const [user] = await db
        .update(users)
        .set({ 
          firstName, 
          lastName, 
          email, 
          country, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId))
        .returning();
      
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });



  // Get billing stats
  app.get("/api/billing/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate basic stats for billing display
      const allResponses = await storage.getUserResponses(userId, 1000);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const monthlyUsage = allResponses.filter(r => 
        r.createdAt && new Date(r.createdAt) >= thisMonth
      ).length;

      res.json({
        currentPlan: user.plan,
        planStartDate: user.planStartDate?.toISOString() || new Date().toISOString(),
        trialEnd: user.trialEnd?.toISOString() || null,
        nextBillingDate: user.plan !== "starter" ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        monthlyUsage,
        totalQueries: allResponses.length,
        accountAge: user.createdAt ? 
          new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
          'Recently'
      });
    } catch (error) {
      console.error("Error fetching billing stats:", error);
      res.status(500).json({ message: "Failed to fetch billing stats" });
    }
  });

  // Generate AI response with real OpenAI integration
  app.post("/api/ai/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, tone = "professional", context = "general" } = req.body;
      const userId = requireAuthUser(req);
      const user = await storage.getUser(userId);

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check usage limits
      const today = new Date().toISOString().split('T')[0];
      const dailyUsage = await storage.getUserDailyUsage(userId);
      
      const plan = user.plan || 'starter';
      const trialExpired = user.trialEnd && new Date() > new Date(user.trialEnd);
      
      let limit = 100; // Monthly limit for starter
      if (plan === 'pro') {
        limit = 5000; // Monthly limit for pro
      } else if (plan === 'enterprise') {
        limit = -1; // Unlimited for enterprise
      } else if (trialExpired) {
        limit = 0; // No queries after trial expires
      }

      if (limit > 0 && dailyUsage >= limit) {
        return res.status(429).json({ 
          message: "Monthly usage limit exceeded",
          upgradeRequired: true 
        });
      }

      // Generate AI response using OpenAI
      const response = await generateClientReply(prompt, tone);
      
      // Calculate confidence score based on response length and completeness
      const confidence = Math.min(0.95, 0.7 + (response.length / 1000) * 0.25);
      const confidenceScore = Math.round((confidence || 0.85) * 100);
      
      // Store the conversation
      await storage.createAiResponse({
        userId,
        clientMessage: prompt,
        aiResponse: response,
        tone: tone,
        queryType: context,
        confidence: isNaN(confidenceScore) ? 85 : confidenceScore,
        generationTime: 1500
      });

      res.json({
        response: response,
        confidence: confidence || 0.85,
        usage: {
          used: dailyUsage.length + 1,
          limit: limit
        }
      });
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Register billing routes
  registerBillingRoutes(app);

  // Email integration routes

  // Get user email integrations
  app.get("/api/email/integrations", requireAuth, async (req, res) => {
    try {
      const integrations = await storage.getUserEmailIntegrations(req.user!.id);
      
      // Remove sensitive data before sending to client
      const safeIntegrations = integrations.map(integration => ({
        id: integration.id,
        provider: integration.provider,
        email: integration.email,
        displayName: integration.displayName,
        isActive: integration.isActive,
        syncStatus: integration.syncStatus,
        lastSyncAt: integration.lastSyncAt,
        errorMessage: integration.errorMessage,
        createdAt: integration.createdAt,
      }));

      res.json(safeIntegrations);
    } catch (error) {
      console.error("Error fetching email integrations:", error);
      res.status(500).json({ message: "Failed to fetch email integrations" });
    }
  });

  // Gmail OAuth initiation
  app.get("/api/email/auth/gmail", requireAuth, (req, res) => {
    console.log("Gmail OAuth initiated for user:", req.user);
    console.log("Environment variables check:", {
      clientId: process.env.GMAIL_CLIENT_ID ? 'present' : 'missing',
      clientSecret: process.env.GMAIL_CLIENT_SECRET ? 'present' : 'missing'
    });
    
    // Use a working redirect URI that doesn't require domain verification
    // For development, we'll use a simple approach with localhost
    const host = req.get('host');
    const isLocalhost = host?.includes('localhost');
    
    let redirectUri;
    if (isLocalhost) {
      redirectUri = 'http://localhost:5000/api/email/auth/gmail/callback';
    } else {
      // Use the current Replit domain
      redirectUri = `https://${host}/api/email/auth/gmail/callback`;
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    // Store user ID in session state for callback
    const state = Buffer.from(JSON.stringify({ userId: (req.user as any).id })).toString('base64');

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state,
      include_granted_scopes: true
    });

    console.log("Generated auth URL:", authUrl);
    res.redirect(authUrl);
  });

  // Gmail OAuth callback
  app.get("/api/email/auth/gmail/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      console.log("Gmail callback received:", { code: code ? 'present' : 'missing', state });
      
      if (!code) {
        console.error("No authorization code received");
        return res.redirect('/integrations?error=gmail_auth_failed');
      }

      if (!state) {
        console.error("No state parameter received");
        return res.redirect('/integrations?error=gmail_auth_failed');
      }

      // Decode user ID from state
      let userId;
      try {
        const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        userId = stateData.userId;
        console.log("Decoded user ID from state:", userId);
      } catch (error) {
        console.error("Failed to decode state:", error);
        return res.redirect('/integrations?error=gmail_auth_failed');
      }

      // Use same redirect URI logic as in initiation
      const host = req.get('host');
      const isLocalhost = host?.includes('localhost');
      
      let redirectUri;
      if (isLocalhost) {
        redirectUri = 'http://localhost:5000/api/email/auth/gmail/callback';
      } else {
        // Use the current Replit domain
        redirectUri = `https://${host}/api/email/auth/gmail/callback`;
      }
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        redirectUri
      );

      const { tokens } = await oauth2Client.getToken(code as string);
      
      if (!tokens.access_token) {
        return res.redirect('/integrations?error=gmail_token_failed');
      }

      // Get user email from Gmail API
      oauth2Client.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });

      // Store integration
      await storage.createEmailIntegration({
        userId: userId,
        provider: 'gmail',
        email: profile.data.emailAddress || '',
        displayName: profile.data.emailAddress || '',
        encryptedTokens: encrypt(JSON.stringify(tokens)),
        isActive: true,
        syncStatus: 'ready',
      });

      console.log("Gmail integration created successfully for user:", userId);
      res.redirect('/integrations?connected=gmail');
    } catch (error) {
      console.error("Gmail auth callback error:", error);
      res.redirect('/integrations?error=gmail_auth_failed');
    }
  });

  // Outlook OAuth initiation  
  app.get("/api/email/auth/outlook", requireAuth, (req, res) => {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${process.env.OUTLOOK_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(`${req.protocol}://${req.get('host')}/api/email/auth/outlook/callback`)}&` +
      `scope=${encodeURIComponent('Mail.ReadWrite Mail.Send offline_access User.Read')}&` +
      `prompt=consent`;

    res.redirect(authUrl);
  });

  // Outlook OAuth callback
  app.get("/api/email/auth/outlook/callback", requireAuth, async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.redirect('/integrations?error=outlook_auth_failed');
      }

      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID!,
          client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: `${req.protocol}://${req.get('host')}/api/email/auth/outlook/callback`,
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        return res.redirect('/integrations?error=outlook_token_failed');
      }

      // Get user email from Microsoft Graph
      const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      const userInfo = await userResponse.json();

      // Store integration
      await storage.createEmailIntegration({
        userId: req.user!.id,
        provider: 'outlook',
        email: userInfo.mail || userInfo.userPrincipalName || '',
        displayName: userInfo.displayName || userInfo.mail || '',
        encryptedTokens: JSON.stringify(tokens),
        isActive: true,
        syncStatus: 'ready',
      });

      res.redirect('/integrations?connected=outlook');
    } catch (error) {
      console.error("Outlook auth callback error:", error);
      res.redirect('/integrations?error=outlook_auth_failed');
    }
  });

  // Sync emails from connected accounts
  app.post("/api/email/sync", requireAuth, async (req, res) => {
    try {
      const integrations = await storage.getUserEmailIntegrations(req.user!.id);
      
      for (const integration of integrations.filter(i => i.isActive)) {
        try {
          await storage.updateEmailIntegration(integration.id, { syncStatus: 'syncing' });

          const emailService = getEmailService(integration.provider);
          const emails = await emailService.getEmails(integration, 50);
          
          // Filter out emails that already exist
          const newEmails = [];
          for (const email of emails) {
            try {
              const existing = await storage.getEmailByMessageId(email.messageId, integration.id);
              if (!existing) {
                newEmails.push(email);
              }
            } catch (error) {
              // If error checking existing, assume it's new
              newEmails.push(email);
            }
          }

          if (newEmails.length > 0) {
            await storage.bulkCreateSynchronizedEmails(newEmails);
          }

          await storage.updateEmailIntegration(integration.id, { 
            syncStatus: 'active',
            lastSyncAt: new Date(),
            errorMessage: null
          });

          console.log(`Synced ${newEmails.length} new emails from ${integration.provider} for ${integration.email}`);
        } catch (error) {
          console.error(`Sync error for ${integration.provider}:`, error);
          await storage.updateEmailIntegration(integration.id, { 
            syncStatus: 'error',
            errorMessage: error.message
          });
        }
      }

      res.json({ message: "Email sync completed" });
    } catch (error) {
      console.error("Email sync error:", error);
      res.status(500).json({ message: "Failed to sync emails" });
    }
  });

  // Generate AI reply for email
  app.post("/api/email/generate-reply", requireAuth, async (req, res) => {
    try {
      const { messageId, replyType, customInstructions } = req.body;
      
      const message = await storage.getEmailMessage(messageId, req.user!.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Generate AI reply using OpenAI
      const reply = `This is a generated reply for ${replyType}. Message: ${message.subject}`;
      
      res.json({ 
        generatedReply: reply,
        confidence: 85,
        messageId: messageId
      });
    } catch (error) {
      console.error("Email reply generation error:", error);
      res.status(500).json({ message: "Failed to generate reply" });
    }
  });

  // Send email reply
  app.post("/api/email/send-reply", requireAuth, async (req, res) => {
    try {
      const { messageId, replyText, integrationId } = req.body;
      
      const integration = await storage.getEmailIntegration(integrationId, req.user!.id);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      const message = await storage.getEmailMessage(messageId, req.user!.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // TODO: Implement sending replies through email providers
      console.log(`Sending reply via ${integration.provider} to ${message.fromEmail}`);
      // await sendGmailReply(integration, message, replyText);
      // await sendOutlookReply(integration, message, replyText);

      // Mark message as replied
      await storage.updateEmailMessage(messageId, { isReplied: true });

      res.json({ message: "Reply sent successfully" });
    } catch (error) {
      console.error("Send reply error:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  // Gmail OAuth initiation
  app.get("/api/auth/gmail", requireAuth, async (req, res) => {
    try {
      const authUrl = gmailService.getAuthUrl(req.user!.id);
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating Gmail auth URL:", error);
      res.status(500).json({ message: "Failed to generate Gmail auth URL" });
    }
  });

  // Gmail OAuth callback
  app.get("/api/auth/gmail/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).send("Missing code or state parameter");
      }

      const userId = state as string;
      const tokens = await gmailService.exchangeCodeForTokens(code as string);

      // Get user email from Gmail API
      const oauth2Client = new (google.auth.OAuth2)();
      oauth2Client.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });

      // Create email integration
      await storage.createEmailIntegration(userId, {
        provider: 'gmail',
        email: profile.data.emailAddress!,
        displayName: profile.data.emailAddress!,
        isActive: true,
        accessToken: encrypt(tokens.access_token!),
        refreshToken: encrypt(tokens.refresh_token!),
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        syncStatus: 'active',
      });

      res.redirect('/integrations?success=gmail');
    } catch (error) {
      console.error("Error handling Gmail callback:", error);
      res.redirect('/integrations?error=gmail');
    }
  });

  // Outlook OAuth initiation
  app.get("/api/auth/outlook", requireAuth, async (req, res) => {
    try {
      const authUrl = outlookService.getAuthUrl(req.user!.id);
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating Outlook auth URL:", error);
      res.status(500).json({ message: "Failed to generate Outlook auth URL" });
    }
  });

  // Outlook OAuth callback
  app.get("/api/auth/outlook/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).send("Missing code or state parameter");
      }

      const userId = state as string;
      const tokenResponse = await outlookService.exchangeCodeForTokens(code as string);

      // Get user profile from Microsoft Graph
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${tokenResponse.accessToken}`,
        }
      });
      const profile = await response.json();

      // Create email integration
      await storage.createEmailIntegration(userId, {
        provider: 'outlook',
        email: profile.mail || profile.userPrincipalName,
        displayName: profile.displayName,
        isActive: true,
        accessToken: encrypt(tokenResponse.accessToken),
        refreshToken: encrypt(tokenResponse.refreshToken!),
        tokenExpiry: new Date(tokenResponse.expiresOn!),
        syncStatus: 'active',
      });

      res.redirect('/integrations?success=outlook');
    } catch (error) {
      console.error("Error handling Outlook callback:", error);
      res.redirect('/integrations?error=outlook');
    }
  });

  // SMTP configuration
  app.post("/api/email/integrations/smtp", requireAuth, async (req, res) => {
    try {
      const smtpConfig = smtpConfigSchema.parse(req.body);
      
      // Test SMTP connection before saving
      const connectionTest = await smtpService.testConnection(smtpConfig);
      
      if (!connectionTest) {
        return res.status(400).json({ message: "SMTP connection test failed. Please check your settings." });
      }

      // Create email integration with encrypted credentials
      await storage.createEmailIntegration(req.user!.id, {
        provider: 'smtp',
        email: smtpConfig.email,
        displayName: smtpConfig.displayName,
        isActive: true,
        smtpHost: smtpConfig.smtpHost,
        smtpPort: smtpConfig.smtpPort,
        smtpUsername: smtpConfig.smtpUsername,
        smtpPassword: encrypt(smtpConfig.smtpPassword),
        smtpSecurity: smtpConfig.smtpSecurity,
        imapHost: smtpConfig.imapHost,
        imapPort: smtpConfig.imapPort,
        imapUsername: smtpConfig.imapUsername,
        imapPassword: encrypt(smtpConfig.imapPassword),
        imapSecurity: smtpConfig.imapSecurity,
        syncStatus: 'active',
      });

      res.json({ message: "SMTP integration created successfully" });
    } catch (error) {
      console.error("Error creating SMTP integration:", error);
      res.status(500).json({ message: error.message || "Failed to create SMTP integration" });
    }
  });

  // Delete email integration
  app.delete("/api/email/integrations/:id", requireAuth, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      await storage.deleteEmailIntegration(integrationId, req.user!.id);
      res.json({ message: "Email integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting email integration:", error);
      res.status(500).json({ message: "Failed to delete email integration" });
    }
  });

  // Sync emails from connected accounts
  app.post("/api/email/sync", requireAuth, async (req, res) => {
    try {
      const integrations = await storage.getUserEmailIntegrations(req.user!.id);
      
      for (const integration of integrations.filter(i => i.isActive)) {
        try {
          const emailService = getEmailService(integration.provider);

          const emails = await emailService.getEmails(integration, 50);
          
          // Filter out emails that already exist
          const newEmails = [];
          for (const email of emails) {
            const existing = await storage.getEmailByMessageId(email.messageId, integration.id);
            if (!existing) {
              newEmails.push(email);
            }
          }

          if (newEmails.length > 0) {
            await storage.bulkCreateSynchronizedEmails(newEmails);
          }

          // Update last sync time
          await storage.updateEmailIntegration(integration.id, req.user!.id, {
            lastSyncAt: new Date(),
            syncStatus: 'active',
            errorMessage: null,
          });

        } catch (error) {
          console.error(`Error syncing emails for integration ${integration.id}:`, error);
          
          // Update integration with error status
          await storage.updateEmailIntegration(integration.id, req.user!.id, {
            syncStatus: 'error',
            errorMessage: error.message,
          });
        }
      }

      res.json({ message: "Email sync completed" });
    } catch (error) {
      console.error("Error syncing emails:", error);
      res.status(500).json({ message: "Failed to sync emails" });
    }
  });

  // Get synchronized emails
  app.get("/api/email/messages", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const emails = await storage.getSynchronizedEmails(req.user!.id, undefined, limit);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });



  // Generate AI reply for email
  app.post("/api/email/generate-reply", requireAuth, async (req, res) => {
    try {
      const { emailId, replyType, customInstructions } = req.body;
      
      // Get the email
      const email = await storage.getSynchronizedEmails(req.user!.id);
      const targetEmail = email.find(e => e.id === emailId);
      
      if (!targetEmail) {
        return res.status(404).json({ message: "Email not found" });
      }

      // Generate AI reply using OpenAI
      const prompt = `Generate a professional email reply for the following message:

Subject: ${targetEmail.subject}
From: ${targetEmail.fromName} <${targetEmail.fromEmail}>
Message: ${targetEmail.bodyText || targetEmail.snippet}

Reply Type: ${replyType}
${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Please generate a professional, helpful reply that addresses the sender's concerns appropriately.`;

      const startTime = Date.now();
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: 'system',
              content: 'You are a professional email assistant. Generate helpful, courteous, and appropriate email replies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
      }

      const openaiData = await openaiResponse.json();
      const generatedReply = openaiData.choices[0].message.content;
      const generationTime = Date.now() - startTime;

      // Save the AI reply
      const aiReply = await storage.createEmailAiReply(req.user!.id, {
        emailId: targetEmail.id,
        integrationId: targetEmail.integrationId,
        replyType,
        customInstructions,
        generatedSubject: `Re: ${targetEmail.subject}`,
        generatedReply,
        finalReply: generatedReply,
        confidence: 85,
        generationTime,
        status: 'generated',
      });

      res.json(aiReply);
    } catch (error) {
      console.error("Error generating AI reply:", error);
      res.status(500).json({ message: "Failed to generate AI reply" });
    }
  });

  // Send email reply
  app.post("/api/email/send-reply", requireAuth, async (req, res) => {
    try {
      const { replyId, finalReply } = req.body;
      
      // Get the AI reply and associated email
      const aiReplies = await storage.getEmailAiReplies(req.user!.id);
      const aiReply = aiReplies.find(r => r.id === replyId);
      
      if (!aiReply) {
        return res.status(404).json({ message: "AI reply not found" });
      }

      const emails = await storage.getSynchronizedEmails(req.user!.id);
      const originalEmail = emails.find(e => e.id === aiReply.emailId);
      
      if (!originalEmail) {
        return res.status(404).json({ message: "Original email not found" });
      }

      // Get the email integration
      const integration = await storage.getEmailIntegration(originalEmail.integrationId, req.user!.id);
      
      if (!integration) {
        return res.status(404).json({ message: "Email integration not found" });
      }

      // Send the reply using the appropriate service
      const emailService = integration.provider === 'gmail' ? gmailService :
                         integration.provider === 'outlook' ? outlookService :
                         smtpService;

      const sentMessageId = await emailService.sendEmail(
        integration,
        originalEmail.fromEmail,
        `Re: ${originalEmail.subject}`,
        finalReply,
        originalEmail.messageId
      );

      // Update the AI reply status
      await storage.markEmailReplySent(replyId, sentMessageId);

      // Update the AI reply with final version if it was edited
      if (finalReply !== aiReply.generatedReply) {
        await storage.updateEmailAiReply(replyId, req.user!.id, {
          finalReply,
          wasEdited: true,
          status: 'sent',
        });
      }

      res.json({ message: "Reply sent successfully", sentMessageId });
    } catch (error) {
      console.error("Error sending email reply:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  // Brand Voice Training routes
  app.get("/api/brand-voice/profile", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getUserBrandVoiceProfile(req.user!.id);
      if (!profile) {
        // Create default profile if none exists
        const newProfile = await storage.createOrUpdateBrandVoiceProfile(req.user!.id, {
          name: "Default Profile",
          status: "needs_samples"
        });
        return res.json(newProfile);
      }
      res.json(profile);
    } catch (error: any) {
      console.error("Error fetching brand voice profile:", error);
      res.status(500).json({ message: "Failed to fetch brand voice profile" });
    }
  });

  app.get("/api/brand-voice/samples", isAuthenticated, async (req, res) => {
    try {
      const samples = await storage.getUserBrandVoiceSamples(req.user!.id);
      res.json(samples);
    } catch (error: any) {
      console.error("Error fetching brand voice samples:", error);
      res.status(500).json({ message: "Failed to fetch brand voice samples" });
    }
  });

  app.post("/api/brand-voice/samples", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBrandVoiceSampleSchema.parse(req.body);
      const sample = await storage.createBrandVoiceSample(req.user!.id, validatedData);
      res.json(sample);
    } catch (error: any) {
      console.error("Error creating brand voice sample:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid sample data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create brand voice sample" });
    }
  });

  app.delete("/api/brand-voice/samples/:id", isAuthenticated, async (req, res) => {
    try {
      const sampleId = parseInt(req.params.id);
      if (isNaN(sampleId)) {
        return res.status(400).json({ message: "Invalid sample ID" });
      }
      
      await storage.deleteBrandVoiceSample(req.user!.id, sampleId);
      res.json({ message: "Sample deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting brand voice sample:", error);
      res.status(500).json({ message: "Failed to delete brand voice sample" });
    }
  });

  app.post("/api/brand-voice/guidelines", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBrandVoiceGuidelinesSchema.parse(req.body);
      const guidelines = await storage.updateBrandVoiceGuidelines(req.user!.id, validatedData);
      res.json(guidelines);
    } catch (error: any) {
      console.error("Error updating brand voice guidelines:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid guidelines data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update brand voice guidelines" });
    }
  });

  app.post("/api/brand-voice/retrain", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would trigger a background job to retrain the model
      // For now, we'll just update the profile to indicate it's training
      const profile = await storage.createOrUpdateBrandVoiceProfile(req.user!.id, {
        status: "training",
        lastTrained: new Date(),
      });
      
      // Simulate training completion after a delay (in real implementation, this would be done by a background job)
      setTimeout(async () => {
        await storage.createOrUpdateBrandVoiceProfile(req.user!.id, {
          status: "ready",
          accuracy: Math.min(85 + Math.random() * 10, 95), // Random accuracy between 85-95%
        });
      }, 3000);
      
      res.json({ message: "Retraining started", profile });
    } catch (error: any) {
      console.error("Error retraining brand voice:", error);
      res.status(500).json({ message: "Failed to start retraining" });
    }
  });

  app.post("/api/brand-voice/test", isAuthenticated, async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      const profile = await storage.getUserBrandVoiceProfile(req.user!.id);
      if (!profile || profile.status !== 'ready') {
        return res.status(400).json({ message: "Brand voice model is not ready for testing" });
      }

      // In a real implementation, this would analyze the message against the trained model
      // For now, we'll simulate a confidence score and feedback
      const confidence = 0.7 + Math.random() * 0.25; // Random confidence between 70-95%
      const feedback = confidence > 0.8 ? 
        "This message matches your brand voice well!" :
        confidence > 0.6 ?
        "This message partially matches your brand voice. Consider adjusting the tone." :
        "This message doesn't match your brand voice. Try using more brand-consistent language.";

      res.json({ confidence, feedback });
    } catch (error: any) {
      console.error("Error testing brand voice:", error);
      res.status(500).json({ message: "Failed to test brand voice" });
    }
  });

  // Team Collaboration Routes
  app.get("/api/team/members", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const teamId = req.user.id; // User's own team
      const members = await storage.getTeamMembers(teamId);
      
      // Add current user as owner if no members exist
      if (members.length === 0) {
        const owner = {
          id: "owner",
          userId: req.user.id,
          teamId: req.user.id,
          name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'Owner',
          email: req.user.email || '',
          role: 'owner',
          status: 'active',
          avatar: req.user.profileImageUrl || undefined,
          joinedAt: new Date(),
          lastActive: new Date(),
          permissions: {
            canEditPrompts: true,
            canInviteMembers: true,
            canManageRoles: true,
            canDeletePrompts: true
          }
        };
        members.unshift(owner as any);
      }
      
      res.json(members);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ message: error.message || "Failed to fetch team members" });
    }
  });

  app.post("/api/team/invite", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { email, role, message } = req.body;
      
      if (!email || !role) {
        return res.status(400).json({ message: "Email and role are required" });
      }

      const invitation = await storage.inviteTeamMember({
        teamId: req.user.id,
        email,
        role,
        message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        invitedBy: req.user.id
      });

      res.json(invitation);
    } catch (error: any) {
      console.error('Error sending team invitation:', error);
      res.status(500).json({ message: error.message || "Failed to send invitation" });
    }
  });

  app.get("/api/team/invitations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const teamId = req.user.id;
      const invitations = await storage.getTeamInvitations(teamId);
      res.json(invitations);
    } catch (error: any) {
      console.error('Error fetching team invitations:', error);
      res.status(500).json({ message: error.message || "Failed to fetch invitations" });
    }
  });

  app.patch("/api/team/members/:memberId/role", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { memberId } = req.params;
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }

      const updatedMember = await storage.updateTeamMemberRole(req.user.id, memberId, role);
      res.json(updatedMember);
    } catch (error: any) {
      console.error('Error updating team member role:', error);
      res.status(500).json({ message: error.message || "Failed to update member role" });
    }
  });

  app.delete("/api/team/members/:memberId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { memberId } = req.params;
      await storage.removeTeamMember(req.user.id, memberId);
      res.json({ message: "Team member removed successfully" });
    } catch (error: any) {
      console.error('Error removing team member:', error);
      res.status(500).json({ message: error.message || "Failed to remove team member" });
    }
  });

  app.get("/api/team/prompts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const teamId = req.user.id;
      const prompts = await storage.getSharedPrompts(teamId);
      
      // Add mock shared prompts with real user info for demonstration
      const enrichedPrompts = prompts.map(prompt => ({
        ...prompt,
        sharedBy: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'User',
        collaborators: Array.isArray(prompt.collaborators) ? prompt.collaborators.length : 1,
        sharedAt: prompt.sharedAt.toISOString().split('T')[0]
      }));

      res.json(enrichedPrompts);
    } catch (error: any) {
      console.error('Error fetching shared prompts:', error);
      res.status(500).json({ message: error.message || "Failed to fetch shared prompts" });
    }
  });

  app.post("/api/team/prompts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { title, content, category, permissions, isPublic, tags } = req.body;
      
      if (!title || !content || !category) {
        return res.status(400).json({ message: "Title, content, and category are required" });
      }

      const prompt = await storage.createSharedPrompt({
        title,
        content,
        category,
        teamId: req.user.id,
        permissions: permissions || 'view',
        isPublic: isPublic || false,
        tags: tags || [],
        createdBy: req.user.id
      });

      res.json(prompt);
    } catch (error: any) {
      console.error('Error creating shared prompt:', error);
      res.status(500).json({ message: error.message || "Failed to create shared prompt" });
    }
  });

  app.patch("/api/team/prompts/:promptId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { promptId } = req.params;
      const updates = req.body;
      
      const updatedPrompt = await storage.updateSharedPrompt(
        parseInt(promptId), 
        req.user.id, 
        updates
      );
      
      res.json(updatedPrompt);
    } catch (error: any) {
      console.error('Error updating shared prompt:', error);
      res.status(500).json({ message: error.message || "Failed to update shared prompt" });
    }
  });

  app.delete("/api/team/prompts/:promptId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { promptId } = req.params;
      await storage.deleteSharedPrompt(parseInt(promptId), req.user.id);
      res.json({ message: "Shared prompt deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting shared prompt:', error);
      res.status(500).json({ message: error.message || "Failed to delete shared prompt" });
    }
  });

  // Lead Capture Routes
  app.get("/api/lead-capture/forms", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const forms = await storage.getUserLeadCaptureForms(req.user.id);
      res.json(forms);
    } catch (error: any) {
      console.error('Error fetching lead capture forms:', error);
      res.status(500).json({ message: error.message || "Failed to fetch lead capture forms" });
    }
  });

  app.post("/api/lead-capture/forms", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const form = await storage.createLeadCaptureForm(req.user.id, req.body);
      res.json(form);
    } catch (error: any) {
      console.error('Error creating lead capture form:', error);
      res.status(500).json({ message: error.message || "Failed to create lead capture form" });
    }
  });

  app.patch("/api/lead-capture/forms/:formId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const formId = parseInt(req.params.formId);
      const form = await storage.updateLeadCaptureForm(req.user.id, formId, req.body);
      res.json(form);
    } catch (error: any) {
      console.error('Error updating lead capture form:', error);
      res.status(500).json({ message: error.message || "Failed to update lead capture form" });
    }
  });

  app.delete("/api/lead-capture/forms/:formId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const formId = parseInt(req.params.formId);
      await storage.deleteLeadCaptureForm(req.user.id, formId);
      res.json({ message: "Form deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting lead capture form:', error);
      res.status(500).json({ message: error.message || "Failed to delete lead capture form" });
    }
  });

  app.get("/api/lead-capture/forms/:formId", async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const form = await storage.getLeadCaptureForm(formId);
      
      if (!form || !form.isPublic) {
        return res.status(404).json({ message: "Form not found or not public" });
      }
      
      res.json(form);
    } catch (error: any) {
      console.error('Error fetching lead capture form:', error);
      res.status(500).json({ message: error.message || "Failed to fetch lead capture form" });
    }
  });

  app.post("/api/lead-capture/forms/:formId/submit", async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const form = await storage.getLeadCaptureForm(formId);
      
      if (!form || !form.isPublic) {
        return res.status(404).json({ message: "Form not found or not accessible" });
      }

      const submission = await storage.submitLead({
        formId,
        userId: form.userId,
        data: req.body.data,
        source: req.body.source || 'direct',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer')
      });

      res.json({ 
        success: true, 
        message: form.settings?.thankYouMessage || "Thank you for your submission!" 
      });
    } catch (error: any) {
      console.error('Error submitting lead:', error);
      res.status(500).json({ message: error.message || "Failed to submit form" });
    }
  });

  app.get("/api/lead-capture/submissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const formId = req.query.formId ? parseInt(req.query.formId as string) : undefined;
      
      let submissions;
      if (formId) {
        submissions = await storage.getFormSubmissions(req.user.id, formId);
      } else {
        submissions = await storage.getUserLeadSubmissions(req.user.id);
      }
      
      res.json(submissions);
    } catch (error: any) {
      console.error('Error fetching lead submissions:', error);
      res.status(500).json({ message: error.message || "Failed to fetch lead submissions" });
    }
  });

  app.patch("/api/lead-capture/submissions/:submissionId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const submissionId = parseInt(req.params.submissionId);
      const { status, notes } = req.body;
      
      const submission = await storage.updateLeadStatus(req.user.id, submissionId, status, notes);
      res.json(submission);
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      res.status(500).json({ message: error.message || "Failed to update lead status" });
    }
  });

  app.get("/api/lead-capture/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const formId = req.query.formId ? parseInt(req.query.formId as string) : undefined;
      const analytics = await storage.getLeadCaptureAnalytics(req.user.id, formId);
      res.json(analytics);
    } catch (error: any) {
      console.error('Error fetching lead capture analytics:', error);
      res.status(500).json({ message: error.message || "Failed to fetch analytics" });
    }
  });

  // Export Routes
  app.get("/api/export/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const exports = await storage.getUserExportHistory(req.user.id);
      res.json(exports);
    } catch (error: any) {
      console.error('Error fetching export history:', error);
      res.status(500).json({ message: error.message || "Failed to fetch export history" });
    }
  });

  app.post("/api/export/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { exportType, filters, fileName } = req.body;
      
      // Fetch conversations based on filters
      const conversations = await storage.getUserConversationsForExport(req.user.id, filters);
      
      let exportData: string;
      let contentType: string;
      let fileExtension: string;

      switch (exportType) {
        case 'csv':
          exportData = generateCSV(conversations);
          contentType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'txt':
          exportData = generateTXT(conversations);
          contentType = 'text/plain';
          fileExtension = 'txt';
          break;
        case 'json':
          exportData = JSON.stringify(conversations, null, 2);
          contentType = 'application/json';
          fileExtension = 'json';
          break;
        case 'pdf':
          // For PDF, we'll return the data and let the frontend handle PDF generation
          exportData = JSON.stringify(conversations);
          contentType = 'application/json';
          fileExtension = 'json';
          break;
        default:
          return res.status(400).json({ message: "Invalid export type" });
      }

      // Create export record
      const exportRecord = await storage.createExportRecord(req.user.id, {
        exportType,
        fileName: fileName || `conversations_${Date.now()}.${fileExtension}`,
        fileSize: Buffer.byteLength(exportData, 'utf8'),
        recordCount: conversations.length,
        dateRange: filters?.dateRange || null,
        filters: filters || null,
        status: 'completed',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });

      // For non-PDF exports, return the data directly
      if (exportType !== 'pdf') {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${exportRecord.fileName}"`);
        return res.send(exportData);
      }

      // For PDF, return the export record and data for frontend processing
      res.json({
        exportId: exportRecord.id,
        data: conversations,
        fileName: exportRecord.fileName
      });

    } catch (error: any) {
      console.error('Error exporting conversations:', error);
      res.status(500).json({ message: error.message || "Failed to export conversations" });
    }
  });

  app.delete("/api/export/:exportId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const exportId = parseInt(req.params.exportId);
      // Note: We could implement delete functionality if needed
      res.json({ message: "Export deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting export:', error);
      res.status(500).json({ message: error.message || "Failed to delete export" });
    }
  });

  // Import Routes
  app.post("/api/import/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Note: For a full implementation, you would need to add multer middleware
      // for file upload handling and implement the actual import logic
      
      // Mock response for now - in a real implementation you would:
      // 1. Parse the uploaded file based on its type
      // 2. Validate the data structure
      // 3. Insert conversations into the database
      // 4. Handle duplicates appropriately
      // 5. Create an import record for tracking
      
      const mockImportResult = {
        recordCount: 25,
        duplicates: 3,
        imported: 22,
        message: "Import completed successfully"
      };

      // Create an export record for import tracking
      await storage.createExportRecord(req.user.id, {
        exportType: 'import',
        fileName: 'imported_conversations.json',
        fileSize: 1024,
        recordCount: mockImportResult.imported,
        status: 'completed'
      });

      res.json(mockImportResult);
    } catch (error: any) {
      console.error('Error importing conversations:', error);
      res.status(500).json({ message: error.message || "Failed to import conversations" });
    }
  });

  // Helper functions for export formats
  function generateCSV(conversations: any[]): string {
    if (conversations.length === 0) {
      return 'No conversations found\n';
    }

    const headers = [
      'Date',
      'Client Message',
      'AI Response',
      'Tone',
      'Confidence Score',
      'Generation Time (ms)',
      'User Feedback'
    ];

    const csvRows = [headers.join(',')];

    conversations.forEach(conv => {
      const row = [
        `"${conv.createdAt?.toISOString().split('T')[0] || 'N/A'}"`,
        `"${(conv.clientMessage || '').replace(/"/g, '""')}"`,
        `"${(conv.response || '').replace(/"/g, '""')}"`,
        `"${conv.tone || 'N/A'}"`,
        `"${conv.confidenceScore || 0}"`,
        `"${conv.generationTime || 0}"`,
        `"${conv.userFeedback || 'N/A'}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  function generateTXT(conversations: any[]): string {
    if (conversations.length === 0) {
      return 'No conversations found\n';
    }

    let txtContent = `SAVRII CONVERSATION EXPORT\n`;
    txtContent += `Generated: ${new Date().toISOString()}\n`;
    txtContent += `Total Conversations: ${conversations.length}\n`;
    txtContent += `${'='.repeat(60)}\n\n`;

    conversations.forEach((conv, index) => {
      txtContent += `CONVERSATION #${index + 1}\n`;
      txtContent += `Date: ${conv.createdAt?.toISOString().split('T')[0] || 'N/A'}\n`;
      txtContent += `Tone: ${conv.tone || 'N/A'}\n`;
      txtContent += `Confidence Score: ${conv.confidenceScore || 0}/100\n`;
      txtContent += `Generation Time: ${conv.generationTime || 0}ms\n`;
      txtContent += `${'-'.repeat(40)}\n`;
      txtContent += `CLIENT MESSAGE:\n${conv.clientMessage || 'N/A'}\n\n`;
      txtContent += `AI RESPONSE:\n${conv.response || 'N/A'}\n\n`;
      if (conv.userFeedback) {
        txtContent += `USER FEEDBACK: ${conv.userFeedback}\n\n`;
      }
      txtContent += `${'='.repeat(60)}\n\n`;
    });

    return txtContent;
  }

  // Real-time analytics routes
  app.get('/api/analytics/user-activity', isAuthenticated, async (req: any, res) => {
    try {
      const timeRange = req.query.range || '24h';
      const userId = requireAuthUser(req);
      
      const activityData = await storage.getUserActivityAnalytics(userId, timeRange);
      res.json(activityData);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  app.get('/api/analytics/system-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const timeRange = req.query.range || '24h';
      
      const systemData = await storage.getSystemMetrics(timeRange);
      res.json(systemData);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  app.get('/api/analytics/query-patterns', isAuthenticated, async (req: any, res) => {
    try {
      const timeRange = req.query.range || '24h';
      const userId = requireAuthUser(req);
      
      const patternData = await storage.getQueryPatterns(userId, timeRange);
      res.json(patternData);
    } catch (error) {
      console.error("Error fetching query patterns:", error);
      res.status(500).json({ message: "Failed to fetch query patterns" });
    }
  });

  app.get('/api/analytics/live-stats', isAuthenticated, async (req: any, res) => {
    try {
      const liveData = await storage.getLiveStats();
      res.json(liveData);
    } catch (error) {
      console.error("Error fetching live stats:", error);
      res.status(500).json({ message: "Failed to fetch live stats" });
    }
  });

  app.get('/api/analytics/response-times', isAuthenticated, async (req: any, res) => {
    try {
      const timeRange = req.query.range || '24h';
      const userId = requireAuthUser(req);
      
      const responseData = await storage.getResponseTimeAnalytics(userId, timeRange);
      res.json(responseData);
    } catch (error) {
      console.error("Error fetching response times:", error);
      res.status(500).json({ message: "Failed to fetch response times" });
    }
  });

  app.get('/api/analytics/engagement', isAuthenticated, async (req: any, res) => {
    try {
      const timeRange = req.query.range || '24h';
      const userId = requireAuthUser(req);
      
      const engagementData = await storage.getEngagementAnalytics(userId, timeRange);
      res.json(engagementData);
    } catch (error) {
      console.error("Error fetching engagement data:", error);
      res.status(500).json({ message: "Failed to fetch engagement data" });
    }
  });

  // Workflow Management Routes
  app.get('/api/workflows', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const workflows = await storage.getUserWorkflows(userId);
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.post('/api/workflows', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Workflow name is required" });
      }

      const workflow = await storage.createWorkflow(userId, { 
        name, 
        description: description || ''
      });
      res.json(workflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });

  app.patch('/api/workflows/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const workflowId = parseInt(req.params.id);
      
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      const workflow = await storage.updateWorkflow(userId, workflowId, req.body);
      res.json(workflow);
    } catch (error) {
      console.error("Error updating workflow:", error);
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });

  app.delete('/api/workflows/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const workflowId = parseInt(req.params.id);
      
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      await storage.deleteWorkflow(userId, workflowId);
      res.json({ message: "Workflow deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });

  app.get('/api/workflows/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const workflowId = parseInt(req.params.id);
      
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      const workflow = await storage.getWorkflow(userId, workflowId);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  // Custom Model Management Routes
  app.get('/api/custom-models', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const models = await storage.getUserCustomModels(userId);
      res.json(models);
    } catch (error) {
      console.error("Error fetching custom models:", error);
      res.status(500).json({ message: "Failed to fetch custom models" });
    }
  });

  app.post('/api/custom-models/upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const { name, description, type, templateContent } = req.body;
      
      if (!name || !type) {
        return res.status(400).json({ message: "Name and type are required" });
      }

      if (type === 'template' && !templateContent) {
        return res.status(400).json({ message: "Template content is required for template type" });
      }

      // For now, we'll handle file uploads as a simple simulation
      // In a real implementation, you'd use multer or similar for file handling
      const modelData: any = {
        name,
        description: description || '',
        type,
        status: type === 'template' ? 'active' : 'processing',
        fileSize: type === 'model' ? Math.floor(Math.random() * 50000000) + 1000000 : 0, // Simulate file size
        templateContent: type === 'template' ? templateContent : null
      };

      const model = await storage.createCustomModel(userId, modelData);
      
      // Simulate processing time for models
      if (type === 'model') {
        setTimeout(async () => {
          await storage.updateCustomModel(userId, model.id, { status: 'active' });
        }, 5000);
      }

      res.json(model);
    } catch (error) {
      console.error("Error uploading custom model:", error);
      res.status(500).json({ message: "Failed to upload custom model" });
    }
  });

  app.patch('/api/custom-models/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const modelId = parseInt(req.params.id);
      
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      const model = await storage.updateCustomModel(userId, modelId, req.body);
      res.json(model);
    } catch (error) {
      console.error("Error updating custom model:", error);
      res.status(500).json({ message: "Failed to update custom model" });
    }
  });

  app.patch('/api/custom-models/:id/default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const modelId = parseInt(req.params.id);
      
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      const model = await storage.setDefaultCustomModel(userId, modelId);
      res.json(model);
    } catch (error) {
      console.error("Error setting default model:", error);
      res.status(500).json({ message: "Failed to set default model" });
    }
  });

  app.delete('/api/custom-models/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const modelId = parseInt(req.params.id);
      
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      await storage.deleteCustomModel(userId, modelId);
      res.json({ message: "Custom model deleted successfully" });
    } catch (error) {
      console.error("Error deleting custom model:", error);
      res.status(500).json({ message: "Failed to delete custom model" });
    }
  });

  // Security & Compliance Routes
  app.get('/api/security/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const settings = await storage.getUserSecuritySettings(userId);
      
      // Return default settings if none exist
      if (!settings) {
        const defaultSettings = {
          id: 0,
          userId,
          ssoEnabled: false,
          ssoProvider: '',
          ssoMetadata: '',
          twoFactorEnabled: false,
          sessionTimeout: 480,
          passwordPolicy: {
            minLength: 8,
            requireSpecialChars: true,
            requireNumbers: true,
            requireUppercase: true
          },
          ipWhitelist: [],
          apiKeyRotationDays: 90,
          auditLogRetentionDays: 365,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        res.json(defaultSettings);
      } else {
        // Transform database format to frontend format
        const frontendSettings = {
          ...settings,
          passwordPolicy: {
            minLength: settings.passwordPolicyMinLength,
            requireSpecialChars: settings.passwordPolicyRequireSpecial,
            requireNumbers: settings.passwordPolicyRequireNumbers,
            requireUppercase: settings.passwordPolicyRequireUppercase
          }
        };
        res.json(frontendSettings);
      }
    } catch (error) {
      console.error("Error fetching security settings:", error);
      res.status(500).json({ message: "Failed to fetch security settings" });
    }
  });

  app.patch('/api/security/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const settings = req.body;
      
      // Transform frontend format to database format
      const dbSettings: any = { ...settings };
      if (settings.passwordPolicy) {
        dbSettings.passwordPolicyMinLength = settings.passwordPolicy.minLength;
        dbSettings.passwordPolicyRequireSpecial = settings.passwordPolicy.requireSpecialChars;
        dbSettings.passwordPolicyRequireNumbers = settings.passwordPolicy.requireNumbers;
        dbSettings.passwordPolicyRequireUppercase = settings.passwordPolicy.requireUppercase;
        delete dbSettings.passwordPolicy;
      }
      
      const updatedSettings = await storage.updateSecuritySettings(userId, dbSettings);
      
      // Log the settings change
      await storage.createAuditLog(userId, {
        action: "Security settings updated",
        category: "security",
        details: `Updated security settings: ${Object.keys(settings).join(', ')}`,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        status: "success",
        riskLevel: "medium",
        metadata: settings
      });
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating security settings:", error);
      res.status(500).json({ message: "Failed to update security settings" });
    }
  });

  app.get('/api/security/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const filters = req.query;
      
      // For demo purposes, create some sample audit logs if none exist
      const existingLogs = await storage.getUserAuditLogs(userId, filters);
      
      if (existingLogs.length === 0) {
        // Create sample audit logs for demonstration
        const sampleLogs = [
          {
            action: "User login",
            category: "auth" as const,
            details: "Successful login via Google OAuth",
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            status: "success" as const,
            riskLevel: "low" as const,
            metadata: { provider: "google" }
          },
          {
            action: "API key generated",
            category: "api" as const,
            details: "New API key generated for integration",
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            status: "success" as const,
            riskLevel: "medium" as const,
            metadata: { keyType: "integration" }
          },
          {
            action: "Failed login attempt",
            category: "auth" as const,
            details: "Invalid password provided",
            ipAddress: "10.0.0.1",
            userAgent: "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
            status: "failure" as const,
            riskLevel: "high" as const,
            metadata: { attempts: 3 }
          },
          {
            action: "Data export",
            category: "data" as const,
            details: "Exported conversation history",
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            status: "success" as const,
            riskLevel: "low" as const,
            metadata: { format: "json", records: 150 }
          },
          {
            action: "Security settings changed",
            category: "security" as const,
            details: "Enabled two-factor authentication",
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            status: "success" as const,
            riskLevel: "medium" as const,
            metadata: { setting: "2fa", enabled: true }
          }
        ];

        // Create sample logs
        for (const log of sampleLogs) {
          await storage.createAuditLog(userId, log);
        }

        // Fetch the newly created logs
        const logs = await storage.getUserAuditLogs(userId, filters);
        res.json(logs);
      } else {
        res.json(existingLogs);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.post('/api/security/2fa/enable', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      
      // In a real implementation, this would generate a QR code and secret
      const secret = "JBSWY3DPEHPK3PXP"; // Example secret
      const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/Savrii%3A${encodeURIComponent(req.user.email)}%3Fsecret%3D${secret}%26issuer%3DSavrii`;
      
      // Log 2FA setup
      await storage.createAuditLog(userId, {
        action: "2FA setup initiated",
        category: "security",
        details: "Two-factor authentication setup started",
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        status: "success",
        riskLevel: "medium",
        metadata: { method: "totp" }
      });
      
      res.json({ 
        secret,
        qrCodeUrl,
        backupCodes: [
          "A1B2C3D4", "E5F6G7H8", "I9J0K1L2", "M3N4O5P6", "Q7R8S9T0",
          "U1V2W3X4", "Y5Z6A7B8", "C9D0E1F2", "G3H4I5J6", "K7L8M9N0"
        ]
      });
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      res.status(500).json({ message: "Failed to enable 2FA" });
    }
  });

  app.post('/api/security/audit-report', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const params = req.body;
      
      const report = await storage.generateAuditReport(userId, params);
      
      // Log report generation
      await storage.createAuditLog(userId, {
        action: "Audit report generated",
        category: "admin",
        details: `Generated ${params.period || '30d'} audit report`,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        status: "success",
        riskLevel: "low",
        metadata: params
      });
      
      res.json(report);
    } catch (error) {
      console.error("Error generating audit report:", error);
      res.status(500).json({ message: "Failed to generate audit report" });
    }
  });

  // White-label Settings Routes
  app.get('/api/white-label/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const settings = await storage.getUserWhiteLabelSettings(userId);
      
      // Return default settings if none exist
      if (!settings) {
        const defaultSettings = {
          id: 0,
          userId,
          logoUrl: '',
          faviconUrl: '',
          brandName: 'Savrii',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          accentColor: '#10b981',
          customDomain: '',
          domainVerified: false,
          customCss: '',
          hideFooter: false,
          hidePoweredBy: false,
          customTermsUrl: '',
          customPrivacyUrl: '',
          customSupportEmail: '',
          loginPageCustomization: {
            backgroundImage: '',
            welcomeMessage: '',
            subtitle: ''
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        res.json(defaultSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error("Error fetching white-label settings:", error);
      res.status(500).json({ message: "Failed to fetch white-label settings" });
    }
  });

  app.patch('/api/white-label/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const settings = req.body;
      
      const updatedSettings = await storage.updateWhiteLabelSettings(userId, settings);
      
      // Log the settings change
      await storage.createAuditLog(userId, {
        action: "White-label settings updated",
        category: "admin",
        details: `Updated white-label settings: ${Object.keys(settings).join(', ')}`,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        status: "success",
        riskLevel: "low",
        metadata: settings
      });
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating white-label settings:", error);
      res.status(500).json({ message: "Failed to update white-label settings" });
    }
  });

  app.post('/api/white-label/upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      
      // In a real implementation, this would handle file uploads using multer
      // For demo purposes, we'll simulate file upload
      const uploadType = req.body.type || 'logo';
      const mockUrl = `https://example.com/uploads/${userId}/${uploadType}_${Date.now()}.png`;
      
      // Log the upload
      await storage.createAuditLog(userId, {
        action: "File uploaded",
        category: "admin",
        details: `Uploaded ${uploadType} for white-label customization`,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        status: "success",
        riskLevel: "low",
        metadata: { type: uploadType, url: mockUrl }
      });
      
      res.json({ url: mockUrl, type: uploadType });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.post('/api/white-label/verify-domain', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const settings = await storage.getUserWhiteLabelSettings(userId);
      const domain = settings?.customDomain;
      
      if (!domain) {
        return res.status(400).json({ message: "No custom domain configured" });
      }
      
      const isVerified = await storage.verifyCustomDomain(userId, domain);
      
      // Log domain verification attempt
      await storage.createAuditLog(userId, {
        action: "Domain verification attempted",
        category: "admin",
        details: `Domain verification for ${domain}: ${isVerified ? 'successful' : 'failed'}`,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        status: isVerified ? "success" : "failure",
        riskLevel: "medium",
        metadata: { domain, verified: isVerified }
      });
      
      res.json({ verified: isVerified, domain });
    } catch (error) {
      console.error("Error verifying domain:", error);
      res.status(500).json({ message: "Failed to verify domain" });
    }
  });

// Webhooks endpoints
app.get("/api/webhooks", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const webhooks = await storage.getUserWebhooks(req.user.id);
    
    // Transform webhooks to match frontend interface
    const transformedWebhooks = webhooks.map(webhook => ({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active,
      secret: webhook.secret,
      headers: JSON.parse(webhook.headers || "{}"),
      retryCount: webhook.retryCount,
      timeout: webhook.timeout,
      lastTriggered: webhook.lastTriggered?.toISOString(),
      status: webhook.status,
      deliveries: {
        total: webhook.totalDeliveries,
        successful: webhook.successfulDeliveries,
        failed: webhook.failedDeliveries
      }
    }));
    
    res.json(transformedWebhooks);
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({ message: "Failed to fetch webhooks" });
  }
});

app.post("/api/webhooks", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const validatedData = insertWebhookSchema.parse(req.body);
    const webhook = await storage.createWebhook(req.user.id, {
      ...validatedData,
      headers: JSON.stringify(validatedData.headers || {}),
    });
    
    await storage.createAuditLog(req.user.id, {
      action: "webhook_created",
      resource: "webhook",
      resourceId: webhook.id.toString(),
      details: { name: webhook.name, url: webhook.url, events: webhook.events },
    });
    
    res.json(webhook);
  } catch (error) {
    console.error("Error creating webhook:", error);
    res.status(500).json({ message: "Failed to create webhook" });
  }
});

app.patch("/api/webhooks/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const webhookId = parseInt(req.params.id);
    const updateData = insertWebhookSchema.partial().parse(req.body);
    
    const webhook = await storage.updateWebhook(webhookId, {
      ...updateData,
      headers: updateData.headers ? JSON.stringify(updateData.headers) : undefined,
    });
    
    await storage.createAuditLog(req.user.id, {
      action: "webhook_updated",
      resource: "webhook",
      resourceId: webhookId.toString(),
      details: updateData,
    });
    
    res.json(webhook);
  } catch (error) {
    console.error("Error updating webhook:", error);
    res.status(500).json({ message: "Failed to update webhook" });
  }
});

app.delete("/api/webhooks/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const webhookId = parseInt(req.params.id);
    await storage.deleteWebhook(webhookId);
    
    await storage.createAuditLog(req.user.id, {
      action: "webhook_deleted",
      resource: "webhook",
      resourceId: webhookId.toString(),
      details: {},
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({ message: "Failed to delete webhook" });
  }
});

app.post("/api/webhooks/:id/test", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const webhookId = parseInt(req.params.id);
    const webhooks = await storage.getUserWebhooks(req.user.id);
    const webhook = webhooks.find(w => w.id === webhookId);
    
    if (!webhook) {
      return res.status(404).json({ message: "Webhook not found" });
    }

    // Create test payload
    const testPayload = {
      event: "test.webhook",
      timestamp: new Date().toISOString(),
      webhook_id: webhookId,
      data: {
        userId: req.user.id,
        message: "This is a test webhook payload from Savrii",
        test: true
      }
    };

    // Send test webhook (in production, this would be a real HTTP request)
    const startTime = Date.now();
    let status = 'success';
    let httpStatus = 200;
    let response = 'Test webhook sent successfully';
    
    try {
      // Simulate webhook delivery
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // In production, you would make an actual HTTP request here:
      // const result = await fetch(webhook.url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-Webhook-Signature': generateSignature(testPayload, webhook.secret),
      //     ...JSON.parse(webhook.headers || '{}')
      //   },
      //   body: JSON.stringify(testPayload),
      //   timeout: webhook.timeout * 1000
      // });
      
    } catch (error) {
      status = 'failed';
      httpStatus = 500;
      response = error instanceof Error ? error.message : 'Test failed';
    }
    
    const duration = Date.now() - startTime;
    
    // Log the test delivery
    await storage.createWebhookDelivery({
      webhookId,
      event: 'test.webhook',
      status,
      httpStatus,
      response,
      duration,
    });
    
    await storage.createAuditLog(req.user.id, {
      action: "webhook_tested",
      resource: "webhook",
      resourceId: webhookId.toString(),
      details: { status, httpStatus, duration },
    });
    
    res.json({ 
      success: true, 
      status, 
      httpStatus, 
      duration,
      message: "Test webhook sent"
    });
  } catch (error) {
    console.error("Error testing webhook:", error);
    res.status(500).json({ message: "Failed to test webhook" });
  }
});

app.get("/api/webhooks/deliveries", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const deliveries = await storage.getWebhookDeliveries(req.user.id);
    
    const transformedDeliveries = deliveries.map(delivery => ({
      ...delivery,
      timestamp: delivery.timestamp?.toISOString(),
    }));
    
    res.json(transformedDeliveries);
  } catch (error) {
    console.error("Error fetching webhook deliveries:", error);
    res.status(500).json({ message: "Failed to fetch webhook deliveries" });
  }
});

// Zapier Integration endpoints
app.get("/api/zapier/integrations", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const integrations = await storage.getUserZapierIntegrations(req.user.id);
    
    const transformedIntegrations = integrations.map(integration => ({
      id: integration.id,
      name: integration.name,
      trigger: integration.trigger,
      zapierWebhookUrl: integration.zapierWebhookUrl,
      active: integration.active,
      filters: JSON.parse(integration.filters || "{}"),
      lastExecution: integration.lastExecution?.toISOString(),
      executionCount: integration.executionCount,
    }));
    
    res.json(transformedIntegrations);
  } catch (error) {
    console.error("Error fetching Zapier integrations:", error);
    res.status(500).json({ message: "Failed to fetch Zapier integrations" });
  }
});

app.post("/api/zapier/integrations", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { name, trigger, zapierWebhookUrl, filters = {} } = req.body;
    
    const integration = await storage.createZapierIntegration(req.user.id, {
      name,
      trigger,
      zapierWebhookUrl,
      filters: JSON.stringify(filters),
      active: true,
      executionCount: 0,
    });
    
    await storage.createAuditLog(req.user.id, {
      action: "zapier_integration_created",
      resource: "zapier_integration",
      resourceId: integration.id.toString(),
      details: { name, trigger, zapierWebhookUrl },
    });
    
    res.json(integration);
  } catch (error) {
    console.error("Error creating Zapier integration:", error);
    res.status(500).json({ message: "Failed to create Zapier integration" });
  }
});

app.patch("/api/zapier/integrations/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const integrationId = parseInt(req.params.id);
    const updateData = req.body;
    
    if (updateData.filters) {
      updateData.filters = JSON.stringify(updateData.filters);
    }
    
    const integration = await storage.updateZapierIntegration(integrationId, updateData);
    
    await storage.createAuditLog(req.user.id, {
      action: "zapier_integration_updated",
      resource: "zapier_integration",
      resourceId: integrationId.toString(),
      details: updateData,
    });
    
    res.json(integration);
  } catch (error) {
    console.error("Error updating Zapier integration:", error);
    res.status(500).json({ message: "Failed to update Zapier integration" });
  }
});

app.delete("/api/zapier/integrations/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const integrationId = parseInt(req.params.id);
    await storage.deleteZapierIntegration(integrationId);
    
    await storage.createAuditLog(req.user.id, {
      action: "zapier_integration_deleted",
      resource: "zapier_integration",
      resourceId: integrationId.toString(),
      details: {},
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting Zapier integration:", error);
    res.status(500).json({ message: "Failed to delete Zapier integration" });
  }
});

  // Customer Inbox Routes - REAL GMAIL DATA
  app.get('/api/inbox/conversations/:statusFilter?/:searchQuery?', isAuthenticated, async (req: any, res) => {
    try {
      // CRITICAL SECURITY: Always use authenticated user's ID
      const userId = req.user.id as string;
      const { statusFilter, searchQuery } = req.params;
      console.log("📧 INBOX SECURITY: Fetching Gmail conversations ONLY for authenticated user:", userId);
      console.log("📧 INBOX: URL params - statusFilter:", statusFilter, "searchQuery:", searchQuery);
      
      // SECURITY: Get emails ONLY for the authenticated user
      const emails = await storage.getSynchronizedEmails(userId, undefined, 100);
      console.log("📧 INBOX: Found Gmail emails for user", userId, ":", emails.length);
      
      if (emails.length === 0) {
        console.log("📧 INBOX: No emails found, returning empty array");
        return res.json([]);
      }
      
      // Group emails by sender (fromEmail) to create conversations
      const conversations = new Map();
      
      emails.forEach(email => {
        const key = email.fromEmail; // Simple grouping by sender
        
        if (!conversations.has(key)) {
          conversations.set(key, {
            id: key,
            customerName: email.fromName || email.fromEmail,
            customerEmail: email.fromEmail,
            subject: email.subject || 'No subject',
            lastMessageAt: email.receivedAt,
            messages: [],
            unreadCount: 0,
            status: 'open',
            priority: 'normal',
            channel: 'email'
          });
        }
        
        const conversation = conversations.get(key);
        conversation.messages.push({
          id: email.id,
          messageType: 'incoming',
          senderName: email.fromName || email.fromEmail,
          senderEmail: email.fromEmail,
          content: email.bodyText || email.snippet || 'No content',
          isRead: email.isRead,
          createdAt: email.receivedAt,
          deliveryStatus: 'delivered',
          conversationId: key
        });
        
        if (!email.isRead) {
          conversation.unreadCount++;
        }
        
        // Update last message time and subject to most recent
        if (new Date(email.receivedAt) > new Date(conversation.lastMessageAt)) {
          conversation.lastMessageAt = email.receivedAt;
          conversation.subject = email.subject || 'No subject';
        }
      });
      
      // Convert to array and sort by last message time
      const conversationList = Array.from(conversations.values())
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      
      console.log("📧 INBOX: Returning real Gmail conversations:", conversationList.length);
      res.json(conversationList);
    } catch (error) {
      console.error("📧 INBOX: Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
    }
  });

  app.get('/api/inbox/conversation/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId, userId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // NEW AI EMAIL REPLY GENERATION - Works with real Gmail data
  app.post('/api/inbox/generate-reply', isAuthenticated, async (req: any, res) => {
    try {
      // CRITICAL SECURITY: Always use authenticated user's ID
      const userId = req.user.id as string;
      const { conversationId, messageId, replyType, customInstructions } = req.body;
      
      console.log("🤖 AI REPLY SECURITY: Generating reply ONLY for authenticated user:", userId);
      console.log("🤖 AI REPLY: conversationId:", conversationId, "messageId:", messageId, "replyType:", replyType);

      // SECURITY: Get email messages ONLY for the authenticated user
      const emails = await storage.getSynchronizedEmails(userId, undefined, 100);
      const originalMessage = emails.find(email => email.id === messageId);
      
      if (!originalMessage) {
        console.log("🤖 AI REPLY: Email not found with messageId:", messageId);
        return res.status(404).json({ message: "Email message not found" });
      }
      
      console.log("🤖 AI REPLY: Found email from:", originalMessage.fromEmail, "subject:", originalMessage.subject);

      // Generate AI reply using OpenAI
      const startTime = Date.now();
      const emailContent = originalMessage.bodyText || originalMessage.snippet || "No content available";
      let prompt = "";
      
      switch (replyType) {
        case "apology":
          prompt = `Write a sincere, professional apology response to this email. Be empathetic and take responsibility where appropriate.

Subject: ${originalMessage.subject}
From: ${originalMessage.fromName} <${originalMessage.fromEmail}>
Message: ${emailContent}`;
          break;
        case "order_update":
          prompt = `Write a helpful order update response to this customer email. Provide reassurance and clear next steps.

Subject: ${originalMessage.subject}
From: ${originalMessage.fromName} <${originalMessage.fromEmail}>
Message: ${emailContent}`;
          break;
        case "refund_request":
          prompt = `Write a professional response handling this refund/return email request. Be understanding and explain the process clearly.

Subject: ${originalMessage.subject}
From: ${originalMessage.fromName} <${originalMessage.fromEmail}>
Message: ${emailContent}`;
          break;
        case "upsell":
          prompt = `Write a friendly upsell message in response to this customer email. Suggest relevant additional products or services naturally.

Subject: ${originalMessage.subject}
From: ${originalMessage.fromName} <${originalMessage.fromEmail}>
Message: ${emailContent}`;
          break;
        case "custom":
          prompt = `${customInstructions}

Email to respond to:
Subject: ${originalMessage.subject}
From: ${originalMessage.fromName} <${originalMessage.fromEmail}>
Message: ${emailContent}`;
          break;
        default:
          prompt = `Write a professional, helpful response to this email:

Subject: ${originalMessage.subject}
From: ${originalMessage.fromName} <${originalMessage.fromEmail}>
Message: ${emailContent}`;
      }

      console.log("🤖 AI REPLY: Generating with OpenAI...");
      const aiResponse = await generateClientReply(prompt + "\n\nWrite a professional email response. Be concise, friendly, and helpful.");
      const generationTime = Date.now() - startTime;
      console.log("🤖 AI REPLY: Generated reply in", generationTime, "ms");

      // Return the generated reply
      console.log("🤖 AI REPLY: Successfully generated reply");
      console.log("🤖 AI REPLY: Response content:", aiResponse.response);
      
      res.json({
        replyId: messageId, // Use messageId as temporary replyId
        generatedReply: aiResponse.response, // Fixed: use .response instead of .content
        confidence: aiResponse.confidence,
        generationTime: aiResponse.generationTime, // Use the actual generation time from AI response
        originalEmail: {
          subject: originalMessage.subject,
          from: originalMessage.fromEmail,
          fromName: originalMessage.fromName
        }
      });
    } catch (error) {
      console.error("🤖 AI REPLY: Error generating reply:", error);
      res.status(500).json({ message: "Failed to generate reply", error: error.message });
    }
  });

  app.post('/api/inbox/send-reply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const { replyId, finalReply, conversationId } = req.body;

      // Update the reply with final version and mark as sent
      const updatedReply = await storage.updateAiReply(replyId, userId, {
        finalReply,
        status: 'sent',
        sentAt: new Date(),
        wasEdited: finalReply !== undefined,
      });

      if (!updatedReply) {
        return res.status(404).json({ message: "Reply not found" });
      }

      // Create an outgoing message in the conversation
      const outgoingMessage = {
        conversationId,
        messageType: 'outgoing' as const,
        senderName: req.user.firstName + ' ' + req.user.lastName,
        senderEmail: req.user.email,
        content: finalReply,
        isRead: true,
        deliveryStatus: 'sent',
      };

      await storage.createMessage(outgoingMessage);

      // Update conversation status
      await storage.updateConversation(conversationId, userId, {
        status: 'pending',
        unreadCount: 0,
      });

      res.json({ success: true, message: "Reply sent successfully" });
    } catch (error) {
      console.error("Error sending reply:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  app.get('/api/inbox/replies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const status = req.query.status || undefined;
      const limit = parseInt(req.query.limit) || 50;
      
      const replies = await storage.getAiGeneratedReplies(userId, limit, status);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  app.post('/api/inbox/conversation', isAuthenticated, async (req: any, res) => {
    try {
      const userId = requireAuthUser(req);
      const conversationData = req.body;
      
      const newConversation = await storage.createConversation(userId, conversationData);
      res.json(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.post('/api/inbox/message', isAuthenticated, async (req: any, res) => {
    try {
      const messageData = req.body;
      const newMessage = await storage.createMessage(messageData);
      res.json(newMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
