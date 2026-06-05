import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class GoogleAuthService {
  private oauth2Client: OAuth2Client;
  private supabase?: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.supabase = supabase;
  }

  getAuthUrl(organizationId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: organizationId,
      prompt: 'consent' // Force consent to get a refresh token
    });
  }

  async exchangeCodeForTokens(code: string, organizationId: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    if (this.supabase) {
      // Store tokens in Supabase
      const { error } = await this.supabase
        .from('integrations')
        .upsert({
          organization_id: organizationId,
          source: 'google',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization_id,source' });

      if (error) {
        throw new Error(`Failed to store Google tokens: ${error.message}`);
      }
    }

    return tokens;
  }

  async getClientForOrganization(organizationId: string): Promise<OAuth2Client> {
    if (!this.supabase) {
      throw new Error('Supabase client required for organization-based auth');
    }

    const { data: integration, error } = await this.supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('source', 'google')
      .single();

    if (error || !integration) {
      throw new Error(`No Google integration found for organization ${organizationId}`);
    }

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      expiry_date: integration.token_expires_at ? new Date(integration.token_expires_at).getTime() : undefined
    });

    // Check if token is expired and refresh if necessary
    client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        // Update refresh token if a new one is provided
        await this.supabase!
          .from('integrations')
          .update({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('organization_id', organizationId)
          .eq('source', 'google');
      } else {
        await this.supabase!
          .from('integrations')
          .update({
            access_token: tokens.access_token,
            token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('organization_id', organizationId)
          .eq('source', 'google');
      }
    });

    return client;
  }
}
