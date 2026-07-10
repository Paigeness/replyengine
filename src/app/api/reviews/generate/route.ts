import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/lib/supabase-admin';
import { generateResponse } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId, organizationId } = body;

    if (!reviewId || !organizationId) {
      return NextResponse.json(
        { error: 'Missing reviewId or organizationId' },
        { status: 400 }
      );
    }

    const supabase = getAdmin();

    // 1. Fetch the review and verify it belongs to the organization via location
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*, locations!inner(organization_id)')
      .eq('id', reviewId)
      .eq('locations.organization_id', organizationId)
      .single();

    if (reviewError || !review) {
      console.error('Error fetching review or unauthorized:', reviewError);
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }

    // 2. Fetch the organization for the business name
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      console.error('Error fetching organization:', orgError);
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // 3. Fetch user preferences (tone, custom instructions)
    // We look for the owner's preferences.
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('tone, custom_instructions')
      .eq('organization_id', organizationId)
      .eq('role', 'owner')
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user preferences:', userError);
    }

    const tone = user?.tone || 'Professional & Friendly';
    const customInstructions = user?.custom_instructions || '';

    // 4. Generate the response using AI
    const aiResponse = await generateResponse(
      review.content,
      org.name,
      tone,
      customInstructions
    );

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error('API Error in /api/reviews/generate:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
