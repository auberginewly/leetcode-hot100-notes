# LeetCode Hot 100 · JavaScript 题解

写给算法初学者的中文题解仓库：从直观思路出发，解释为什么需要优化，再写出可复述、可运行的 JavaScript 最优解。

## 已完成

| 编号 | 题目 | 分类 | 题解 |
| --- | --- | --- | --- |
| 20 | 有效的括号 | 栈 | [题解](problems/stack/0020-valid-parentheses/README.md) |
| 46 | 全排列 | 回溯 | [题解](problems/backtracking/0046-permutations/README.md) |
| 146 | LRU 缓存 | 链表 / 哈希表 | [题解](problems/linked-list/0146-lru-cache/README.md) |

## 写作原则

- 先讲人话，再讲术语；先暴力，再推导最优解。
- 用具体例子和状态变化说明算法，解释关键代码为何这样写。
- JavaScript 为默认语言；给出复杂度、边界情况和面试追问。
- 提交代码前运行 `node --test tests/*.test.js`。

完整规范见 [AGENTS.md](AGENTS.md)，新题模板见 [templates/solution.md](templates/solution.md)。
