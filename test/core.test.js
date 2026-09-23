import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAcceptLanguage } from '../src/core.js';

test('parses a simple header', () => {
  assert.deepEqual(parseAcceptLanguage('en-US'), [
    { tag: 'en-US', q: 1 },
  ]);
});

test('sorts by descending q', () => {
  assert.deepEqual(parseAcceptLanguage('en-US,fr;q=0.5,de;q=0.9'), [
    { tag: 'en-US', q: 1 },
    { tag: 'de', q: 0.9 },
    { tag: 'fr', q: 0.5 },
  ]);
});

test('normalizes highest q to 1', () => {
  assert.deepEqual(parseAcceptLanguage('en;q=0.8,fr;q=0.4'), [
    { tag: 'en', q: 1 },
    { tag: 'fr', q: 0.5 },
  ]);
});

test('keeps original tag casing', () => {
  assert.deepEqual(parseAcceptLanguage('EN-us,FR'), [
    { tag: 'EN-us', q: 1 },
    { tag: 'FR', q: 1 },
  ]);
});

test('skips wildcard entries', () => {
  assert.deepEqual(parseAcceptLanguage('*,en'), [
    { tag: 'en', q: 1 },
  ]);
});

test('skips q=0 entries', () => {
  assert.deepEqual(parseAcceptLanguage('en;q=0,fr'), [
    { tag: 'fr', q: 1 },
  ]);
});

test('skips invalid tags', () => {
  assert.deepEqual(parseAcceptLanguage('en,not a tag,fr'), [
    { tag: 'en', q: 1 },
    { tag: 'fr', q: 1 },
  ]);
});

test('deduplicates case-insensitively', () => {
  assert.deepEqual(parseAcceptLanguage('en-US,en-us'), [
    { tag: 'en-US', q: 1 },
  ]);
});

test('handles whitespace and empty parts', () => {
  assert.deepEqual(parseAcceptLanguage('  en , , fr ; q=0.5 '), [
    { tag: 'en', q: 1 },
    { tag: 'fr', q: 0.5 },
  ]);
});

test('rejects q values above 1', () => {
  assert.deepEqual(parseAcceptLanguage('en;q=1.5,fr'), [
    { tag: 'en', q: 1 },
    { tag: 'fr', q: 1 },
  ]);
});

test('rejects malformed q values', () => {
  assert.deepEqual(parseAcceptLanguage('en;q=abc,fr'), [
    { tag: 'en', q: 1 },
    { tag: 'fr', q: 1 },
  ]);
});

test('returns empty array for empty header', () => {
  assert.deepEqual(parseAcceptLanguage(''), []);
});

test('returns empty array for non-string input', () => {
  assert.deepEqual(parseAcceptLanguage(null), []);
});
