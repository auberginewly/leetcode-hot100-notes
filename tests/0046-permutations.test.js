const {test}=require('node:test');
const assert=require('node:assert/strict');
const {permute}=require('../problems/backtracking/0046-permutations/solution');
test('三个数字六种排列',()=>{const actual=permute([1,2,3]).map(x=>x.join(',')).sort();assert.deepEqual(actual,['1,2,3','1,3,2','2,1,3','2,3,1','3,1,2','3,2,1'].sort())});
test('单个数字',()=>assert.deepEqual(permute([1]),[[1]]));
test('两个数字',()=>assert.deepEqual(permute([0,1]),[[0,1],[1,0]]));
