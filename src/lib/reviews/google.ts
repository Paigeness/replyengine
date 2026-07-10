import { google } from 'googleapis';
import { getAdmin } from '../supabase-admin';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Fetches recent reviews from Google Business Profile for a given organization.
 */
export async function fetchGoogleReviews(organizationId: string) {
  const supabase = getAdmin();

  // 1. Get the Google integration for this organization
  const { data: integration, error: intError } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('source', 'google')
    .single();

  if (intError || !integration) {
    console.error(`No Google integration found for org ${organizationId}`);
    return;
  }

  // 2. Setup OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
    expiry_date: integration.token_expires_at ? new Date(integration.token_expires_at).getTime() : undefined,
  });

  // 3. Handle token refresh
  oauth2Client.on('tokens', async (tokens) => {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    if (tokens.access_token) updateData.access_token = tokens.access_token;
    if (tokens.refresh_token) updateData.refresh_token = tokens.refresh_token;
    if (tokens.expiry_date) updateData.token_expires_at = new Date(tokens.expiry_date).toISOString();

    await supabase
      .from('integrations')
      .update(updateData)
      .eq('id', integration.id);
  });

  // 4. Fetch locations for this organization
  const { data: locations, error: locError } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', organizationId)
    .not('google_business_location_id', 'is', null);

  if (locError || !locations) {
    console.error(`Error fetching locations for org ${organizationId}:`, locError);
    return;
  }

  for (const location of locations) {
    try {
      // Google Business Profile API v4 URL
      // locationName should be in format "accounts/{accountId}/locations/{locationId}"
      const locationName = location.google_business_location_id;
      const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews`;
      
      const response = await oauth2Client.request({ url });
      const data = response.data as any;
      const googleReviews = data.reviews || [];

      for (const gReview of googleReviews) {
        // Upsert review into Supabase
        await supabase.from('reviews').upsert({
          location_id: location.id,
          source: 'google',
          source_review_id: gReview.reviewId,
          author_name: gReview.reviewer.displayName,
          rating: ratingToNumber(gReview.starRating),
          content: gReview.comment || '',
          posted_at: gReview.createTime,
        }, { onConflict: 'source, source_review_id' });
      }
      
      console.log(`Synced ${googleReviews.length} reviews for location ${location.name}`);
    } catch (err: any) {
      console.error(`Failed to fetch reviews for location ${location.id}:`, err.message);
    }
  }
}

/**
 * Posts a reply to a Google review.
 */
export async function postGoogleReply(reviewId: string, replyContent: string) {
  const supabase = getAdmin();

  // 1. Fetch review and its location/integration
  const { data: review, error: revError } = await supabase
    .from('reviews')
    .select('*, locations!inner(*)')
    .eq('id', reviewId)
    .single();

  if (revError || !review) {
    throw new Error(`Review ${reviewId} not found`);
  }

  const organizationId = review.locations.organization_id;

  // 2. Get Google integration
  const { data: integration, error: intError } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('source', 'google')
    .single();

  if (intError || !integration) {
    throw new Error(`Google integration not found for organization ${organizationId}`);
  }

  // 3. Setup OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
    expiry_date: integration.token_expires_at ? new Date(integration.token_expires_at).getTime() : undefined,
  });

  // 4. Post reply
  const locationName = review.locations.google_business_location_id;
  const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews/${review.source_review_id}/reply`;
  
  await oauth2Client.request({
    url,
    method: 'PUT',
    data: {
      comment: replyContent,
    },
  });

  // 5. Update review status
  await supabase
    .from('reviews')
    .update({
      responded: true,
      our_response: replyContent,
      response_posted_at: new Date().toISOString(),
    })
    .eq('id', reviewId);
}

function ratingToNumber(rating: string): number {
  switch (rating) {
    case 'FIVE': return 5;
    case 'FOUR': return 4;
    case 'THREE': return 3;
    case 'TWO': return 2;
    case 'ONE': return 1;
    default: return 0;
  }
}
