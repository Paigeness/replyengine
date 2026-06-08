import { NextRequest, NextResponse } from 'next/server';
import { GooglePipeline } from '../../../../../packages/google-business-profile/src/services/pipeline';
import { YelpPipeline } from '../../../../../packages/yelp-fusion/src/services/pipeline';
import { ResponsePipeline } from '../../../../../packages/ai-engine/src/services/pipeline';
import { GooglePostingPipeline } from '../../../../../packages/google-business-profile/src/services/posting';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const googleSync = new GooglePipeline();
    await googleSync.syncAllReviews();

    const yelpSync = new YelpPipeline();
    await yelpSync.syncAllReviews();

    const responsePipeline = new ResponsePipeline();
    await responsePipeline.processPendingReviews();

    const googlePosting = new GooglePostingPipeline();
    await googlePosting.postApprovedResponses();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
