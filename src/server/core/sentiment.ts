import Sentiment from 'sentiment';

const analyzer = new Sentiment();

/**
 * A robust sentiment analyzer for Tywin Bot using the AFINN-165 dictionary.
 * It handles over 3,300 words including slang, swearing, and negations.
 */
export const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  if (!text) return 'neutral';

  const result = analyzer.analyze(text);
  const score = result.score;

  // AFINN score thresholds:
  // Usually anything > 0 is positive, but for Tywin's pragmatic tone,
  // we require a slightly stronger positive/negative sentiment.
  if (score >= 2) return 'positive';
  if (score <= -2) return 'negative';
  return 'neutral';
};
