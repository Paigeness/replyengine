import { postGoogleReply } from './google';
import { getAdmin } from '../supabase-admin';

/**
 * Orchestrates posting a response to the correct integration source.
 */
export async function postResponse(responseId: string) {
  const supabase = getAdmin();

  // 1. Fetch response data
  const { data: response, error: respError } = await supabase
    .from('responses')
    .select('*, reviews(*)')
    .eq('id', responseId)
    .single();

  if (respError || !response) {
    throw new Error(`Response ${responseId} not found`);
  }

  const review = response.reviews;
  if (!review) {
    throw new Error(`Review not found for response ${responseId}`);
  }

  try {
    // 2. Route based on source
    if (review.source === 'google') {
      await postGoogleReply(review.id, response.content);
    } else if (review.source === 'yelp') {
      // Yelp doesn't support API replies, handled via email (mocked or outside this flow)
      console.log('Yelp response skipped for auto-posting (not supported by API)');
      return;
    } else if (review.source === 'tripadvisor') {
      // TripAdvisor implementation pending
      console.log('TripAdvisor response skipped for auto-posting (not implemented)');
      return;
    }

    // 3. Mark response as posted
    await supabase
      .from('responses')
      .update({
        posted: true,
        posted_at: new Date().toISOString(),
      })
      .eq('id', responseId);

    console.log(`Successfully posted response ${responseId} to ${review.source}`);
  } catch (error: any) {
    console.error(`Failed to post response ${responseId}:`, error.message);
    throw error;
  }
}
