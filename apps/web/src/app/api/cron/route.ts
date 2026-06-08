import { NextRequest, NextResponse } from 'next/server';
import { GooglePipeline } from '../../../../../packages/google-business-profile/src/services/pipeline';
import { YelpPipeline } from '../../../../../packages/yelp-fusion/src/services/pipeline';
import { ResponsePipeline } from '../../../../../packages/ai-engine/src/services/pipeline';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('--- ReplyEngine Automation Pipeline Started (Cron) ---');
  const startTime = new Date();

  try {
    console.log('\n[1/4] Syncing Google reviews...');
    const googleSync = new GooglePipeline();
    await googleSync.syncAllReviews();

    console.log('\n[2/4] Syncing Yelp reviews...');
    const yelpSync = new YelpPipeline();
    await yelpSync.syncAllReviews();

    console.log('\n[3/4] Generating AI responses...');
    const responsePipeline = new ResponsePipeline();
    await responsePipeline.processPendingReviews();

    console.log('\n[4/4] Posting approved responses to Google...');
    const { GooglePostingService } = await import('../../../../../packages/google-business-profile/src/services/posting');
    const posting = new GooglePostingService();
    await posting.postAll();

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    
    return NextResponse.json({
      success: true,
      message: 'Automation pipeline completed successfully',
      duration: `${duration}s`
    });
  } catch (error: any) {
    console.error('\n--- Automation Pipeline Failed ---');
    console.error(error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
