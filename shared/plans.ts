export interface PlanFeatures {
  name: string;
  price: number;
  currency: string;
  interval: string;
  trialDays?: number;
  queries: string;
  aiResponses: string;
  support: string;
  integrations: string;
  analytics: string;
  customPrompts: boolean;
  brandVoiceTraining: boolean;
  apiAccess: boolean;
  whiteLabelOptions: boolean;
  features: string[];
  allowedFeatures: string[];
  queryLimit: number;
  teamMembers: number;
  fileUploads: boolean;
  sso: boolean;
  webhooks: boolean;
  modelSwitching: boolean;
  dataCompliance: boolean;
  customDomain: boolean;
}

export const PLANS: Record<string, PlanFeatures> = {
  starter: {
    name: "Starter (Free)",
    price: 0,
    currency: "USD",
    interval: "month",
    trialDays: 14,
    queries: "100 per month",
    aiResponses: "Basic AI responses",
    support: "Email support",
    integrations: "1 integration",
    analytics: "Basic analytics",
    customPrompts: false,
    brandVoiceTraining: false,
    apiAccess: false,
    whiteLabelOptions: false,
    queryLimit: 100,
    teamMembers: 1,
    fileUploads: false,
    sso: false,
    webhooks: false,
    modelSwitching: false,
    dataCompliance: false,
    customDomain: false,
    allowedFeatures: [
      "basic_responses",
      "email_support", 
      "basic_analytics",
      "single_integration"
    ],
    features: [
      "100 queries per month",
      "Basic AI responses", 
      "Email support",
      "1 integration",
      "Basic analytics"
    ]
  },
  pro: {
    name: "Pro", 
    price: 29,
    currency: "USD",
    interval: "month",
    queries: "5,000 per month",
    aiResponses: "Advanced AI responses",
    support: "Priority support",
    integrations: "All integrations",
    analytics: "Advanced analytics",
    customPrompts: true,
    brandVoiceTraining: true,
    apiAccess: false,
    whiteLabelOptions: false,
    queryLimit: 5000,
    teamMembers: 3,
    fileUploads: true,
    sso: false,
    webhooks: false,
    modelSwitching: false,
    dataCompliance: false,
    customDomain: false,
    allowedFeatures: [
      "basic_responses",
      "advanced_responses",
      "priority_support",
      "all_integrations", 
      "advanced_analytics",
      "prompt_builder",
      "brand_voice_training",
      "multilingual_support",
      "prompt_templates",
      "daily_summary",
      "lead_capture",
      "team_collaboration",
      "conversation_export",
      "file_uploads"
    ],
    features: [
      "5,000 queries per month",
      "Advanced AI responses",
      "Priority support", 
      "All integrations",
      "Advanced analytics",
      "Custom prompt builder",
      "Brand voice training",
      "Multilingual support",
      "Prompt library templates",
      "Daily summary email",
      "Lead capture forms",
      "Team collaboration (3 users)",
      "Conversation history export"
    ]
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    currency: "USD", 
    interval: "month",
    queries: "Unlimited",
    aiResponses: "Premium AI responses",
    support: "24/7 phone & chat support",
    integrations: "All integrations",
    analytics: "Real-time analytics",
    customPrompts: true,
    brandVoiceTraining: true,
    apiAccess: true,
    whiteLabelOptions: true,
    queryLimit: -1,
    teamMembers: -1,
    fileUploads: true,
    sso: true,
    webhooks: true,
    modelSwitching: true,
    dataCompliance: true,
    customDomain: true,
    allowedFeatures: [
      "basic_responses",
      "advanced_responses", 
      "premium_responses",
      "phone_chat_support",
      "realtime_analytics",
      "api_access",
      "white_label",
      "unlimited_team",
      "account_manager",
      "data_compliance",
      "custom_domain",
      "webhooks_zapier",
      "fine_tuned_ai",
      "model_switching",
      "custom_workflows",
      "unlimited_uploads",
      "sso"
    ],
    features: [
      "Unlimited queries",
      "Premium AI responses",
      "24/7 phone & chat support",
      "Real-time analytics", 
      "API access",
      "White-label options",
      "Unlimited team members",
      "Dedicated account manager",
      "Data compliance tools (GDPR export, audit logs)",
      "Custom domain integration",
      "Webhook & Zapier support",
      "Fine-tuned AI (trained on user's own data)",
      "Model switching (GPT-4, Claude, etc.)",
      "Custom AI workflows",
      "Unlimited file uploads",
      "SSO (Single Sign-On)"
    ]
  }
};

export function getPlanFeatures(planName: string): PlanFeatures {
  return PLANS[planName] || PLANS.starter;
}

export function isTrialExpired(user: any): boolean {
  if (!user || !user.trialEnd) return false;
  if (user.plan !== 'starter' && user.plan !== 'free_trial') return false;
  return new Date() > new Date(user.trialEnd);
}

export const FEATURE_ACCESS = {
  // Pro features
  prompt_builder: { starter: false, pro: true, enterprise: true },
  brand_voice: { starter: false, pro: true, enterprise: true },
  prompt_templates: { starter: false, pro: true, enterprise: true },
  all_integrations: { starter: false, pro: true, enterprise: true },
  team_collaboration: { starter: false, pro: true, enterprise: true },
  advanced_analytics: { starter: false, pro: true, enterprise: true },
  daily_reports: { starter: false, pro: true, enterprise: true },
  lead_capture: { starter: false, pro: true, enterprise: true },
  export_data: { starter: false, pro: true, enterprise: true },
  
  // Enterprise features
  real_time_analytics: { starter: false, pro: false, enterprise: true },
  workflow_automation: { starter: false, pro: false, enterprise: true },
  custom_ai_model: { starter: false, pro: false, enterprise: true },
  webhooks: { starter: false, pro: false, enterprise: true },
  white_label: { starter: false, pro: false, enterprise: true },
  security_compliance: { starter: false, pro: false, enterprise: true },
};

export function canAccessFeature(user: any, feature: string): boolean {
  if (!user) return false;
  
  // Check if trial has expired for starter users  
  if ((user.plan === 'starter' || user.plan === 'free_trial') && isTrialExpired(user)) {
    return false; // No features available after trial expires
  }
  
  // Check FEATURE_ACCESS mapping
  if (FEATURE_ACCESS[feature as keyof typeof FEATURE_ACCESS]) {
    const access = FEATURE_ACCESS[feature as keyof typeof FEATURE_ACCESS];
    return access[user.plan as keyof typeof access] || false;
  }
  
  const plan = getPlanFeatures(user.plan);
  
  // Check if feature is in allowedFeatures list
  if (plan.allowedFeatures && plan.allowedFeatures.includes(feature)) {
    return true;
  }
  
  // Legacy feature checks for backward compatibility
  switch (feature) {
    case 'customPrompts':
    case 'prompt_builder':
      return plan.customPrompts;
    case 'brandVoiceTraining':
    case 'brand_voice_training':
      return plan.brandVoiceTraining;
    case 'apiAccess':
    case 'api_access':
      return plan.apiAccess;
    case 'whiteLabelOptions':
    case 'white_label':
      return plan.whiteLabelOptions;
    case 'advancedAnalytics':
    case 'advanced_analytics':
      return user.plan !== 'starter' && user.plan !== 'free_trial';
    case 'realtime_analytics':
      return user.plan === 'enterprise';
    case 'team_collaboration':
      return user.plan === 'pro' || user.plan === 'enterprise';
    case 'unlimited_team':
      return user.plan === 'enterprise';
    case 'sso':
      return plan.sso;
    case 'webhooks_zapier':
      return plan.webhooks;
    case 'model_switching':
      return plan.modelSwitching;
    case 'data_compliance':
      return plan.dataCompliance;
    case 'custom_domain':
      return plan.customDomain;
    case 'file_uploads':
      return plan.fileUploads;
    default:
      return false;
  }
}

export function getUpgradeTarget(currentPlan: string, feature: string): string {
  // Determine which plan the user needs to upgrade to for a specific feature
  if (PLANS.pro.allowedFeatures.includes(feature)) {
    return currentPlan === 'starter' || currentPlan === 'free_trial' ? 'pro' : 'enterprise';
  }
  if (PLANS.enterprise.allowedFeatures.includes(feature)) {
    return 'enterprise';
  }
  return 'pro'; // Default fallback
}

export function getDaysLeftInTrial(user: { trialEnd?: Date | null; plan: string }): number {
  if (user.plan !== "starter" || !user.trialEnd) return 0;
  const now = new Date();
  const trialEnd = new Date(user.trialEnd);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getCurrentTrialDay(user: { planStartDate?: Date | null; plan: string }): number {
  if (user.plan !== "starter" || !user.planStartDate) return 1;
  
  const now = new Date();
  const startDate = new Date(user.planStartDate);
  
  // Calculate calendar days difference (rolls over at midnight)
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const daysDifference = Math.floor((nowDate.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(1, Math.min(14, daysDifference + 1)); // Day 1-14
}