import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restaurants } from '../js/data.js';

test('data: 6 restaurants', () => {
  assert.equal(restaurants.length, 6);
});

test('data: each restaurant has required fields', () => {
  for (const r of restaurants) {
    assert.ok(r.id, `missing id`);
    assert.ok(r.name, `${r.id} missing name`);
    assert.ok(typeof r.rating === 'number', `${r.id} rating not number`);
    assert.ok(typeof r.distance === 'number', `${r.id} distance not number`);
    assert.ok(Array.isArray(r.rooms) && r.rooms.length > 0, `${r.id} no rooms`);
  }
});

test('data: covers high rating + close distance', () => {
  assert.ok(restaurants.some(r => r.rating >= 4.5 && r.distance <= 1.0));
});

test('data: covers low rating for constraint testing', () => {
  assert.ok(restaurants.some(r => r.rating < 4.0));
});

test('data: covers no-private-room scenario', () => {
  assert.ok(restaurants.some(r => !r.rooms.some(room => room.type === 'private')));
});

test('data: covers birthday service', () => {
  assert.ok(restaurants.some(r => r.services.includes('birthday')));
});
