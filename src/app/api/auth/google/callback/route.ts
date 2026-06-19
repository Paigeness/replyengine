import { NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const organizationId = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard/settings?error=no_code`)
  }

  if (!organizationId) {
    console.error('No organization ID provided in state')
    return NextResponse.redirect(`${origin}/dashboard/settings?error=no_state`)
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await response.json()

    if (tokens.error) {
      console.error('Google token exchange error:', tokens.error)
      return NextResponse.redirect(`${origin}/dashboard/settings?error=${tokens.error}`)
    }

    const admin = getAdmin()
    
    // Calculate expiration date
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    const { error: upsertError } = await admin
      .from('integrations')
      .upsert({
        organization_id: organizationId,
        source: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'organization_id,source' })

    if (upsertError) {
      console.error('Database upsert error:', upsertError)
      return NextResponse.redirect(`${origin}/dashboard/settings?error=db_error`)
    }

    return NextResponse.redirect(`${origin}/dashboard/settings?success=google_connected`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${origin}/dashboard/settings?error=auth_failed`)
  }
}
