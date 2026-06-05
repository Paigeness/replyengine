import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleAuthService } from './auth';
import { GoogleBusinessService, GoogleReview } from './business';
import * as dotenv from 'dotenv';

dotenv.config();

export class GooglePipeline {
  private supabase: SupabaseClient;
  private authService: GoogleAuthService;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.authService = new GoogleAuthService(this.supabase);
  }

  async syncAllReviews() {
    console.log('Starting Google reviews sync...');

    // 1. Get all organizations with active Google integration
    const { data: integrations, error } = await this.supabase
      .from('integrations')
      .select('organization_id')
      .eq('source', 'google');

    if (error) {
      console.error('Error fetching Google integrations:', error);
      return;
    }

    console.log(`Found ${integrations?.length || 0} organizations with Google integration.`);

    for (const integration of integrations || []) {
      try {
        await this.syncOrganizationReviews(integration.organization_id);
      } catch (err) {
        console.error(`Failed to sync reviews for organization ${integration.organization_id}:`, err);
      }
    }
  }

  async syncOrganizationReviews(organizationId: string) {
    console.log(`Syncing reviews for organization ${organizationId}...`);

    // 1. Get OAuth client for organization
    const authClient = await this.authService.getClientForOrganization(organizationId);
    const businessService = new GoogleBusinessService(authClient);

    // 2. Get all locations for this organization that have a google_business_location_id
    const { data: locations, error } = await this.supabase
      .from('locations')
      .select('id, name, google_business_location_id')
      .eq('organization_id', organizationId)
      .not('google_business_location_id', 'is', null);

    if (error) {
      throw new Error(`Error fetching locations: ${error.message}`);
    }

    for (const location of locations || []) {
      await this.syncLocationReviews(location, businessService);
    }
  }

  private async syncLocationReviews(location: any, businessService: GoogleBusinessService) {
    console.log(`Fetching reviews for location: ${location.name} (${location.google_business_location_id})`);

    try {
      const googleReviews = await businessService.fetchReviews(location.google_business_location_id);
      
      for (const gReview of googleReviews) {
        await this.upsertReview(location.id, gReview);
      }
      
      console.log(`Synced ${googleReviews.length} reviews for ${location.name}.`);
    } catch (err) {
      console.error(`Error syncing location ${location.id}:`, err);
    }
  }

  private async upsertReview(locationId: string, gReview: GoogleReview) {
    const { error } = await this.supabase
      .from('reviews')
      .upsert({
        location_id: locationId,
        source: 'google',
        source_review_id: gReview.name,
        author_name: gReview.reviewer.displayName,
        rating: GoogleBusinessService.parseStarRating(gReview.starRating),
        content: gReview.comment,
        posted_at: gReview.createTime,
        created_at: new Date().toISOString()
      }, { 
        onConflict: 'source,source_review_id',
        ignoreDuplicates: false // We might want to update if content changes (rare but possible)
      });

    if (error) {
      console.error(`Error upserting review ${gReview.reviewId}:`, error.message);
    }
  }
}
