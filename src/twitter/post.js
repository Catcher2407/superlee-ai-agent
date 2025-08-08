import { client } from './twitter-client.js';

export async function replyToTweet(tweetId, text) {
  return await client.v2.reply(text, tweetId);
}
