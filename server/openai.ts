import Together from "together-ai";

const together = new Together({ 
  apiKey: process.env.TOGETHER_API_KEY
});

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
  
  try {
    // Simple, direct system prompt as requested
    const systemPrompt = "You are an AI assistant for customer support. Always respond clearly, directly, and helpfully to user messages. Avoid generic replies like 'Thank you for your message'. Address the question with specific solutions or actions.";

    // Using Together.ai with a high-quality model
    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3-70b-chat-hf",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: clientMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedText = response.choices[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error("Together.ai returned an empty response");
    }

    const generationTime = Date.now() - startTime;
    
    // Calculate confidence based on response quality
    let confidence = 0.85;
    if (response.choices[0].finish_reason === "stop") {
      confidence = 0.95;
    }
    if (generatedText.length > 100) {
      confidence = Math.min(confidence + 0.05, 1.0);
    }

    return {
      response: generatedText.trim(),
      confidence: Math.round(confidence * 100),
      generationTime
    };
    
  } catch (error: any) {
    console.error("Together.ai API Error:", error);
    
    // Handle specific error types and throw to be caught by route handler
    if (error.code === 'insufficient_quota' || error.status === 429) {
      throw new Error("Together.ai API quota exceeded. Please check your account limits.");
    }
    
    if (error.code === 'invalid_api_key' || error.status === 401) {
      throw new Error("Invalid Together.ai API key. Please check your API configuration.");
    }
    
    // Re-throw the error instead of providing fallback
    throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
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

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');

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
