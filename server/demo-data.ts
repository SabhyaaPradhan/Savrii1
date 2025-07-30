import { db } from "./db";
import { customerConversations, customerMessages, aiGeneratedReplies, replyTemplates } from "@shared/schema";

export async function seedInboxDemoData(userId: string) {
  try {
    // Create sample conversations
    const [conversation1] = await db.insert(customerConversations).values({
      userId,
      customerName: "Sarah Johnson",
      customerEmail: "sarah.johnson@email.com",
      customerPhone: "+1-555-0123",
      channel: "email",
      subject: "Order Delivery Issue",
      status: "open",
      priority: "high",
      lastMessageAt: new Date(),
      unreadCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    const [conversation2] = await db.insert(customerConversations).values({
      userId,
      customerName: "Mike Chen",
      customerEmail: "mike.chen@email.com",
      channel: "whatsapp",
      subject: "Product Return Request",
      status: "pending",
      priority: "normal",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      updatedAt: new Date(),
    }).returning();

    const [conversation3] = await db.insert(customerConversations).values({
      userId,
      customerName: "Emma Davis",
      customerEmail: "emma.davis@email.com",
      channel: "email",
      subject: "Product Inquiry",
      status: "closed",
      priority: "low",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      updatedAt: new Date(),
    }).returning();

    // Add messages to conversations
    await db.insert(customerMessages).values([
      {
        conversationId: conversation1.id,
        messageType: "incoming",
        senderName: "Sarah Johnson",
        senderEmail: "sarah.johnson@email.com",
        content: "Hi, I ordered a product 5 days ago (Order #12345) and it still hasn't arrived. The tracking shows it was delivered but I never received it. Can you please help me resolve this issue?",
        isRead: false,
        deliveryStatus: "delivered",
        createdAt: new Date(),
      },
      {
        conversationId: conversation2.id,
        messageType: "incoming",
        senderName: "Mike Chen",
        senderEmail: "mike.chen@email.com",
        content: "I received my order yesterday but the item doesn't match what I ordered. I ordered a blue XL shirt but received a red Medium. I'd like to return this and get the correct item.",
        isRead: true,
        deliveryStatus: "delivered",
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        conversationId: conversation2.id,
        messageType: "outgoing",
        senderName: "Support Team",
        senderEmail: "support@company.com",
        content: "Hi Mike, I'm sorry to hear about the mix-up with your order. I've initiated a return process for you and will send the correct blue XL shirt right away. You should receive a return label via email within the next hour.",
        isRead: true,
        deliveryStatus: "sent",
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        conversationId: conversation3.id,
        messageType: "incoming",
        senderName: "Emma Davis",
        senderEmail: "emma.davis@email.com",
        content: "Hi, I'm interested in your wireless headphones. Do they have noise cancellation and what's the battery life?",
        isRead: true,
        deliveryStatus: "delivered",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
      },
      {
        conversationId: conversation3.id,
        messageType: "outgoing",
        senderName: "Support Team",
        senderEmail: "support@company.com",
        content: "Hi Emma, yes our wireless headphones feature active noise cancellation and have up to 30 hours of battery life. They're currently on sale for 20% off. Would you like me to send you more details?",
        isRead: true,
        deliveryStatus: "sent",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
      },
    ]);

    // Create sample reply templates
    await db.insert(replyTemplates).values([
      {
        userId,
        name: "Apology for Delivery Issues",
        replyType: "apology",
        template: "I sincerely apologize for the delivery issue with your order. Let me investigate this immediately and find a solution for you.",
        isDefault: true,
        useCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        name: "Order Status Update",
        replyType: "order_update",
        template: "Thank you for contacting us about your order. I've checked the status and here's what I found:",
        isDefault: true,
        useCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        name: "Refund Processing",
        replyType: "refund_request",
        template: "I understand you'd like to process a refund. I'll be happy to help you with that. Let me start the refund process for you right away.",
        isDefault: true,
        useCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log("✅ Demo inbox data created successfully");
    return true;
  } catch (error) {
    console.error("❌ Error creating demo inbox data:", error);
    return false;
  }
}