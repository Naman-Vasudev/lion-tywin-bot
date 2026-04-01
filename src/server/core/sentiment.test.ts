import { describe, it, expect } from 'vitest';
import { analyzeSentiment } from './sentiment';

describe('analyzeSentiment', () => {
  it('should identify positive sentiment', () => {
    expect(analyzeSentiment('Tywin Lannister is a great and wise leader')).toBe('positive');
    expect(analyzeSentiment('I love the family and its legacy')).toBe('positive');
  });

  it('should identify negative sentiment', () => {
    expect(analyzeSentiment('You are a stupid fool and a traitor')).toBe('negative');
    expect(analyzeSentiment('Tywin is a coward and a bastard')).toBe('negative');
  });

  it('should handle negation', () => {
    expect(analyzeSentiment('Tywin is not a fool')).toBe('positive');
    expect(analyzeSentiment('He is never weak')).toBe('positive');
    expect(analyzeSentiment('I do not hate you')).toBe('positive');
  });

  it('should handle intensity', () => {
    expect(analyzeSentiment('He is very smart')).toBe('positive'); // Score: 3 * 2 = 6
    expect(analyzeSentiment('This is extremely bad')).toBe('negative'); // Score: -3 * 2 = -6
  });

  it('should identify neutral sentiment', () => {
    expect(analyzeSentiment('Tywin Lannister sits on the small council')).toBe('neutral');
    expect(analyzeSentiment('The sky is grey today')).toBe('neutral');
  });

  it('should handle empty input', () => {
    expect(analyzeSentiment('')).toBe('neutral');
  });
});
