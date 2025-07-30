import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { PLANS } from "@shared/plans";

export function registerBillingRoutes(app: Express) {
  // Get user's plan information
  app.get("/api/billing/plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        currentPlan: user.plan,
        features: PLANS[user.plan] || PLANS.starter,
        planStartDate: user.planStartDate,
        trialEnd: user.trialEnd,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId
      });
    } catch (error) {
      console.error("Error fetching plan info:", error);
      res.status(500).json({ message: "Failed to fetch plan information" });
    }
  });

  // Change user's plan
  app.post("/api/billing/change-plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { newPlan } = req.body;
      
      if (!newPlan || !PLANS[newPlan]) {
        return res.status(400).json({ message: "Invalid plan specified" });
      }

      // In production, this would integrate with Stripe
      // For now, we'll update the user's plan directly
      const updatedUser = await storage.updateUserPlan(userId, newPlan);
      
      res.json({ 
        success: true, 
        message: `Plan changed to ${PLANS[newPlan].name}`,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error changing plan:", error);
      res.status(500).json({ message: "Failed to change plan" });
    }
  });

  // Cancel subscription
  app.post("/api/billing/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In production, this would cancel the Stripe subscription
      // For now, we'll just downgrade to starter plan
      const updatedUser = await storage.updateUserPlan(userId, "starter");
      
      res.json({ 
        success: true, 
        message: "Subscription cancelled",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Get billing history (mock for now)
  app.get("/api/billing/history", isAuthenticated, async (req: any, res) => {
    try {
      // In production, this would fetch from Stripe
      res.json([
        {
          id: "inv_1",
          date: "2025-01-01",
          amount: 29.00,
          status: "paid",
          description: "Pro Plan - Monthly"
        },
        {
          id: "inv_2", 
          date: "2024-12-01",
          amount: 29.00,
          status: "paid",
          description: "Pro Plan - Monthly"
        }
      ]);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      res.status(500).json({ message: "Failed to fetch billing history" });
    }
  });
}