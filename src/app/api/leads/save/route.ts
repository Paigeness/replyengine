import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

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

    const leadData = await request.json()

    const { data, error } = await supabase
      .from('leads')
      .insert({
        organization_id: userData.organization_id,
        business_name: leadData.name,
        category: leadData.category,
        city: leadData.city,
        rating: leadData.rating,
        address: leadData.address,
        website: leadData.website,
        phone: leadData.phone,
        status: 'new',
        notes: leadData.notes || ''
      })
      .select()
      .single()

    if (error) {
      console.error('Save lead error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Save lead catch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
