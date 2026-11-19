# 146. LRU 缓存

[LeetCode 原题](https://leetcode.cn/problems/lru-cache/description/) · 中等 · 哈希表 / 双向链表

## 1. 一句话读懂题目

设计一个容量固定的缓存：读一个已有的 key 要返回 value，写入新的 key 时如果空间不够，就淘汰**最久没有被读或写**的那个 key。LRU 是 Least Recently Used（最近最少使用）的缩写。

`get(key)` 读不到返回 `-1`；`put(key, value)` 插入或更新。题目要求两种操作平均 O(1)。注意：**读取算使用，更新已有 key 也算使用。**

## 2. 用一个例子理解顺序

假设容量为 2，左侧表示最近使用，右侧表示最久未使用：

| 操作 | 缓存顺序（新 → 旧） | 返回值 / 说明 |
| --- | --- | --- |
| `put(1, 1)` | `1` | 插入 1 |
| `put(2, 2)` | `2 → 1` | 插入 2 |
| `get(1)` | `1 → 2` | 返回 1；1 变成最新 |
| `put(3, 3)` | `3 → 1` | 淘汰最旧的 2 |
| `get(2)` | `3 → 1` | 返回 -1 |
| `put(4, 4)` | `4 → 3` | 淘汰最旧的 1 |

## 3. 最直观的解法：数组

维护一个数组存储缓存项，从左到右表示新到旧。每次 `get` 搜索对应 key，把它移动到数组头；`put` 也先搜索，有则更新移动，无则插入头部，超容量就弹出尾部。

问题在于：找 key 需要遍历数组，O(n)；移动位置还可能引起数组元素整体挪动，O(n)。空间 O(capacity)。它直观，却不符合平均 O(1) 的要求。

**JS 的快捷替代：有序 `Map`。** JavaScript `Map` 保留插入顺序。找到 key 后先 `delete` 再 `set`，就能让它成为最新插入项；超过容量删除 `map.keys().next().value` 即可。Map 查找、删除、插入通常平均 O(1)，可以实现简洁版 LRU。但面试更值得掌握下面不依赖 Map 插入顺序的通用结构。

## 4. 最优解如何推导出来

我们需要同时解决两件事：

1. **快速找到一个 key**：用 `Map<key, Node>`，平均 O(1)。
2. **快速更新最近使用顺序**：用双向链表，将刚使用的节点放到最前面，O(1)。

链表用两个不存数据的哨兵（虚拟节点）：

```text
head ⇄ A ⇄ B ⇄ C ⇄ tail
       最新       最旧
```

`head.next` 永远是最近使用的真实节点；`tail.prev` 永远是最久未使用的真实节点。哨兵让空链表和单元素链表无需特殊判断。

一个真实节点有 `key`、`value`、`prev`、`next` 四个字段。存 `key` 是因为淘汰尾部节点时，还要 `map.delete(node.key)`。

### 操作 A：插入到 head 后面

假设原来是 `head ⇄ A ⇄ tail`，插入 B 后要变成 `head ⇄ B ⇄ A ⇄ tail`。

```js
addToHead(node) {
  node.prev = this.head;           // B 的左边是 head
  node.next = this.head.next;      // B 的右边是原来的 A
  this.head.next.prev = node;      // A 的左边改成 B
  this.head.next = node;           // head 的右边改成 B
}
```

先记住原来 `head.next` 指向谁，再修改邻居指针；如果先覆盖 `head.next`，就可能丢失原先的第一个节点。

### 操作 B：删除已知节点

假设 `A ⇄ B ⇄ C`，删除 B 就让 A 和 C 相连：

```js
removeNode(node) {
  node.prev.next = node.next; // A.next = C
  node.next.prev = node.prev; // C.prev = A
}
```

因为每个节点知道自己的前驱和后继，不必从头寻找前驱，因此删除已知节点只需要 O(1)。如果只有单向链表，通常得从头查找前驱，耗费 O(n)。

### 操作 C：移动到最前面

```js
moveToHead(node) {
  this.removeNode(node);
  this.addToHead(node);
}
```

这里**复用同一个节点**，不用新建节点，Map 也无需重新映射。

### `get` 与 `put` 的组成

- `get(key)`：Map 找不到就返回 `-1`；找到则移动到头部，返回 `node.value`。
- `put(key, value)`：已有 key 就更新 `node.value` 并移动到头部；新 key 就创建节点、写入 Map、插入头部。如果容量超限，删除 `tail.prev`，同时从 Map 删除该 key。

核心不变量：**Map 中的每个 key 恰好对应链表中的一个真实节点，链表顺序始终从最新到最旧。**

## 5. 手动模拟

容量为 2，开始只有哨兵：

```text
put(1,1)  head ⇄ 1 ⇄ tail
put(2,2)  head ⇄ 2 ⇄ 1 ⇄ tail
get(1)    head ⇄ 1 ⇄ 2 ⇄ tail  → 1
put(3,3)  head ⇄ 3 ⇄ 1 ⇄ tail  （删除 2）
get(2)    head ⇄ 3 ⇄ 1 ⇄ tail  → -1
```

特别注意 `get(1)` 不仅返回值，也会改变链表顺序；如果漏掉这个动作，下一次淘汰的就会是错误节点。

## 6. JavaScript 完整代码

以下代码可以在本地直接执行测试，提交 LeetCode 时删除末尾 `module.exports`。

```js
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(null, null);
    this.tail = new Node(null, null);
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
    const node = this.map.get(key);
    if (!node) return -1;
    this.moveToHead(node);
    return node.value;
  }

  put(key, value) {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    const node = new Node(key, value);
    this.map.set(key, node);
    this.addToHead(node);

    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this.removeNode(lru);
      this.map.delete(lru.key);
    }
  }
}

module.exports = { LRUCache };
```

独立源码：[solution.js](solution.js)。

## 7. 时间与空间复杂度

| 操作 | 平均时间复杂度 | 原因 |
| --- | --- | --- |
| `get` | O(1) | Map 查找 + 常数次指针修改 |
| `put` | O(1) | Map 查找/更新 + 常数次指针修改 |
| 空间 | O(capacity) | Map + 双向链表各存至多 capacity 个真实节点 |

这些时间界限是**平均 O(1)**，不是对 JS Map 哈希操作的严格最坏情况承诺。

## 8. 易错点与面试追问

- **只读取不移动**：`get` 命中后必须更新使用顺序。
- **更新旧 key 后不移动**：`put` 更新也算使用。
- **只删链表不删 Map**：会遗留过期映射；淘汰时两个结构都要删。
- **插入顺序写错**：先保存前后指针，再修改邻居的指针。
- **为什么要虚拟头尾？** 统一空链表、头部插入、尾部删除的处理。
- **为什么用双向链表？** Map 只能找到当前节点，双向链表才能 O(1) 找到其前驱并将它摘掉。
- **能否用 JS Map 一步到位？** 可以，借助插入顺序语义写得更短；手写版更能展示数据结构理解。

## 9. 三句话复习卡片

1. Map 负责按 key 在平均 O(1) 找到节点；双向链表负责 O(1) 调整新旧顺序。
2. 最近用过的放 `head.next`，要淘汰的取 `tail.prev`。
3. 记牢 `addToHead`、`removeNode`、`moveToHead` 三个操作，就能组合出 `get` 和 `put`。

本地验证：`node --test tests/*.test.js`。
