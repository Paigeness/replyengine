import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TripAdvisorService, TripAdvisorReview } from './tripadvisor';
import * as dotenv from 'dotenv';

dotenv.config();

export class TripAdvisorPipeline {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async syncAllReviews() {
    console.log('Starting TripAdvisor reviews sync...');

    const { data: integrations, error } = await this.supabase
      .from('integrations')
      .select('organization_id, settings')
      .eq('source', 'tripadvisor');

    if (error) {
      console.error('Error fetching TripAdvisor integrations:', error);
      return;
    }

    for (const integration of integrations || []) {
      const apiKey = (integration.settings as any)?.apiKey || process.env.TRIPADVISOR_API_KEY;
      if (!apiKey) continue;

      const taService = new TripAdvisorService(apiKey);
      await this.syncOrganizationReviews(integration.organization_id, taService);
    }
  }

  async syncOrganizationReviews(organizationId: string, taService: TripAdvisorService) {
    const { data: locations, error } = await this.supabase
      .from('locations')
      .select('id, name, tripadvisor_location_id')
      .eq('organization_id', organizationId)
      .not('tripadvisor_location_id', 'is', null);

    if (error) return;

    for (const location of locations || []) {
      try {
        const reviews = await taService.fetchReviews(location.tripadvisor_location_id);
        for (const review of reviews) {
          await this.upsertReview(location.id, review);
        }
      } catch (err) {
        console.error(`Error syncing TripAdvisor location ${location.id}:`, err);
      }
    }
  }

  private async upsertReview(locationId: string, taReview: TripAdvisorReview) {
    await this.supabase
      .from('reviews')
      .upsert({
        location_id: locationId,
        source: 'tripadvisor',
        source_review_id: taReview.id,
        author_name: taReview.user.username,
        rating: taReview.rating,
        content: taReview.text,
        posted_at: taReview.published_date,
        created_at: new Date().toISOString()
      }, { 
        onConflict: 'source,source_review_id'
      });
  }
}
