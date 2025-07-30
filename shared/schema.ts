import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  plan: varchar("plan").default("starter").notNull(), // starter, pro, enterprise
  planStartDate: timestamp("plan_start_date").defaultNow(),
  trialEnd: timestamp("trial_end"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  country: varchar("country").default("IN"),
  currency: varchar("currency").default("INR"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Responses table to track usage
export const aiResponses = pgTable("ai_responses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  clientMessage: text("client_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  queryType: varchar("query_type").default("general"), // refund_request, shipping_delay, product_howto, general
  tone: varchar("tone").default("professional"), // professional, friendly, casual
  confidence: integer("confidence").default(80), // 0-100
  generationTime: integer("generation_time").default(0), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertAiResponseSchema = createInsertSchema(aiResponses).pick({
  clientMessage: true,
  aiResponse: true,
  queryType: true,
  tone: true,
  confidence: true,
  generationTime: true,
});

export const generateRequestSchema = z.object({
  clientMessage: z.string().min(10, "Message must be at least 10 characters"),
  queryType: z.enum(["refund_request", "shipping_delay", "product_howto", "general"]),
  tone: z.enum(["professional", "friendly", "casual"]).default("professional"),
});

// Email Integration Tables
export const emailIntegrations = pgTable("email_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  provider: varchar("provider").notNull(), // gmail, outlook
  email: varchar("email").notNull(),
  displayName: varchar("display_name"),
  encryptedTokens: text("encrypted_tokens").notNull(),
  isActive: boolean("is_active").default(true),
  syncStatus: varchar("sync_status").default("ready"), // ready, syncing, error
  lastSyncAt: timestamp("last_sync_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailMessages = pgTable("email_messages", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => emailIntegrations.id, { onDelete: "cascade" }).notNull(),
  messageId: varchar("message_id").notNull(),
  threadId: varchar("thread_id"),
  subject: text("subject"),
  fromEmail: varchar("from_email").notNull(),
  fromName: varchar("from_name"),
  toEmail: varchar("to_email").notNull(),
  toName: varchar("to_name"),
  bodyText: text("body_text"),
  bodyHtml: text("body_html"),
  isRead: boolean("is_read").default(false),
  isReplied: boolean("is_replied").default(false),
  receivedAt: timestamp("received_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailIntegration = typeof emailIntegrations.$inferSelect;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type InsertEmailIntegration = typeof emailIntegrations.$inferInsert;
export type InsertEmailMessage = typeof emailMessages.$inferInsert;

// Workflows table for automation workflows
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  status: varchar("status").default("draft").notNull(), // draft, active, paused
  nodes: jsonb("nodes").default([]).notNull(), // Array of workflow nodes
  triggers: integer("triggers").default(0),
  actions: integer("actions").default(0),
  runs: integer("runs").default(0),
  successRate: integer("success_rate").default(100),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Workflow = typeof workflows.$inferSelect;
export type UpsertWorkflow = typeof workflows.$inferInsert;

export const insertWorkflowSchema = createInsertSchema(workflows).pick({
  name: true,
  description: true,
  status: true,
  nodes: true,
  triggers: true,
  actions: true,
});

export const updateWorkflowSchema = insertWorkflowSchema.partial();

// Custom Models table for user-uploaded models and templates
export const customModels = pgTable("custom_models", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'model' or 'template'
  status: varchar("status").default("uploading").notNull(), // uploading, processing, active, error
  isDefault: boolean("is_default").default(false),
  fileSize: integer("file_size").default(0),
  filePath: varchar("file_path"),
  templateContent: text("template_content"),
  modelConfig: jsonb("model_config").default('{}'),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CustomModel = typeof customModels.$inferSelect;
export type UpsertCustomModel = typeof customModels.$inferInsert;

export const insertCustomModelSchema = createInsertSchema(customModels).pick({
  name: true,
  description: true,
  type: true,
  status: true,
  isDefault: true,
  fileSize: true,
  filePath: true,
  templateContent: true,
  modelConfig: true
});

export const updateCustomModelSchema = insertCustomModelSchema.partial();

// Security Settings table for SSO, 2FA, and security policies
export const securitySettings = pgTable("security_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  ssoEnabled: boolean("sso_enabled").default(false),
  ssoProvider: varchar("sso_provider"),
  ssoMetadata: text("sso_metadata"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  sessionTimeout: integer("session_timeout").default(480), // minutes
  passwordPolicyMinLength: integer("password_policy_min_length").default(8),
  passwordPolicyRequireSpecial: boolean("password_policy_require_special").default(true),
  passwordPolicyRequireNumbers: boolean("password_policy_require_numbers").default(true),
  passwordPolicyRequireUppercase: boolean("password_policy_require_uppercase").default(true),
  ipWhitelist: text("ip_whitelist").array().default([]),
  apiKeyRotationDays: integer("api_key_rotation_days").default(90),
  auditLogRetentionDays: integer("audit_log_retention_days").default(365),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SecuritySettings = typeof securitySettings.$inferSelect;
export type UpsertSecuritySettings = typeof securitySettings.$inferInsert;

export const insertSecuritySettingsSchema = createInsertSchema(securitySettings).pick({
  ssoEnabled: true,
  ssoProvider: true,
  ssoMetadata: true,
  twoFactorEnabled: true,
  sessionTimeout: true,
  passwordPolicyMinLength: true,
  passwordPolicyRequireSpecial: true,
  passwordPolicyRequireNumbers: true,
  passwordPolicyRequireUppercase: true,
  ipWhitelist: true,
  apiKeyRotationDays: true,
  auditLogRetentionDays: true
});

export const updateSecuritySettingsSchema = insertSecuritySettingsSchema.partial();

// Audit Logs table for security monitoring
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userEmail: varchar("user_email").notNull(),
  action: varchar("action").notNull(),
  category: varchar("category").notNull(), // auth, data, api, admin, security
  details: text("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  status: varchar("status").notNull(), // success, failure, warning
  riskLevel: varchar("risk_level").default("low"), // low, medium, high
  metadata: jsonb("metadata").default('{}'),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type UpsertAuditLog = typeof auditLogs.$inferInsert;

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  action: true,
  category: true,
  details: true,
  ipAddress: true,
  userAgent: true,
  status: true,
  riskLevel: true,
  metadata: true
});

// White-label Settings table for platform customization
export const whiteLabelSettings = pgTable("white_label_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  logoUrl: varchar("logo_url"),
  faviconUrl: varchar("favicon_url"),
  brandName: varchar("brand_name").default("Savrii"),
  primaryColor: varchar("primary_color").default("#3b82f6"),
  secondaryColor: varchar("secondary_color").default("#64748b"),
  accentColor: varchar("accent_color").default("#10b981"),
  customDomain: varchar("custom_domain"),
  domainVerified: boolean("domain_verified").default(false),
  customCss: text("custom_css"),
  hideFooter: boolean("hide_footer").default(false),
  hidePoweredBy: boolean("hide_powered_by").default(false),
  customTermsUrl: varchar("custom_terms_url"),
  customPrivacyUrl: varchar("custom_privacy_url"),
  customSupportEmail: varchar("custom_support_email"),
  loginPageBackgroundImage: varchar("login_page_background_image"),
  loginPageWelcomeMessage: varchar("login_page_welcome_message"),
  loginPageSubtitle: varchar("login_page_subtitle"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WhiteLabelSettings = typeof whiteLabelSettings.$inferSelect;
export type UpsertWhiteLabelSettings = typeof whiteLabelSettings.$inferInsert;

export const insertWhiteLabelSettingsSchema = createInsertSchema(whiteLabelSettings).pick({
  logoUrl: true,
  faviconUrl: true,
  brandName: true,
  primaryColor: true,
  secondaryColor: true,
  accentColor: true,
  customDomain: true,
  domainVerified: true,
  customCss: true,
  hideFooter: true,
  hidePoweredBy: true,
  customTermsUrl: true,
  customPrivacyUrl: true,
  customSupportEmail: true,
  loginPageBackgroundImage: true,
  loginPageWelcomeMessage: true,
  loginPageSubtitle: true
});

export const updateUserSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  country: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(2, "Country is required"),
});

// Customer Conversations table for inbox management
export const customerConversations = pgTable("customer_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(), // Client who owns this conversation
  customerName: varchar("customer_name").notNull(),
  customerEmail: varchar("customer_email").notNull(),
  customerPhone: varchar("customer_phone"),
  channel: varchar("channel").default("email"), // email, whatsapp, sms, chat, etc.
  channelId: varchar("channel_id"), // External ID from the channel
  subject: varchar("subject"),
  status: varchar("status").default("open"), // open, closed, pending
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  unreadCount: integer("unread_count").default(0),
  metadata: jsonb("metadata").default('{}'), // Channel-specific metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Messages table for individual messages within conversations
export const customerMessages = pgTable("customer_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => customerConversations.id).notNull(),
  messageType: varchar("message_type").notNull(), // incoming, outgoing
  senderName: varchar("sender_name").notNull(),
  senderEmail: varchar("sender_email"),
  content: text("content").notNull(),
  messageId: varchar("message_id"), // External message ID from channel
  isRead: boolean("is_read").default(false),
  deliveryStatus: varchar("delivery_status").default("pending"), // pending, sent, delivered, failed
  replyToMessageId: integer("reply_to_message_id").references(() => customerMessages.id),
  attachments: jsonb("attachments").default('[]'), // File attachments
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Generated Replies table for tracking AI-assisted responses
export const aiGeneratedReplies = pgTable("ai_generated_replies", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => customerConversations.id).notNull(),
  originalMessageId: integer("original_message_id").references(() => customerMessages.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  replyType: varchar("reply_type").notNull(), // apology, order_update, refund_request, upsell, custom
  customInstructions: text("custom_instructions"), // For custom reply type
  generatedReply: text("generated_reply").notNull(),
  finalReply: text("final_reply"), // After editing
  confidence: integer("confidence").default(80), // 0-100
  generationTime: integer("generation_time").default(0), // milliseconds
  wasEdited: boolean("was_edited").default(false),
  status: varchar("status").default("draft"), // draft, sent, failed
  sentAt: timestamp("sent_at"),
  deliveryStatus: varchar("delivery_status").default("pending"), // pending, sent, delivered, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reply Templates table for quick responses
export const replyTemplates = pgTable("reply_templates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  replyType: varchar("reply_type").notNull(), // apology, order_update, refund_request, upsell, custom
  template: text("template").notNull(),
  isDefault: boolean("is_default").default(false),
  useCount: integer("use_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Optional for guest reviews
  userName: varchar("user_name"), // For guest reviews
  userEmail: varchar("user_email"), // For guest reviews
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  userName: true,
  userEmail: true,
  rating: true,
  title: true,
  content: true,
  isPublic: true,
});

export const insertContactSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

// Webhooks table for webhook endpoint management
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  events: text("events").array().notNull(),
  active: boolean("active").default(true),
  secret: varchar("secret").notNull(),
  headers: text("headers").default("{}"),
  retryCount: integer("retry_count").default(3),
  timeout: integer("timeout").default(30),
  lastTriggered: timestamp("last_triggered"),
  status: varchar("status").default("active"),
  totalDeliveries: integer("total_deliveries").default(0),
  successfulDeliveries: integer("successful_deliveries").default(0),
  failedDeliveries: integer("failed_deliveries").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type UpsertWebhook = typeof webhooks.$inferInsert;

export const insertWebhookSchema = createInsertSchema(webhooks).pick({
  name: true,
  url: true,
  events: true,
  secret: true,
  headers: true,
  retryCount: true,
  timeout: true,
  active: true
});

// Zapier integrations table
export const zapierIntegrations = pgTable("zapier_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  trigger: varchar("trigger").notNull(),
  zapierWebhookUrl: varchar("zapier_webhook_url").notNull(),
  active: boolean("active").default(true),
  filters: text("filters").default("{}"),
  lastExecution: timestamp("last_execution"),
  executionCount: integer("execution_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ZapierIntegration = typeof zapierIntegrations.$inferSelect;
export type UpsertZapierIntegration = typeof zapierIntegrations.$inferInsert;

// Webhook deliveries table for logging delivery attempts
export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhook_id").references(() => webhooks.id).notNull(),
  event: varchar("event").notNull(),
  status: varchar("status").notNull(),
  httpStatus: integer("http_status"),
  response: text("response"),
  duration: integer("duration"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type UpsertWebhookDelivery = typeof webhookDeliveries.$inferInsert;

// Custom Prompts table
export const customPrompts = pgTable("custom_prompts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: varchar("category"),
  tags: text("tags").array().default([]), // Array of tags
  tone: varchar("tone"),
  isPublic: boolean("is_public").default(false),
  isFavorite: boolean("is_favorite").default(false),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomPromptSchema = createInsertSchema(customPrompts).pick({
  title: true,
  description: true,
  content: true,
  category: true,
  tags: true,
  tone: true,
  isPublic: true,
});

export type CustomPrompt = typeof customPrompts.$inferSelect;
export type InsertCustomPrompt = z.infer<typeof insertCustomPromptSchema>;

// Brand Voice Training tables
export const brandVoiceProfiles = pgTable("brand_voice_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").default("Default Profile"),
  description: text("description"),
  status: varchar("status").default("needs_samples"), // training, ready, needs_samples
  accuracy: integer("accuracy").default(0), // 0-100
  samplesCount: integer("samples_count").default(0),
  toneCharacteristics: jsonb("tone_characteristics"), // formality, friendliness, etc.
  guidelines: text("guidelines").array().default([]),
  keyPhrases: text("key_phrases").array().default([]),
  avoidWords: text("avoid_words").array().default([]),
  lastTrained: timestamp("last_trained"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const brandVoiceSamples = pgTable("brand_voice_samples", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  profileId: integer("profile_id").references(() => brandVoiceProfiles.id),
  name: varchar("name").notNull(),
  content: text("content").notNull(),
  type: varchar("type").default("text"), // text, file, guideline
  category: varchar("category"),
  status: varchar("status").default("processing"), // processing, analyzed, error
  wordCount: integer("word_count").default(0),
  toneAnalysis: jsonb("tone_analysis"), // tone, confidence, characteristics, sentiment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const brandVoiceGuidelines = pgTable("brand_voice_guidelines", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  profileId: integer("profile_id").references(() => brandVoiceProfiles.id),
  brandPersonality: text("brand_personality"),
  communicationStyle: text("communication_style"),
  keyMessages: text("key_messages"),
  avoidanceRules: text("avoidance_rules"),
  targetAudience: text("target_audience"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBrandVoiceProfileSchema = createInsertSchema(brandVoiceProfiles).pick({
  name: true,
  description: true,
});

export const insertBrandVoiceSampleSchema = createInsertSchema(brandVoiceSamples).pick({
  name: true,
  content: true,
  type: true,
  category: true,
});

export const insertBrandVoiceGuidelinesSchema = createInsertSchema(brandVoiceGuidelines).pick({
  brandPersonality: true,
  communicationStyle: true,
  keyMessages: true,
  avoidanceRules: true,
  targetAudience: true,
});

export type BrandVoiceProfile = typeof brandVoiceProfiles.$inferSelect;
export type BrandVoiceSample = typeof brandVoiceSamples.$inferSelect;
export type BrandVoiceGuidelines = typeof brandVoiceGuidelines.$inferSelect;
export type InsertBrandVoiceProfile = z.infer<typeof insertBrandVoiceProfileSchema>;
export type InsertBrandVoiceSample = z.infer<typeof insertBrandVoiceSampleSchema>;
export type InsertBrandVoiceGuidelines = z.infer<typeof insertBrandVoiceGuidelinesSchema>;

// Team Collaboration tables
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  teamId: varchar("team_id").references(() => users.id).notNull(), // References the team owner's user ID
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  role: varchar("role").notNull().default("viewer"), // owner, admin, editor, viewer
  status: varchar("status").notNull().default("invited"), // active, invited, pending
  avatar: varchar("avatar"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  permissions: jsonb("permissions").default('{}')
});

export const teamInvitations = pgTable("team_invitations", {
  id: serial("id").primaryKey(),
  teamId: varchar("team_id").references(() => users.id).notNull(), // References the team owner's user ID
  email: varchar("email").notNull(),
  role: varchar("role").notNull().default("viewer"),
  message: text("message"),
  status: varchar("status").notNull().default("pending"), // pending, accepted, expired
  invitedBy: varchar("invited_by").references(() => users.id).notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull()
});

export const sharedPrompts = pgTable("shared_prompts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  teamId: varchar("team_id").references(() => users.id).notNull(), // References the team owner's user ID
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  sharedAt: timestamp("shared_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  permissions: varchar("permissions").notNull().default("view"), // view, edit
  isPublic: boolean("is_public").default(false),
  collaborators: jsonb("collaborators").default('[]'),
  tags: text("tags").array().default([])
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  teamId: true,
  name: true,
  email: true,
  role: true,
  status: true,
  avatar: true
});

export const insertTeamInvitationSchema = createInsertSchema(teamInvitations).pick({
  teamId: true,
  email: true,
  role: true,
  message: true,
  expiresAt: true
});

export const insertSharedPromptSchema = createInsertSchema(sharedPrompts).pick({
  title: true,
  content: true,
  category: true,
  teamId: true,
  permissions: true,
  isPublic: true,
  tags: true
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type SharedPrompt = typeof sharedPrompts.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertTeamInvitation = z.infer<typeof insertTeamInvitationSchema>;
export type InsertSharedPrompt = z.infer<typeof insertSharedPromptSchema>;

// Lead Capture tables
export const leadCaptureForms = pgTable("lead_capture_forms", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull().default("embed"), // embed, popup, widget, inline
  fields: jsonb("fields").default('[]'),
  styling: jsonb("styling").default('{}'),
  settings: jsonb("settings").default('{}'),
  status: varchar("status").notNull().default("active"), // active, paused, draft
  isPublic: boolean("is_public").default(true),
  submissions: integer("submissions").default(0),
  conversionRate: integer("conversion_rate").default(0), // percentage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const leadSubmissions = pgTable("lead_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => leadCaptureForms.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  data: jsonb("data").notNull(), // Contains all form field values
  source: varchar("source").default("direct"), // direct, website, social, referral
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: varchar("referrer"),
  status: varchar("status").default("new"), // new, contacted, qualified, converted, rejected
  tags: text("tags").array().default([]),
  notes: text("notes"),
  score: integer("score").default(0), // Lead scoring 0-100
  followUpDate: timestamp("follow_up_date"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  lastContactedAt: timestamp("last_contacted_at")
});

export const leadCaptureAnalytics = pgTable("lead_capture_analytics", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => leadCaptureForms.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  views: integer("views").default(0),
  submissions: integer("submissions").default(0),
  conversionRate: integer("conversion_rate").default(0), // percentage
  bounceRate: integer("bounce_rate").default(0), // percentage
  timeOnForm: integer("time_on_form").default(0), // seconds
  topSource: varchar("top_source").default("direct"),
  deviceType: varchar("device_type").default("desktop") // desktop, mobile, tablet
});

export const insertLeadCaptureFormSchema = createInsertSchema(leadCaptureForms).pick({
  name: true,
  title: true,
  description: true,
  type: true,
  fields: true,
  styling: true,
  settings: true,
  status: true,
  isPublic: true
});

export const insertLeadSubmissionSchema = createInsertSchema(leadSubmissions).pick({
  formId: true,
  data: true,
  source: true,
  ipAddress: true,
  userAgent: true,
  referrer: true,
  tags: true,
  notes: true,
  score: true
});

// Export History table
export const exportHistory = pgTable("export_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exportType: varchar("export_type").notNull(), // pdf, csv, txt, json
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").default(0), // in bytes
  recordCount: integer("record_count").default(0), // number of conversations/responses exported
  dateRange: jsonb("date_range"), // { from: date, to: date }
  filters: jsonb("filters"), // applied filters during export
  status: varchar("status").default("completed"), // processing, completed, failed
  downloadUrl: varchar("download_url"), // temporary download link
  expiresAt: timestamp("expires_at"), // when download link expires
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertExportHistorySchema = createInsertSchema(exportHistory).pick({
  exportType: true,
  fileName: true,
  fileSize: true,
  recordCount: true,
  dateRange: true,
  filters: true,
  status: true,
  downloadUrl: true,
  expiresAt: true
});

export type ExportHistory = typeof exportHistory.$inferSelect;
export type InsertExportHistory = z.infer<typeof insertExportHistorySchema>;

export type LeadCaptureForm = typeof leadCaptureForms.$inferSelect;
export type LeadSubmission = typeof leadSubmissions.$inferSelect;
export type LeadCaptureAnalytics = typeof leadCaptureAnalytics.$inferSelect;
export type InsertLeadCaptureForm = z.infer<typeof insertLeadCaptureFormSchema>;
export type InsertLeadSubmission = z.infer<typeof insertLeadSubmissionSchema>;

export type InsertAiResponse = z.infer<typeof insertAiResponseSchema>;
export type AiResponse = typeof aiResponses.$inferSelect;
export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Customer conversation types
export type CustomerConversation = typeof customerConversations.$inferSelect;
export type CustomerMessage = typeof customerMessages.$inferSelect;
export type AiGeneratedReply = typeof aiGeneratedReplies.$inferSelect;
export type ReplyTemplate = typeof replyTemplates.$inferSelect;

export type InsertCustomerConversation = typeof customerConversations.$inferInsert;
export type InsertCustomerMessage = typeof customerMessages.$inferInsert;
export type InsertAiGeneratedReply = typeof aiGeneratedReplies.$inferInsert;
export type InsertReplyTemplate = typeof replyTemplates.$inferInsert;

// Schema validation for API requests
export const insertCustomerConversationSchema = createInsertSchema(customerConversations).pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  channel: true,
  channelId: true,
  subject: true,
  status: true,
  priority: true,
  metadata: true,
});

export const insertCustomerMessageSchema = createInsertSchema(customerMessages).pick({
  conversationId: true,
  messageType: true,
  senderName: true,
  senderEmail: true,
  content: true,
  messageId: true,
  replyToMessageId: true,
  attachments: true,
  metadata: true,
});

export const insertAiGeneratedReplySchema = createInsertSchema(aiGeneratedReplies).pick({
  conversationId: true,
  originalMessageId: true,
  replyType: true,
  customInstructions: true,
  generatedReply: true,
  finalReply: true,
  confidence: true,
  generationTime: true,
  wasEdited: true,
});

export const generateReplyRequestSchema = z.object({
  conversationId: z.number(),
  messageId: z.number(),
  replyType: z.enum(["apology", "order_update", "refund_request", "upsell", "custom"]),
  customInstructions: z.string().optional(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
