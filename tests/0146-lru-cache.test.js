const { test } = require('node:test');
const assert = require('node:assert/strict');

for (const [name, path] of [
  ['原生 Map', '../problems/linked-list/0146-lru-cache/solution-map'],
  ['Map + 双向链表', '../problems/linked-list/0146-lru-cache/solution'],
]) {
  const { LRUCache } = require(path);

  test(name + '：典型流程', () => {
    const cache = new LRUCache(2);
    cache.put(1, 1); cache.put(2, 2);
    assert.equal(cache.get(1), 1);
    cache.put(3, 3);
    assert.equal(cache.get(2), -1);
    cache.put(4, 4);
    assert.equal(cache.get(1), -1);
    assert.equal(cache.get(3), 3);
    assert.equal(cache.get(4), 4);
  });

  test(name + '：更新已有 key 刷新顺序', () => {
    const cache = new LRUCache(2);
    cache.put(1, 1); cache.put(2, 2);
    cache.put(1, 10); cache.put(3, 3);
    assert.equal(cache.get(1), 10);
    assert.equal(cache.get(2), -1);
  });

  test(name + '：容量为 1', () => {
    const cache = new LRUCache(1);
    cache.put(1, 1); cache.put(2, 2);
    assert.equal(cache.get(1), -1);
    assert.equal(cache.get(2), 2);
  });
}
