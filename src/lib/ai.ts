import OpenAI from 'openai';

let _openai: OpenAI | null = null;

function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
    });
  }
  return _openai;
}

/**
 * Generates a professional and friendly response to a customer review using GPT-4o.
 * 
 * @param reviewContent The content of the customer review
 * @param businessName The name of the business receiving the review
 * @param tone The desired tone for the response (e.g., "Professional & Friendly", "Casual & Energetic")
 * @param customInstructions Any additional instructions to follow for the response
 * @returns A promise that resolves to the generated response string
 */
export async function generateResponse(
  reviewContent: string,
  businessName: string,
  tone: string,
  customInstructions?: string
): Promise<string> {
  const openai = getOpenAI();
  try {
    const systemPrompt = `
You are an AI review responder for ${businessName}. Your goal is to write professional, friendly, and helpful responses to customer reviews.

Rules:
1. Adapt your writing style to the specified tone: "${tone}".
2. Thank the reviewer for their feedback.
3. Address specific points mentioned in the review (positive or negative).
4. For negative reviews, be empathetic and offer a way to resolve the issue offline if appropriate.
5. Never be defensive, argumentative, or rude.
6. Follow these custom instructions if provided: "${customInstructions || 'None'}".
7. Keep the response concise (usually 2-4 sentences).
8. Sign off as "The ${businessName} Team".
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Review to respond to:\n\n"${reviewContent}"` },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const generatedText = response.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error('OpenAI returned an empty response');
    }

    return generatedText;
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    
    // Handle specific OpenAI errors if needed
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI API Error (${error.status}):`, error.message);
      throw new Error(`AI Service Error: ${error.message}`);
    }
    
    throw new Error('Failed to generate review response. Please try again later.');
  }
}
