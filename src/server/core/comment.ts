import { reddit } from '@devvit/web/server';
import { QUOTE_BUCKETS, ALL_QUOTES } from './quotes';
import { analyzeSentiment } from './sentiment';

const TRIGGERS = [
  /\btywin\b/i,
  /\blannister\b/i,
  /\blord tywin\b/i,
];

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
      // Purely local sentiment analysis (robust AFINN-165 dictionary)
      const sentiment = analyzeSentiment(comment.body);
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
