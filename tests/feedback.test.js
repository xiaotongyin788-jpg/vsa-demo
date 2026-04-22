import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateFeedback } from '../js/feedback.js';
import { restaurants } from '../js/data.js';

test('feedback: suggest alternative time when slot full', () => {
  const rules = [
    { type: 'CONSTRAINT', field: 'time', op: '==', value: '18:00' },
    { type: 'CONSTRAINT', field: 'party_size', op: '==', value: 6 },
    { type: 'CONSTRAINT', field: 'room_type', op: '==', value: 'private' }
  ];
  const laocheng = restaurants.find(r => r.id === 'laocheng');
  const failedCheck = { field: 'table_available', passed: false, reason: '18:00 时段已满' };
  const fb = generateFeedback(rules, laocheng, [failedCheck], restaurants);
  assert.ok(fb.suggestions.some(s => s.type === 'alternative_time'));
});

test('feedback: suggest alternative restaurant when rating not met', () => {
  const rules = [{ type: 'CONSTRAINT', field: 'rating', op: '>=', value: 4.5 }];
  const xiangwei = restaurants.find(r => r.id === 'xiangwei');
  const failedCheck = { field: 'rating', passed: false, reason: '实际评分 3.8' };
  const fb = generateFeedback(rules, xiangwei, [failedCheck], restaurants);
  assert.ok(fb.suggestions.some(s => s.type === 'alternative_restaurant'));
});

test('feedback: returns reasons from failed checks', () => {
  const rules = [];
  const r = restaurants[0];
  const failedChecks = [
    { field: 'rating', passed: false, reason: '不满足' },
    { field: 'distance', passed: false, reason: '太远' }
  ];
  const fb = generateFeedback(rules, r, failedChecks);
  assert.equal(fb.reasons.length, 2);
  assert.ok(fb.reasons.includes('不满足'));
});
