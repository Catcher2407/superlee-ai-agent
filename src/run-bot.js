import { fetchMentions, fetchTargetTweets } from './twitter/fetch.js';
import { replyToTweet } from './twitter/post.js';
import { generateReply } from './ai/openai.js';
import { isReplied, saveReplied } from './utils/store.js';
import { delay } from './utils/delay.js';

async function processTargets() {
  const targets = await fetchTargetTweets();

  for (const tweet of targets) {
    if (repliedIds.includes(tweet.id)) continue;

    const aiReply = await generateReply(tweet.text);
    await replyToTweet(tweet.id, aiReply);
    console.log(`✅ Replied to ${tweet.id}`);
    saveReplied(tweet.id);

    console.log('⏳ Waiting 20 minutes...');
    await delay(20 * 60 * 1000);
  }

  const mentions = await fetchLatestMentions();

  for (const mention of mentions) {
    if (repliedIds.includes(mention.id)) continue;

    const aiReply = await generateReply(mention.text);
    await replyToTweet(mention.id, aiReply);
    console.log(`✅ Replied to mention ${mention.id}`);
    saveReplied(mention.id);
  }
}

async function runBot() {
  console.log('🤖 Bot is running...');
  try {
    const mentions = await fetchMentions();

    for (const tweet of mentions) {
      if (isReplied(tweet.id)) continue;

      const reply = await generateReply(tweet.text);
      await replyToTweet(tweet.id, reply);

      console.log(`✅ Replied to ${tweet.id}`);
      saveReplied(tweet.id);

      await delay(60 * 1000); // 1 minute delay between replies
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

await processTargets();
// Run every 15 minutes
runBot();
setInterval(runBot, 15 * 60 * 1000);
