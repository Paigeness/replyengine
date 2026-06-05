import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { YelpService, YelpReview } from './yelp';
import { EmailService } from 'email';
import { AIService } from 'ai-engine';
import * as dotenv from 'dotenv';

dotenv.config();

export class YelpPipeline {
  private supabase: SupabaseClient;
  private emailService: EmailService;
  private aiService: AIService;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    const resendApiKey = process.env.RESEND_API_KEY || '';
    this.emailService = new EmailService(resendApiKey);
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.aiService = new AIService(openaiApiKey);
  }

  async syncAllReviews() {
    console.log('Starting Yelp reviews sync...');

    const { data: integrations, error } = await this.supabase
      .from('integrations')
      .select('organization_id, settings')
      .eq('source', 'yelp');

    if (error) {
      console.error('Error fetching Yelp integrations:', error);
      return;
    }

    for (const integration of integrations || []) {
      try {
        const apiKey = (integration.settings as any)?.apiKey || process.env.YELP_API_KEY;
        if (!apiKey) {
          console.warn(`No API key for Yelp integration in organization ${integration.organization_id}`);
          continue;
        }

        const yelpService = new YelpService(apiKey);
        await this.syncOrganizationReviews(integration.organization_id, yelpService);
      } catch (err) {
        console.error(`Failed to sync Yelp reviews for organization ${integration.organization_id}:`, err);
      }
    }
  }

  async syncOrganizationReviews(organizationId: string, yelpService: YelpService) {
    const { data: locations, error } = await this.supabase
      .from('locations')
      .select('id, name, yelp_business_id')
      .eq('organization_id', organizationId)
      .not('yelp_business_id', 'is', null);

    if (error) {
      throw new Error(`Error fetching locations: ${error.message}`);
    }

    // Get organization owner email
    const { data: owners } = await this.supabase
      .from('users')
      .select('email')
      .eq('organization_id', organizationId)
      .eq('role', 'owner')
      .single();

    const ownerEmail = owners?.email;

    for (const location of locations || []) {
      await this.syncLocationReviews(location, yelpService, organizationId, ownerEmail);
    }
  }

  private async syncLocationReviews(location: any, yelpService: YelpService, organizationId: string, ownerEmail?: string) {
    console.log(`Fetching Yelp reviews for location: ${location.name} (${location.yelp_business_id})`);

    try {
      const yelpReviews = await yelpService.fetchReviews(location.yelp_business_id);
      
      for (const yReview of yelpReviews) {
        await this.handleReview(location, yReview, organizationId, ownerEmail);
      }
      
      console.log(`Synced ${yelpReviews.length} Yelp reviews for ${location.name}.`);
    } catch (err) {
      console.error(`Error syncing Yelp location ${location.id}:`, err);
    }
  }

  private async handleReview(location: any, yReview: YelpReview, organizationId: string, ownerEmail?: string) {
    // Check if review already exists
    const { data: existingReview } = await this.supabase
      .from('reviews')
      .select('id')
      .eq('source', 'yelp')
      .eq('source_review_id', yReview.id)
      .single();

    if (existingReview) {
      // Review already exists, skip or update (Yelp reviews don't change much)
      return;
    }

    // New review!
    console.log(`New Yelp review detected: ${yReview.id}`);

    // 1. Insert review
    const { data: newReview, error: insertError } = await this.supabase
      .from('reviews')
      .insert({
        location_id: location.id,
        source: 'yelp',
        source_review_id: yReview.id,
        author_name: yReview.user.name,
        rating: yReview.rating,
        content: yReview.text,
        posted_at: yReview.time_created,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error(`Error inserting Yelp review ${yReview.id}:`, insertError.message);
      return;
    }

    // 2. Generate AI draft
    try {
      // Fetch templates
      const { data: templates } = await this.supabase
        .from('response_templates')
        .select('*')
        .eq('organization_id', organizationId);
      
      const template = templates?.find(t => t.is_default) || templates?.[0];

      const generationResult = await this.aiService.generateResponse(
        {
          id: newReview.id,
          rating: newReview.rating,
          content: newReview.content,
          authorName: newReview.author_name,
          source: 'yelp',
          postedAt: new Date(newReview.posted_at)
        },
        { id: organizationId, name: location.name }, // Simplified
        template
      );

      // Store response
      await this.supabase
        .from('responses')
        .insert({
          review_id: newReview.id,
          location_id: location.id,
          content: generationResult.content,
          ai_model: 'gpt-4o',
          approved: false,
          posted: false
        });

      // Update review
      await this.supabase
        .from('reviews')
        .update({ responded: true, our_response: generationResult.content })
        .eq('id', newReview.id);

      // 3. Send email notification (Yelp workaround)
      if (ownerEmail) {
        await this.emailService.sendDraftResponse(
          ownerEmail,
          location.name,
          newReview.content,
          generationResult.content,
          yReview.url
        );
        console.log(`Notification sent to ${ownerEmail} for review ${newReview.id}`);
      }
    } catch (err) {
      console.error(`Failed to handle new Yelp review ${newReview.id}:`, err);
    }
  }
}
