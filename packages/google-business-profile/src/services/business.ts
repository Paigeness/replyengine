import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface GoogleReview {
  name: string;
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export class GoogleBusinessService {
  private authClient: OAuth2Client;

  constructor(authClient: OAuth2Client) {
    this.authClient = authClient;
  }

  /**
   * Fetch reviews for a specific location.
   * locationName format: accounts/{accountId}/locations/{locationId}
   */
  public async fetchReviews(locationName: string): Promise<GoogleReview[]> {
    try {
      // The reviews API is part of the My Business account management
      // We use the 'mybusinessreviews' API or direct REST calls if not in library
      // Using direct request via authClient is often safer for these specialized APIs
      const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews`;
      const response = await this.authClient.request({ url });
      
      const data = response.data as any;
      return data.reviews || [];
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      throw error;
    }
  }

  /**
   * Post a reply to a review.
   * reviewName format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
   */
  public async postReply(reviewName: string, replyContent: string) {
    try {
      const url = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;
      const response = await this.authClient.request({
        url,
        method: 'PUT',
        data: {
          comment: replyContent,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error posting Google review reply:', error);
      throw error;
    }
  }

  /**
   * Convert Google star rating to numeric rating.
   */
  public static parseStarRating(googleRating: string): number {
    switch (googleRating) {
      case 'ONE': return 1;
      case 'TWO': return 2;
      case 'THREE': return 3;
      case 'FOUR': return 4;
      case 'FIVE': return 5;
      default: return 0;
    }
  }
}
