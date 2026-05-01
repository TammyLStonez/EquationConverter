// js/converter.js
// LaTeX → Unicode engine and .docx XML processor.
// No dependencies — pure vanilla JS.

// ═══════════════════════════════════════════════════════════════
//  SYMBOL TABLES
// ═══════════════════════════════════════════════════════════════

const GREEK = {
  alpha:'α', beta:'β',  gamma:'γ',  delta:'δ',  epsilon:'ε', varepsilon:'ε',
  zeta:'ζ',  eta:'η',   theta:'θ',  vartheta:'ϑ',iota:'ι',  kappa:'κ',
  lambda:'λ',mu:'μ',    nu:'ν',     xi:'ξ',     pi:'π',     varpi:'ϖ',
  rho:'ρ',   varrho:'ϱ',sigma:'σ',  varsigma:'ς',tau:'τ',   upsilon:'υ',
  phi:'φ',   varphi:'φ',chi:'χ',    psi:'ψ',    omega:'ω',
  Alpha:'Α', Beta:'Β',  Gamma:'Γ',  Delta:'Δ',  Epsilon:'Ε',Zeta:'Ζ',
  Eta:'Η',   Theta:'Θ', Iota:'Ι',   Kappa:'Κ',  Lambda:'Λ', Mu:'Μ',
  Nu:'Ν',    Xi:'Ξ',    Pi:'Π',     Rho:'Ρ',    Sigma:'Σ',  Tau:'Τ',
  Upsilon:'Υ',Phi:'Φ',  Chi:'Χ',    Psi:'Ψ',    Omega:'Ω',
};

const OPERATORS = {
  times:'×',   div:'÷',    cdot:'·',   pm:'±',     mp:'∓',
  oplus:'⊕',   otimes:'⊗', odot:'⊙',  circ:'∘',   bullet:'•',
  star:'★',    ast:'∗',    dagger:'†', ddagger:'‡',
  cap:'∩',     cup:'∪',    setminus:'∖',
  subset:'⊂',  supset:'⊃', subseteq:'⊆', supseteq:'⊇',
  sqsubset:'⊏',sqsupset:'⊐',sqsubseteq:'⊑',sqsupseteq:'⊒',
  in:'∈',      notin:'∉',  ni:'∋',     emptyset:'∅', varnothing:'∅',
  forall:'∀',  exists:'∃', nexists:'∄',
  neg:'¬',     lnot:'¬',   land:'∧',   lor:'∨',    wedge:'∧', vee:'∨',
  barwedge:'⊼',veebar:'⊻',
  sum:'∑',     prod:'∏',   coprod:'∐',
  int:'∫',     iint:'∬',   iiint:'∭', iiiint:'⨌', oint:'∮',
  partial:'∂', nabla:'∇',  infty:'∞',  sqrt:'√',
  ldots:'…',   cdots:'⋯',  vdots:'⋮',  ddots:'⋱',
  perp:'⊥',    parallel:'∥',angle:'∠', measuredangle:'∡', sphericalangle:'∢',
  triangle:'△',
  hbar:'ℏ',    ell:'ℓ',    wp:'℘',     aleph:'ℵ',  beth:'ℶ', gimel:'ℷ',
  complement:'∁', top:'⊤', bot:'⊥',
};

const RELATIONS = {
  leq:'≤',     le:'≤',      geq:'≥',    ge:'≥',
  neq:'≠',     ne:'≠',      approx:'≈', approxeq:'≊',
  sim:'∼',     simeq:'≃',   cong:'≅',   equiv:'≡',
  propto:'∝',  ll:'≪',      gg:'≫',
  prec:'≺',    succ:'≻',    preceq:'⪯', succeq:'⪰',
  models:'⊨',  vdash:'⊢',   dashv:'⊣',
  asymp:'≍',   doteq:'≐',   fallingdotseq:'≒', risingdotseq:'≓',
  lesssim:'≲', gtrsim:'≳',  lessgtr:'≶',gtrless:'≷',
  lesseqgtr:'⋚',gtreqless:'⋛',
  mid:'∣',     nmid:'∤',    nleq:'≰',   ngeq:'≱',
  nprec:'⊀',   nsucc:'⊁',   nsim:'≁',   ncong:'≇',
};

const ARROWS = {
  // Standard
  to:'→',           rightarrow:'→',      Rightarrow:'⇒',
  leftarrow:'←',    gets:'←',            Leftarrow:'⇐',
  leftrightarrow:'↔',Leftrightarrow:'⇔',
  uparrow:'↑',      Uparrow:'⇑',
  downarrow:'↓',    Downarrow:'⇓',
  updownarrow:'↕',  Updownarrow:'⇕',
  nearrow:'↗',      searrow:'↘',         nwarrow:'↖',   swarrow:'↙',
  mapsto:'↦',       longmapsto:'⟼',
  longrightarrow:'⟶',longleftarrow:'⟵', longleftrightarrow:'⟷',
  Longrightarrow:'⟹',Longleftarrow:'⟸',Longleftrightarrow:'⟺',
  // implies / iff  ← explicitly requested
  implies:'⟹',     impliedby:'⟸',       iff:'⟺',
  // Harpoons
  rightharpoonup:'⇀',  rightharpoondown:'⇁',
  leftharpoonup:'↼',   leftharpoondown:'↽',
  rightleftharpoons:'⇌',leftrightharpoons:'⇋',
  upharpoonright:'↾',  upharpoonleft:'↿',
  downharpoonright:'⇂',downharpoonleft:'⇃',
  // Hooks & misc
  hookrightarrow:'↪',  hookleftarrow:'↩',
  looparrowright:'↬',  looparrowleft:'↫',
  curvearrowright:'↷', curvearrowleft:'↶',
  circlearrowright:'↻',circlearrowleft:'↺',
  dashrightarrow:'⇢',  dashleftarrow:'⇠',
  rightsquigarrow:'↝', leftrightsquigarrow:'↭',
  twoheadrightarrow:'↠',twoheadleftarrow:'↞',
  rightarrowtail:'↣',  leftarrowtail:'↢',
};

const MISC = {
  langle:'⟨',   rangle:'⟩',
  lceil:'⌈',    rceil:'⌉',
  lfloor:'⌊',   rfloor:'⌋',
  Vert:'‖',     vert:'|',
  quad:'\u2003',qquad:'\u2003\u2003',
  ',':'\u2009', ';':'\u2004',   // thin/medium spaces
  '!':'',                        // negative space → remove
  therefore:'∴',because:'∵',
  checkmark:'✓',square:'□',     blacksquare:'■',
  diamond:'◇',  lozenge:'◊',
  flat:'♭',     natural:'♮',    sharp:'♯',
  clubsuit:'♣', diamondsuit:'♦',heartsuit:'♥',spadesuit:'♠',
  // Degree — ° and temperature
  degree:'°',   circ:'°',       // \circ alone → °; special-cased below for °C/°F/°K
  prime:'′',    dprime:'″',     backprime:'‵',
  // Blackboard bold
  'mathbb{R}':'ℝ','mathbb{Z}':'ℤ','mathbb{N}':'ℕ',
  'mathbb{Q}':'ℚ','mathbb{C}':'ℂ','mathbb{F}':'𝔽',
};

const ACCENTS = {
  hat:'̂',       tilde:'̃',     bar:'̄',      vec:'⃗',
  dot:'̇',       ddot:'̈',      dddot:'⃛',
  overline:'̄',  underline:'̲', widehat:'̂',  widetilde:'̃',
  acute:'́',     grave:'̀',     check:'̌',    breve:'̆',
  mathring:'̊',
};

const FUNCTIONS = new Set([
  'sin','cos','tan','cot','sec','csc',
  'arcsin','arccos','arctan','arccot','arcsec','arccsc',
  'sinh','cosh','tanh','coth','sech','csch',
  'log','ln','exp','lg',
  'lim','limsup','liminf','sup','inf','max','min',
  'det','dim','ker','gcd','lcm','deg',
  'Pr','arg','Re','Im','hom','End','Aut',
  'mod','pmod',
]);

const ALL_SYMBOLS = Object.assign({}, GREEK, OPERATORS, RELATIONS, ARROWS, MISC);

// ── Vulgar fractions (common ones with dedicated Unicode chars) ──
const VULGAR_FRACTIONS = {
  '1,2':'½', '1,3':'⅓', '2,3':'⅔',
  '1,4':'¼', '3,4':'¾',
  '1,5':'⅕', '2,5':'⅖', '3,5':'⅗', '4,5':'⅘',
  '1,6':'⅙', '5,6':'⅚',
  '1,7':'⅐',
  '1,8':'⅛', '3,8':'⅜', '5,8':'⅝', '7,8':'⅞',
  '1,9':'⅑',
  '1,10':'⅒',
};

// ── Superscript map — full Unicode coverage ──────────────────
// chars with no Unicode superscript form fall back to ^(x) in applyScript()
const SUP_MAP = {
  // Digits
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
  '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
  // Operators
  '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾',
  // Lowercase — all 26, using best available Unicode codepoints
  'a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ',
  'f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ',
  'k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ',
  'p':'ᵖ',           'r':'ʳ','s':'ˢ','t':'ᵗ',
  'u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ',
  // q has no Unicode superscript — handled as fallback
  // Uppercase — cover all that exist in Unicode
  'A':'ᴬ','B':'ᴮ',          'D':'ᴰ','E':'ᴱ',
  'G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ',
  'L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ',
  'R':'ᴿ',          'T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ',
  // C, F, Q, S, X, Y, Z have no Unicode superscript — fallback
};

// ── Subscript map — full Unicode coverage ────────────────────
// Unicode subscript letters are very limited; missing ones fall back to _(x)
const SUB_MAP = {
  // Digits
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄',
  '5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
  // Operators
  '+':'₊','-':'₋','=':'₌','(':'₍',')':'₎',
  // Lowercase — only chars with actual Unicode subscript forms
  'a':'ₐ',          'e':'ₑ',
  'h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ',
  'm':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ',
  'r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ',
  'x':'ₓ',
  // b,c,d,f,g,q,w,y,z have NO Unicode subscript — fallback
  // Uppercase — none exist in Unicode standard — all fallback
};

// ═══════════════════════════════════════════════════════════════
//  SCRIPT HELPERS
// ═══════════════════════════════════════════════════════════════

// Apply super/subscript char-by-char; unmapped chars trigger full fallback
function applyScript(str, map) {
  let result = '';
  let needsFallback = false;
  for (const ch of str) {
    if (map[ch] !== undefined) {
      result += map[ch];
    } else {
      needsFallback = true;
      break;
    }
  }
  return needsFallback ? null : result;  // null = use fallback notation
}

function stripBraces(s) {
  s = (s || '').trim();
  return (s.startsWith('{') && s.endsWith('}')) ? s.slice(1, -1) : s;
}

function applySupScript(raw) {
  const content = stripBraces(raw);
  const inner   = convertInner(content);
  const mapped  = applyScript(inner, SUP_MAP);
  if (mapped !== null) return mapped;
  // Fallback: wrap in ^(…) or ^x for single char
  return inner.length === 1 ? `^${inner}` : `^(${inner})`;
}

function applySubScript(raw) {
  const content = stripBraces(raw);
  const inner   = convertInner(content);
  const mapped  = applyScript(inner, SUB_MAP);
  if (mapped !== null) return mapped;
  return inner.length === 1 ? `_${inner}` : `_(${inner})`;
}

// ═══════════════════════════════════════════════════════════════
//  CORE CONVERTER
// ═══════════════════════════════════════════════════════════════

export function convertInner(expr) {
  expr = (expr || '').trim();

  // ── 1. Temperature: ^\circ C / ^\circ F / ^\circ K ──────────
  // Must run BEFORE general superscript processing.
  // Handles: ^\circ C,  ^{\circ}C,  ^\circ\mathrm{C},  \,^\circ C, etc.
  expr = expr.replace(
    /\\,?\s*\^\s*(?:\\circ|\{\\circ\})\s*(?:\\mathrm\{([CFK])\}|([CFK]))/g,
    (_, m1, m2) => ` °${m1 || m2}`
  );
  // Bare ^\circ (not followed by C/F/K) → °
  expr = expr.replace(/\^\s*(?:\\circ|\{\\circ\})/g, '°');

  // ── 2. \frac{a}{b} → vulgar or fraction-slash or (a)/(b) ────
  expr = expr.replace(
    /\\frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g,
    (_, rawNum, rawDen) => {
      const num = convertInner(rawNum);
      const den = convertInner(rawDen);
      // Check vulgar fraction first
      const vk = `${num.trim()},${den.trim()}`;
      if (VULGAR_FRACTIONS[vk]) return VULGAR_FRACTIONS[vk];
      // Short num+den → fraction slash ⁄
      if (num.length <= 5 && den.length <= 5 && !/[+\-*/()]/.test(num+den)) {
        return `${num}⁄${den}`;
      }
      // Complex → parenthesized
      const wrapNum = /[+\-]/.test(num) ? `(${num})` : num;
      const wrapDen = /[+\-]/.test(den) ? `(${den})` : den;
      return `${wrapNum}/${wrapDen}`;
    }
  );

  // ── 3. \sqrt[n]{x} and \sqrt{x} ─────────────────────────────
  expr = expr.replace(
    /\\sqrt(?:\[([^\]]*)\])?\{((?:[^{}]|\{[^{}]*\})*)\}/g,
    (_, n, content) => {
      const inner = convertInner(content);
      const sym   = n
        ? ({'2':'√','3':'∛','4':'∜'}[n.trim()] || `${applySupScript(n)}√`)
        : '√';
      return inner.length > 1 ? `${sym}(${inner})` : `${sym}${inner}`;
    }
  );

  // ── 4. Style wrappers — strip, keep content ──────────────────
  expr = expr.replace(
    /\\(?:mathbb|mathrm|mathbf|mathit|mathsf|mathtt|text|textrm|textbf|textit|operatorname|mbox)\{([^{}]*)\}/g,
    (_, inner) => convertInner(inner)
  );

  // ── 5. Blackboard bold shortcuts ─────────────────────────────
  const bbMap = {R:'ℝ',Z:'ℤ',N:'ℕ',Q:'ℚ',C:'ℂ',F:'𝔽',H:'ℍ'};
  expr = expr.replace(/\\mathbb\{([A-Z])\}/g, (_, c) => bbMap[c] || c);

  // ── 6. Accents: \hat{x}, \vec{v}, etc. ───────────────────────
  expr = expr.replace(
    /\\(hat|tilde|bar|vec|dot|ddot|dddot|overline|underline|widehat|widetilde|acute|grave|check|breve|mathring)\{([^{}]*)\}/g,
    (_, cmd, content) => convertInner(content) + (ACCENTS[cmd] || '')
  );

  // ── 7. \underset / \overset ──────────────────────────────────
  expr = expr.replace(/\\underset\{([^{}]*)\}\{([^{}]*)\}/g,
    (_, b, a) => `${convertInner(a)}${applySubScript(b)}`);
  expr = expr.replace(/\\overset\{([^{}]*)\}\{([^{}]*)\}/g,
    (_, a, b) => `${convertInner(b)}${applySupScript(a)}`);

  // ── 8. \stackrel{a}{b} ───────────────────────────────────────
  expr = expr.replace(/\\stackrel\{([^{}]*)\}\{([^{}]*)\}/g,
    (_, a, b) => `${convertInner(b)}${applySupScript(a)}`);

  // ── 9. Remove layout-only commands ───────────────────────────
  expr = expr.replace(/\\(?:limits|nolimits|displaystyle|textstyle|scriptstyle|scriptscriptstyle|left(?=\s)|right(?=\s))\b/g, '');
  expr = expr.replace(/\\(?:hspace|vspace|kern)\{[^{}]*\}/g, ' ');
  expr = expr.replace(/\\(?:phantom|hphantom|vphantom)\{[^{}]*\}/g, '');

  // ── 10. Delimiter pairs ───────────────────────────────────────
  const delimPairs = [
    ['\\left(','('], ['\\right)',')'],
    ['\\left[','['], ['\\right]',']'],
    ['\\left\\{','{'],['\\right\\}','}'],
    ['\\left|','|'], ['\\right|','|'],
    ['\\left\\|','‖'],['\\right\\|','‖'],
    ['\\left\\langle','⟨'],['\\right\\rangle','⟩'],
    ['\\left\\lfloor','⌊'],['\\right\\rfloor','⌋'],
    ['\\left\\lceil','⌈'], ['\\right\\rceil','⌉'],
    ['\\left.',''],  ['\\right.',''],
    ['\\bigl(','('], ['\\bigr)',')'],
    ['\\Bigl(','('], ['\\Bigr)',')'],
    ['\\biggl(','('],['\\biggr)',')'],
    ['\\Biggl(','('],['\\Biggr)',')'],
    ['\\bigl[','['], ['\\bigr]',']'],
    ['\\bigl|','|'], ['\\bigr|','|'],
    ['\\Bigl|','|'], ['\\Bigr|','|'],
  ];
  for (const [k, v] of delimPairs) expr = expr.split(k).join(v);

  // ── 11. Named functions: \sin → sin ──────────────────────────
  for (const fn of FUNCTIONS) {
    expr = expr.replace(new RegExp(`\\\\${fn}\\b`, 'g'), fn);
  }

  // ── 12. Super/subscripts — handle both orderings ─────────────
  // Pattern: base?  (^arg)?  (_arg)?  in either order, greedy on arg
  // We loop twice to handle chained cases like x^{a}_{b}^{c}
  for (let pass = 0; pass < 2; pass++) {
    expr = expr.replace(
      /(\^)\{([^{}]*)\}|(\^)([^{}\s\\])|(_)\{([^{}]*)\}|(_)([^{}\s\\])/g,
      (m, c1, g1, c2, g2, c3, g3, c4, g4) => {
        if (c1 || c2) return applySupScript(g1 || g2);
        if (c3 || c4) return applySubScript(g3 || g4);
        return m;
      }
    );
  }

  // ── 13. All remaining \commands → symbol lookup ───────────────
  expr = expr.replace(/\\([A-Za-z]+|[^A-Za-z\s{}])/g,
    (full, cmd) => ALL_SYMBOLS[cmd] ?? full
  );

  // ── 14. Clean leftover braces (grouping only) ────────────────
  for (let i = 0; i < 3; i++) {
    expr = expr.replace(/\{([^{}]*)\}/g, '$1');
  }

  // ── 15. Collapse multiple spaces ─────────────────────────────
  expr = expr.replace(/  +/g, ' ');

  return expr;
}

// ═══════════════════════════════════════════════════════════════
//  CURRENCY / PROSE GUARD
// ═══════════════════════════════════════════════════════════════

function looksLikeMath(s) {
  s = s.trim();
  // Definite math markers
  if (s.includes('\\') || s.includes('{') || s.includes('}')) return true;
  if (s.includes('^') || s.includes('_')) return true;
  // Pure digits / punctuation → currency or quantity, not math
  if (/^[\d\s,.']+$/.test(s)) return false;
  // Starts with digit, no operators or letter variables → likely currency
  if (/^\d/.test(s)) {
    if (!/[+\-*/=<>!~|&a-zA-Z]/.test(s)) return false;
    // "$50 and $100" pattern — digit word digit
    if (/\d\s+[a-z]{2,}\s+\d/.test(s)) return false;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  FULL-TEXT CONVERTER  (handles all delimiter styles)
// ═══════════════════════════════════════════════════════════════

export function convertLatexInText(text) {
  const log = [];

  const proc = (inner, mode) => {
    const trimmed   = inner.trim();
    const converted = convertInner(trimmed);
    if (converted !== trimmed) log.push([trimmed, converted]);
    return mode === 'display' ? '\n' + converted + '\n' : converted;
  };

  // Display: $$...$$
  text = text.replace(/\$\$(.+?)\$\$/gs,
    (_, i) => proc(i, 'display'));

  // Display: \[...\]
  text = text.replace(/\\\[(.+?)\\\]/gs,
    (_, i) => proc(i, 'display'));

  // Display: \begin{equation|align|gather|multline}...\end{...}
  text = text.replace(
    /\\begin\{(equation\*?|align\*?|gather\*?|multline\*?|eqnarray\*?)\}([\s\S]+?)\\end\{\1\}/g,
    (_, _env, i) => proc(i, 'display')
  );

  // Inline: \(...\)
  text = text.replace(/\\\((.+?)\\\)/gs,
    (_, i) => proc(i, 'inline'));

  // Inline: $...$ — math content guard prevents currency false-positives
  text = text.replace(
    /\$(?=[^$\n]*[a-zA-Z\\^_{})(\[\]])([^$\n]+?)\$/g,
    (full, inner) => looksLikeMath(inner) ? proc(inner, 'inline') : full
  );

  return { text, log };
}

// ═══════════════════════════════════════════════════════════════
//  DOCX XML PROCESSOR
// ═══════════════════════════════════════════════════════════════

function hasLatex(text) {
  return /\$|\\\(|\\\)|\\\[|\\\]|\\begin\{(?:equation|align|gather|multline|eqnarray)/.test(text);
}

function unescapeXml(s) {
  return s
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function escapeXml(s) {
  return s
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

function extractParaText(paraXml) {
  return [...paraXml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)]
    .map(m => m[1]).join('');
}

function rebuildPara(paraXml, newText) {
  const rprM   = paraXml.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
  const rpr    = rprM ? `<w:rPr>${rprM[1]}</w:rPr>` : '';
  const sp     = (newText.includes(' ') || newText.includes('\n'))
                 ? ' xml:space="preserve"' : '';
  const newRun = `<w:r>${rpr}<w:t${sp}>${escapeXml(newText)}</w:t></w:r>`;
  const stripped = paraXml.replace(/<w:r\b[\s\S]*?<\/w:r>/g, '');
  return stripped.includes('</w:p>')
    ? stripped.replace('</w:p>', newRun + '</w:p>')
    : stripped + newRun;
}

export function processXmlBody(xml, allLog) {
  let parasChanged = 0;
  let eqsFound     = 0;

  const result = xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, paraXml => {
    const raw     = extractParaText(paraXml);
    if (!raw) return paraXml;

    const decoded = unescapeXml(raw);
    if (!hasLatex(decoded)) return paraXml;

    const eqCount = (decoded.match(
      /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$/g
    ) || []).length;

    const { text: converted, log } = convertLatexInText(decoded);
    const trimmed = converted.trim();
    if (trimmed === decoded) return paraXml;

    allLog.push(...log);
    parasChanged++;
    eqsFound += eqCount;
    return rebuildPara(paraXml, trimmed);
  });

  return { xml: result, parasChanged, eqsFound };
}
