import { AIService } from '../src/services/ai';
import { Review, Organization, ResponseTemplate } from '../src/types';
import OpenAI from 'openai';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };
  });
});

describe('AIService', () => {
  let aiService: AIService;
  let mockOpenAIInstance: any;

  const organization: Organization = { id: 'org1', name: 'Test Pizza' };
  const template: ResponseTemplate = { tone: 'friendly', business_name: 'Test Pizza' };
  const review: Review = {
    id: '1',
    location_id: 'loc1',
    source: 'google',
    author_name: 'John',
    rating: 5,
    content: 'Best pizza ever!',
    posted_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService('test');
    mockOpenAIInstance = (aiService as any).openai;
  });

  it('should generate a response for a positive review', async () => {
    mockOpenAIInstance.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'Thank you for the kind words, John! We are glad you enjoyed the pizza. Test Pizza Team' } }],
    });

    const result = await aiService.generateResponse(review, organization, template);

    expect(result.is_escalation_needed).toBe(false);
    expect(result.content).toContain('Thank you');
    expect(result.sentiment).toBe('positive');
  });

  it('should trigger escalation for quality check failure (too short)', async () => {
    mockOpenAIInstance.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'Hi' } }],
    });

    const result = await aiService.generateResponse(review, organization, template);

    expect(result.is_escalation_needed).toBe(true);
    expect(result.escalation_reason).toContain('Quality check failed: Response too short');
  });

  it('should return escalation immediately for high-risk content', async () => {
    // "poison" is a safety keyword in my updated SentimentService
    const negativeReview: Review = { ...review, rating: 4, content: 'I found poison in my food!' };
    
    const result = await aiService.generateResponse(negativeReview, organization, template);

    expect(result.is_escalation_needed).toBe(true);
    expect(result.escalation_reason).toContain('health/safety issue');
    expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled();
  });
});
