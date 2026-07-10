import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/lib/supabase-admin';
import { fetchGoogleReviews } from '@/lib/reviews/google';
import { generateResponse } from '@/lib/ai';
import { postResponse } from '@/lib/reviews/post';

export async function GET(req: NextRequest) {
  // 1. Auth check for CRON_SECRET
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = getAdmin();
  const results = [];

  try {
    // 2. Get all organizations with active Google integrations
    const { data: integrations, error: intError } = await supabase
      .from('integrations')
      .select('organization_id')
      .eq('source', 'google');

    if (intError) throw intError;

    for (const integration of integrations || []) {
      const orgId = integration.organization_id;
      const orgResult: any = { organizationId: orgId, reviewsSynced: 0, responsesGenerated: 0, posted: 0 };

      try {
        // A. Sync new reviews from Google
        await fetchGoogleReviews(orgId);

        // B. Find unresponded reviews for this organization
        // We join with locations to filter by organization
        const { data: unrespondedReviews, error: revError } = await supabase
          .from('reviews')
          .select('*, locations!inner(organization_id)')
          .eq('locations.organization_id', orgId)
          .eq('responded', false);

        if (revError) throw revError;
        orgResult.reviewsSynced = unrespondedReviews?.length || 0;

        // C. Fetch Organization info (for name and preferences)
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', orgId)
          .single();

        const { data: owner, error: userError } = await supabase
          .from('users')
          .select('tone, custom_instructions')
          .eq('organization_id', orgId)
          .eq('role', 'owner')
          .maybeSingle();

        if (orgError) throw orgError;

        const tone = owner?.tone || 'Professional & Friendly';
        const customInstructions = owner?.custom_instructions || '';

        // D. Generate responses for each new review
        for (const review of unrespondedReviews || []) {
          try {
            const aiContent = await generateResponse(
              review.content,
              org.name,
              tone,
              customInstructions
            );

            // E. Store the response
            const { data: newResponse, error: respError } = await supabase
              .from('responses')
              .insert({
                review_id: review.id,
                location_id: review.location_id,
                content: aiContent,
                ai_model: 'gpt-4o',
                approved: true, // Auto-approve for now as it's an automated pipeline
              })
              .select()
              .single();

            if (respError) throw respError;
            orgResult.responsesGenerated++;

            // F. Auto-post back to source
            await postResponse(newResponse.id);
            orgResult.posted++;
          } catch (genErr: any) {
            console.error(`Failed to process review ${review.id}:`, genErr.message);
          }
        }
      } catch (orgErr: any) {
        console.error(`Error processing organization ${orgId}:`, orgErr.message);
        orgResult.error = orgErr.message;
      }
      
      results.push(orgResult);
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error('Global Cron Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
