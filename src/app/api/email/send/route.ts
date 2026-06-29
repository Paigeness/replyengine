import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { sendOutreachEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's organization_id
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { to, subject, body } = await request.json()

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Send the email
    const result = await sendOutreachEmail({ to, subject, body })

    // Log the sent email in Supabase
    const { error: logError } = await supabase
      .from('outreach_emails')
      .insert({
        organization_id: userData.organization_id,
        recipient_email: to,
        subject,
        body,
        status: result.success ? 'sent' : 'failed'
      })

    if (logError) {
      console.error('Failed to log email in Supabase:', logError)
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
