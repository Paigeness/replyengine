import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify the auth token and get the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('organization_id, tone, custom_instructions, email_new_reviews, email_daily_summary, email_weekly_report')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get organization details
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name, website, address')
      .eq('id', userData.organization_id)
      .single()

    return NextResponse.json({
      organizationId: userData.organization_id,
      name: org?.name || '',
      website: org?.website || '',
      address: org?.address || '',
      tone: userData.tone || 'Professional & Friendly',
      customInstructions: userData.custom_instructions || '',
      emailNewReviews: userData.email_new_reviews ?? true,
      emailDailySummary: userData.email_daily_summary ?? true,
      emailWeeklyReport: userData.email_weekly_report ?? false,
    })
  } catch (err: any) {
    console.error('Settings GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Get user's organization
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update organization fields if provided
    if (body.name !== undefined || body.website !== undefined || body.address !== undefined) {
      const orgUpdate: any = {}
      if (body.name !== undefined) orgUpdate.name = body.name
      if (body.website !== undefined) orgUpdate.website = body.website
      if (body.address !== undefined) orgUpdate.address = body.address
      orgUpdate.updated_at = new Date().toISOString()

      const { error: orgError } = await supabaseAdmin
        .from('organizations')
        .update(orgUpdate)
        .eq('id', userData.organization_id)

      if (orgError) {
        console.error('Org update error:', orgError)
        return NextResponse.json({ error: orgError.message }, { status: 500 })
      }
    }

    // Update user preferences if provided
    const userUpdate: any = {}
    if (body.tone !== undefined) userUpdate.tone = body.tone
    if (body.customInstructions !== undefined) userUpdate.custom_instructions = body.customInstructions
    if (body.emailNewReviews !== undefined) userUpdate.email_new_reviews = body.emailNewReviews
    if (body.emailDailySummary !== undefined) userUpdate.email_daily_summary = body.emailDailySummary
    if (body.emailWeeklyReport !== undefined) userUpdate.email_weekly_report = body.emailWeeklyReport

    if (Object.keys(userUpdate).length > 0) {
      const { error: userUpdateError } = await supabaseAdmin
        .from('users')
        .update(userUpdate)
        .eq('id', user.id)

      if (userUpdateError) {
        console.error('User update error:', userUpdateError)
        return NextResponse.json({ error: userUpdateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Settings PUT error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}