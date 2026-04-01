const Sentiment = require('sentiment');
const analyzer = new Sentiment();

const cases = [
  'Tywin is not a fool',
  'He is never weak',
  'I do not hate you',
  'He is very smart',
  'This is extremely bad'
];

cases.forEach(c => {
  const res = analyzer.analyze(c);
  console.log(`Text: "${c}" | Score: ${res.score} | Sentiment: ${res.score >= 2 ? 'positive' : res.score <= -2 ? 'negative' : 'neutral'}`);
});
