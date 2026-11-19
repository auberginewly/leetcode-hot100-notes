# 20. 有效的括号

[LeetCode 原题](https://leetcode.cn/problems/valid-parentheses/) · 简单 · 栈

## 一句话题意
给定只包含 `()[]{}` 的字符串，判断每个右括号是否和最近尚未匹配的左括号类型相同。

## 为什么要用栈？
括号遵循**后打开，先关闭**。例如 `([])`：先遇到 `(`，再遇到 `[`，必须先匹配 `]` 才能匹配 `)`。这正是栈的后进先出（LIFO）。

## 手动模拟
```text
输入 "([])"
读 '(' → 栈 ['(']
读 '[' → 栈 ['(', '[']
读 ']' → 弹出 '['，匹配成功
读 ')' → 弹出 '('，匹配成功
结束时栈为空 → true
```
而 `([)]` 在读到 `)` 时，栈顶是 `[`，类型不符，立刻返回 false。

## 面试标准 JavaScript
```js
var isValid = function(s) {
  if (s.length % 2 !== 0) return false;
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }
  return stack.length === 0;
};
module.exports = { isValid };
```
提交 LeetCode 时删除 `module.exports`。独立源码：[solution.js](solution.js)。

## 关键逻辑
- 奇数长度不可能全部配对，直接返回 false。
- 遇到左括号就入栈；遇到右括号就弹出栈顶，比较它是否为对应的左括号。
- 如果遇到右括号时栈为空，`pop()` 返回 undefined，也会比较失败。
- 遍历结束后必须检查栈是否为空，否则 `"((("` 会被误判为 true。

## 复杂度
时间 O(n)，每个字符最多入栈、出栈一次；空间 O(n)，最坏情况下全是左括号。

## 易错点 / 面试追问
- 只统计括号数量是不够的：`([)]` 数量正确，但顺序错误。
- 不能只检查遍历中的匹配，最后还需确认栈为空。
- `pairs` 是右括号 → 左括号，比较的是刚弹出的栈顶。

## 三句话复习
左括号入栈；右括号必须匹配栈顶，否则 false；遍历完栈为空才是 true。
