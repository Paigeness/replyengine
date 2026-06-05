export type ReviewSentiment = 'positive' | 'neutral' | 'negative';

export interface Review {
  id: string;
  location_id: string;
  source: 'google' | 'yelp' | 'tripadvisor';
  author_name: string;
  rating: number;
  content: string;
  posted_at: Date;
}

export interface Organization {
  id: string;
  name: string;
}

export interface ResponseTemplate {
  tone: 'professional' | 'friendly' | 'enthusiastic';
  business_name: string;
}

export interface GenerationResult {
  content: string;
  sentiment: ReviewSentiment;
  model: string;
  is_escalation_needed: boolean;
  escalation_reason?: string;
}
