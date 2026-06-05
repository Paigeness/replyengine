import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AIService } from './ai';
import { SentimentService } from './sentiment';
import { Review, GenerationResult } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export class ResponsePipeline {
  private supabase: SupabaseClient;
  private aiService: AIService;
  private sentimentService: SentimentService;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.aiService = new AIService();
    this.sentimentService = new SentimentService();
  }

  async processPendingReviews() {
    console.log('Fetching pending reviews...');
    
    // Fetch reviews that don't have a response record yet
    const { data: reviews, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        locations (
          id,
          organization_id,
          name
        )
      `)
      .eq('responded', false);

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    console.log(`Found ${reviews?.length || 0} reviews to process.`);

    for (const reviewData of reviews || []) {
      try {
        await this.processSingleReview(reviewData);
      } catch (err) {
        console.error(`Failed to process review ${reviewData.id}:`, err);
      }
    }
  }

  private async processSingleReview(reviewData: any) {
    const review: Review = {
      id: reviewData.id,
      rating: reviewData.rating,
      content: reviewData.content,
      authorName: reviewData.author_name,
      source: reviewData.source,
      postedAt: new Date(reviewData.posted_at)
    };

    const location = reviewData.locations;
    const organizationId = location.organization_id;

    console.log(`Processing review ${review.id} for location ${location.name}...`);

    // 1. Determine sentiment and check for escalation
    const sentiment = this.sentimentService.analyze(review);
    
    if (sentiment.escalate) {
      console.log(`Review ${review.id} flagged for escalation. Reason: ${sentiment.escalationReason}`);
      // Update review status in DB if needed, or just let the human handle it
      // For now, we skip auto-generation for escalated reviews or we can generate a draft
    }

    // 2. Fetch response templates for the organization
    const { data: templates } = await this.supabase
      .from('response_templates')
      .select('*')
      .eq('organization_id', organizationId);

    // Find the best template
    const template = templates?.find(t => t.is_default) || templates?.[0];

    // 3. Generate response
    const generationResult = await this.aiService.generateResponse(
      review,
      { id: organizationId, name: 'Client Organization' }, // We could fetch org details if needed
      template
    );

    // 4. Store the response
    const { data: response, error: responseError } = await this.supabase
      .from('responses')
      .insert({
        review_id: review.id,
        location_id: location.id,
        content: generationResult.content,
        ai_model: 'gpt-4o',
        approved: false, // Needs human approval by default
        posted: false
      })
      .select()
      .single();

    if (responseError) {
      throw new Error(`Error storing response: ${responseError.message}`);
    }

    // 5. Update review as responded (meaning it has a generated response)
    const { error: updateError } = await this.supabase
      .from('reviews')
      .update({ responded: true, our_response: generationResult.content })
      .eq('id', review.id);

    if (updateError) {
      console.error(`Error updating review ${review.id}:`, updateError);
    }

    console.log(`Response generated and stored for review ${review.id}. Response ID: ${response.id}`);
  }
}
