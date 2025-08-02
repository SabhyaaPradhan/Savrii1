import Together from "together-ai";

// Initialize the Together AI client with proper error handling
let together: Together | null = null;

try {
  if (process.env.TOGETHER_API_KEY) {
    together = new Together({ 
      apiKey: process.env.TOGETHER_API_KEY
    });
  } else {
    console.warn("TOGETHER_API_KEY not set. Using fallback responses.");
  }
} catch (error) {
  console.error("Failed to initialize Together AI client:", error);
}

export interface GenerateReplyOptions {
  clientMessage: string;
  queryType: 'refund_request' | 'shipping_delay' | 'product_howto' | 'general';
  tone: 'professional' | 'friendly' | 'casual';
  context?: string;
}

export interface GenerateReplyResponse {
  reply: string;
  confidence: number;
  generationTime: number;
}

export async function generateClientReply(
  clientMessage: string,
  queryType: string = "general",
  tone: string = "professional"
): Promise<{
  response: string;
  confidence: number;
  generationTime: number;
}> {
  const startTime = Date.now();
  
  // Temporarily provide a fallback response for development
  const fallbackResponses = {
    refund_request: "I understand you're requesting a refund. I'll be happy to help you with that process. Could you please provide your order number and the reason for the refund request?",
    shipping_delay: "I apologize for the shipping delay. Let me check the status of your order and provide you with an updated delivery timeline.",
    product_howto: "I'd be happy to help you with instructions for using our product. Could you please specify which product you need help with?",
    general: "Thank you for reaching out to our customer support team. I'm here to help you with any questions or concerns you may have."
  };
  
  const response = fallbackResponses[queryType as keyof typeof fallbackResponses] || fallbackResponses.general;
  const generationTime = Date.now() - startTime;
  
  return {
    response: response,
    confidence: 85,
    generationTime
  };
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  // If Together AI client is not initialized, return fallback response
  if (!together) {
    return {
      rating: 4,
      confidence: 0.8
    };
  }
  
  try {
    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3-70b-chat-hf",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    // Safely parse the response
    let result;
    try {
      result = JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      console.error("Error parsing sentiment analysis response:", parseError);
      result = {};
    }

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return {
      rating: 3,
      confidence: 0.5,
    };
  }
}
