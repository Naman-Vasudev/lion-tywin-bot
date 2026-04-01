import { reddit } from '@devvit/web/server';
import { QUOTE_BUCKETS, ALL_QUOTES } from './quotes';
import { analyzeSentiment } from './sentiment';

const TRIGGERS = [
  /\btywin\b/i,
  /\blannister\b/i,
  /\blord tywin\b/i,
];

// Set your Render.com URL here after deploying the Python service.
// Example: https://tywin-sentiment-service.onrender.com
// Leave empty to always use the local fallback.
const SENTIMENT_SERVICE_URL = process.env['SENTIMENT_SERVICE_URL'] ?? 'https://lion-tywin-bot.onrender.com';

type Sentiment = 'positive' | 'negative' | 'neutral';

/**
 * Tries to call the Python VADER microservice.
 * Falls back to the local rule-based analyzer if the service is unavailable or slow.
 */
const getSentiment = async (text: string): Promise<Sentiment> => {
  if (SENTIMENT_SERVICE_URL) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 800); // 800ms hard timeout

      const response = await fetch(`${SENTIMENT_SERVICE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = (await response.json()) as { sentiment: Sentiment };
        console.log(`[sentiment] VADER result: ${data.sentiment}`);
        return data.sentiment;
      }
    } catch (err) {
      // Service unavailable, timed out, or network error — fall through to local
      console.warn(`[sentiment] Python service unreachable, using local fallback: ${err}`);
    }
  }

  // Local rule-based fallback
  const result = analyzeSentiment(text);
  console.log(`[sentiment] Local fallback result: ${result}`);
  return result;
};

/**
 * Handles the onCommentSubmit trigger.
 * Detects keywords and replies with a Tywin Lannister quote matching the comment's sentiment.
 */
export const handleCommentSubmit = async (event: any) => {
  try {
    const comment = event.comment;
    const author = event.author;

    if (!comment || !author || !comment.body) {
      return;
    }

    // Avoid replying to the bot's own comments to prevent infinite loops
    const botUser = await reddit.getCurrentUser();
    if (botUser && author.id === botUser.id) {
      return;
    }

    const body = comment.body.toLowerCase();
    const isMatch = TRIGGERS.some((regex) => regex.test(body));

    if (isMatch && comment.id) {
      const sentiment = await getSentiment(comment.body);
      const bucket = QUOTE_BUCKETS[sentiment] ?? ALL_QUOTES;
      const randomQuote =
        bucket[Math.floor(Math.random() * bucket.length)] ??
        "A Lannister always pays his debts.";

      await reddit.submitComment({
        id: comment.id as `t1_${string}`,
        text: randomQuote,
      });

      console.log(`[tywin] Replied to ${sentiment} comment ${comment.id} by ${author.name}`);
    }
  } catch (error) {
    console.error(`Error handling comment submit: ${error}`);
  }
};
