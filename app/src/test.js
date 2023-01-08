import baretest from 'baretest';
import * as assert from 'assert';
import { clean_insert, testQuery } from "./query.js";

const test = baretest('Tests');

test('first test on t1', async () => {
  const given = `insert into t1 (name) values
  ('bill'),
  ('john'),
  ('jane')`;
  await clean_insert(given);

  const res = (await testQuery()).fetchAll();
  assert.equal(res.length, 3);
  assert.equal(res[0][0], 1);
  assert.equal(res[0][1], 'bill');
  assert.equal(res[1][0], 2);
  assert.equal(res[1][1], 'john');
  assert.equal(res[2][0], 3);
  assert.equal(res[2][1], 'jane');
});

test('second test on t1', async () => {
  const given = `insert into t1 (name) values
  ('jim'),
  ('jenny'),
  ('sarah')`;
  await clean_insert(given);

  const res = (await testQuery()).fetchAll();
  assert.equal(res.length, 3);
  assert.equal(res[0][0], 1);
  assert.equal(res[0][1], 'jim');
  assert.equal(res[1][0], 2);
  assert.equal(res[1][1], 'jenny');
  assert.equal(res[2][0], 3);
  assert.equal(res[2][1], 'sarah');
});

try {
  await test.run()
} catch (e) { console.log(e) }