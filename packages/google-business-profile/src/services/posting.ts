import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleAuthService } from './auth';
import { GoogleBusinessService } from './business';
import * as dotenv from 'dotenv';

dotenv.config();

export class GooglePostingPipeline {
  private supabase: SupabaseClient;
  private authService: GoogleAuthService;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.authService = new GoogleAuthService(this.supabase);
  }

  async postApprovedResponses() {
    console.log('Checking for approved responses to post to Google...');

    // 1. Fetch responses that are approved but not yet posted, joining with reviews to get source and source_review_id
    const { data: pendingResponses, error } = await this.supabase
      .from('responses')
      .select(`
        *,
        reviews (
          source,
          source_review_id
        ),
        locations (
          organization_id
        )
      `)
      .eq('posted', false)
      .eq('approved', true);

    if (error) {
      console.error('Error fetching pending responses:', error);
      return;
    }

    const googleResponses = pendingResponses?.filter(r => r.reviews.source === 'google') || [];
    console.log(`Found ${googleResponses.length} approved Google responses to post.`);

    for (const response of googleResponses) {
      try {
        await this.postSingleResponse(response);
      } catch (err) {
        console.error(`Failed to post response ${response.id}:`, err);
      }
    }
  }

  private async postSingleResponse(responseData: any) {
    const organizationId = responseData.locations.organization_id;
    const reviewName = responseData.reviews.source_review_id; // For Google, we should store the full name 'accounts/.../reviews/...'

    console.log(`Posting response ${responseData.id} to Google...`);

    // 1. Get OAuth client
    const authClient = await this.authService.getClientForOrganization(organizationId);
    const businessService = new GoogleBusinessService(authClient);

    // 2. Post to Google
    await businessService.postReply(reviewName, responseData.content);

    // 3. Update response record
    const now = new Date().toISOString();
    await this.supabase
      .from('responses')
      .update({
        posted: true,
        posted_at: now
      })
      .eq('id', responseData.id);

    // 4. Update review record
    await this.supabase
      .from('reviews')
      .update({
        response_posted_at: now
      })
      .eq('id', responseData.review_id);

    console.log(`Successfully posted response ${responseData.id} to Google.`);
  }
}
