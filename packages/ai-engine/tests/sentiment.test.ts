import { SentimentService } from '../src/services/sentiment';
import { Review } from '../src/types';

describe('SentimentService', () => {
  describe('classify', () => {
    it('should classify 4-5 stars as positive', () => {
      expect(SentimentService.classify(5)).toBe('positive');
      expect(SentimentService.classify(4)).toBe('positive');
    });

    it('should classify 3 stars as neutral', () => {
      expect(SentimentService.classify(3)).toBe('neutral');
    });

    it('should classify 1-2 stars as negative', () => {
      expect(SentimentService.classify(2)).toBe('negative');
      expect(SentimentService.classify(1)).toBe('negative');
    });
  });

  describe('detectEscalation', () => {
    const baseReview: Review = {
      id: '1',
      location_id: 'loc1',
      source: 'google',
      author_name: 'Test',
      rating: 5,
      content: 'Great place!',
      posted_at: new Date(),
    };

    it('should detect escalation for negative review with "lawsuit"', () => {
      const review = { ...baseReview, rating: 1, content: 'I am going to file a lawsuit!' };
      const result = SentimentService.detectEscalation(review);
      expect(result.isNeeded).toBe(true);
      expect(result.reason).toContain('lawsuit');
    });

    it('should detect escalation for mention of "sick"', () => {
      const review = { ...baseReview, rating: 4, content: 'The food was okay but I got sick later.' };
      const result = SentimentService.detectEscalation(review);
      expect(result.isNeeded).toBe(true);
      expect(result.reason).toContain('sick');
    });

    it('should not detect escalation for normal positive review', () => {
      const result = SentimentService.detectEscalation(baseReview);
      expect(result.isNeeded).toBe(false);
    });

    it('should not detect escalation for normal negative review without keywords', () => {
      const review = { ...baseReview, rating: 2, content: 'Slow service and cold food.' };
      const result = SentimentService.detectEscalation(review);
      expect(result.isNeeded).toBe(false);
    });
  });
});
