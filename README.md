# Rocket CP Calculator

ロケットモデルの空力中心（Center of Pressure; CP）位置を簡単に求めるための小さなユーティリティです。Barrowman 法に基づき、3・4・6 枚フィンを想定した干渉補正や、フィンが想定外の枚数のときの警告も含めて計算します。

## できること
- 機体長、直径、フィン位置・形状（前縁/後縁の長さや後退長など）を入力すると、
  - CP 位置 `Xcp`
  - 口径換算距離 `calibers`（直径で割った CP 位置）
  - ノーズコーンとフィンの法線力傾斜 `CNa` などの中間値
  - 想定外枚数フィン時の警告メッセージ
  をまとめて返します。
- ブラウザから `window.CpCalculator.calculateCp` として、Node.js からは CommonJS モジュールとして利用できます。

## 使い方
```js
const { calculateCp } = require('./cpCalculator');

const result = calculateCp({
  L: 0.2,   // ノーズ長 [m]
  d: 0.04,  // 直径 [m]
  n: 4,     // フィン枚数
  Xf: 0.35, // 前縁位置 [m]
  dX: 0.02, // フィン根本と前縁の距離 [m]
  Lfr: 0.1, // フィン前縁長 [m]
  Lfc: 0.06,// フィン後縁長 [m]
  S: 0.06,  // スパン長 [m]
});

console.log(result.Xcp);      // CP 位置（機体先端からの距離）
console.log(result.calibers); // 直径で割った位置
```

## テスト
Node.js の組み込みテスティングフレームワーク（`node --test`）で自動テストを用意しています。

```bash
npm test
```

2025-11-17 時点で全テストが通過しています。最新の結果は上記コマンドで確認できます。
