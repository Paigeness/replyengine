import fetch from 'cross-fetch';

export interface YelpReview {
  id: string;
  rating: number;
  user: {
    name: string;
    profile_url?: string;
    image_url?: string;
  };
  text: string;
  time_created: string;
  url: string;
}

export class YelpService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch reviews for a specific business.
   * businessId: Yelp business ID
   */
  public async fetchReviews(businessId: string): Promise<YelpReview[]> {
    let retries = 3;
    while (retries > 0) {
      try {
        const url = `https://api.yelp.com/v3/businesses/${businessId}/reviews`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        });

        if (response.status === 429) {
          console.warn('Yelp API rate limit hit, retrying in 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries--;
          continue;
        }

        if (!response.ok) {
          throw new Error(`Yelp API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.reviews || [];
      } catch (error) {
        console.error('Error fetching Yelp reviews:', error);
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return [];
  }
}
