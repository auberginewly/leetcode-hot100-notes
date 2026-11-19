const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LRUCache } = require('../problems/linked-list/0146-lru-cache/solution');

test('官方典型流程', () => {
  const lru = new LRUCache(2);
  lru.put(1, 1); lru.put(2, 2);
  assert.equal(lru.get(1), 1);
  lru.put(3, 3);
  assert.equal(lru.get(2), -1);
  lru.put(4, 4);
  assert.equal(lru.get(1), -1);
  assert.equal(lru.get(3), 3);
  assert.equal(lru.get(4), 4);
});

test('更新现有 key 刷新使用顺序', () => {
  const lru = new LRUCache(2);
  lru.put(1, 1); lru.put(2, 2); lru.put(1, 10); lru.put(3, 3);
  assert.equal(lru.get(1), 10);
  assert.equal(lru.get(2), -1);
});

test('容量为 1', () => {
  const lru = new LRUCache(1);
  lru.put(1, 1); lru.put(2, 2);
  assert.equal(lru.get(1), -1);
  assert.equal(lru.get(2), 2);
});
