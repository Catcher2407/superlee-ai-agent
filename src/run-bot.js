// 📁 src/run-bot.js
import { fetchTargetTweets, replyToTweet, fetchLatestMentions } from './twitter/twitter-client.js';
import { generateReply } from './ai/openai.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const repliedPath = './replied.json';
let repliedIds = fs.existsSync(repliedPath) ? JSON.parse(fs.readFileSync(repliedPath)) : [];
const isDryRun = process.env.DRY_RUN === 'true';

function saveReplied(id) {
  repliedIds.push(id);
  fs.writeFileSync(repliedPath, JSON.stringify(repliedIds));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processTargets() {
  const targets = await fetchTargetTweets();
  for (const tweet of targets) {
    if (repliedIds.includes(tweet.id)) continue;

    const aiReply = await generateReply(tweet.text);

    if (isDryRun) {
      console.log(`[DRY-RUN] Would reply: "${aiReply}" to tweet ${tweet.id}`);
    } else {
      await replyToTweet(tweet.id, aiReply);
      console.log(`✅ Replied to ${tweet.id}`);
      saveReplied(tweet.id);
      console.log('⏳ Waiting 5 minutes before next reply...');
      await delay(5 * 60 * 1000); // 5 menit antar reply
    }
  }

  const mentions = await fetchLatestMentions();
  for (const mention of mentions) {
    if (repliedIds.includes(mention.id)) continue;

    const aiReply = await generateReply(mention.text);

    if (isDryRun) {
      console.log(`[DRY-RUN] Would reply: "${aiReply}" to mention ${mention.id}`);
    } else {
      await replyToTweet(mention.id, aiReply);
      console.log(`✅ Replied to mention ${mention.id}`);
      saveReplied(mention.id);
      console.log('⏳ Waiting 5 minutes before next reply...');
      await delay(5 * 60 * 1000); // 5 menit antar reply
    }
  }
}

async function runBot() {
  const mode = process.argv[2];
  console.log(`🤖 Running bot mode: ${mode || 'reply-only'}${isDryRun ? ' (DRY-RUN)' : ''}`);

  try {
    await processTargets();
  } catch (err) {
    if (err.code === 429) {
      const waitMs = 15 * 60 * 1000; // 15 menit
      console.warn(`⚠️ Rate limited. Waiting ${waitMs / 60000} minutes...`);
      await delay(waitMs);
      await runBot(); // retry setelah delay
    } else {
      console.error('❌ Bot failed:', err.message);
      process.exit(1);
    }
  }
}

runBot();
