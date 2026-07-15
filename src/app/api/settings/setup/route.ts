import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase env vars not configured' }, { status: 500 })
    }

    // Use service role key to bypass RLS
    const supabase = createClient(url, key)

    // Verify the user's JWT is valid
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ ok: true, message: 'User already exists' })
    }

    // Create organization (service role bypasses RLS)
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: user.email?.split('@')[0] || 'My Business' })
      .select('id')
      .single()

    if (orgErr) {
      console.error('Org create error:', orgErr)
      return NextResponse.json({ error: 'Failed to create org: ' + orgErr.message }, { status: 500 })
    }

    // Create user row
    const { error: userErr } = await supabase
      .from('users')
      .insert({ id: user.id, organization_id: org.id })

    if (userErr) {
      console.error('User create error:', userErr)
      return NextResponse.json({ error: 'Failed to create user: ' + userErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Setup error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}