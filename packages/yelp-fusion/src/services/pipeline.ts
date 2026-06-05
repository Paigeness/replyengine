import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { YelpService, YelpReview } from './yelp';
import * as dotenv from 'dotenv';

dotenv.config();

export class YelpPipeline {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async syncAllReviews() {
    console.log('Starting Yelp reviews sync...');

    // 1. Get all organizations with active Yelp integration (using API key from settings)
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

    for (const location of locations || []) {
      await this.syncLocationReviews(location, yelpService);
    }
  }

  private async syncLocationReviews(location: any, yelpService: YelpService) {
    console.log(`Fetching Yelp reviews for location: ${location.name} (${location.yelp_business_id})`);

    try {
      const yelpReviews = await yelpService.fetchReviews(location.yelp_business_id);
      
      for (const yReview of yelpReviews) {
        await this.upsertReview(location.id, yReview);
      }
      
      console.log(`Synced ${yelpReviews.length} Yelp reviews for ${location.name}.`);
    } catch (err) {
      console.error(`Error syncing Yelp location ${location.id}:`, err);
    }
  }

  private async upsertReview(locationId: string, yReview: YelpReview) {
    const { error } = await this.supabase
      .from('reviews')
      .upsert({
        location_id: locationId,
        source: 'yelp',
        source_review_id: yReview.id,
        author_name: yReview.user.name,
        rating: yReview.rating,
        content: yReview.text,
        posted_at: yReview.time_created,
        created_at: new Date().toISOString()
      }, { 
        onConflict: 'source,source_review_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`Error upserting Yelp review ${yReview.id}:`, error.message);
    }
  }
}
