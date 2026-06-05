import { GooglePipeline } from 'google-business-profile';
import { YelpPipeline } from 'yelp-fusion';
import { TripAdvisorPipeline } from 'tripadvisor';
import { ResponsePipeline } from 'ai-engine';
import { GooglePostingPipeline } from 'google-business-profile';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('--- ReplyEngine Automation Pipeline Started ---');
  const startTime = new Date();

  try {
    // 1. Sync Reviews from Google
    console.log('\n[1/5] Syncing Google reviews...');
    const googleSync = new GooglePipeline();
    await googleSync.syncAllReviews();

    // 2. Sync Reviews from Yelp
    console.log('\n[2/5] Syncing Yelp reviews...');
    const yelpSync = new YelpPipeline();
    await yelpSync.syncAllReviews();

    // 3. Sync Reviews from TripAdvisor
    console.log('\n[3/5] Syncing TripAdvisor reviews...');
    const taSync = new TripAdvisorPipeline();
    await taSync.syncAllReviews();

    // 4. Generate AI Responses for pending reviews
    console.log('\n[4/5] Generating AI responses...');
    const responsePipeline = new ResponsePipeline();
    await responsePipeline.processPendingReviews();

    // 5. Post approved responses to Google
    console.log('\n[5/5] Posting approved responses to Google...');
    const googlePosting = new GooglePostingPipeline();
    await googlePosting.postApprovedResponses();

    console.log('\n--- Automation Pipeline Completed Successfully ---');
  } catch (error) {
    console.error('\n--- Automation Pipeline Failed ---');
    console.error(error);
    process.exit(1);
  } finally {
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`Duration: ${duration}s`);
  }
}

main();
