import { Review, ReviewSentiment } from '../types';

export class SentimentService {
  private static readonly ESCALATION_KEYWORDS = [
    'sue', 'lawsuit', 'attorney', 'complaint', 'refund', 
    'legal', 'court', 'police', 'injury', 'poison',
    'sick', 'hospital', 'safety', 'danger', 'attorney',
    'lawyer', 'legal action'
  ];

  public static classify(rating: number): ReviewSentiment {
    if (rating >= 4) return 'positive';
    if (rating === 3) return 'neutral';
    return 'negative';
  }

  public static detectEscalation(review: Review): { isNeeded: boolean; reason?: string } {
    const content = review.content.toLowerCase();
    
    // Rule 1: Rating 1-2 with specific keywords
    if (review.rating <= 2) {
      const foundKeyword = this.ESCALATION_KEYWORDS.find(keyword => content.includes(keyword));
      if (foundKeyword) {
        return { 
          isNeeded: true, 
          reason: `Negative review contains high-risk keyword: "${foundKeyword}"` 
        };
      }
    }

    // Rule 2: Health/Safety mentions regardless of rating (though usually low)
    const safetyKeywords = ['poison', 'sick', 'hospital', 'injury', 'danger'];
    const foundSafety = safetyKeywords.find(keyword => content.includes(keyword));
    if (foundSafety) {
      return { 
        isNeeded: true, 
        reason: `Review mentions health/safety issue: "${foundSafety}"` 
      };
    }

    return { isNeeded: false };
  }
}
