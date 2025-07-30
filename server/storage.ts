import {
  users,
  aiResponses,
  reviews,
  contactMessages,
  customPrompts,
  brandVoiceProfiles,
  brandVoiceSamples,
  brandVoiceGuidelines,
  teamMembers,
  teamInvitations,
  sharedPrompts,
  leadCaptureForms,
  leadSubmissions,
  leadCaptureAnalytics,
  exportHistory,
  workflows,
  customModels,
  securitySettings,
  auditLogs,
  whiteLabelSettings,
  webhooks,
  zapierIntegrations,
  webhookDeliveries,
  customerConversations,
  customerMessages,
  aiGeneratedReplies,
  replyTemplates,
  emailIntegrations,
  emailMessages,

  type User,
  type UpsertUser,
  type InsertAiResponse,
  type AiResponse,
  type Review,
  type InsertReview,
  type ContactMessage,
  type InsertContact,
  type CustomPrompt,
  type InsertCustomPrompt,
  type BrandVoiceProfile,
  type BrandVoiceSample,
  type BrandVoiceGuidelines,
  type InsertBrandVoiceSample,
  type InsertBrandVoiceGuidelines,
  type TeamMember,
  type TeamInvitation,
  type SharedPrompt,
  type InsertTeamMember,
  type InsertTeamInvitation,
  type InsertSharedPrompt,
  type LeadCaptureForm,
  type LeadSubmission,
  type LeadCaptureAnalytics,
  type InsertLeadCaptureForm,
  type InsertLeadSubmission,
  type ExportHistory,
  type InsertExportHistory,
  type Workflow,
  type UpsertWorkflow,
  type CustomModel,
  type UpsertCustomModel,
  type SecuritySettings,
  type UpsertSecuritySettings,
  type AuditLog,
  type UpsertAuditLog,
  type WhiteLabelSettings,
  type UpsertWhiteLabelSettings,
  type Webhook,
  type UpsertWebhook,
  type ZapierIntegration,
  type UpsertZapierIntegration,
  type WebhookDelivery,
  type UpsertWebhookDelivery,
  type CustomerConversation,
  type CustomerMessage,
  type AiGeneratedReply,
  type ReplyTemplate,
  type InsertCustomerConversation,
  type InsertCustomerMessage,
  type InsertAiGeneratedReply,
  type InsertReplyTemplate,
  type EmailIntegration,
  type InsertEmailIntegration,
  type EmailMessage,
  type InsertEmailMessage,
} from "@shared/schema";

// Type aliases for backward compatibility
type SynchronizedEmail = EmailMessage;
type UpsertSynchronizedEmail = InsertEmailMessage;

import { db } from "./db";
import { eq, and, gte, desc, count, sum, avg, lte, sql, isNotNull, lt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPlan(userId: string, plan: string, trialEnd?: Date): Promise<User>;
  updateUserLocation(userId: string, country: string, currency: string): Promise<User>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // AI Response operations
  createAiResponse(response: InsertAiResponse & { userId: string }): Promise<AiResponse>;
  getUserResponses(userId: string, limit?: number): Promise<AiResponse[]>;
  getTodayResponseCount(userId: string): Promise<number>;
  getUserAnalytics(userId: string): Promise<any>;
  getUserDailyUsage(userId: string): Promise<any[]>;
  getUserTemplateUsage(userId: string): Promise<any[]>;
  getUserActivityHeatmap(userId: string): Promise<any[]>;
  
  // Review operations
  createReview(review: InsertReview & { userId?: string | null; userName?: string | null; userEmail?: string | null }): Promise<Review>;
  getPublicReviews(limit?: number): Promise<Review[]>;
  
  // Contact operations
  createContactMessage(contact: InsertContact): Promise<ContactMessage>;
  
  // Custom Prompts operations
  getUserCustomPrompts(userId: string): Promise<CustomPrompt[]>;
  createCustomPrompt(userId: string, prompt: InsertCustomPrompt): Promise<CustomPrompt>;
  updateCustomPrompt(userId: string, promptId: number, prompt: InsertCustomPrompt): Promise<CustomPrompt>;
  deleteCustomPrompt(userId: string, promptId: number): Promise<void>;
  toggleCustomPromptFavorite(userId: string, promptId: number, isFavorite: boolean): Promise<CustomPrompt>;
  duplicateCustomPrompt(userId: string, promptId: number): Promise<CustomPrompt>;

  // Brand Voice operations
  getUserBrandVoiceProfile(userId: string): Promise<BrandVoiceProfile | undefined>;
  createOrUpdateBrandVoiceProfile(userId: string, profile: Partial<BrandVoiceProfile>): Promise<BrandVoiceProfile>;
  getUserBrandVoiceSamples(userId: string): Promise<BrandVoiceSample[]>;
  createBrandVoiceSample(userId: string, sample: InsertBrandVoiceSample): Promise<BrandVoiceSample>;
  deleteBrandVoiceSample(userId: string, sampleId: number): Promise<void>;
  updateBrandVoiceGuidelines(userId: string, guidelines: InsertBrandVoiceGuidelines): Promise<BrandVoiceGuidelines>;
  getBrandVoiceGuidelines(userId: string): Promise<BrandVoiceGuidelines | undefined>;
  
  // Billing operations
  getBillingStats(userId: string): Promise<any>;

  // Team Collaboration operations
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  inviteTeamMember(invitation: InsertTeamInvitation & { invitedBy: string }): Promise<TeamInvitation>;
  getTeamInvitations(teamId: string): Promise<TeamInvitation[]>;
  acceptTeamInvitation(invitationId: number, userId: string): Promise<void>;
  updateTeamMemberRole(teamId: string, memberId: string, role: string): Promise<TeamMember>;
  removeTeamMember(teamId: string, memberId: string): Promise<void>;
  getSharedPrompts(teamId: string): Promise<SharedPrompt[]>;
  createSharedPrompt(prompt: InsertSharedPrompt & { createdBy: string }): Promise<SharedPrompt>;
  updateSharedPrompt(promptId: number, teamId: string, prompt: Partial<InsertSharedPrompt>): Promise<SharedPrompt>;
  deleteSharedPrompt(promptId: number, teamId: string): Promise<void>;

  // Lead Capture operations
  getUserLeadCaptureForms(userId: string): Promise<LeadCaptureForm[]>;
  createLeadCaptureForm(userId: string, form: InsertLeadCaptureForm): Promise<LeadCaptureForm>;
  updateLeadCaptureForm(userId: string, formId: number, form: Partial<InsertLeadCaptureForm>): Promise<LeadCaptureForm>;
  deleteLeadCaptureForm(userId: string, formId: number): Promise<void>;
  getLeadCaptureForm(formId: number): Promise<LeadCaptureForm | undefined>;
  submitLead(submission: InsertLeadSubmission & { userId: string }): Promise<LeadSubmission>;
  getFormSubmissions(userId: string, formId: number): Promise<LeadSubmission[]>;
  getUserLeadSubmissions(userId: string): Promise<LeadSubmission[]>;
  updateLeadStatus(userId: string, submissionId: number, status: string, notes?: string): Promise<LeadSubmission>;
  getLeadCaptureAnalytics(userId: string, formId?: number): Promise<any>;

  // Export operations
  getUserExportHistory(userId: string): Promise<ExportHistory[]>;
  createExportRecord(userId: string, exportData: InsertExportHistory): Promise<ExportHistory>;
  getUserConversationsForExport(userId: string, filters?: any): Promise<AiResponse[]>;
  deleteExpiredExports(): Promise<void>;

  // Real-time analytics operations
  getUserActivityAnalytics(userId: string, timeRange: string): Promise<any>;
  getSystemMetrics(timeRange: string): Promise<any>;
  getQueryPatterns(userId: string, timeRange: string): Promise<any>;
  getLiveStats(): Promise<any>;
  getResponseTimeAnalytics(userId: string, timeRange: string): Promise<any>;
  getEngagementAnalytics(userId: string, timeRange: string): Promise<any>;

  // Workflow operations
  getUserWorkflows(userId: string): Promise<Workflow[]>;
  createWorkflow(userId: string, workflow: UpsertWorkflow): Promise<Workflow>;
  updateWorkflow(userId: string, workflowId: number, workflow: Partial<UpsertWorkflow>): Promise<Workflow>;
  deleteWorkflow(userId: string, workflowId: number): Promise<void>;
  getWorkflow(userId: string, workflowId: number): Promise<Workflow | undefined>;

  // Custom Model operations
  getUserCustomModels(userId: string): Promise<CustomModel[]>;
  createCustomModel(userId: string, model: UpsertCustomModel): Promise<CustomModel>;
  updateCustomModel(userId: string, modelId: number, model: Partial<UpsertCustomModel>): Promise<CustomModel>;
  deleteCustomModel(userId: string, modelId: number): Promise<void>;
  getCustomModel(userId: string, modelId: number): Promise<CustomModel | undefined>;
  setDefaultCustomModel(userId: string, modelId: number): Promise<CustomModel>;
  incrementModelUsage(userId: string, modelId: number): Promise<void>;

  // Security Settings operations
  getUserSecuritySettings(userId: string): Promise<SecuritySettings | undefined>;
  updateSecuritySettings(userId: string, settings: Partial<UpsertSecuritySettings>): Promise<SecuritySettings>;
  createSecuritySettings(userId: string, settings: UpsertSecuritySettings): Promise<SecuritySettings>;

  // Audit Log operations
  getUserAuditLogs(userId: string, filters?: any): Promise<AuditLog[]>;
  createAuditLog(userId: string, log: UpsertAuditLog): Promise<AuditLog>;
  generateAuditReport(userId: string, params: any): Promise<any>;

  // White-label Settings operations
  getUserWhiteLabelSettings(userId: string): Promise<WhiteLabelSettings | undefined>;
  updateWhiteLabelSettings(userId: string, settings: Partial<UpsertWhiteLabelSettings>): Promise<WhiteLabelSettings>;
  createWhiteLabelSettings(userId: string, settings: UpsertWhiteLabelSettings): Promise<WhiteLabelSettings>;
  verifyCustomDomain(userId: string, domain: string): Promise<boolean>;

  // Webhook operations
  getUserWebhooks(userId: string): Promise<Webhook[]>;
  createWebhook(userId: string, webhook: UpsertWebhook): Promise<Webhook>;
  updateWebhook(webhookId: number, webhook: Partial<UpsertWebhook>): Promise<Webhook>;
  deleteWebhook(webhookId: number): Promise<void>;
  getWebhookDeliveries(userId: string): Promise<WebhookDelivery[]>;
  createWebhookDelivery(delivery: UpsertWebhookDelivery): Promise<WebhookDelivery>;

  // Zapier operations
  getUserZapierIntegrations(userId: string): Promise<ZapierIntegration[]>;
  createZapierIntegration(userId: string, integration: UpsertZapierIntegration): Promise<ZapierIntegration>;
  updateZapierIntegration(integrationId: number, integration: Partial<UpsertZapierIntegration>): Promise<ZapierIntegration>;
  deleteZapierIntegration(integrationId: number): Promise<void>;

  // Customer Inbox operations
  getCustomerConversations(userId: string, limit?: number): Promise<(CustomerConversation & {
    messages: CustomerMessage[];
    lastMessage?: CustomerMessage;
    unreadCount: number;
  })[]>;
  getConversation(conversationId: number, userId: string): Promise<(CustomerConversation & {
    messages: CustomerMessage[];
  }) | null>;
  createConversation(userId: string, conversation: InsertCustomerConversation): Promise<CustomerConversation>;
  updateConversation(conversationId: number, userId: string, updates: Partial<InsertCustomerConversation>): Promise<CustomerConversation | null>;

  getConversationMessages(conversationId: number, userId: string): Promise<CustomerMessage[]>;
  createMessage(message: InsertCustomerMessage): Promise<CustomerMessage>;
  markMessageAsRead(messageId: number, userId: string): Promise<void>;

  generateAiReply(userId: string, reply: InsertAiGeneratedReply): Promise<AiGeneratedReply>;
  getAiGeneratedReplies(userId: string, limit?: number, status?: string): Promise<(AiGeneratedReply & {
    conversation: CustomerConversation;
    originalMessage: CustomerMessage;
  })[]>;
  updateAiReply(replyId: number, userId: string, updates: Partial<InsertAiGeneratedReply>): Promise<AiGeneratedReply | null>;

  getReplyTemplates(userId: string): Promise<ReplyTemplate[]>;
  createReplyTemplate(userId: string, template: InsertReplyTemplate): Promise<ReplyTemplate>;

  // Email Integration operations
  getUserEmailIntegrations(userId: string): Promise<EmailIntegration[]>;
  getEmailIntegration(integrationId: number, userId: string): Promise<EmailIntegration | null>;
  createEmailIntegration(userId: string, integration: UpsertEmailIntegration): Promise<EmailIntegration>;
  updateEmailIntegration(integrationId: number, userId: string, updates: Partial<UpsertEmailIntegration>): Promise<EmailIntegration | null>;
  deleteEmailIntegration(integrationId: number, userId: string): Promise<void>;
  getActiveEmailIntegration(userId: string): Promise<EmailIntegration | null>;

  // Synchronized Email operations
  getSynchronizedEmails(userId: string, integrationId?: number, limit?: number): Promise<SynchronizedEmail[]>;
  createSynchronizedEmail(email: UpsertSynchronizedEmail): Promise<SynchronizedEmail>;
  bulkCreateSynchronizedEmails(emails: UpsertSynchronizedEmail[]): Promise<SynchronizedEmail[]>;
  updateSynchronizedEmail(emailId: number, userId: string, updates: Partial<UpsertSynchronizedEmail>): Promise<SynchronizedEmail | null>;
  markEmailAsRead(emailId: number, userId: string): Promise<void>;
  getEmailByMessageId(messageId: string, integrationId: number): Promise<SynchronizedEmail | null>;

  // Email AI Reply operations
  createEmailAiReply(userId: string, reply: UpsertEmailAiReply): Promise<EmailAiReply>;
  getEmailAiReplies(userId: string, emailId?: number, limit?: number): Promise<EmailAiReply[]>;
  updateEmailAiReply(replyId: number, userId: string, updates: Partial<UpsertEmailAiReply>): Promise<EmailAiReply | null>;
  markEmailReplySent(replyId: number, sentMessageId: string): Promise<void>;

  // AI Response analysis for confidence metrics
  getRecentAiResponses(userId: string, limit?: number): Promise<{ confidence: number; createdAt: Date }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if updating by ID first (for existing user plan conversion)
    if (userData.id) {
      const [user] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return user;
    }
    
    // Then try to find existing user by email
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
    
    if (existingUser.length > 0) {
      // Update existing user
      const [user] = await db
        .update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          plan: userData.plan || existingUser[0].plan,
          planStartDate: userData.planStartDate || existingUser[0].planStartDate,
          trialEnd: userData.trialEnd || existingUser[0].trialEnd,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser[0].id))
        .returning();
      return user;
    } else {
      // Create new user - set trial end date for new users (14 days from now)
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          plan: userData.plan || 'starter',
          trialEnd: userData.trialEnd || trialEnd
        })
        .returning();
      return user;
    }
  }

  async updateUserPlan(userId: string, plan: string, trialEnd?: Date): Promise<User> {
    const updateData: any = { plan, planStartDate: new Date(), updatedAt: new Date() };
    if (trialEnd) {
      updateData.trialEnd = trialEnd;
    }
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId, 
        stripeSubscriptionId: subscriptionId, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserLocation(userId: string, country: string, currency: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ country, currency, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Note: Request limiting removed as all plans now have unlimited queries

  // AI Response operations
  async createAiResponse(response: InsertAiResponse & { userId: string }): Promise<AiResponse> {
    const [aiResponse] = await db
      .insert(aiResponses)
      .values(response)
      .returning();
    return aiResponse;
  }

  async getUserResponses(userId: string, limit: number = 10): Promise<AiResponse[]> {
    return await db
      .select()
      .from(aiResponses)
      .where(eq(aiResponses.userId, userId))
      .orderBy(aiResponses.createdAt)
      .limit(limit);
  }

  async getTodayResponseCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const responses = await db
      .select()
      .from(aiResponses)
      .where(
        and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, today)
        )
      );
    
    return responses.length;
  }

  async getWeeklyResponseCount(userId: string): Promise<number> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const responses = await db
      .select()
      .from(aiResponses)
      .where(
        and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, weekStart)
        )
      );
    
    return responses.length;
  }

  async getMonthlyResponseCount(userId: string): Promise<number> {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const responses = await db
      .select()
      .from(aiResponses)
      .where(
        and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, monthStart)
        )
      );
    
    return responses.length;
  }

  async getUserAnalytics(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get today's usage
    const todayCount = await this.getTodayResponseCount(userId);
    
    // Get current week usage
    const weekCount = await this.getWeeklyResponseCount(userId);
    
    // Get monthly usage
    const monthCount = await this.getMonthlyResponseCount(userId);

    // Get week total for comparison
    const weekResponses = await db
      .select()
      .from(aiResponses)
      .where(
        and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, weekAgo)
        )
      );

    // Get total responses
    const totalResponses = await db
      .select()
      .from(aiResponses)
      .where(eq(aiResponses.userId, userId));

    // Calculate confidence stats
    const confidenceScores = totalResponses.map(r => r.confidence || 0);
    const avgConfidence = confidenceScores.length > 0 ? 
      confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length : 0;
    const highQuality = confidenceScores.filter(c => c > 90).length;
    const lowQuality = confidenceScores.filter(c => c < 70).length;

    // Calculate performance stats
    const generationTimes = totalResponses.map(r => r.generationTime || 0);
    const avgTime = generationTimes.length > 0 ? 
      generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length : 0;
    const minTime = generationTimes.length > 0 ? Math.min(...generationTimes) : 0;

    const trialDaysLeft = user.plan === 'starter' && user.trialEnd ? 
      Math.max(0, Math.floor((user.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

    // Calculate previous week for growth comparison
    const prevWeekStart = new Date();
    prevWeekStart.setDate(prevWeekStart.getDate() - prevWeekStart.getDay() - 7);
    prevWeekStart.setHours(0, 0, 0, 0);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
    prevWeekEnd.setHours(23, 59, 59, 999);
    
    const prevWeekResponses = await db
      .select()
      .from(aiResponses)
      .where(
        and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, prevWeekStart),
          lte(aiResponses.createdAt, prevWeekEnd)
        )
      );
    
    const weeklyGrowth = prevWeekResponses.length > 0 ? 
      Math.round(((weekCount - prevWeekResponses.length) / prevWeekResponses.length) * 100) : 
      (weekCount > 0 ? 100 : 0);

    return {
      used: todayCount,
      limit: user.plan === 'starter' ? 50 : -1, // Fixed: starter has 50 limit, pro/enterprise unlimited
      plan: user.plan,
      weekTotal: weekCount,
      weeklyLimit: user.plan === 'starter' ? 350 : -1, // 50 per day × 7 days for starter
      monthTotal: monthCount,
      monthlyLimit: user.plan === 'starter' ? 1500 : -1, // 50 per day × 30 days for starter
      weeklyGrowth,
      totalResponses: totalResponses.length,
      joinDate: user.createdAt?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'Recently',
      trialDaysLeft,
      avgConfidence: avgConfidence / 100,
      highQualityCount: highQuality,
      lowQualityCount: lowQuality,
      avgGenerationTime: avgTime / 1000,
      fastestTime: minTime / 1000,
      successRate: totalResponses.length > 0 ? (totalResponses.length - lowQuality) / totalResponses.length : 1.0
    };
  }

  async getUserDailyUsage(userId: string): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const responses = await db
      .select()
      .from(aiResponses)
      .where(
        and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, sevenDaysAgo)
        )
      );

    // Group by day
    const dailyGroups: { [key: string]: number } = {};
    responses.forEach(response => {
      const day = response.createdAt?.toLocaleDateString('en-US', { weekday: 'short' }) || '';
      dailyGroups[day] = (dailyGroups[day] || 0) + 1;
    });

    // Fill in missing days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      result.push({
        day: dayName,
        responses: dailyGroups[dayName] || 0
      });
    }

    return result;
  }

  async getUserTemplateUsage(userId: string): Promise<any[]> {
    const responses = await db
      .select()
      .from(aiResponses)
      .where(eq(aiResponses.userId, userId));

    const templateGroups: { [key: string]: number } = {};
    responses.forEach(response => {
      const template = response.queryType || 'general';
      templateGroups[template] = (templateGroups[template] || 0) + 1;
    });

    const templateNames = {
      'refund_request': 'Refund Request',
      'shipping_delay': 'Shipping Delay', 
      'product_howto': 'Product Info',
      'general': 'General Support'
    };

    return Object.entries(templateGroups).map(([key, count]) => ({
      name: templateNames[key as keyof typeof templateNames] || key,
      count
    }));
  }

  async getUserActivityHeatmap(userId: string): Promise<any[]> {
    const responses = await db
      .select()
      .from(aiResponses)
      .where(eq(aiResponses.userId, userId));

    const hourGroups: { [key: number]: number } = {};
    responses.forEach(response => {
      if (response.createdAt) {
        const hour = response.createdAt.getHours();
        hourGroups[hour] = (hourGroups[hour] || 0) + 1;
      }
    });

    return Object.entries(hourGroups).map(([hour, activity]) => ({
      hour: `${hour}:00`,
      activity
    }));
  }

  // Review operations
  async createReview(reviewData: InsertReview & { userId?: string | null; userName?: string | null; userEmail?: string | null }): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    return review;
  }

  async getPublicReviews(limit: number = 10): Promise<any[]> {
    const reviewsWithUsers = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        createdAt: reviews.createdAt,
        userName: reviews.userName,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.isPublic, true))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);

    return reviewsWithUsers.map(review => ({
      ...review,
      userName: review.userName || // Guest user name
        (review.userFirstName && review.userLastName ? 
          `${review.userFirstName} ${review.userLastName}` : // Authenticated user name
          'Anonymous User') // Fallback
    }));
  }

  // Contact operations
  async createContactMessage(contactData: InsertContact): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(contactData)
      .returning();
    return message;
  }

  async getBillingStats(userId: string) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Calculate stats from user's response history
    const allResponses = await db.select().from(aiResponses).where(eq(aiResponses.userId, userId));
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);
    
    const thisMonthResponses = allResponses.filter(r => r.createdAt && new Date(r.createdAt) >= thisMonth);
    const thisYearResponses = allResponses.filter(r => r.createdAt && new Date(r.createdAt) >= thisYear);
    
    return {
      totalResponses: allResponses.length,
      thisMonthResponses: thisMonthResponses.length,
      thisYearResponses: thisYearResponses.length,
      averageConfidence: allResponses.length > 0 ? 
        allResponses.reduce((sum, r) => sum + (r.confidence || 0), 0) / allResponses.length : 0,
      plan: user.plan,
      planStartDate: user.planStartDate,
      trialEnd: user.trialEnd
    };
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const conversations = await db.select().from(aiResponses).where(eq(aiResponses.userId, userId)).orderBy(desc(aiResponses.createdAt)).limit(10);
    
    // Group conversations by date for better organization
    const groupedConversations = conversations.reduce((acc: any, conv: any) => {
      const date = new Date(conv.createdAt || new Date()).toDateString();
      if (!acc[date]) {
        acc[date] = {
          date: date,
          messages: []
        };
      }
      
      // Add user message
      acc[date].messages.push({
        id: `user-${conv.id}`,
        type: 'user',
        content: conv.clientMessage, // Fixed: use clientMessage instead of query
        timestamp: new Date(conv.createdAt || new Date()).toLocaleTimeString(),
        createdAt: conv.createdAt
      });
      
      // Add AI response
      acc[date].messages.push({
        id: `ai-${conv.id}`,
        type: 'ai',
        content: conv.aiResponse, // Fixed: use aiResponse instead of response
        confidence: conv.confidence,
        timestamp: new Date(conv.createdAt || new Date()).toLocaleTimeString(),
        createdAt: conv.createdAt
      });
      
      return acc;
    }, {});
    
    return Object.values(groupedConversations);
  }

  async storeConversation(userId: string, conversation: any): Promise<void> {
    await db.insert(aiResponses).values({
      userId,
      clientMessage: conversation.userMessage,
      aiResponse: conversation.aiResponse,
      tone: conversation.tone || 'professional',
      confidence: conversation.confidence || 0.9,
      generationTime: conversation.generationTime || 1000,
      queryType: conversation.context || 'general',
      createdAt: new Date()
    });
  }

  // Custom Prompts operations
  async getUserCustomPrompts(userId: string): Promise<CustomPrompt[]> {
    const prompts = await db
      .select()
      .from(customPrompts)
      .where(eq(customPrompts.userId, userId))
      .orderBy(desc(customPrompts.updatedAt));
    
    return prompts;
  }

  async createCustomPrompt(userId: string, promptData: InsertCustomPrompt): Promise<CustomPrompt> {
    const [prompt] = await db
      .insert(customPrompts)
      .values({
        ...promptData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return prompt;
  }

  async updateCustomPrompt(userId: string, promptId: number, promptData: InsertCustomPrompt): Promise<CustomPrompt> {
    const [prompt] = await db
      .update(customPrompts)
      .set({
        ...promptData,
        updatedAt: new Date()
      })
      .where(and(eq(customPrompts.id, promptId), eq(customPrompts.userId, userId)))
      .returning();
    
    if (!prompt) {
      throw new Error('Prompt not found or unauthorized');
    }
    
    return prompt;
  }

  async deleteCustomPrompt(userId: string, promptId: number): Promise<void> {
    const result = await db
      .delete(customPrompts)
      .where(and(eq(customPrompts.id, promptId), eq(customPrompts.userId, userId)));
  }

  async toggleCustomPromptFavorite(userId: string, promptId: number, isFavorite: boolean): Promise<CustomPrompt> {
    const [prompt] = await db
      .update(customPrompts)
      .set({
        isFavorite,
        updatedAt: new Date()
      })
      .where(and(eq(customPrompts.id, promptId), eq(customPrompts.userId, userId)))
      .returning();
    
    if (!prompt) {
      throw new Error('Prompt not found or unauthorized');
    }
    
    return prompt;
  }

  async duplicateCustomPrompt(userId: string, promptId: number): Promise<CustomPrompt> {
    // First get the original prompt
    const [originalPrompt] = await db
      .select()
      .from(customPrompts)
      .where(and(eq(customPrompts.id, promptId), eq(customPrompts.userId, userId)));
    
    if (!originalPrompt) {
      throw new Error('Prompt not found or unauthorized');
    }
    
    // Create a duplicate with modified title
    const [duplicatedPrompt] = await db
      .insert(customPrompts)
      .values({
        ...originalPrompt,
        id: undefined, // Remove id to create new record
        title: `${originalPrompt.title} (Copy)`,
        isFavorite: false, // Reset favorite status
        usageCount: 0, // Reset usage count
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return duplicatedPrompt;
  }

  // Brand Voice operations
  async getUserBrandVoiceProfile(userId: string): Promise<BrandVoiceProfile | undefined> {
    const [profile] = await db
      .select()
      .from(brandVoiceProfiles)
      .where(eq(brandVoiceProfiles.userId, userId))
      .limit(1);

    return profile;
  }

  async createOrUpdateBrandVoiceProfile(userId: string, profileData: Partial<BrandVoiceProfile>): Promise<BrandVoiceProfile> {
    const existingProfile = await this.getUserBrandVoiceProfile(userId);

    if (existingProfile) {
      const [updatedProfile] = await db
        .update(brandVoiceProfiles)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(brandVoiceProfiles.userId, userId))
        .returning();
      return updatedProfile;
    } else {
      const [newProfile] = await db
        .insert(brandVoiceProfiles)
        .values({
          userId,
          name: profileData.name || "Default Profile",
          description: profileData.description || null,
          status: profileData.status || "needs_samples",
          accuracy: profileData.accuracy || 0,
          samplesCount: profileData.samplesCount || 0,
          toneCharacteristics: profileData.toneCharacteristics || {
            formality: 70,
            friendliness: 60,
            confidence: 75,
            enthusiasm: 50,
            empathy: 65
          },
          guidelines: profileData.guidelines || [],
          keyPhrases: profileData.keyPhrases || [],
          avoidWords: profileData.avoidWords || [],
          lastTrained: profileData.lastTrained || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newProfile;
    }
  }

  async getUserBrandVoiceSamples(userId: string): Promise<BrandVoiceSample[]> {
    return db
      .select()
      .from(brandVoiceSamples)
      .where(eq(brandVoiceSamples.userId, userId))
      .orderBy(desc(brandVoiceSamples.createdAt));
  }

  async createBrandVoiceSample(userId: string, sample: InsertBrandVoiceSample): Promise<BrandVoiceSample> {
    // Calculate word count
    const wordCount = sample.content.split(/\s+/).length;
    
    const [newSample] = await db
      .insert(brandVoiceSamples)
      .values({
        userId,
        ...sample,
        wordCount,
        status: "analyzed", // For now, mark as analyzed immediately
        toneAnalysis: {
          tone: "professional",
          confidence: 0.85,
          characteristics: ["clear", "direct", "helpful"],
          sentiment: "neutral"
        }
      })
      .returning();

    // Update profile samples count
    const samplesCount = await db
      .select({ count: count() })
      .from(brandVoiceSamples)
      .where(eq(brandVoiceSamples.userId, userId));

    await this.createOrUpdateBrandVoiceProfile(userId, {
      samplesCount: samplesCount[0].count,
      status: samplesCount[0].count >= 3 ? "ready" : "needs_samples",
      accuracy: Math.min(75 + (samplesCount[0].count * 5), 95)
    });

    return newSample;
  }

  async deleteBrandVoiceSample(userId: string, sampleId: number): Promise<void> {
    await db
      .delete(brandVoiceSamples)
      .where(and(eq(brandVoiceSamples.id, sampleId), eq(brandVoiceSamples.userId, userId)));

    // Update profile samples count
    const samplesCount = await db
      .select({ count: count() })
      .from(brandVoiceSamples)
      .where(eq(brandVoiceSamples.userId, userId));

    await this.createOrUpdateBrandVoiceProfile(userId, {
      samplesCount: samplesCount[0].count,
      status: samplesCount[0].count >= 3 ? "ready" : "needs_samples",
      accuracy: Math.min(75 + (samplesCount[0].count * 5), 95)
    });
  }

  async updateBrandVoiceGuidelines(userId: string, guidelines: InsertBrandVoiceGuidelines): Promise<BrandVoiceGuidelines> {
    const existingGuidelines = await this.getBrandVoiceGuidelines(userId);

    if (existingGuidelines) {
      const [updatedGuidelines] = await db
        .update(brandVoiceGuidelines)
        .set({
          ...guidelines,
          updatedAt: new Date(),
        })
        .where(eq(brandVoiceGuidelines.userId, userId))
        .returning();
      return updatedGuidelines;
    } else {
      const [newGuidelines] = await db
        .insert(brandVoiceGuidelines)
        .values({
          userId,
          ...guidelines,
        })
        .returning();
      return newGuidelines;
    }
  }

  async getBrandVoiceGuidelines(userId: string): Promise<BrandVoiceGuidelines | undefined> {
    const [guidelines] = await db
      .select()
      .from(brandVoiceGuidelines)
      .where(eq(brandVoiceGuidelines.userId, userId))
      .limit(1);

    return guidelines;
  }

  // Team Collaboration methods
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const members = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, teamId))
        .orderBy(desc(teamMembers.joinedAt));
      
      return members;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw new Error('Failed to fetch team members');
    }
  }

  async inviteTeamMember(invitation: InsertTeamInvitation & { invitedBy: string }): Promise<TeamInvitation> {
    try {
      // Set expiration date to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const [newInvitation] = await db
        .insert(teamInvitations)
        .values({
          ...invitation,
          expiresAt,
          invitedBy: invitation.invitedBy
        })
        .returning();

      return newInvitation;
    } catch (error) {
      console.error('Error creating team invitation:', error);
      throw new Error('Failed to send team invitation');
    }
  }

  async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    try {
      const invitations = await db
        .select()
        .from(teamInvitations)
        .where(and(
          eq(teamInvitations.teamId, teamId),
          eq(teamInvitations.status, 'pending'),
          gte(teamInvitations.expiresAt, new Date())
        ))
        .orderBy(desc(teamInvitations.sentAt));
      
      return invitations;
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      throw new Error('Failed to fetch team invitations');
    }
  }

  async acceptTeamInvitation(invitationId: number, userId: string): Promise<void> {
    try {
      // Get the invitation details
      const [invitation] = await db
        .select()
        .from(teamInvitations)
        .where(eq(teamInvitations.id, invitationId));

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Get user details
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Add user to team
      await db.insert(teamMembers).values({
        userId: userId,
        teamId: invitation.teamId,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
        email: user.email || invitation.email,
        role: invitation.role,
        status: 'active',
        avatar: user.profileImageUrl || undefined,
        permissions: this.getRolePermissions(invitation.role)
      });

      // Mark invitation as accepted
      await db
        .update(teamInvitations)
        .set({ status: 'accepted' })
        .where(eq(teamInvitations.id, invitationId));

    } catch (error) {
      console.error('Error accepting team invitation:', error);
      throw new Error('Failed to accept team invitation');
    }
  }

  async updateTeamMemberRole(teamId: string, memberId: string, role: string): Promise<TeamMember> {
    try {
      const permissions = this.getRolePermissions(role);
      
      const [updatedMember] = await db
        .update(teamMembers)
        .set({ 
          role,
          permissions,
          lastActive: new Date()
        })
        .where(and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, memberId)
        ))
        .returning();

      if (!updatedMember) {
        throw new Error('Team member not found');
      }

      return updatedMember;
    } catch (error) {
      console.error('Error updating team member role:', error);
      throw new Error('Failed to update team member role');
    }
  }

  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    try {
      await db
        .delete(teamMembers)
        .where(and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, memberId)
        ));
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }

  async getSharedPrompts(teamId: string): Promise<SharedPrompt[]> {
    try {
      const prompts = await db
        .select()
        .from(sharedPrompts)
        .where(eq(sharedPrompts.teamId, teamId))
        .orderBy(desc(sharedPrompts.sharedAt));
      
      return prompts;
    } catch (error) {
      console.error('Error fetching shared prompts:', error);
      throw new Error('Failed to fetch shared prompts');
    }
  }

  async createSharedPrompt(prompt: InsertSharedPrompt & { createdBy: string }): Promise<SharedPrompt> {
    try {
      const [newPrompt] = await db
        .insert(sharedPrompts)
        .values({
          ...prompt,
          createdBy: prompt.createdBy,
          collaborators: [prompt.createdBy]
        })
        .returning();

      return newPrompt;
    } catch (error) {
      console.error('Error creating shared prompt:', error);
      throw new Error('Failed to create shared prompt');
    }
  }

  async updateSharedPrompt(promptId: number, teamId: string, prompt: Partial<InsertSharedPrompt>): Promise<SharedPrompt> {
    try {
      const [updatedPrompt] = await db
        .update(sharedPrompts)
        .set({
          ...prompt,
          updatedAt: new Date()
        })
        .where(and(
          eq(sharedPrompts.id, promptId),
          eq(sharedPrompts.teamId, teamId)
        ))
        .returning();

      if (!updatedPrompt) {
        throw new Error('Shared prompt not found');
      }

      return updatedPrompt;
    } catch (error) {
      console.error('Error updating shared prompt:', error);
      throw new Error('Failed to update shared prompt');
    }
  }

  async deleteSharedPrompt(promptId: number, teamId: string): Promise<void> {
    try {
      await db
        .delete(sharedPrompts)
        .where(and(
          eq(sharedPrompts.id, promptId),
          eq(sharedPrompts.teamId, teamId)
        ));
    } catch (error) {
      console.error('Error deleting shared prompt:', error);
      throw new Error('Failed to delete shared prompt');
    }
  }

  private getRolePermissions(role: string) {
    switch (role) {
      case 'owner':
        return {
          canEditPrompts: true,
          canInviteMembers: true,
          canManageRoles: true,
          canDeletePrompts: true
        };
      case 'admin':
        return {
          canEditPrompts: true,
          canInviteMembers: true,
          canManageRoles: true,
          canDeletePrompts: true
        };
      case 'editor':
        return {
          canEditPrompts: true,
          canInviteMembers: false,
          canManageRoles: false,
          canDeletePrompts: false
        };
      case 'viewer':
      default:
        return {
          canEditPrompts: false,
          canInviteMembers: false,
          canManageRoles: false,
          canDeletePrompts: false
        };
    }
  }

  // Lead Capture methods
  async getUserLeadCaptureForms(userId: string): Promise<LeadCaptureForm[]> {
    try {
      const forms = await db
        .select()
        .from(leadCaptureForms)
        .where(eq(leadCaptureForms.userId, userId))
        .orderBy(desc(leadCaptureForms.createdAt));
      
      return forms;
    } catch (error) {
      console.error('Error fetching lead capture forms:', error);
      throw new Error('Failed to fetch lead capture forms');
    }
  }

  async createLeadCaptureForm(userId: string, form: InsertLeadCaptureForm): Promise<LeadCaptureForm> {
    try {
      const [newForm] = await db
        .insert(leadCaptureForms)
        .values({
          ...form,
          userId
        })
        .returning();

      return newForm;
    } catch (error) {
      console.error('Error creating lead capture form:', error);
      throw new Error('Failed to create lead capture form');
    }
  }

  async updateLeadCaptureForm(userId: string, formId: number, form: Partial<InsertLeadCaptureForm>): Promise<LeadCaptureForm> {
    try {
      const [updatedForm] = await db
        .update(leadCaptureForms)
        .set({
          ...form,
          updatedAt: new Date()
        })
        .where(and(
          eq(leadCaptureForms.id, formId),
          eq(leadCaptureForms.userId, userId)
        ))
        .returning();

      if (!updatedForm) {
        throw new Error('Lead capture form not found');
      }

      return updatedForm;
    } catch (error) {
      console.error('Error updating lead capture form:', error);
      throw new Error('Failed to update lead capture form');
    }
  }

  async deleteLeadCaptureForm(userId: string, formId: number): Promise<void> {
    try {
      await db
        .delete(leadCaptureForms)
        .where(and(
          eq(leadCaptureForms.id, formId),
          eq(leadCaptureForms.userId, userId)
        ));
    } catch (error) {
      console.error('Error deleting lead capture form:', error);
      throw new Error('Failed to delete lead capture form');
    }
  }

  async getLeadCaptureForm(formId: number): Promise<LeadCaptureForm | undefined> {
    try {
      const [form] = await db
        .select()
        .from(leadCaptureForms)
        .where(eq(leadCaptureForms.id, formId))
        .limit(1);
      
      return form;
    } catch (error) {
      console.error('Error fetching lead capture form:', error);
      throw new Error('Failed to fetch lead capture form');
    }
  }

  async submitLead(submission: InsertLeadSubmission & { userId: string }): Promise<LeadSubmission> {
    try {
      const [newSubmission] = await db
        .insert(leadSubmissions)
        .values(submission)
        .returning();

      // Update form submission count
      await db
        .update(leadCaptureForms)
        .set({
          submissions: sql`${leadCaptureForms.submissions} + 1`
        })
        .where(eq(leadCaptureForms.id, submission.formId));

      return newSubmission;
    } catch (error) {
      console.error('Error submitting lead:', error);
      throw new Error('Failed to submit lead');
    }
  }

  async getFormSubmissions(userId: string, formId: number): Promise<LeadSubmission[]> {
    try {
      const submissions = await db
        .select()
        .from(leadSubmissions)
        .where(and(
          eq(leadSubmissions.formId, formId),
          eq(leadSubmissions.userId, userId)
        ))
        .orderBy(desc(leadSubmissions.submittedAt));
      
      return submissions;
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      throw new Error('Failed to fetch form submissions');
    }
  }

  async getUserLeadSubmissions(userId: string): Promise<LeadSubmission[]> {
    try {
      const submissions = await db
        .select()
        .from(leadSubmissions)
        .where(eq(leadSubmissions.userId, userId))
        .orderBy(desc(leadSubmissions.submittedAt));
      
      return submissions;
    } catch (error) {
      console.error('Error fetching user lead submissions:', error);
      throw new Error('Failed to fetch user lead submissions');
    }
  }

  async updateLeadStatus(userId: string, submissionId: number, status: string, notes?: string): Promise<LeadSubmission> {
    try {
      const updateData: any = {
        status,
        lastContactedAt: new Date()
      };
      
      if (notes) {
        updateData.notes = notes;
      }

      const [updatedSubmission] = await db
        .update(leadSubmissions)
        .set(updateData)
        .where(and(
          eq(leadSubmissions.id, submissionId),
          eq(leadSubmissions.userId, userId)
        ))
        .returning();

      if (!updatedSubmission) {
        throw new Error('Lead submission not found');
      }

      return updatedSubmission;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw new Error('Failed to update lead status');
    }
  }

  async getLeadCaptureAnalytics(userId: string, formId?: number): Promise<any> {
    try {
      // Get form analytics
      let formsQuery = db
        .select()
        .from(leadCaptureForms)
        .where(eq(leadCaptureForms.userId, userId));

      if (formId) {
        formsQuery = formsQuery.where(eq(leadCaptureForms.id, formId));
      }

      const forms = await formsQuery;

      // Get submissions data
      let submissionsQuery = db
        .select()
        .from(leadSubmissions)
        .where(eq(leadSubmissions.userId, userId));

      if (formId) {
        submissionsQuery = submissionsQuery.where(eq(leadSubmissions.formId, formId));
      }

      const submissions = await submissionsQuery;

      // Calculate analytics
      const totalSubmissions = submissions.length;
      const totalForms = forms.length;
      
      // Group submissions by date for trends
      const submissionsByDate = submissions.reduce((acc, submission) => {
        const date = submission.submittedAt?.toISOString().split('T')[0] || 'unknown';
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by status
      const submissionsByStatus = submissions.reduce((acc, submission) => {
        const status = submission.status || 'new';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by source
      const submissionsBySource = submissions.reduce((acc, submission) => {
        const source = submission.source || 'direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate conversion rates for each form
      const formStats = forms.map(form => ({
        id: form.id,
        name: form.name,
        submissions: form.submissions || 0,
        conversionRate: form.conversionRate || 0,
        status: form.status
      }));

      const averageScore = submissions.length > 0 
        ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length 
        : 0;

      return {
        totalForms,
        totalSubmissions,
        averageScore: Math.round(averageScore),
        submissionsByDate,
        submissionsByStatus,
        submissionsBySource,
        formStats,
        recentSubmissions: submissions.slice(0, 10) // Latest 10 submissions
      };
    } catch (error) {
      console.error('Error fetching lead capture analytics:', error);
      throw new Error('Failed to fetch lead capture analytics');
    }
  }

  // Export methods
  async getUserExportHistory(userId: string): Promise<ExportHistory[]> {
    try {
      const exports = await db
        .select()
        .from(exportHistory)
        .where(eq(exportHistory.userId, userId))
        .orderBy(desc(exportHistory.createdAt));
      
      return exports;
    } catch (error) {
      console.error('Error fetching export history:', error);
      throw new Error('Failed to fetch export history');
    }
  }

  async createExportRecord(userId: string, exportData: InsertExportHistory): Promise<ExportHistory> {
    try {
      const [newExport] = await db
        .insert(exportHistory)
        .values({
          ...exportData,
          userId
        })
        .returning();

      return newExport;
    } catch (error) {
      console.error('Error creating export record:', error);
      throw new Error('Failed to create export record');
    }
  }

  async getUserConversationsForExport(userId: string, filters?: any): Promise<AiResponse[]> {
    try {
      let query = db
        .select()
        .from(aiResponses)
        .where(eq(aiResponses.userId, userId));

      // Apply date range filters if provided
      if (filters?.dateRange?.from) {
        query = query.where(gte(aiResponses.createdAt, new Date(filters.dateRange.from)));
      }
      if (filters?.dateRange?.to) {
        query = query.where(lte(aiResponses.createdAt, new Date(filters.dateRange.to)));
      }

      // Apply tone filter if provided
      if (filters?.tone && filters.tone !== 'all') {
        query = query.where(eq(aiResponses.tone, filters.tone));
      }

      // Apply confidence filter if provided
      if (filters?.minConfidence) {
        query = query.where(gte(aiResponses.confidenceScore, filters.minConfidence));
      }

      query = query.orderBy(desc(aiResponses.createdAt));

      // Apply limit if provided
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const conversations = await query;
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations for export:', error);
      throw new Error('Failed to fetch conversations for export');
    }
  }

  async deleteExpiredExports(): Promise<void> {
    try {
      await db
        .delete(exportHistory)
        .where(and(
          isNotNull(exportHistory.expiresAt),
          lt(exportHistory.expiresAt, new Date())
        ));
    } catch (error) {
      console.error('Error deleting expired exports:', error);
      throw new Error('Failed to delete expired exports');
    }
  }

  // Real-time analytics implementations
  async getUserActivityAnalytics(userId: string, timeRange: string): Promise<any> {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const responses = await db
        .select()
        .from(aiResponses)
        .where(and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, startDate)
        ))
        .orderBy(aiResponses.createdAt);

      const timeFormat = timeRange === '24h' ? 'hour' : 'day';
      const groupedData = this.groupDataByTime(responses, timeFormat);
      
      return groupedData.map(group => ({
        time: group.time,
        activeUsers: 1,
        queries: group.count,
        responses: group.count
      }));
    } catch (error) {
      console.error('Error fetching user activity analytics:', error);
      return [];
    }
  }

  async getSystemMetrics(timeRange: string): Promise<any> {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const responses = await db
        .select()
        .from(aiResponses)
        .where(gte(aiResponses.createdAt, startDate))
        .orderBy(aiResponses.createdAt);

      const timeFormat = timeRange === '24h' ? 'hour' : 'day';
      const groupedData = this.groupDataByTime(responses, timeFormat);
      
      return {
        avgResponseTime: responses.reduce((sum, r) => sum + (r.generationTime || 0), 0) / responses.length / 1000 || 1.2,
        systemLoad: Math.floor(Math.random() * 30) + 40,
        data: groupedData.map(group => ({
          time: group.time,
          cpu: Math.floor(Math.random() * 20) + 30,
          memory: Math.floor(Math.random() * 25) + 45,
          responseTime: group.avgResponseTime || 120
        }))
      };
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return { avgResponseTime: 1.2, systemLoad: 67, data: [] };
    }
  }

  async getQueryPatterns(userId: string, timeRange: string): Promise<any> {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const responses = await db
        .select()
        .from(aiResponses)
        .where(and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, startDate)
        ));

      const toneGroups = responses.reduce((acc, response) => {
        const tone = response.tone || 'professional';
        if (!acc[tone]) {
          acc[tone] = { name: tone, count: 0, queries: 0 };
        }
        acc[tone].count++;
        acc[tone].queries++;
        return acc;
      }, {} as Record<string, any>);

      const result = Object.values(toneGroups).map((group: any) => ({
        name: group.name.charAt(0).toUpperCase() + group.name.slice(1),
        value: Math.round((group.count / responses.length) * 100) || 0,
        queries: group.queries
      }));

      return result.length > 0 ? result : [
        { name: 'Professional', value: 100, queries: 1 }
      ];
    } catch (error) {
      console.error('Error fetching query patterns:', error);
      return [{ name: 'Professional', value: 100, queries: 1 }];
    }
  }

  async getLiveStats(): Promise<any> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const activeUsersResult = await db
        .selectDistinct({ userId: aiResponses.userId })
        .from(aiResponses)
        .where(gte(aiResponses.createdAt, fifteenMinutesAgo));

      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentQueries = await db
        .select()
        .from(aiResponses)
        .where(gte(aiResponses.createdAt, oneMinuteAgo));

      return {
        activeUsers: activeUsersResult.length,
        queriesPerMinute: recentQueries.length,
        avgResponseTime: recentQueries.reduce((sum, r) => sum + (r.generationTime || 0), 0) / recentQueries.length / 1000 || 1.2,
        systemLoad: Math.floor(Math.random() * 30) + 40
      };
    } catch (error) {
      console.error('Error fetching live stats:', error);
      return { activeUsers: 0, queriesPerMinute: 0, avgResponseTime: 1.2, systemLoad: 67 };
    }
  }

  async getResponseTimeAnalytics(userId: string, timeRange: string): Promise<any> {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const responses = await db
        .select()
        .from(aiResponses)
        .where(and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, startDate)
        ))
        .orderBy(aiResponses.createdAt);

      const times = responses.map(r => r.generationTime || 1000);
      
      return {
        avgResponseTime: times.reduce((sum, time) => sum + time, 0) / times.length / 1000 || 1.2,
        minResponseTime: Math.min(...times) / 1000 || 0.8,
        maxResponseTime: Math.max(...times) / 1000 || 2.1,
        data: this.groupDataByTime(responses, timeRange === '24h' ? 'hour' : 'day')
      };
    } catch (error) {
      console.error('Error fetching response time analytics:', error);
      return { avgResponseTime: 1.2, minResponseTime: 0.8, maxResponseTime: 2.1, data: [] };
    }
  }

  async getEngagementAnalytics(userId: string, timeRange: string): Promise<any> {
    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const responses = await db
        .select()
        .from(aiResponses)
        .where(and(
          eq(aiResponses.userId, userId),
          gte(aiResponses.createdAt, startDate)
        ));

      return {
        totalInteractions: responses.length,
        avgConfidenceScore: responses.reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / responses.length || 85,
        engagementRate: responses.filter(r => r.userFeedback).length / responses.length * 100 || 0
      };
    } catch (error) {
      console.error('Error fetching engagement analytics:', error);
      return { totalInteractions: 0, avgConfidenceScore: 85, engagementRate: 0 };
    }
  }

  private groupDataByTime(data: any[], format: 'hour' | 'day'): any[] {
    const groups: Record<string, any> = {};
    
    data.forEach(item => {
      const date = new Date(item.createdAt);
      let key: string;
      
      if (format === 'hour') {
        key = `${date.getHours().toString().padStart(2, '0')}:00`;
      } else {
        key = date.toISOString().split('T')[0];
      }
      
      if (!groups[key]) {
        groups[key] = {
          time: key,
          count: 0,
          totalResponseTime: 0,
          avgResponseTime: 0
        };
      }
      
      groups[key].count++;
      groups[key].totalResponseTime += item.generationTime || 0;
      groups[key].avgResponseTime = groups[key].totalResponseTime / groups[key].count;
    });
    
    return Object.values(groups);
  }

  // Workflow operations
  async getUserWorkflows(userId: string): Promise<Workflow[]> {
    try {
      const userWorkflows = await db
        .select()
        .from(workflows)
        .where(eq(workflows.userId, userId))
        .orderBy(desc(workflows.createdAt));
      return userWorkflows;
    } catch (error) {
      console.error('Error fetching user workflows:', error);
      return [];
    }
  }

  async createWorkflow(userId: string, workflow: UpsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db
      .insert(workflows)
      .values({
        ...workflow,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newWorkflow;
  }

  async updateWorkflow(userId: string, workflowId: number, workflow: Partial<UpsertWorkflow>): Promise<Workflow> {
    const [updatedWorkflow] = await db
      .update(workflows)
      .set({
        ...workflow,
        updatedAt: new Date(),
      })
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
      .returning();
    return updatedWorkflow;
  }

  async deleteWorkflow(userId: string, workflowId: number): Promise<void> {
    await db
      .delete(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)));
  }

  async getWorkflow(userId: string, workflowId: number): Promise<Workflow | undefined> {
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)));
    return workflow;
  }

  // Custom Model operations
  async getUserCustomModels(userId: string): Promise<CustomModel[]> {
    try {
      const userModels = await db
        .select()
        .from(customModels)
        .where(eq(customModels.userId, userId))
        .orderBy(desc(customModels.createdAt));
      return userModels;
    } catch (error) {
      console.error('Error fetching user custom models:', error);
      return [];
    }
  }

  async createCustomModel(userId: string, model: UpsertCustomModel): Promise<CustomModel> {
    const [newModel] = await db
      .insert(customModels)
      .values({
        ...model,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newModel;
  }

  async updateCustomModel(userId: string, modelId: number, model: Partial<UpsertCustomModel>): Promise<CustomModel> {
    const [updatedModel] = await db
      .update(customModels)
      .set({
        ...model,
        updatedAt: new Date(),
      })
      .where(and(eq(customModels.id, modelId), eq(customModels.userId, userId)))
      .returning();
    return updatedModel;
  }

  async deleteCustomModel(userId: string, modelId: number): Promise<void> {
    await db
      .delete(customModels)
      .where(and(eq(customModels.id, modelId), eq(customModels.userId, userId)));
  }

  async getCustomModel(userId: string, modelId: number): Promise<CustomModel | undefined> {
    const [model] = await db
      .select()
      .from(customModels)
      .where(and(eq(customModels.id, modelId), eq(customModels.userId, userId)));
    return model;
  }

  async setDefaultCustomModel(userId: string, modelId: number): Promise<CustomModel> {
    // First, unset all current defaults for this user
    await db
      .update(customModels)
      .set({ isDefault: false })
      .where(eq(customModels.userId, userId));

    // Then set the new default
    const [updatedModel] = await db
      .update(customModels)
      .set({ 
        isDefault: true,
        updatedAt: new Date()
      })
      .where(and(eq(customModels.id, modelId), eq(customModels.userId, userId)))
      .returning();
    
    return updatedModel;
  }

  async incrementModelUsage(userId: string, modelId: number): Promise<void> {
    await db
      .update(customModels)
      .set({
        usageCount: sql`${customModels.usageCount} + 1`,
        lastUsed: new Date()
      })
      .where(and(eq(customModels.id, modelId), eq(customModels.userId, userId)));
  }

  // Security Settings operations
  async getUserSecuritySettings(userId: string): Promise<SecuritySettings | undefined> {
    try {
      const [settings] = await db
        .select()
        .from(securitySettings)
        .where(eq(securitySettings.userId, userId));
      return settings;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return undefined;
    }
  }

  async updateSecuritySettings(userId: string, settings: Partial<UpsertSecuritySettings>): Promise<SecuritySettings> {
    const [updatedSettings] = await db
      .update(securitySettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(securitySettings.userId, userId))
      .returning();
    
    if (!updatedSettings) {
      // If no settings exist, create them
      return this.createSecuritySettings(userId, settings as UpsertSecuritySettings);
    }
    
    return updatedSettings;
  }

  async createSecuritySettings(userId: string, settings: UpsertSecuritySettings): Promise<SecuritySettings> {
    const [newSettings] = await db
      .insert(securitySettings)
      .values({
        ...settings,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newSettings;
  }

  // Audit Log operations
  async getUserAuditLogs(userId: string, filters?: any): Promise<AuditLog[]> {
    try {
      let query = db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, userId))
        .orderBy(desc(auditLogs.timestamp))
        .limit(1000); // Limit to last 1000 logs

      const logs = await query;
      return logs;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  async createAuditLog(userId: string, log: UpsertAuditLog): Promise<AuditLog> {
    // Get user email for the log
    const user = await this.getUserById(userId);
    
    const [newLog] = await db
      .insert(auditLogs)
      .values({
        ...log,
        userId,
        userEmail: user?.email || 'unknown',
        timestamp: new Date(),
      })
      .returning();
    return newLog;
  }

  async generateAuditReport(userId: string, params: any): Promise<any> {
    // This would typically generate and email a comprehensive audit report
    // For now, we'll just return a success response
    return { success: true, message: "Report generation started" };
  }

  // White-label Settings operations
  async getUserWhiteLabelSettings(userId: string): Promise<WhiteLabelSettings | undefined> {
    try {
      const [settings] = await db
        .select()
        .from(whiteLabelSettings)
        .where(eq(whiteLabelSettings.userId, userId));
      return settings;
    } catch (error) {
      console.error('Error fetching white-label settings:', error);
      return undefined;
    }
  }

  async updateWhiteLabelSettings(userId: string, settings: Partial<UpsertWhiteLabelSettings>): Promise<WhiteLabelSettings> {
    const [updatedSettings] = await db
      .update(whiteLabelSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(whiteLabelSettings.userId, userId))
      .returning();
    
    if (!updatedSettings) {
      // If no settings exist, create them
      return this.createWhiteLabelSettings(userId, settings as UpsertWhiteLabelSettings);
    }
    
    return updatedSettings;
  }

  async createWhiteLabelSettings(userId: string, settings: UpsertWhiteLabelSettings): Promise<WhiteLabelSettings> {
    const [newSettings] = await db
      .insert(whiteLabelSettings)
      .values({
        ...settings,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newSettings;
  }

  async verifyCustomDomain(userId: string, domain: string): Promise<boolean> {
    // In a real implementation, this would verify DNS records
    // For demo purposes, we'll simulate verification
    const isValid = domain && domain.includes('.');
    
    if (isValid) {
      await this.updateWhiteLabelSettings(userId, { 
        customDomain: domain,
        domainVerified: true 
      });
    }
    
    return isValid;
  }

  // Webhook operations
  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    const userWebhooks = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, userId))
      .orderBy(desc(webhooks.createdAt));
    return userWebhooks;
  }

  async createWebhook(userId: string, webhook: UpsertWebhook): Promise<Webhook> {
    const secret = webhook.secret || this.generateWebhookSecret();
    
    const [newWebhook] = await db
      .insert(webhooks)
      .values({
        ...webhook,
        userId,
        secret,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newWebhook;
  }

  async updateWebhook(webhookId: number, webhook: Partial<UpsertWebhook>): Promise<Webhook> {
    const [updatedWebhook] = await db
      .update(webhooks)
      .set({
        ...webhook,
        updatedAt: new Date(),
      })
      .where(eq(webhooks.id, webhookId))
      .returning();
    return updatedWebhook;
  }

  async deleteWebhook(webhookId: number): Promise<void> {
    await db.delete(webhooks).where(eq(webhooks.id, webhookId));
  }

  async getWebhookDeliveries(userId: string): Promise<WebhookDelivery[]> {
    const deliveries = await db
      .select({
        id: webhookDeliveries.id,
        webhookId: webhookDeliveries.webhookId,
        event: webhookDeliveries.event,
        status: webhookDeliveries.status,
        httpStatus: webhookDeliveries.httpStatus,
        response: webhookDeliveries.response,
        duration: webhookDeliveries.duration,
        timestamp: webhookDeliveries.timestamp,
      })
      .from(webhookDeliveries)
      .innerJoin(webhooks, eq(webhookDeliveries.webhookId, webhooks.id))
      .where(eq(webhooks.userId, userId))
      .orderBy(desc(webhookDeliveries.timestamp))
      .limit(100);
    return deliveries;
  }

  async createWebhookDelivery(delivery: UpsertWebhookDelivery): Promise<WebhookDelivery> {
    const [newDelivery] = await db
      .insert(webhookDeliveries)
      .values(delivery)
      .returning();
    return newDelivery;
  }

  // Zapier operations
  async getUserZapierIntegrations(userId: string): Promise<ZapierIntegration[]> {
    const integrations = await db
      .select()
      .from(zapierIntegrations)
      .where(eq(zapierIntegrations.userId, userId))
      .orderBy(desc(zapierIntegrations.createdAt));
    return integrations;
  }

  async createZapierIntegration(userId: string, integration: UpsertZapierIntegration): Promise<ZapierIntegration> {
    const [newIntegration] = await db
      .insert(zapierIntegrations)
      .values({
        ...integration,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newIntegration;
  }

  async updateZapierIntegration(integrationId: number, integration: Partial<UpsertZapierIntegration>): Promise<ZapierIntegration> {
    const [updatedIntegration] = await db
      .update(zapierIntegrations)
      .set({
        ...integration,
        updatedAt: new Date(),
      })
      .where(eq(zapierIntegrations.id, integrationId))
      .returning();
    return updatedIntegration;
  }

  async deleteZapierIntegration(integrationId: number): Promise<void> {
    await db.delete(zapierIntegrations).where(eq(zapierIntegrations.id, integrationId));
  }

  // Customer Inbox operations
  async getCustomerConversations(userId: string, limit: number = 50): Promise<(CustomerConversation & {
    messages: CustomerMessage[];
    lastMessage?: CustomerMessage;
    unreadCount: number;
  })[]> {
    const conversations = await db
      .select()
      .from(customerConversations)
      .where(eq(customerConversations.userId, userId))
      .orderBy(desc(customerConversations.lastMessageAt))
      .limit(limit);

    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const messages = await db
          .select()
          .from(customerMessages)
          .where(eq(customerMessages.conversationId, conversation.id))
          .orderBy(desc(customerMessages.createdAt));

        return {
          ...conversation,
          messages,
          lastMessage: messages[0],
          unreadCount: messages.filter(m => !m.isRead && m.messageType === 'incoming').length,
        };
      })
    );

    return conversationsWithMessages;
  }

  async getConversation(conversationId: number, userId: string): Promise<(CustomerConversation & {
    messages: CustomerMessage[];
  }) | null> {
    const [conversation] = await db
      .select()
      .from(customerConversations)
      .where(and(
        eq(customerConversations.id, conversationId),
        eq(customerConversations.userId, userId)
      ));

    if (!conversation) return null;

    const messages = await db
      .select()
      .from(customerMessages)
      .where(eq(customerMessages.conversationId, conversationId))
      .orderBy(customerMessages.createdAt);

    return {
      ...conversation,
      messages,
    };
  }

  async createConversation(userId: string, conversation: InsertCustomerConversation): Promise<CustomerConversation> {
    const [newConversation] = await db
      .insert(customerConversations)
      .values({
        ...conversation,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newConversation;
  }

  async updateConversation(conversationId: number, userId: string, updates: Partial<InsertCustomerConversation>): Promise<CustomerConversation | null> {
    const [updatedConversation] = await db
      .update(customerConversations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(customerConversations.id, conversationId),
        eq(customerConversations.userId, userId)
      ))
      .returning();
    return updatedConversation || null;
  }

  async getConversationMessages(conversationId: number, userId: string): Promise<CustomerMessage[]> {
    // Verify the conversation belongs to the user
    const [conversation] = await db
      .select()
      .from(customerConversations)
      .where(and(
        eq(customerConversations.id, conversationId),
        eq(customerConversations.userId, userId)
      ));

    if (!conversation) return [];

    return await db
      .select()
      .from(customerMessages)
      .where(eq(customerMessages.conversationId, conversationId))
      .orderBy(customerMessages.createdAt);
  }

  async createMessage(message: InsertCustomerMessage): Promise<CustomerMessage> {
    const [newMessage] = await db
      .insert(customerMessages)
      .values({
        ...message,
        createdAt: new Date(),
      })
      .returning();

    // Update conversation's last message timestamp
    await db
      .update(customerConversations)
      .set({
        lastMessageAt: new Date(),
        updatedAt: new Date(),
        unreadCount: message.messageType === 'incoming' ? sql`${customerConversations.unreadCount} + 1` : customerConversations.unreadCount,
      })
      .where(eq(customerConversations.id, message.conversationId));

    return newMessage;
  }

  async markMessageAsRead(messageId: number, userId: string): Promise<void> {
    await db
      .update(customerMessages)
      .set({ isRead: true })
      .where(eq(customerMessages.id, messageId));
  }

  async generateAiReply(userId: string, reply: InsertAiGeneratedReply): Promise<AiGeneratedReply> {
    const [newReply] = await db
      .insert(aiGeneratedReplies)
      .values({
        ...reply,
        userId,
        createdAt: new Date(),
      })
      .returning();
    return newReply;
  }

  async getAiGeneratedReplies(userId: string, limit: number = 50, status?: string): Promise<(AiGeneratedReply & {
    conversation: CustomerConversation;
    originalMessage: CustomerMessage;
  })[]> {
    let query = db
      .select({
        reply: aiGeneratedReplies,
        conversation: customerConversations,
        originalMessage: customerMessages,
      })
      .from(aiGeneratedReplies)
      .innerJoin(customerConversations, eq(aiGeneratedReplies.conversationId, customerConversations.id))
      .innerJoin(customerMessages, eq(aiGeneratedReplies.originalMessageId, customerMessages.id))
      .where(eq(aiGeneratedReplies.userId, userId));

    if (status) {
      query = query.where(eq(aiGeneratedReplies.status, status));
    }

    const results = await query
      .orderBy(desc(aiGeneratedReplies.createdAt))
      .limit(limit);

    return results.map(result => ({
      ...result.reply,
      conversation: result.conversation,
      originalMessage: result.originalMessage,
    }));
  }

  async updateAiReply(replyId: number, userId: string, updates: Partial<InsertAiGeneratedReply>): Promise<AiGeneratedReply | null> {
    const [updatedReply] = await db
      .update(aiGeneratedReplies)
      .set(updates)
      .where(and(
        eq(aiGeneratedReplies.id, replyId),
        eq(aiGeneratedReplies.userId, userId)
      ))
      .returning();
    return updatedReply || null;
  }

  async getReplyTemplates(userId: string): Promise<ReplyTemplate[]> {
    return await db
      .select()
      .from(replyTemplates)
      .where(eq(replyTemplates.userId, userId))
      .orderBy(desc(replyTemplates.useCount), replyTemplates.name);
  }

  async createReplyTemplate(userId: string, template: InsertReplyTemplate): Promise<ReplyTemplate> {
    const [newTemplate] = await db
      .insert(replyTemplates)
      .values({
        ...template,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newTemplate;
  }

  private generateWebhookSecret(): string {
    return 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Get recent activity for home page
  async getRecentActivity(userId: string) {
    const activities = [];

    // Get recent AI responses
    const recentResponses = await db.select({
      id: aiResponses.id,
      clientMessage: aiResponses.clientMessage,
      createdAt: aiResponses.createdAt,
      tone: aiResponses.tone
    })
    .from(aiResponses)
    .where(eq(aiResponses.userId, userId))
    .orderBy(desc(aiResponses.createdAt))
    .limit(3);

    // Get recent custom prompts
    const recentPrompts = await db.select({
      id: customPrompts.id,
      title: customPrompts.title,
      createdAt: customPrompts.createdAt,
      category: customPrompts.category
    })
    .from(customPrompts)
    .where(eq(customPrompts.userId, userId))
    .orderBy(desc(customPrompts.createdAt))
    .limit(2);

    // Add AI responses to activities
    recentResponses.forEach(response => {
      activities.push({
        id: `response-${response.id}`,
        type: 'response',
        title: 'Response Generated',
        description: response.clientMessage?.slice(0, 50) + '...' || 'Customer inquiry handled',
        timestamp: response.createdAt,
        category: response.tone || 'professional'
      });
    });

    // Add custom prompts to activities
    recentPrompts.forEach(prompt => {
      activities.push({
        id: `prompt-${prompt.id}`,
        type: 'prompt',
        title: 'Prompt Created',
        description: `${prompt.title} (${prompt.category})`,
        timestamp: prompt.createdAt,
        category: prompt.category || 'general'
      });
    });

    // Sort all activities by timestamp and return top 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }

  // Get performance statistics for home page
  async getPerformanceStats(userId: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get total responses count
      const totalResponsesResult = await db.select({
        count: count()
      })
      .from(aiResponses)
      .where(and(
        eq(aiResponses.userId, userId),
        gte(aiResponses.createdAt, thirtyDaysAgo)
      ));

      // Get all responses for calculating averages manually
      const responses = await db.select({
        confidence: aiResponses.confidence,
        generationTime: aiResponses.generationTime
      })
      .from(aiResponses)
      .where(and(
        eq(aiResponses.userId, userId),
        gte(aiResponses.createdAt, thirtyDaysAgo)
      ));

      const totalQueries = totalResponsesResult[0]?.count || 0;
      
      // Calculate averages manually
      let avgConfidence = 85;
      let avgResponseTime = 1200;
      
      if (responses.length > 0) {
        const validConfidences = responses.filter(r => r.confidence !== null).map(r => r.confidence!);
        const validTimes = responses.filter(r => r.generationTime !== null).map(r => r.generationTime!);
        
        if (validConfidences.length > 0) {
          avgConfidence = validConfidences.reduce((sum, conf) => sum + conf, 0) / validConfidences.length;
        }
        
        if (validTimes.length > 0) {
          avgResponseTime = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
        }
      }

      return {
        totalQueries,
        responseAccuracy: Math.round(avgConfidence * 100) / 100,
        avgResponseTime: `${Math.round(avgResponseTime)}ms`,
        customerSatisfaction: 98 // Default value since we don't have customer satisfaction tracking yet
      };
    } catch (error) {
      console.error('Error in getPerformanceStats:', error);
      return {
        totalQueries: 0,
        responseAccuracy: 85,
        avgResponseTime: '1.2s',
        customerSatisfaction: 98
      };
    }
  }

  // Customer Inbox Management
  async getCustomerConversations(userId: string, limit: number = 50): Promise<CustomerConversation[]> {
    const conversations = await this.db.select()
      .from(customerConversations)
      .where(eq(customerConversations.userId, userId))
      .orderBy(customerConversations.lastMessageAt)
      .limit(limit);

    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await this.db.select()
          .from(customerMessages)
          .where(eq(customerMessages.conversationId, conv.id))
          .orderBy(customerMessages.createdAt);

        const lastMessage = messages[messages.length - 1];
        
        return {
          ...conv,
          messages,
          lastMessage,
        };
      })
    );

    return conversationsWithMessages;
  }

  async getConversation(conversationId: number, userId: string): Promise<CustomerConversation | null> {
    const [conversation] = await this.db.select()
      .from(customerConversations)
      .where(eq(customerConversations.id, conversationId))
      .where(eq(customerConversations.userId, userId));

    if (!conversation) return null;

    const messages = await this.db.select()
      .from(customerMessages)
      .where(eq(customerMessages.conversationId, conversationId))
      .orderBy(customerMessages.createdAt);

    return {
      ...conversation,
      messages,
      lastMessage: messages[messages.length - 1],
    };
  }

  async createConversation(userId: string, data: any): Promise<CustomerConversation> {
    const [conversation] = await this.db.insert(customerConversations)
      .values({
        ...data,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return conversation;
  }

  async updateConversation(conversationId: number, userId: string, data: any): Promise<CustomerConversation | null> {
    const [conversation] = await this.db.update(customerConversations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(customerConversations.id, conversationId))
      .where(eq(customerConversations.userId, userId))
      .returning();

    return conversation || null;
  }

  async createMessage(data: any): Promise<CustomerMessage> {
    const [message] = await this.db.insert(customerMessages)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();

    return message;
  }

  // AI Generated Replies Management
  async generateAiReply(userId: string, data: any): Promise<AiGeneratedReply> {
    const [reply] = await this.db.insert(aiGeneratedReplies)
      .values({
        ...data,
        status: 'generated',
        wasEdited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return reply;
  }

  async updateAiReply(replyId: number, userId: string, data: any): Promise<AiGeneratedReply | null> {
    const [reply] = await this.db.update(aiGeneratedReplies)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(aiGeneratedReplies.id, replyId))
      .returning();

    return reply || null;
  }

  async getAiGeneratedReplies(userId: string, limit: number = 50, status?: string): Promise<AiGeneratedReply[]> {
    let query = this.db.select({
      id: aiGeneratedReplies.id,
      conversationId: aiGeneratedReplies.conversationId,
      originalMessageId: aiGeneratedReplies.originalMessageId,
      replyType: aiGeneratedReplies.replyType,
      customInstructions: aiGeneratedReplies.customInstructions,
      generatedReply: aiGeneratedReplies.generatedReply,
      finalReply: aiGeneratedReplies.finalReply,
      confidence: aiGeneratedReplies.confidence,
      status: aiGeneratedReplies.status,
      wasEdited: aiGeneratedReplies.wasEdited,
      generationTime: aiGeneratedReplies.generationTime,
      sentAt: aiGeneratedReplies.sentAt,
      createdAt: aiGeneratedReplies.createdAt,
      conversation: {
        id: customerConversations.id,
        customerName: customerConversations.customerName,
        customerEmail: customerConversations.customerEmail,
        channel: customerConversations.channel,
        subject: customerConversations.subject,
      },
    })
    .from(aiGeneratedReplies)
    .innerJoin(customerConversations, eq(aiGeneratedReplies.conversationId, customerConversations.id))
    .where(eq(customerConversations.userId, userId))
    .orderBy(aiGeneratedReplies.createdAt)
    .limit(limit);

    if (status) {
      query = query.where(eq(aiGeneratedReplies.status, status));
    }

    const replies = await query;
    return replies;
  }

  // Email Integration operations
  async getUserEmailIntegrations(userId: string): Promise<EmailIntegration[]> {
    const integrations = await db
      .select()
      .from(emailIntegrations)
      .where(eq(emailIntegrations.userId, userId))
      .orderBy(desc(emailIntegrations.createdAt));
    return integrations;
  }

  async getEmailIntegration(integrationId: number, userId: string): Promise<EmailIntegration | null> {
    const [integration] = await db
      .select()
      .from(emailIntegrations)
      .where(and(
        eq(emailIntegrations.id, integrationId),
        eq(emailIntegrations.userId, userId)
      ));
    return integration || null;
  }

  async createEmailIntegration(integration: InsertEmailIntegration): Promise<EmailIntegration> {
    const [newIntegration] = await db
      .insert(emailIntegrations)
      .values({
        ...integration,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newIntegration;
  }

  async updateEmailIntegration(integrationId: number, updates: Partial<EmailIntegration>): Promise<void> {
    await db
      .update(emailIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailIntegrations.id, integrationId));
  }

  async getEmailMessage(messageId: number, userId: string): Promise<EmailMessage | null> {
    const [message] = await db
      .select()
      .from(emailMessages)
      .innerJoin(emailIntegrations, eq(emailMessages.integrationId, emailIntegrations.id))
      .where(and(
        eq(emailMessages.id, messageId),
        eq(emailIntegrations.userId, userId)
      ));
    return message?.email_messages || null;
  }

  async updateEmailMessage(messageId: number, updates: Partial<EmailMessage>): Promise<void> {
    await db
      .update(emailMessages)
      .set(updates)
      .where(eq(emailMessages.id, messageId));
  }

  async createEmailMessage(message: InsertEmailMessage): Promise<EmailMessage> {
    const [newMessage] = await db
      .insert(emailMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getUserEmailMessages(userId: string, limit: number = 50): Promise<EmailMessage[]> {
    const messages = await db
      .select({
        id: emailMessages.id,
        integrationId: emailMessages.integrationId,
        messageId: emailMessages.messageId,
        threadId: emailMessages.threadId,
        subject: emailMessages.subject,
        fromEmail: emailMessages.fromEmail,
        fromName: emailMessages.fromName,
        toEmail: emailMessages.toEmail,
        toName: emailMessages.toName,
        bodyText: emailMessages.bodyText,
        bodyHtml: emailMessages.bodyHtml,
        isRead: emailMessages.isRead,
        isReplied: emailMessages.isReplied,
        receivedAt: emailMessages.receivedAt,
        createdAt: emailMessages.createdAt,
      })
      .from(emailMessages)
      .innerJoin(emailIntegrations, eq(emailMessages.integrationId, emailIntegrations.id))
      .where(eq(emailIntegrations.userId, userId))
      .orderBy(desc(emailMessages.receivedAt))
      .limit(limit);
    return messages;
  }

  async updateEmailIntegration(integrationId: number, userId: string, updates: Partial<UpsertEmailIntegration>): Promise<EmailIntegration | null> {
    const [updatedIntegration] = await db
      .update(emailIntegrations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(emailIntegrations.id, integrationId),
        eq(emailIntegrations.userId, userId)
      ))
      .returning();
    return updatedIntegration || null;
  }

  async deleteEmailIntegration(integrationId: number, userId: string): Promise<void> {
    await db
      .delete(emailIntegrations)
      .where(and(
        eq(emailIntegrations.id, integrationId),
        eq(emailIntegrations.userId, userId)
      ));
  }

  async getActiveEmailIntegration(userId: string): Promise<EmailIntegration | null> {
    const [integration] = await db
      .select()
      .from(emailIntegrations)
      .where(and(
        eq(emailIntegrations.userId, userId),
        eq(emailIntegrations.isActive, true)
      ))
      .limit(1);
    return integration || null;
  }

  // Synchronized Email operations
  async getSynchronizedEmails(userId: string, integrationId?: number, limit: number = 50): Promise<SynchronizedEmail[]> {
    let query = db
      .select({
        id: emailMessages.id,
        integrationId: emailMessages.integrationId,
        messageId: emailMessages.messageId,
        threadId: emailMessages.threadId,
        subject: emailMessages.subject,
        fromEmail: emailMessages.fromEmail,
        fromName: emailMessages.fromName,
        toEmail: emailMessages.toEmail,
        toName: emailMessages.toName,
        bodyText: emailMessages.bodyText,
        bodyHtml: emailMessages.bodyHtml,
        isRead: emailMessages.isRead,
        isReplied: emailMessages.isReplied,
        receivedAt: emailMessages.receivedAt,
        createdAt: emailMessages.createdAt,
      })
      .from(emailMessages)
      .innerJoin(emailIntegrations, eq(emailMessages.integrationId, emailIntegrations.id))
      .where(eq(emailIntegrations.userId, userId));

    if (integrationId) {
      query = query.where(eq(emailMessages.integrationId, integrationId));
    }

    const emails = await query
      .orderBy(desc(emailMessages.receivedAt))
      .limit(limit);

    return emails;
  }

  async createSynchronizedEmail(email: UpsertSynchronizedEmail): Promise<SynchronizedEmail> {
    const [newEmail] = await db
      .insert(emailMessages)
      .values({
        ...email,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newEmail;
  }

  async bulkCreateSynchronizedEmails(emails: UpsertSynchronizedEmail[]): Promise<SynchronizedEmail[]> {
    if (emails.length === 0) return [];

    const emailsWithTimestamp = emails.map(email => ({
      ...email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const newEmails = await db
      .insert(emailMessages)
      .values(emailsWithTimestamp)
      .returning();
    
    return newEmails;
  }

  async updateSynchronizedEmail(emailId: number, userId: string, updates: Partial<UpsertSynchronizedEmail>): Promise<SynchronizedEmail | null> {
    const [updatedEmail] = await db
      .update(emailMessages)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(emailMessages.id, emailId),
        eq(emailMessages.userId, userId)
      ))
      .returning();
    return updatedEmail || null;
  }

  async markEmailAsRead(emailId: number, userId: string): Promise<void> {
    await db
      .update(emailMessages)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(and(
        eq(emailMessages.id, emailId),
        eq(emailMessages.userId, userId)
      ));
  }

  async getEmailByMessageId(messageId: string, integrationId: number): Promise<SynchronizedEmail | null> {
    const [email] = await db
      .select()
      .from(emailMessages)
      .where(and(
        eq(emailMessages.messageId, messageId),
        eq(emailMessages.integrationId, integrationId)
      ))
      .limit(1);
    return email || null;
  }

  // Email AI Reply operations
  async createEmailAiReply(userId: string, reply: UpsertEmailAiReply): Promise<EmailAiReply> {
    const [newReply] = await db
      .insert(emailAiReplies)
      .values({
        ...reply,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newReply;
  }

  async getEmailAiReplies(userId: string, emailId?: number, limit: number = 50): Promise<EmailAiReply[]> {
    let query = db
      .select()
      .from(emailAiReplies)
      .where(eq(emailAiReplies.userId, userId));

    if (emailId) {
      query = query.where(eq(emailAiReplies.emailId, emailId));
    }

    const replies = await query
      .orderBy(desc(emailAiReplies.createdAt))
      .limit(limit);

    return replies;
  }

  async updateEmailAiReply(replyId: number, userId: string, updates: Partial<UpsertEmailAiReply>): Promise<EmailAiReply | null> {
    const [updatedReply] = await db
      .update(emailAiReplies)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(emailAiReplies.id, replyId),
        eq(emailAiReplies.userId, userId)
      ))
      .returning();
    return updatedReply || null;
  }

  async markEmailReplySent(replyId: number, sentMessageId: string): Promise<void> {
    await db
      .update(emailAiReplies)
      .set({
        status: 'sent',
        sentAt: new Date(),
        sentMessageId,
        updatedAt: new Date(),
      })
      .where(eq(emailAiReplies.id, replyId));
  }

  async getRecentAiResponses(userId: string, limit = 100): Promise<{ confidence: number; createdAt: Date }[]> {
    const responses = await db
      .select({
        confidence: aiResponses.confidence,
        createdAt: aiResponses.createdAt,
      })
      .from(aiResponses)
      .where(eq(aiResponses.userId, userId))
      .orderBy(desc(aiResponses.createdAt))
      .limit(limit);
    
    return responses.map(r => ({
      confidence: r.confidence || 80,
      createdAt: r.createdAt || new Date()
    }));
  }
}

export const storage = new DatabaseStorage();
