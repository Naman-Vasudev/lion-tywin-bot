/**
 * A robust rule-based sentiment analyzer for Tywin Bot.
 * Handles negation (e.g., "not bad") and intensity (e.g., "very good").
 */

// AFINN-light dictionary
const SENTIMENT_WORDS: Record<string, number> = {
  // Positive
  'admire': 3, 'amazing': 4, 'best': 5, 'brave': 3, 'brilliant': 4, 'clever': 3,
  'excellent': 4, 'family': 2, 'glory': 3, 'good': 3, 'great': 4, 'honor': 2,
  'just': 2, 'justice': 2, 'legacy': 3, 'lion': 2, 'love': 3, 'loyal': 4,
  'master': 2, 'perfect': 4, 'praise': 3, 'pride': 2, 'respect': 3, 'right': 1,
  'smart': 3, 'strong': 2, 'success': 3, 'true': 1, 'victory': 3, 'wise': 4, 'win': 2,

  // Negative
  'arrogant': -3, 'bad': -3, 'bastard': -4, 'betray': -4, 'clumsy': -2, 'coward': -5,
  'cruel': -3, 'defeat': -3, 'disgrace': -4, 'enemy': -2, 'evil': -4, 'fail': -3,
  'fool': -4, 'hate': -4, 'insolent': -4, 'kill': -3, 'liar': -3, 'mad': -3,
  'murder': -4, 'rat': -3, 'scum': -4, 'shame': -3, 'stunted': -3, 'stupid': -4,
  'traitor': -5, 'ugly': -3, 'weak': -4, 'whore': -4, 'worst': -5, 'wrong': -2,
};

// Words that flip sentiment
const NEGATIONS = new Set(['not', 'no', 'never', 'can\'t', 'don\'t', 'isn\'t', 'aren\'t', 'won\'t', 'didn\'t', 'hardly', 'scarcely']);

// Words that amplify sentiment
const INTENSIFIERS = new Set(['very', 'extremely', 'really', 'so', 'highly', 'truly', 'too', 'quite']);

/**
 * Analyzes text sentiment by calculating a score based on words, negation, and intensity.
 * Returns: 'positive' if >= 2, 'negative' if <= -2, else 'neutral'.
 */
export const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  if (!text) return 'neutral';

  const tokens = text.toLowerCase().match(/\b[\w']+\b/g) || [];
  let totalScore = 0;
  let modifier = 1;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    // Check for modifier words
    if (NEGATIONS.has(token)) {
      modifier = -1;
      continue;
    }
    if (INTENSIFIERS.has(token)) {
      modifier = 2;
      continue;
    }

    // Score the word
    if (SENTIMENT_WORDS[token]) {
      totalScore += (SENTIMENT_WORDS[token] ?? 0) * modifier;
      // Reset modifier after use
      modifier = 1;
    } else {
      // If word is unknown, still reset modifier to avoid carrying it across too many words
      // (Unless it's an intensifier/negation that just set the modifier)
      const prevToken = i > 0 ? tokens[i - 1] : undefined;
      if (modifier !== 1 && prevToken && !NEGATIONS.has(prevToken) && !INTENSIFIERS.has(prevToken)) {
        modifier = 1;
      }
    }
  }

  if (totalScore >= 2) return 'positive';
  if (totalScore <= -2) return 'negative';
  return 'neutral';
};
