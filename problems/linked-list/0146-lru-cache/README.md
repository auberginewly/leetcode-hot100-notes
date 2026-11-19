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

## 5. 解法三：Map + 双向链表（面试标准版）

为什么还需要链表？如果面试官要求你自己维护「最近使用」顺序，不依赖 JS Map 的插入顺序，可以把职责拆开：

- **Map：** `key → 节点`，平均 O(1) 定位。
- **双向链表：** O(1) 删除已知节点并插到最前面。

```text
head ⇄ A ⇄ B ⇄ C ⇄ tail
       最新       最旧
```

`head` 和 `tail` 是虚拟节点，避免处理空链表特殊情况。**不需要 LeetCode 提供的 ListNode，也不一定需要自己写 Node 类。** 本题节点是双向的，普通 JS 对象 `{ key, value, prev, next }` 就足够。普通单向链表的 `ListNode(val,next)` 不能直接完成这里的 O(1) 删除。

### 三个必须掌握的操作

**插入到 head 后面**：原来 `head ⇄ A`，插入 B 后变成 `head ⇄ B ⇄ A`。

```js
addToHead(node) {
  node.prev = this.head;       // B 左边是 head
  node.next = this.head.next;  // B 右边是原来的 A
  this.head.next.prev = node;  // A 左边改成 B
  this.head.next = node;       // head 右边改成 B
}
```

**删除一个已知节点**：`A ⇄ B ⇄ C` 变为 `A ⇄ C`，只改两条邻居指针。

```js
removeNode(node) {
  node.prev.next = node.next;
  node.next.prev = node.prev;
}
```

**移到头部**：先摘掉，再插入。

```js
moveToHead(node) {
  this.removeNode(node);
  this.addToHead(node);
}
```

### 完整 JavaScript 实现

```js
// 双向链表节点用普通对象即可，不必额外定义 Node / ListNode 类。
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: null, value: null, prev: null, next: null };
    this.tail = { key: null, value: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
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

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this.moveToHead(node);
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this.moveToHead(node);
      return;
    }

    const node = { key, value, prev: null, next: null };
    this.map.set(key, node);
    this.addToHead(node);

    if (this.map.size > this.capacity) {
      const oldest = this.tail.prev;
      this.removeNode(oldest);
      this.map.delete(oldest.key);
    }
  }
}

module.exports = { LRUCache };
```

完整文件：[solution.js](solution.js)。提交 LeetCode 时删除最后的 `module.exports` 即可。

### get / put 是怎么组合出来的？

- `get`：Map 找到节点 → `moveToHead` → 返回 value。
- `put` 已存在：更新 value → `moveToHead`。
- `put` 不存在：创建普通对象节点 → 写 Map → `addToHead` → 如果超容量，删除 `tail.prev`，同时 `map.delete(oldest.key)`。

**不变量：** Map 里每个 key 都对应链表中的一个真实节点；从 head 到 tail 永远按「最新 → 最旧」排列。

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
