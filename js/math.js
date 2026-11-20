(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MarioMath = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clampTier(tier) {
    const n = Number(tier) || 1;
    return Math.max(1, Math.min(4, Math.round(n)));
  }

  function tierLabel(tier) {
    const labels = {
      1: '⭐ Fácil',
      2: '⭐⭐ Media',
      3: '⭐⭐⭐ Avanzada',
      4: '⭐⭐⭐⭐ Experto'
    };
    return labels[clampTier(tier)];
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs((a / gcd(a, b)) * b);
  }

  function simplifyFrac(num, den) {
    if (den < 0) {
      num = -num;
      den = -den;
    }
    if (num === 0) return { n: 0, d: 1 };
    const g = gcd(num, den);
    return { n: num / g, d: den / g };
  }

  const SUPERSCRIPTS = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };

  function toSuperscript(num) {
    return String(num).split('').map(ch => SUPERSCRIPTS[ch] || ch).join('');
  }

  function primeFactorsString(n) {
    if (n <= 1) return String(n);
    let temp = n;
    const parts = [];
    for (let p = 2; p * p <= temp; p++) {
      if (temp % p === 0) {
        let exp = 0;
        while (temp % p === 0) {
          exp++;
          temp = Math.floor(temp / p);
        }
        parts.push(exp > 1 ? `${p}${toSuperscript(exp)}` : `${p}`);
      }
    }
    if (temp > 1) {
      parts.push(`${temp}`);
    }
    return parts.join(' × ');
  }

  function fracHTML(n, d) {
    if (d === 1) {
      return `<span class="whole-num">${n}</span>`;
    }
    return `<span class="frac"><span class="num">${n}</span><span class="den">${d}</span></span>`;
  }

  function verticalCalcHTML(a, b, opSymbol) {
    const d1 = Math.floor(a / 10);
    const u1 = a % 10;
    const d2 = Math.floor(b / 10);
    const u2 = b % 10;
    return `
      <div class="vertical-op" aria-label="${a} ${opSymbol} ${b}">
        <div class="v-header">
          <span class="v-sign"></span>
          <span class="v-col dec-label">D</span>
          <span class="v-col uni-label">U</span>
        </div>
        <div class="v-row">
          <span class="v-sign"></span>
          <span class="v-col dec-val">${d1 > 0 ? d1 : ''}</span>
          <span class="v-col uni-val">${u1}</span>
        </div>
        <div class="v-row v-bottom">
          <span class="v-sign">${opSymbol}</span>
          <span class="v-col dec-val">${d2 > 0 ? d2 : ''}</span>
          <span class="v-col uni-val">${u2}</span>
        </div>
        <div class="v-line"></div>
        <div class="v-row v-qmark">
          <span class="v-sign"></span>
          <span class="v-col">?</span>
          <span class="v-col">?</span>
        </div>
      </div>
    `;
  }

  function buildNumericOptions(correct, candidates, minVal) {
    const minAllowed = typeof minVal === 'number' ? minVal : 0;
    const set = new Set([correct]);
    const distractorList = [];

    for (const c of candidates) {
      const val = Math.round(c);
      if (Number.isFinite(val) && val >= minAllowed && !set.has(val)) {
        set.add(val);
        distractorList.push(val);
      }
      if (distractorList.length >= 3) break;
    }

    let delta = 1;
    while (distractorList.length < 3) {
      const plus = correct + delta;
      if (plus >= minAllowed && !set.has(plus)) {
        set.add(plus);
        distractorList.push(plus);
      }
      if (distractorList.length >= 3) break;
      const minus = correct - delta;
      if (minus >= minAllowed && !set.has(minus)) {
        set.add(minus);
        distractorList.push(minus);
      }
      delta++;
    }

    const raw = [{ value: correct, html: String(correct), text: String(correct), isCorrect: true }];
    for (let i = 0; i < 3; i++) {
      const v = distractorList[i];
      raw.push({ value: v, html: String(v), text: String(v), isCorrect: false });
    }
    const mixed = shuffle(raw);
    const correctIndex = mixed.findIndex(o => o.isCorrect);
    return { options: mixed, correctIndex };
  }

  // =========================================================================
  // 6 AÑOS: SUMAS CON LLEVADAS (PROGRESIVAS NIVEL 1 -> 4)
  // =========================================================================
  function generateSumaLlevadas(rawTier = 1) {
    const tier = clampTier(rawTier);
    let d1, d2, u1, u2;

    if (tier === 1) {
      // Nivel 1: 12..19 + 1 cifra con llevada suave (ej. 15 + 6, 17 + 4)
      d1 = 1;
      d2 = 0;
      u1 = randInt(4, 9);
      u2 = randInt(Math.max(2, 10 - u1), 7);
    } else if (tier === 2) {
      // Nivel 2: 20..59 + 1 cifra con llevada (ej. 27 + 6, 48 + 7)
      d1 = randInt(2, 5);
      d2 = 0;
      u1 = randInt(3, 9);
      u2 = randInt(Math.max(2, 10 - u1), 9);
    } else if (tier === 3) {
      // Nivel 3: 2 cifras + 2 cifras moderadas (ej. 26 + 17, 35 + 28)
      d1 = randInt(1, 3);
      d2 = randInt(1, 3);
      u1 = randInt(3, 9);
      u2 = randInt(Math.max(2, 10 - u1), 9);
    } else {
      // Nivel 4: 2 cifras + 2 cifras mayores hasta 99 (ej. 48 + 37, 56 + 38)
      d1 = randInt(3, 5);
      d2 = randInt(2, 8 - d1);
      u1 = randInt(4, 9);
      u2 = randInt(Math.max(3, 10 - u1), 9);
    }

    const a = d1 * 10 + u1;
    const b = d2 * 10 + u2;
    const ans = a + b;
    const unitSum = u1 + u2;
    const unitDigit = unitSum % 10;
    const decSum = d1 + d2 + 1;

    const candidates = shuffle([
      ans + 1,
      ans - 1,
      ans + 10,
      decSum * 10 + ((unitDigit + 2) % 10),
      Math.max(10, a + u2 - 10)
    ]);
    // Siempre incluir el error clásico de olvidar la llevada
    candidates.unshift(ans - 10);

    const { options, correctIndex } = buildNumericOptions(ans, candidates, 10);

    return {
      category: 'sumaLlevadas',
      tier,
      badge: `Suma con llevadas · ${tierLabel(tier)}`,
      title: '¡Resuelve esta suma con llevada!',
      promptHTML: verticalCalcHTML(a, b, '+'),
      promptText: `${a} + ${b}`,
      options,
      correctIndex,
      correctText: String(ans),
      explanation: `Unidades: ${u1} + ${u2} = ${unitSum} (ponemos el ${unitDigit} y nos llevamos 1). Decenas: ${d1}${d2 > 0 ? ' + ' + d2 : ''} + 1 = ${decSum} → ${ans}.`
    };
  }

  // =========================================================================
  // 6 AÑOS: RESTAS SIN LLEVADAS (PROGRESIVAS NIVEL 1 -> 4)
  // =========================================================================
  function generateRestaSinLlevadas(rawTier = 1) {
    const tier = clampTier(rawTier);
    let d1, u1, d2, u2, a, b;

    do {
      if (tier === 1) {
        // Nivel 1: 13..19 menos 1 cifra sin llevada (ej. 17 - 4, 19 - 6)
        d1 = 1;
        d2 = 0;
        u1 = randInt(3, 9);
        u2 = randInt(1, u1 - 1);
      } else if (tier === 2) {
        // Nivel 2: 22..49 menos 1 o 2 cifras sencillas (ej. 38 - 14, 29 - 6)
        d1 = randInt(2, 4);
        d2 = Math.random() < 0.35 ? 0 : randInt(1, d1 - 1);
        u1 = randInt(2, 9);
        u2 = randInt(1, u1);
      } else if (tier === 3) {
        // Nivel 3: 50..79 menos 2 cifras (ej. 68 - 35, 76 - 42)
        d1 = randInt(5, 7);
        d2 = randInt(2, d1 - 1);
        u1 = randInt(2, 9);
        u2 = randInt(0, u1);
      } else {
        // Nivel 4: 75..99 menos 2 cifras altas sin llevada (ej. 98 - 64, 89 - 57)
        d1 = randInt(7, 9);
        d2 = randInt(3, d1 - 1);
        u1 = randInt(3, 9);
        u2 = randInt(1, u1 - 1);
      }
      a = d1 * 10 + u1;
      b = d2 * 10 + u2;
    } while (b <= 0 || a <= b);

    const ans = a - b;
    const candidates = shuffle([
      ans + 1,
      ans - 1,
      ans + 10,
      ans - 10,
      (d1 - d2) * 10 + Math.min(9, u1 + u2),
      Math.min(99, a + b)
    ]);

    const { options, correctIndex } = buildNumericOptions(ans, candidates, 0);

    return {
      category: 'restaSinLlevadas',
      tier,
      badge: `Resta sin llevadas · ${tierLabel(tier)}`,
      title: '¡Resuelve esta resta!',
      promptHTML: verticalCalcHTML(a, b, '−'),
      promptText: `${a} - ${b}`,
      options,
      correctIndex,
      correctText: String(ans),
      explanation: `Unidades: ${u1} − ${u2} = ${u1 - u2}. Decenas: ${d1}${d2 > 0 ? ' − ' + d2 : ''} = ${d1 - d2} → ${ans}.`
    };
  }

  // =========================================================================
  // 12 AÑOS: MÁXIMO COMÚN DIVISOR (PROGRESIVO NIVEL 1 -> 4)
  // =========================================================================
  function generateMCD(rawTier = 1) {
    const tier = clampTier(rawTier);
    let nums;

    if (tier === 1) {
      const easyPairs = [
        [4, 6], [6, 8], [6, 9], [8, 12], [10, 15],
        [12, 16], [12, 18], [14, 21], [10, 20], [9, 12]
      ];
      nums = shuffle(pick(easyPairs));
    } else if (tier === 2) {
      const g = pick([3, 4, 5, 6, 8, 9, 10, 12]);
      const pair = pick([[2, 3], [2, 5], [3, 4], [3, 5]]);
      nums = shuffle([g * pair[0], g * pair[1]]);
    } else if (tier === 3) {
      const g = pick([6, 7, 8, 9, 12, 14, 15, 16, 18]);
      let pair = pick([[2, 3], [3, 4], [3, 5], [2, 5], [4, 5], [3, 7]]);
      while (g * pair[1] > 98) pair = [2, 3];
      nums = shuffle([g * pair[0], g * pair[1]]);
    } else {
      if (Math.random() < 0.65) {
        const g = pick([3, 4, 5, 6, 8, 9, 10, 12]);
        const triple = pick([[2, 3, 5], [2, 3, 4], [2, 4, 5], [3, 4, 6], [2, 3, 7]]);
        nums = shuffle(triple.map(m => g * m));
      } else {
        const hardPairs = [
          [36, 60], [48, 72], [45, 75], [56, 84],
          [54, 90], [64, 96], [42, 70], [48, 80]
        ];
        nums = shuffle(pick(hardPairs));
      }
    }

    const ans = nums.reduce((acc, v) => gcd(acc, v));
    const minNum = Math.min(...nums);
    const lcmVal = nums.reduce((acc, v) => lcm(acc, v), 1);

    const divCandidates = [];
    for (let d = 1; d < ans; d++) {
      if (ans % d === 0) divCandidates.push(d);
    }

    const candidates = [
      ...shuffle(divCandidates),
      ans * 2,
      minNum,
      lcmVal <= 240 ? lcmVal : ans * 3,
      ans + 2,
      Math.max(1, ans - 2)
    ];

    const { options, correctIndex } = buildNumericOptions(ans, candidates, 1);
    const labelNums = nums.join(', ');
    const factorDesc = nums.map(n => `${n} = ${primeFactorsString(n)}`).join(' · ');

    return {
      category: 'mcd',
      tier,
      badge: `M.C.D. · ${tierLabel(tier)}`,
      title: 'Calcula el Máximo Común Divisor:',
      promptHTML: `<div class="expr-box">M.C.D.(${labelNums})</div>`,
      promptText: `M.C.D.(${labelNums})`,
      options,
      correctIndex,
      correctText: String(ans),
      explanation: `${factorDesc} → Factores comunes al menor exponente: M.C.D. = ${ans}.`
    };
  }

  // =========================================================================
  // 12 AÑOS: MÍNIMO COMÚN MÚLTIPLO (PROGRESIVO NIVEL 1 -> 4)
  // =========================================================================
  function generateMCM(rawTier = 1) {
    const tier = clampTier(rawTier);
    let pool;

    if (tier === 1) {
      pool = [
        [2, 3], [2, 4], [3, 4], [2, 5], [3, 6],
        [4, 6], [5, 10], [4, 8], [3, 5], [6, 8]
      ];
    } else if (tier === 2) {
      pool = [
        [6, 9], [8, 10], [8, 12], [9, 12], [6, 10],
        [10, 15], [9, 15], [12, 16], [4, 10]
      ];
    } else if (tier === 3) {
      pool = [
        [12, 15], [12, 18], [14, 21], [15, 20],
        [16, 24], [18, 24], [10, 12], [20, 30]
      ];
    } else {
      pool = [
        [4, 6, 8], [3, 4, 6], [4, 6, 10], [6, 8, 12],
        [5, 10, 15], [6, 9, 18], [15, 25], [18, 30], [24, 36]
      ];
    }

    const chosen = shuffle(pick(pool));
    const ans = chosen.reduce((acc, v) => lcm(acc, v), 1);
    const g = chosen.reduce((acc, v) => gcd(acc, v));
    const prod = chosen.reduce((acc, v) => acc * v, 1);

    const candidates = [
      prod !== ans && prod <= 600 ? prod : ans * 2,
      ans * 2,
      ans % 2 === 0 ? ans / 2 : ans + chosen[0],
      g,
      ans + chosen[0],
      chosen.reduce((acc, v) => acc + v, 0)
    ];

    const { options, correctIndex } = buildNumericOptions(ans, candidates, 2);
    const labelNums = chosen.join(', ');
    const factorDesc = chosen.map(n => `${n} = ${primeFactorsString(n)}`).join(' · ');

    return {
      category: 'mcm',
      tier,
      badge: `m.c.m. · ${tierLabel(tier)}`,
      title: 'Calcula el mínimo común múltiplo:',
      promptHTML: `<div class="expr-box">m.c.m.(${labelNums})</div>`,
      promptText: `m.c.m.(${labelNums})`,
      options,
      correctIndex,
      correctText: String(ans),
      explanation: `${factorDesc} → Comunes y no comunes al mayor exponente: m.c.m. = ${ans}.`
    };
  }

  // =========================================================================
  // 12 AÑOS: FRACCIONES (PROGRESIVAS NIVEL 1 -> 4)
  // =========================================================================
  function sameFracValue(f1, f2) {
    return f1.n * f2.d === f2.n * f1.d;
  }

  function fracToText(f) {
    return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}`;
  }

  function buildFractionOptions(correctFrac, rawCandidates) {
    const corr = simplifyFrac(correctFrac.n, correctFrac.d);
    const list = [corr];

    for (const cand of rawCandidates) {
      if (!cand || !Number.isFinite(cand.n) || !Number.isFinite(cand.d) || cand.d <= 0 || cand.n <= 0) {
        continue;
      }
      const s = simplifyFrac(cand.n, cand.d);
      if (s.n <= 0 || s.d <= 0) continue;
      if (!list.some(existing => sameFracValue(existing, s))) {
        list.push(s);
      }
      if (list.length >= 4) break;
    }

    let step = 1;
    while (list.length < 4) {
      const fallbacks = [
        { n: corr.n + step, d: corr.d },
        { n: Math.max(1, corr.n - step), d: corr.d },
        { n: corr.n, d: corr.d + step },
        { n: corr.d, d: Math.max(1, corr.n) }
      ];
      for (const fb of fallbacks) {
        const s = simplifyFrac(fb.n, fb.d);
        if (s.n > 0 && s.d > 0 && !list.some(existing => sameFracValue(existing, s))) {
          list.push(s);
          if (list.length >= 4) break;
        }
      }
      step++;
    }

    const raw = list.slice(0, 4).map((f, idx) => ({
      value: fracToText(f),
      html: fracHTML(f.n, f.d),
      text: fracToText(f),
      isCorrect: idx === 0
    }));

    const mixed = shuffle(raw);
    const correctIndex = mixed.findIndex(o => o.isCorrect);
    return { options: mixed, correctIndex, simplified: corr };
  }

  function generateFracciones(rawTier = 1) {
    const tier = clampTier(rawTier);

    // En nivel 1 empezamos con igual denominador o multiplicación sencilla
    let opType;
    if (tier === 1) {
      opType = pick(['+', '−', '×']);
    } else {
      opType = pick(['+', '−', '×', ':']);
    }

    let a, b, c, d, rawN, rawD, explanation;

    if (opType === '+' || opType === '−') {
      if (tier === 1) {
        // Mismo denominador para empezar calentando
        b = pick([3, 4, 5, 6, 7, 8, 9]);
        d = b;
        a = randInt(1, b - 1);
        c = randInt(1, b - 1);
      } else {
        const denPools = {
          2: [[2, 4], [3, 6], [2, 6], [4, 8], [5, 10], [2, 3]],
          3: [[3, 4], [2, 5], [4, 6], [3, 5], [6, 9], [4, 10]],
          4: [[6, 8], [8, 12], [6, 9], [9, 12], [4, 12], [6, 10], [8, 10]]
        };
        const pair = shuffle(pick(denPools[tier]));
        b = pair[0];
        d = pair[1];
        const maxNum1 = tier === 4 ? b + 2 : b - 1;
        const maxNum2 = tier === 4 ? d + 1 : d - 1;
        a = randInt(1, Math.max(1, maxNum1));
        c = randInt(1, Math.max(1, maxNum2));
      }

      if (opType === '−') {
        if (a * d < c * b) {
          const tmpN = a, tmpD = b;
          a = c; b = d;
          c = tmpN; d = tmpD;
        } else if (a * d === c * b) {
          a += 1;
        }
      }

      const commonDen = lcm(b, d);
      const scaledA = a * (commonDen / b);
      const scaledC = c * (commonDen / d);
      rawN = opType === '+' ? scaledA + scaledC : scaledA - scaledC;
      rawD = commonDen;

      const corr = simplifyFrac(rawN, rawD);
      const candidates = [
        { n: opType === '+' ? a + c : Math.max(1, Math.abs(a - c)), d: b + d },
        { n: opType === '+' ? a + c : Math.max(1, Math.abs(a - c)), d: commonDen },
        { n: corr.n + 1, d: corr.d },
        { n: Math.max(1, corr.n - 1), d: corr.d },
        { n: corr.d, d: corr.n }
      ];

      const { options, correctIndex, simplified } = buildFractionOptions(corr, candidates);
      explanation = b === d
        ? `Mismo denominador (${b}): (${a} ${opType} ${c})/${b} = ${rawN}/${b}${rawN !== simplified.n ? ' = ' + fracToText(simplified) : ''}.`
        : `m.c.m.(${b}, ${d}) = ${commonDen} → ${scaledA}/${commonDen} ${opType} ${scaledC}/${commonDen} = ${rawN}/${commonDen}${rawN !== simplified.n ? ' = ' + fracToText(simplified) : ''}.`;

      return {
        category: 'fracciones',
        tier,
        badge: `Fracciones · ${tierLabel(tier)}`,
        title: 'Calcula y simplifica (fracción irreducible):',
        promptHTML: `<div class="expr-box frac-expr">${fracHTML(a, b)} <span class="op-sym">${opType}</span> ${fracHTML(c, d)}</div>`,
        promptText: `${a}/${b} ${opType} ${c}/${d}`,
        options,
        correctIndex,
        correctText: fracToText(simplified),
        explanation
      };
    }

    // Multiplicación o División escalada por tier
    const maxDen = tier === 1 ? 5 : tier === 2 ? 6 : tier === 3 ? 8 : 10;
    const maxNum = tier === 1 ? 3 : tier === 2 ? 5 : tier === 3 ? 7 : 9;
    b = randInt(2, maxDen);
    d = randInt(2, maxDen);
    a = randInt(1, maxNum);
    c = randInt(1, maxNum);
    if (a === b) a = Math.max(1, a - 1);
    if (c === d) c = Math.max(1, c - 1);

    if (opType === '×') {
      rawN = a * c;
      rawD = b * d;
      const corr = simplifyFrac(rawN, rawD);
      const candidates = [
        { n: a * d, d: b * c },
        { n: a + c, d: b + d },
        { n: corr.n + 1, d: corr.d },
        { n: corr.d, d: corr.n }
      ];
      const { options, correctIndex, simplified } = buildFractionOptions(corr, candidates);
      explanation = `Numeradores: ${a} × ${c} = ${rawN}. Denominadores: ${b} × ${d} = ${rawD} → ${rawN}/${rawD}${rawN !== simplified.n ? ' = ' + fracToText(simplified) : ''}.`;

      return {
        category: 'fracciones',
        tier,
        badge: `Fracciones · ${tierLabel(tier)}`,
        title: 'Multiplica y simplifica (fracción irreducible):',
        promptHTML: `<div class="expr-box frac-expr">${fracHTML(a, b)} <span class="op-sym">×</span> ${fracHTML(c, d)}</div>`,
        promptText: `${a}/${b} × ${c}/${d}`,
        options,
        correctIndex,
        correctText: fracToText(simplified),
        explanation
      };
    } else {
      rawN = a * d;
      rawD = b * c;
      const corr = simplifyFrac(rawN, rawD);
      const candidates = [
        { n: a * c, d: b * d },
        { n: b * c, d: a * d },
        { n: corr.n + 1, d: corr.d },
        { n: Math.max(1, corr.n - 1), d: corr.d }
      ];
      const { options, correctIndex, simplified } = buildFractionOptions(corr, candidates);
      explanation = `En cruz: (${a} × ${d}) / (${b} × ${c}) = ${rawN}/${rawD}${rawN !== simplified.n ? ' = ' + fracToText(simplified) : ''}.`;

      return {
        category: 'fracciones',
        tier,
        badge: `Fracciones · ${tierLabel(tier)}`,
        title: 'Divide y simplifica (fracción irreducible):',
        promptHTML: `<div class="expr-box frac-expr">${fracHTML(a, b)} <span class="op-sym">:</span> ${fracHTML(c, d)}</div>`,
        promptText: `${a}/${b} : ${c}/${d}`,
        options,
        correctIndex,
        correctText: fracToText(simplified),
        explanation
      };
    }
  }

  const GENERATORS = {
    sumaLlevadas: generateSumaLlevadas,
    restaSinLlevadas: generateRestaSinLlevadas,
    mcd: generateMCD,
    mcm: generateMCM,
    fracciones: generateFracciones
  };

  function generateQuestionForPlayer(playerConfig, tier = 1) {
    let topics = (playerConfig && Array.isArray(playerConfig.topics) && playerConfig.topics.length > 0)
      ? playerConfig.topics.filter(t => GENERATORS[t])
      : [];

    if (topics.length === 0) {
      topics = (playerConfig && playerConfig.ageGroup === '6')
        ? ['sumaLlevadas', 'restaSinLlevadas']
        : ['mcd', 'mcm', 'fracciones'];
    }

    const chosenTopic = pick(topics);
    return GENERATORS[chosenTopic](tier);
  }

  return {
    gcd,
    lcm,
    simplifyFrac,
    primeFactorsString,
    generateSumaLlevadas,
    generateRestaSinLlevadas,
    generateMCD,
    generateMCM,
    generateFracciones,
    generateQuestionForPlayer
  };
});
