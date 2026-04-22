import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNaturalLanguage } from '../js/dsl.js';

test('dsl: extract explicit rating', () => {
  const rules = parseNaturalLanguage('评分4.5以上');
  assert.deepEqual(
    rules.find(r => r.field === 'rating'),
    { type: 'CONSTRAINT', field: 'rating', op: '>=', value: 4.5 }
  );
});

test('dsl: extract explicit distance', () => {
  const rules = parseNaturalLanguage('距离1公里内');
  assert.deepEqual(
    rules.find(r => r.field === 'distance'),
    { type: 'CONSTRAINT', field: 'distance', op: '<=', value: 1.0 }
  );
});

test('dsl: extract party size', () => {
  const rules = parseNaturalLanguage('8人包间');
  assert.ok(rules.some(r => r.field === 'party_size' && r.value === 8));
});

test('dsl: extract time', () => {
  const rules = parseNaturalLanguage('今晚7点');
  assert.ok(rules.some(r => r.field === 'time' && r.value === '19:00'));
});

test('dsl: extract room type', () => {
  const rules = parseNaturalLanguage('要包间');
  assert.ok(rules.some(r => r.field === 'room_type' && r.value === 'private'));
});

test('dsl: fuzzy "好一点" maps to rating >= 4.0', () => {
  const rules = parseNaturalLanguage('找个好一点的');
  assert.ok(rules.some(r => r.field === 'rating' && r.value === 4.0));
});

test('dsl: fuzzy "离我近" maps to distance <= 1.0', () => {
  const rules = parseNaturalLanguage('离我近的');
  assert.ok(rules.some(r => r.field === 'distance' && r.value === 1.0));
});

test('dsl: fuzzy "便宜" maps to price <= 80', () => {
  const rules = parseNaturalLanguage('找个便宜的');
  assert.ok(rules.some(r => r.field === 'price_per_person' && r.value === 80));
});

test('dsl: "今晚" without specific time defaults to 19:00', () => {
  const rules = parseNaturalLanguage('今晚吃');
  assert.ok(rules.some(r => r.field === 'time' && r.value === '19:00'));
});

test('dsl: generates CRITICAL for payment', () => {
  const rules = parseNaturalLanguage('帮我付500定金');
  assert.ok(rules.some(r => r.type === 'CRITICAL' && r.fn === 'confirm_before_payment'));
});

test('dsl: generates CRITICAL for booking', () => {
  const rules = parseNaturalLanguage('预订今晚7点');
  assert.ok(rules.some(r => r.type === 'CRITICAL' && r.fn === 'all_constraints_satisfied'));
});

test('dsl: service extraction for birthday', () => {
  const rules = parseNaturalLanguage('要能办生日派对');
  assert.ok(rules.some(r => r.field === 'service' && r.value === 'birthday'));
});

test('dsl: complex sentence', () => {
  const rules = parseNaturalLanguage('预订今晚7点4人桌，评分4.0以上');
  assert.ok(rules.some(r => r.field === 'time' && r.value === '19:00'));
  assert.ok(rules.some(r => r.field === 'party_size' && r.value === 4));
  assert.ok(rules.some(r => r.field === 'rating' && r.value === 4.0));
});
