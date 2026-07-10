import { OAuth2Client } from 'google-auth-library';
import { getAdmin } from '../supabase-admin';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function createOAuth2Client(access_token: string, refresh_token?: string, expiry_date?: string) {
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  client.setCredentials({
    access_token,
    refresh_token,
    expiry_date: expiry_date ? new Date(expiry_date).getTime() : undefined,
  });
  return client;
}

export async function fetchGoogleReviews(organizationId: string) {
  const supabase = getAdmin();
  const { data: integration, error: intError } = await supabase
    .from('integrations').select('*')
    .eq('organization_id', organizationId).eq('source', 'google').single();
  if (intError || !integration) { console.error(`No Google integration for org ${organizationId}`); return; }

  const oauth2Client = createOAuth2Client(integration.access_token, integration.refresh_token, integration.token_expires_at);
  oauth2Client.on('tokens', async (tokens) => {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (tokens.access_token) updateData.access_token = tokens.access_token;
    if (tokens.refresh_token) updateData.refresh_token = tokens.refresh_token;
    if (tokens.expiry_date) updateData.token_expires_at = new Date(tokens.expiry_date).toISOString();
    await supabase.from('integrations').update(updateData).eq('id', integration.id);
  });

  const { data: locations, error: locError } = await supabase
    .from('locations').select('*')
    .eq('organization_id', organizationId).not('google_business_location_id', 'is', null);
  if (locError || !locations) { console.error(`Error fetching locations for org ${organizationId}:`, locError); return; }

  for (const location of locations) {
    try {
      const token = await oauth2Client.getAccessToken();
      const url = `https://mybusiness.googleapis.com/v4/${location.google_business_location_id}/reviews`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token.token}` } });
      const data = await response.json();
      for (const gReview of (data.reviews || [])) {
        await supabase.from('reviews').upsert({
          location_id: location.id, source: 'google',
          source_review_id: gReview.reviewId,
          author_name: gReview.reviewer?.displayName || 'Unknown',
          rating: ratingToNumber(gReview.starRating),
          content: gReview.comment || '',
          posted_at: gReview.createTime,
        }, { onConflict: 'source, source_review_id' });
      }
      console.log(`Synced ${(data.reviews || []).length} reviews for location ${location.name}`);
    } catch (err: any) { console.error(`Failed to fetch reviews for location ${location.id}:`, err.message); }
  }
}

export async function postGoogleReply(reviewId: string, replyContent: string) {
  const supabase = getAdmin();
  const { data: review, error: revError } = await supabase
    .from('reviews').select('*, locations!inner(*)').eq('id', reviewId).single();
  if (revError || !review) throw new Error(`Review ${reviewId} not found`);

  const { data: integration, error: intError } = await supabase
    .from('integrations').select('*')
    .eq('organization_id', review.locations.organization_id).eq('source', 'google').single();
  if (intError || !integration) throw new Error(`Google integration not found`);

  const oauth2Client = createOAuth2Client(integration.access_token, integration.refresh_token, integration.token_expires_at);
  const token = await oauth2Client.getAccessToken();
  const url = `https://mybusiness.googleapis.com/v4/${review.locations.google_business_location_id}/reviews/${review.source_review_id}/reply`;
  
  await fetch(url, {
    method: 'PUT', headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: replyContent }),
  });

  await supabase.from('reviews').update({ responded: true, our_response: replyContent, response_posted_at: new Date().toISOString() }).eq('id', reviewId);
}

function ratingToNumber(rating: string): number {
  const map: Record<string, number> = { FIVE: 5, FOUR: 4, THREE: 3, TWO: 2, ONE: 1 };
  return map[rating] || 0;
}