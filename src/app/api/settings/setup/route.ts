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
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase env vars not configured' }, { status: 500 })
    }

    const supabase = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
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

    // Call the database function (bypasses RLS via SECURITY DEFINER)
    const { data: result, error: rpcError } = await supabase
      .rpc('setup_user', { user_id: user.id, user_email: user.email || '' })

    if (rpcError) {
      console.error('Setup RPC error:', rpcError)
      return NextResponse.json({ error: 'Setup failed: ' + rpcError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result })
  } catch (err: any) {
    console.error('Setup error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}