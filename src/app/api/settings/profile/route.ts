import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars not configured')
  }
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const supabase = getClient(token)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let { data: userData } = await supabase
      .from('users')
      .select('organization_id, tone, custom_instructions, email_new_reviews, email_daily_summary, email_weekly_report')
      .eq('id', user.id)
      .single()

    if (!userData) {
      // First time user - create their row and an organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: user.email?.split('@')[0] || 'My Business' })
        .select('id')
        .single()

      if (orgError || !org) {
        console.error('Org creation error:', orgError)
        return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
      }

      const { error: userInsertError } = await supabase
        .from('users')
        .insert({ id: user.id, organization_id: org.id })

      if (userInsertError) {
        console.error('User creation error:', userInsertError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      userData = { organization_id: org.id, tone: 'Professional & Friendly', custom_instructions: null, email_new_reviews: true, email_daily_summary: true, email_weekly_report: false }
    }

    const { data: org } = await supabase
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
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = getClient(token)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    let { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      // First time user - create their row and an organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: user.email?.split('@')[0] || 'My Business' })
        .select('id')
        .single()

      if (orgError || !org) {
        console.error('Org creation error:', orgError)
        return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
      }

      const { error: userInsertError } = await supabase
        .from('users')
        .insert({ id: user.id, organization_id: org.id })

      if (userInsertError) {
        console.error('User creation error:', userInsertError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      userData = { organization_id: org.id }
    }

    if (body.name !== undefined || body.website !== undefined || body.address !== undefined) {
      const orgUpdate: any = {}
      if (body.name !== undefined) orgUpdate.name = body.name
      if (body.website !== undefined) orgUpdate.website = body.website
      if (body.address !== undefined) orgUpdate.address = body.address

      const { error: orgError } = await supabase
        .from('organizations')
        .update(orgUpdate)
        .eq('id', userData.organization_id)

      if (orgError) {
        console.error('Org update error:', orgError)
        return NextResponse.json({ error: orgError.message }, { status: 500 })
      }
    }

    const userUpdate: any = {}
    if (body.tone !== undefined) userUpdate.tone = body.tone
    if (body.customInstructions !== undefined) userUpdate.custom_instructions = body.customInstructions
    if (body.emailNewReviews !== undefined) userUpdate.email_new_reviews = body.emailNewReviews
    if (body.emailDailySummary !== undefined) userUpdate.email_daily_summary = body.emailDailySummary
    if (body.emailWeeklyReport !== undefined) userUpdate.email_weekly_report = body.emailWeeklyReport

    if (Object.keys(userUpdate).length > 0) {
      const { error: userUpdateError } = await supabase
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
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}