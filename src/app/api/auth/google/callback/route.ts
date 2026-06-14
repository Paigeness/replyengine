import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard/settings?error=no_code`)
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
      return NextResponse.redirect(`${origin}/dashboard/settings?error=${tokens.error}`)
    }

    return NextResponse.redirect(`${origin}/dashboard/settings?success=google_connected`)
  } catch (error) {
    return NextResponse.redirect(`${origin}/dashboard/settings?error=auth_failed`)
  }
}
