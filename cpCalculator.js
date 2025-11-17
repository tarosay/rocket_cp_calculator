(function (global) {
  'use strict';

  function calculateCp(params) {
    const { L, d, n, Xf, dX, Lfr, Lfc, S } = params;

    if ([L, d, n, Xf, Lfr, Lfc, S].some(v => !isFinite(v)) || !isFinite(dX)) {
      throw new Error('All parameters must be finite numbers.');
    }
    if ([L, d, n, Xf, Lfr, Lfc, S].some(v => v <= 0) || dX < 0) {
      throw new Error('All parameters must be positive (dX must be >= 0).');
    }

    const R = d / 2;      // Body radius
    const XR = dX;        // = Xt - Xf (Barrowman X_R)

    // Nose cone (cone)
    const CNa_n = 2.0;            // (C_Nα)_N
    const Xn = (2.0 / 3.0) * L;   // X_N = 2/3 L

    // Fin geometry (mid-chord line length Lf)
    const deltaXmc = XR + (Lfc - Lfr) / 2.0; // Δx_mc = X_R + (Ct - Cr)/2
    const Lf = Math.sqrt(S * S + deltaXmc * deltaXmc);

    // Fin (C_Nα)_F without body interference
    const lambda = 2.0 * Lf / (Lfr + Lfc);
    const denom = 1.0 + Math.sqrt(1.0 + lambda * lambda);
    const CNa_f = (4.0 * n * Math.pow(S / d, 2)) / denom; // (C_Nα)_F

    // Fin-body interference factor
    let Kfb;
    let warn = '';
    if (n === 3 || n === 4) {
      Kfb = 1.0 + R / (S + R);
    } else if (n === 6) {
      Kfb = 1.0 + 0.5 * R / (S + R);
    } else {
      Kfb = 1.0;
      warn = '注意: バローマン法は通常 3, 4, 6 枚フィンを想定しています。n ≠ 3,4,6 の場合は近似として扱ってください。';
    }
    const CNa_fb = CNa_f * Kfb; // (C_Nα)_{F,b} with body interference

    // Fin aerodynamic center location (Barrowman general expression)
    const Xf_cp =
      Xf +
      (XR / 3.0) * (Lfr + 2.0 * Lfc) / (Lfr + Lfc) +
      (1.0 / 6.0) * ((Lfr + Lfc) - (Lfr * Lfc) / (Lfr + Lfc));

    // Overall Cp
    const CNa_total = CNa_n + CNa_fb;
    const Xcp = (CNa_n * Xn + CNa_fb * Xf_cp) / CNa_total;
    const calibers = Xcp / d;

    return {
      Xcp,
      calibers,
      CNa_n,
      CNa_fb,
      Xn,
      XR,
      deltaXmc,
      Lf,
      lambda,
      CNa_f,
      Kfb,
      Xf_cp,
      warn,
    };
  }

  const api = { calculateCp };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (global) {
    global.CpCalculator = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
