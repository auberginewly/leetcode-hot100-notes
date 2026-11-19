const {test}=require('node:test');
const assert=require('node:assert/strict');
const {isValid}=require('../problems/stack/0020-valid-parentheses/solution');
for(const [s,expected] of [['()',true],['()[]{}',true],['(]',false],['([])',true],['([)]',false],['(((',false],[')',false],['',true]])test(JSON.stringify(s),()=>assert.equal(isValid(s),expected));
