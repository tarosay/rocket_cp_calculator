'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { calculateCp } = require('../cpCalculator');

const approxEqual = (actual, expected, tolerance = 1e-12) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected}`);
};

test('計算結果が既知の 4 枚フィン例と一致する', () => {
  const result = calculateCp({
    L: 0.2,
    d: 0.04,
    n: 4,
    Xf: 0.35,
    dX: 0.02,
    Lfr: 0.1,
    Lfc: 0.06,
    S: 0.06,
  });

  approxEqual(result.Xcp, 0.3571969696969696);
  approxEqual(result.calibers, 8.92992424242424);
  approxEqual(result.CNa_fb, 20);
  assert.strictEqual(result.warn, '');
});

test('想定外枚数のフィンは警告を返し、干渉係数を 1 とする', () => {
  const result = calculateCp({
    L: 0.2,
    d: 0.04,
    n: 5,
    Xf: 0.35,
    dX: 0.02,
    Lfr: 0.1,
    Lfc: 0.06,
    S: 0.06,
  });

  assert.ok(result.warn.startsWith('注意')); // 警告メッセージ
  approxEqual(result.Kfb, 1);
});

test('不正な入力はエラーを投げる', () => {
  assert.throws(() => calculateCp({
    L: -1,
    d: 0.04,
    n: 4,
    Xf: 0.35,
    dX: 0.02,
    Lfr: 0.1,
    Lfc: 0.06,
    S: 0.06,
  }), /positive/);
});
