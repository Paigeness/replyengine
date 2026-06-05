import { YelpPipeline } from './services/pipeline';
import { sleep } from 'utils'; // I'll assume sleep is available or I'll implement it

const POLLING_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

async function startPolling() {
  const pipeline = new YelpPipeline();
  
  console.log('Yelp polling started...');
  
  while (true) {
    try {
      await pipeline.syncAllReviews();
      console.log(`Sync completed. Next sync in 6 hours.`);
    } catch (err) {
      console.error('Error during Yelp sync:', err);
    }
    
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
  }
}

startPolling();
