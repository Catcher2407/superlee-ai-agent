import { client } from './twitter-client.js';

export async function fetchLatestMentions() {
  const me = await client.v2.me();
  const mentions = await client.v2.userMentionTimeline(me.data.id, {
    exclude: ['retweets', 'replies'],
    max_results: 5,
  });
  return mentions.data.data || [];
}

export async function getLatestTweetFrom(username) {
  const now = Date.now();
  const rateLimitInfo = rateLimitCache.get(username);
  if (rateLimitInfo && now < rateLimitInfo.resetAt) return null;

  let userId = userIdCache.get(username);
  if (!userId) {
    try {
      const user = await client.v2.userByUsername(username);
      userId = user.data.id;
      userIdCache.set(username, userId);
    } catch (error) {
      console.error(`[Error] Failed to fetch user ID for ${username}`, error);
      return null;
    }
  }

  try {
    const timeline = await client.v2.userTimeline(userId, {
      exclude: ['retweets', 'replies'],
      max_results: 5,
    });
    return timeline.data.data?.[0];
  } catch (error) {
    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset ? error.rateLimit.reset * 1000 : now + 15 * 60 * 1000;
      rateLimitCache.set(username, { resetAt: resetTime });
    }
    return null;
  }
}

export async function fetchTargetTweets() {
  const TARGET_USERNAMES = ['ipdotworld', 'StoryProtocol', 'storysylee', 'jacobmtucker'];
  const tweets = [];
  for (const username of TARGET_USERNAMES) {
    const user = await client.v2.userByUsername(username);
    const timeline = await client.v2.userTimeline(user.data.id, {
      exclude: ['retweets', 'replies'],
      max_results: 3,
    });
    if (timeline.data?.data) tweets.push(...timeline.data.data);
  }
  return tweets;
}