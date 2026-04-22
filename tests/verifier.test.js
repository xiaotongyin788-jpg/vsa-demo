import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyPredicates, verifyCritical } from '../js/verifier.js';

const mockRestaurant = {
  id: 'test', name: '测试店', rating: 4.6, distance: 0.5,
  pricePerPerson: 100,
  businessHours: { open: '11:00', close: '22:00' },
  rooms: [{ type: 'private', capacity: 8, availableSlots: ['19:00','20:00'] }],
  services: ['birthday']
};

test('verifier: rating constraint passes', () => {
  const rules = [{ type: 'CONSTRAINT', field: 'rating', op: '>=', value: 4.5 }];
  const result = verifyPredicates(rules, mockRestaurant);
  assert.equal(result.passed, true);
});

test('verifier: rating constraint fails', () => {
  const rules = [{ type: 'CONSTRAINT', field: 'rating', op: '>=', value: 4.8 }];
  const result = verifyPredicates(rules, mockRestaurant);
  assert.equal(result.passed, false);
});

test('verifier: distance and price combined', () => {
  const rules = [
    { type: 'CONSTRAINT', field: 'distance', op: '<=', value: 1.0 },
    { type: 'CONSTRAINT', field: 'price_per_person', op: '<=', value: 150 }
  ];
  const result = verifyPredicates(rules, mockRestaurant);
  assert.equal(result.passed, true);
});

test('verifier: room_type fails when no private room', () => {
  const noPrivate = { ...mockRestaurant, rooms: [{ type: 'hall', capacity: 30, availableSlots: [] }] };
  const rules = [{ type: 'CONSTRAINT', field: 'room_type', op: '==', value: 'private' }];
  const result = verifyPredicates(rules, noPrivate);
  assert.equal(result.passed, false);
});

test('verifier: table_available passes', () => {
  const rules = [
    { type: 'CONSTRAINT', field: 'time', op: '==', value: '19:00' },
    { type: 'CONSTRAINT', field: 'party_size', op: '==', value: 6 },
    { type: 'CONSTRAINT', field: 'room_type', op: '==', value: 'private' },
    { type: 'VERIFY', fn: 'table_available' }
  ];
  const result = verifyPredicates(rules, mockRestaurant);
  const tableCheck = result.checks.find(c => c.field === 'table_available');
  assert.ok(tableCheck);
  assert.equal(tableCheck.passed, true);
});

test('verifier: table_available fails when slot missing', () => {
  const rules = [
    { type: 'CONSTRAINT', field: 'time', op: '==', value: '18:00' },
    { type: 'CONSTRAINT', field: 'party_size', op: '==', value: 6 },
    { type: 'CONSTRAINT', field: 'room_type', op: '==', value: 'private' },
    { type: 'VERIFY', fn: 'table_available' }
  ];
  const result = verifyPredicates(rules, mockRestaurant);
  const tableCheck = result.checks.find(c => c.field === 'table_available');
  assert.equal(tableCheck.passed, false);
});

test('verifier: business hours passes', () => {
  const rules = [
    { type: 'CONSTRAINT', field: 'time', op: '==', value: '19:00' },
    { type: 'VERIFY', fn: 'within_business_hours' }
  ];
  const result = verifyPredicates(rules, mockRestaurant);
  const hourCheck = result.checks.find(c => c.field === 'within_business_hours');
  assert.equal(hourCheck.passed, true);
});

test('critical: passes when predicates pass', () => {
  const rules = [
    { type: 'CONSTRAINT', field: 'rating', op: '>=', value: 4.0 },
    { type: 'CRITICAL', fn: 'all_constraints_satisfied' }
  ];
  const predicateResult = verifyPredicates(rules, mockRestaurant);
  const critical = verifyCritical(rules, predicateResult);
  assert.equal(critical.passed, true);
});

test('critical: fails when predicates fail', () => {
  const rules = [
    { type: 'CONSTRAINT', field: 'rating', op: '>=', value: 4.9 },
    { type: 'CRITICAL', fn: 'all_constraints_satisfied' }
  ];
  const predicateResult = verifyPredicates(rules, mockRestaurant);
  const critical = verifyCritical(rules, predicateResult);
  assert.equal(critical.passed, false);
});

test('critical: payment requires confirmation', () => {
  const rules = [{ type: 'CRITICAL', fn: 'confirm_before_payment' }];
  const result = verifyCritical(rules, { passed: true, checks: [] });
  assert.equal(result.requiresConfirmation, true);
});
