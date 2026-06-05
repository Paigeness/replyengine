import OpenAI from 'openai';
import { Review, Organization, ResponseTemplate, GenerationResult } from '../types';
import { getSystemPrompt, getUserPrompt } from '../templates/prompts';
import { SentimentService } from './sentiment';

export class AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  public async generateResponse(
    review: Review,
    organization: Organization,
    template: ResponseTemplate
  ): Promise<GenerationResult> {
    const sentiment = SentimentService.classify(review.rating);
    const escalation = SentimentService.detectEscalation(review);

    if (escalation.isNeeded) {
      return {
        content: '',
        sentiment,
        model: 'n/a',
        is_escalation_needed: true,
        escalation_reason: escalation.reason,
      };
    }

    const systemPrompt = getSystemPrompt(organization.name, template.tone);
    const userPrompt = getUserPrompt(review.content, review.rating);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content?.trim() || '';

      // Quality Check
      const qualityError = this.checkQuality(content);
      if (qualityError) {
        return {
          content,
          sentiment,
          model: 'gpt-4o',
          is_escalation_needed: true,
          escalation_reason: `Quality check failed: ${qualityError}`,
        };
      }

      return {
        content,
        sentiment,
        model: 'gpt-4o',
        is_escalation_needed: false,
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private checkQuality(content: string): string | null {
    if (content.length < 10) return 'Response too short';
    if (content.length > 500) return 'Response too long';
    
    const profanity = ['badword1', 'badword2']; // Placeholder for real profanity filter
    if (profanity.some(word => content.toLowerCase().includes(word))) {
      return 'Response contains prohibited language';
    }

    return null;
  }
}
