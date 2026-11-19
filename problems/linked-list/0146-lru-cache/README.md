# 146. LRU 缓存

[LeetCode 原题](https://leetcode.cn/problems/lru-cache/description/) · 中等 · 哈希表 / 双向链表

## 1. 一句话理解

设计一个固定容量的缓存。每次读取或写入已有 key，都算「最近使用」。容量满了，插入新 key 时要删除**最久没有被使用**的 key。要求 `get` 和 `put` 平均 O(1)。

## 2. 先手动模拟

容量为 2；从左到右是「最新 → 最旧」。

| 操作 | 顺序 | 结果 |
| --- | --- | --- |
| `put(1,1)` | 1 | 插入 1 |
| `put(2,2)` | 2 → 1 | 插入 2 |
| `get(1)` | 1 → 2 | 返回 1，1 变最新 |
| `put(3,3)` | 3 → 1 | 淘汰 2 |
| `get(2)` | 3 → 1 | 返回 -1 |

**注意：读取也要更新使用顺序。**

## 3. 解法一：数组模拟（便于理解）

用数组按新旧顺序保存键值对。读写都要寻找 key，可能还需要移动元素，因此时间 O(n)、空间 O(capacity)。不满足题目平均 O(1) 的要求。

## 4. 解法二：JavaScript 原生 Map（最简洁）

JS 的 `Map` **按插入顺序迭代**。我们规定「越靠后插入 = 越新使用」：

- `get(key)`：不存在返回 -1；存在就先 `delete` 再 `set`，使其成为最新。
- `put(key,value)`：已有就删除旧位置，再 `set`；超出容量就删 `map.keys().next().value`（最旧的 key）。

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}

module.exports = { LRUCache };
```

完整文件：[solution-map.js](solution-map.js)。**这是 JS 刷题最省代码的版本。** `Map` 的查找、插入和删除平均 O(1)，所以 `get` / `put` 平均 O(1)，空间 O(capacity)。

## 5. 解法三：Map + 双向链表（官方风格）

参考[力扣官方题解](https://leetcode.cn/problems/lru-cache/solutions/259678/lruhuan-cun-ji-zhi-by-leetcode-solution/)的结构：使用自定义 `DLinkedNode`、`Map`、虚拟头尾节点，并维护 `size`。

- `Map` 根据 key 平均 O(1) 找到节点。
- 双向链表从 `head` 到 `tail` 依次为最新到最旧。
- `get` 命中时调用 `moveToHead`。
- `put` 已存在时更新值并移到头部；新插入超容量时调用 `removeTail`，同步删除 Map 中的 key。

`DLinkedNode` 需要 `key`、`value`、`prev`、`next`。本题**不会预置可直接使用的双向链表节点类**，因此按官方思路自行定义；它不同于其他题常见的单向 `ListNode`。

### 关键操作

```js
addToHead(node) {
  node.prev = this.head;
  node.next = this.head.next;
  this.head.next.prev = node;
  this.head.next = node;
}

removeNode(node) {
  node.prev.next = node.next;
  node.next.prev = node.prev;
}

moveToHead(node) {
  this.removeNode(node);
  this.addToHead(node);
}

removeTail() {
  const node = this.tail.prev;
  this.removeNode(node);
  return node;
}
```

先连接新节点和原头节点，再更新邻居指针。删除已知节点只需将前驱、后继接起来。尾部的真实节点 `tail.prev` 就是待淘汰节点。

### 完整 JavaScript 实现

```js
class DLinkedNode {
  constructor(key = 0, value = 0) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.cache = new Map();
    this.head = new DLinkedNode();
    this.tail = new DLinkedNode();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const node = this.cache.get(key);
    this.moveToHead(node);
    return node.value;
  }

  put(key, value) {
    if (!this.cache.has(key)) {
      const node = new DLinkedNode(key, value);
      this.cache.set(key, node);
      this.addToHead(node);
      this.size++;
      if (this.size > this.capacity) {
        const removed = this.removeTail();
        this.cache.delete(removed.key);
        this.size--;
      }
    } else {
      const node = this.cache.get(key);
      node.value = value;
      this.moveToHead(node);
    }
  }

  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }

  removeTail() {
    const node = this.tail.prev;
    this.removeNode(node);
    return node;
  }
}

module.exports = { LRUCache };
```

[独立源码 solution.js](solution.js)。在 LeetCode 提交时删除最后一行 `module.exports`；其余代码可直接提交。

## 6. 复杂度对比

| 解法 | get | put | 空间 |
| --- | --- | --- | --- |
| 数组模拟 | O(n) | O(n) | O(capacity) |
| 原生 Map | 平均 O(1) | 平均 O(1) | O(capacity) |
| Map + 双向链表 | 平均 O(1) | 平均 O(1) | O(capacity) |

Map 的哈希操作是**平均** O(1)，不是严格最坏情况保证。链表的插入、删除操作本身是 O(1)。

## 7. 易错点和面试追问

1. `get` 读取成功后忘记移动节点，导致后续淘汰错误。
2. `put` 更新已有 key 时忘记刷新使用顺序。
3. 淘汰节点只删链表、忘记从 Map 删除 key。
4. `addToHead` 先覆盖 `head.next`，导致原来的第一个节点丢失。
5. **为什么双向而不是单向？** Map 能直接找到目标节点，但单向链表通常还得寻找前驱才能摘掉它。
6. **为什么节点存 key？** 淘汰 `tail.prev` 时需要按 key 删除 Map 条目。
7. **两种 Map 有何不同？** 简洁版利用 JS Map 自带的插入顺序；面试版 Map 只负责查找，链表独立维护顺序。

## 8. 三句话复习卡片

1. LRU = 每次使用刷新顺序，满了淘汰最久没用的。
2. JS 直接用 Map：`delete + set` 刷新顺序；`keys().next().value` 找最旧。
3. 通用标准版：Map 找节点，双向链表用 `removeNode` / `addToHead` O(1) 移动，淘汰 `tail.prev`。

运行测试：`node --test tests/*.test.js`。
