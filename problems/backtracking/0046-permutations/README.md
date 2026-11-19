# 46. 全排列

[LeetCode 原题](https://leetcode.cn/problems/permutations/) · 中等 · 回溯

## 一句话题意
给定互不重复的数字数组，返回所有可能的排列。比如 `[1,2,3]` 有 6 种顺序。

## 最直观思路
第一个位置尝试每个数字，第二个位置从没用过的数字中继续选，直到选满；回到上一层，撤销刚才的选择，再尝试别的数字。这就是**回溯**：做选择 → 递归 → 撤销选择。

例如 `[1,2,3]`：
```text
选 1 → 选 2 → 选 3 → 保存 [1,2,3]
            ↩ 撤销 3、2
     → 选 3 → 选 2 → 保存 [1,3,2]
↩ 撤销 1，接着以 2、3 开头搜索
```

## 为什么需要 used？
同一个排列里不能重复选同一个数字。`used[i]` 表示下标 i 的元素**在当前路径中**是否已被使用；回溯时要重置为 `false`，才能供其他排列使用。

## 面试标准 JavaScript
```js
var permute = function(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);

  function backtrack() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }

  backtrack();
  return result;
};
module.exports = { permute };
```
提交 LeetCode 时删除 `module.exports`。独立源码：[solution.js](solution.js)。

## 为什么 result.push([...path])？
`path` 是不断 push/pop 的同一个数组。必须拷贝一份当前排列；如果直接保存 `path` 的引用，递归结束后结果里的数组会被后续回溯修改。

## 复杂度
时间 O(n × n!)：共有 n! 个排列，保存每个排列需要 O(n)。额外辅助空间 O(n)（路径、used 和递归栈），不计存放答案的 O(n × n!)。

## 易错点 / 面试追问
- 忘记撤销 `path.pop()` 或 `used[i] = false`，后续分支就会出错。
- `result.push(path)` 会保存同一个可变数组的引用。
- `used` 是针对下标而不是值；本题保证数字不重复。若有重复数字，需考虑第 47 题的去重。
- 另一种经典写法是**原地交换**，但初学和面试复述通常先掌握 used 数组版本。

## 三句话复习
每一层决定一个位置放哪个数字；用 used 防止当前路径重复选；递归返回时撤销选择，选满时复制 path。
