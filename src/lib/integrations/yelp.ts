import { getSupabase } from '../supabase';

const YELP_API_BASE_URL = 'https://api.yelp.com/v3';

export interface YelpReview {
  id: string;
  rating: number;
  user: {
    name: string;
    profile_url: string;
    image_url: string;
  };
  text: string;
  time_created: string;
  url: string;
}

/**
 * Fetches reviews from Yelp Fusion API
 */
export async function fetchYelpReviews(businessId: string) {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    console.error('YELP_API_KEY is not set in environment variables');
    throw new Error('Yelp integration is not configured');
  }

  try {
    const response = await fetch(`${YELP_API_BASE_URL}/businesses/${businessId}/reviews?sort_by=newest`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Yelp API error:', errorData);
      throw new Error(`Yelp API error: ${errorData.error?.description || response.statusText}`);
    }

    const data = await response.json();
    return data.reviews as YelpReview[];
  } catch (error) {
    console.error('Failed to fetch Yelp reviews:', error);
    throw error;
  }
}

/**
 * Processes new Yelp reviews for a location
 */
export async function syncYelpReviews(locationId: string, yelpBusinessId: string) {
  const supabase = getSupabase();
  
  try {
    const reviews = await fetchYelpReviews(yelpBusinessId);
    
    for (const review of reviews) {
      // Check if review already exists to avoid duplicates
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('source', 'yelp')
        .eq('source_review_id', review.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing review:', checkError);
        continue;
      }

      if (!existingReview) {
        // Insert the new review
        const { data: newReview, error: insertError } = await supabase
          .from('reviews')
          .insert({
            location_id: locationId,
            source: 'yelp',
            source_review_id: review.id,
            author_name: review.user.name,
            rating: review.rating,
            content: review.text,
            posted_at: review.time_created,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting Yelp review:', insertError);
          continue;
        }

        // Notify the business owner about the new review
        await notifyBusinessOwner(newReview);
      }
    }
  } catch (error) {
    console.error(`Sync failed for Yelp business ${yelpBusinessId}:`, error);
    throw error;
  }
}

/**
 * Sends a notification to the business owner
 * Currently a placeholder as requested by the notification workflow requirement
 */
async function notifyBusinessOwner(review: any) {
  // In a full implementation, this would call an email service like Resend
  // For now, we log the action which can be picked up by an external worker or seen in logs
  console.log(`[NOTIFICATION] New Yelp review for location ${review.location_id}:`, {
    author: review.author_name,
    rating: review.rating,
    content: review.content.substring(0, 50) + '...'
  });
  
  // TODO: Implement actual email sending using a service like Resend or SendGrid
}
