// js/converter.js
// LaTeX → Unicode engine and .docx XML processor.
// No dependencies — pure vanilla JS.

// ═══════════════════════════════════════════════════════════════
//  SYMBOL TABLES
// ═══════════════════════════════════════════════════════════════

const GREEK = {
  alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',varepsilon:'ε',
  zeta:'ζ',eta:'η',theta:'θ',vartheta:'ϑ',iota:'ι',kappa:'κ',lambda:'λ',
  mu:'μ',nu:'ν',xi:'ξ',pi:'π',varpi:'ϖ',rho:'ρ',varrho:'ϱ',sigma:'σ',
  varsigma:'ς',tau:'τ',upsilon:'υ',phi:'φ',varphi:'φ',chi:'χ',psi:'ψ',omega:'ω',
  Alpha:'Α',Beta:'Β',Gamma:'Γ',Delta:'Δ',Epsilon:'Ε',Zeta:'Ζ',Eta:'Η',
  Theta:'Θ',Iota:'Ι',Kappa:'Κ',Lambda:'Λ',Mu:'Μ',Nu:'Ν',Xi:'Ξ',Pi:'Π',
  Rho:'Ρ',Sigma:'Σ',Tau:'Τ',Upsilon:'Υ',Phi:'Φ',Chi:'Χ',Psi:'Ψ',Omega:'Ω',
};
const OPERATORS = {
  times:'×',div:'÷',cdot:'·',pm:'±',mp:'∓',oplus:'⊕',otimes:'⊗',odot:'⊙',
  circ:'∘',bullet:'•',star:'★',ast:'∗',dagger:'†',ddagger:'‡',
  cap:'∩',cup:'∪',setminus:'∖',subset:'⊂',supset:'⊃',subseteq:'⊆',supseteq:'⊇',
  in:'∈',notin:'∉',emptyset:'∅',varnothing:'∅',
  forall:'∀',exists:'∃',nexists:'∄',neg:'¬',lnot:'¬',land:'∧',lor:'∨',wedge:'∧',vee:'∨',
  sum:'∑',prod:'∏',coprod:'∐',int:'∫',iint:'∬',iiint:'∭',oint:'∮',
  partial:'∂',nabla:'∇',infty:'∞',sqrt:'√',
  ldots:'…',cdots:'⋯',vdots:'⋮',ddots:'⋱',
  perp:'⊥',parallel:'∥',angle:'∠',triangle:'△',
  hbar:'ℏ',ell:'ℓ',wp:'℘',aleph:'ℵ',beth:'ℶ',
};
const RELATIONS = {
  leq:'≤',le:'≤',geq:'≥',ge:'≥',neq:'≠',ne:'≠',approx:'≈',sim:'∼',
  simeq:'≃',cong:'≅',equiv:'≡',propto:'∝',ll:'≪',gg:'≫',
  prec:'≺',succ:'≻',preceq:'⪯',succeq:'⪰',
  models:'⊨',vdash:'⊢',dashv:'⊣',asymp:'≍',doteq:'≐',
};
const ARROWS = {
  to:'→',rightarrow:'→',Rightarrow:'⇒',leftarrow:'←',gets:'←',Leftarrow:'⇐',
  leftrightarrow:'↔',Leftrightarrow:'⇔',uparrow:'↑',Uparrow:'⇑',
  downarrow:'↓',Downarrow:'⇓',updownarrow:'↕',Updownarrow:'⇕',
  nearrow:'↗',searrow:'↘',nwarrow:'↖',swarrow:'↙',
  mapsto:'↦',longmapsto:'⟼',longrightarrow:'⟶',longleftarrow:'⟵',longleftrightarrow:'⟷',
  rightharpoonup:'⇀',rightharpoondown:'⇁',leftharpoonup:'↼',leftharpoondown:'↽',
  rightleftharpoons:'⇌',hookrightarrow:'↪',hookleftarrow:'↩',
};
const MISC = {
  langle:'⟨',rangle:'⟩',lceil:'⌈',rceil:'⌉',lfloor:'⌊',rfloor:'⌋',
  Vert:'‖',vert:'|',quad:'\u2003',qquad:'\u2003\u2003',
  therefore:'∴',because:'∵',checkmark:'✓',square:'□',blacksquare:'■',
  diamond:'◇',flat:'♭',natural:'♮',sharp:'♯',degree:'°',prime:'′',
};
const ACCENTS = {
  hat:'̂',tilde:'̃',bar:'̄',vec:'⃗',dot:'̇',ddot:'̈',
  overline:'̄',underline:'̲',widehat:'̂',widetilde:'̃',
  acute:'́',grave:'̀',check:'̌',breve:'̆',
};
const FUNCTIONS = new Set([
  'sin','cos','tan','cot','sec','csc','arcsin','arccos','arctan',
  'sinh','cosh','tanh','coth','log','ln','exp','lim','sup','inf',
  'max','min','det','dim','ker','gcd','lcm','Pr','arg','Re','Im',
]);
const ALL_SYMBOLS = Object.assign({}, GREEK, OPERATORS, RELATIONS, ARROWS, MISC);

const SUP_MAP = {
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
  '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾',
  'a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ',
  'k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','r':'ʳ','s':'ˢ','t':'ᵗ',
  'u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ',
  'A':'ᴬ','B':'ᴮ','D':'ᴰ','E':'ᴱ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ',
  'L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','R':'ᴿ','T':'ᵀ','U':'ᵁ','V':'ᵛ','W':'ᵂ',
};
const SUB_MAP = {
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
  '+':'₊','-':'₋','=':'₌','(':'₍',')':'₎',
  'a':'ₐ','e':'ₑ','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ',
  'o':'ₒ','p':'ₚ','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','x':'ₓ',
};

// ═══════════════════════════════════════════════════════════════
//  CORE CONVERTER
// ═══════════════════════════════════════════════════════════════

function applyScript(str, map) {
  return [...str].map(ch => map[ch] ?? ch).join('');
}

function consumeArg(s, pos) {
  if (pos >= s.length) return ['', pos];
  if (s[pos] === '{') {
    let depth = 1, i = pos + 1;
    while (i < s.length && depth > 0) {
      if (s[i] === '{') depth++; else if (s[i] === '}') depth--;
      i++;
    }
    return [s.slice(pos + 1, i - 1), i];
  }
  return [s[pos], pos + 1];
}

function stripBraces(s) {
  s = s.trim();
  return (s.startsWith('{') && s.endsWith('}')) ? s.slice(1, -1) : s;
}

export function convertInner(expr) {
  expr = expr.trim();

  // \frac{a}{b}
  expr = expr.replace(
    /\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    (_, n, d) => {
      const cn = convertInner(n), cd = convertInner(d);
      return (cn.length <= 4 && cd.length <= 4) ? `${cn}⁄${cd}` : `(${cn})/(${cd})`;
    }
  );

  // \sqrt[n]{x}  and  \sqrt{x}
  expr = expr.replace(
    /\\sqrt(?:\[([^\]]*)\])?\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    (_, n, content) => {
      const inner = convertInner(content);
      const sym = n ? ({'2':'√','3':'∛','4':'∜'}[n.trim()] || '√') : '√';
      return content.length > 1 ? `${sym}(${inner})` : `${sym}${inner}`;
    }
  );

  // Style wrappers: \mathbb, \mathrm, \text, etc.
  expr = expr.replace(
    /\\(?:mathbb|mathrm|mathbf|mathit|mathsf|mathtt|text|textrm|textbf|textit|operatorname)\{([^{}]*)\}/g,
    (_, inner) => convertInner(inner)
  );

  // Blackboard bold shortcuts
  const bbMap = {R:'ℝ',Z:'ℤ',N:'ℕ',Q:'ℚ',C:'ℂ'};
  expr = expr.replace(/\\mathbb\{([A-Z])\}/g, (_, c) => bbMap[c] || c);

  // Accents: \hat{x}
  expr = expr.replace(
    /\\(hat|tilde|bar|vec|dot|ddot|overline|underline|widehat|widetilde|acute|grave|check|breve)\{([^{}]*)\}/g,
    (_, cmd, content) => convertInner(content) + (ACCENTS[cmd] || '')
  );

  // \underset \overset
  expr = expr.replace(/\\underset\{([^{}]*)\}\{([^{}]*)\}/g,
    (_, b, a) => `${convertInner(a)}_${convertInner(b)}`);
  expr = expr.replace(/\\overset\{([^{}]*)\}\{([^{}]*)\}/g,
    (_, a, b) => `${convertInner(a)}^${convertInner(b)}`);

  // Remove \limits \nolimits
  expr = expr.replace(/\\(?:limits|nolimits)\b/g, '');

  // Delimiter pairs
  const delimPairs = [
    ['\\left(','('],['\\right)',')'],['\\left[','['],['\\right]',']'],
    ['\\left\\{','{'],['\\right\\}','}'],['\\left|','|'],['\\right|','|'],
    ['\\left\\|','‖'],['\\right\\|','‖'],
    ['\\left\\langle','⟨'],['\\right\\rangle','⟩'],
    ['\\left.',''],['\\right.',''],
    ['\\left\\lfloor','⌊'],['\\right\\rfloor','⌋'],
    ['\\left\\lceil','⌈'],['\\right\\rceil','⌉'],
    ['\\bigl(','('],['\\bigr)',')'],
    ['\\Bigl(','('],['\\Bigr)',')'],
    ['\\biggl(','('],['\\biggr)',')'],
    ['\\Biggl(','('],['\\Biggr)',')'],
    ['\\bigl[','['],['\\bigr]',']'],
  ];
  for (const [k, v] of delimPairs) expr = expr.split(k).join(v);

  // Named functions: \sin → sin
  for (const fn of FUNCTIONS) {
    expr = expr.replace(new RegExp(`\\\\${fn}\\b`, 'g'), fn);
  }

  // Super/subscript
  expr = expr.replace(
    /([\w\u03B1-\u03C9\u0391-\u03A9∑∏∫∮∂∇]|[)\]])?(?:(\^)(\{[^{}]*\}|[^{}\s\\]))?(?:(_)(\{[^{}]*\}|[^{}\s\\]))?/g,
    (full, base, c1, s1, c2, s2) => {
      if (!c1 && !c2) return full;
      let result = base || '';
      const supStr = c1 === '^' ? stripBraces(s1||'') : (c2 === '^' ? stripBraces(s2||'') : null);
      const subStr = c1 === '_' ? stripBraces(s1||'') : (c2 === '_' ? stripBraces(s2||'') : null);
      if (subStr !== null) {
        const mapped = applyScript(subStr, SUB_MAP);
        result += (mapped !== subStr) ? mapped : `_(${convertInner(subStr)})`;
      }
      if (supStr !== null) {
        const mapped = applyScript(supStr, SUP_MAP);
        result += (mapped !== supStr) ? mapped : `^(${convertInner(supStr)})`;
      }
      return result;
    }
  );

  // All remaining \commands
  expr = expr.replace(/\\([A-Za-z]+|[^A-Za-z\s])/g,
    (full, cmd) => ALL_SYMBOLS[cmd] ?? full);

  // Clean leftover braces
  expr = expr.replace(/\{([^{}]*)\}/g, '$1');
  expr = expr.replace(/\{([^{}]*)\}/g, '$1');

  return expr;
}

// ── Currency / prose guard ────────────────────────────────────
function looksLikeMath(s) {
  s = s.trim();
  if (s.includes('\\') || s.includes('{') || s.includes('}')) return true;
  if (s.includes('^') || s.includes('_')) return true;
  if (/^[\d\s,.]+$/.test(s)) return false;
  if (/^\d/.test(s)) {
    if (!/[+\-*/=<>!~|&a-zA-Z]/.test(s)) return false;
    if (/\d\s+[a-z]+\s+\d/.test(s)) return false;
  }
  return true;
}

// ── Full-text converter ───────────────────────────────────────
export function convertLatexInText(text) {
  const log = [];

  const proc = (inner, mode) => {
    const trimmed = inner.trim();
    const converted = convertInner(trimmed);
    if (converted !== trimmed) log.push([trimmed, converted]);
    return mode === 'display' ? '\n' + converted + '\n' : converted;
  };

  // display $$...$$
  text = text.replace(/\$\$(.+?)\$\$/gs,  (_, i) => proc(i, 'display'));
  // display \[...\]
  text = text.replace(/\\\[(.+?)\\\]/gs,   (_, i) => proc(i, 'display'));
  // display environments
  text = text.replace(
    /\\begin\{(?:equation\*?|align\*?|gather\*?|multline\*?)\}(.+?)\\end\{[^}]+\}/gs,
    (_, i) => proc(i, 'display')
  );
  // inline \(...\)
  text = text.replace(/\\\((.+?)\\\)/gs,   (_, i) => proc(i, 'inline'));
  // inline $...$  (math guard)
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
  return /\$|\\\(|\\\)|\\\[|\\\]|\\begin\{(?:equation|align|gather|multline)/.test(text);
}

function unescapeXml(s) {
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<')
           .replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");
}

function escapeXml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')
           .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function extractParaText(paraXml) {
  return [...paraXml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)]
    .map(m => m[1]).join('');
}

function rebuildPara(paraXml, newText) {
  const rprM = paraXml.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
  const rpr  = rprM ? `<w:rPr>${rprM[1]}</w:rPr>` : '';
  const sp   = (newText.includes(' ') || newText.includes('\n'))
               ? ' xml:space="preserve"' : '';
  const newRun = `<w:r>${rpr}<w:t${sp}>${escapeXml(newText)}</w:t></w:r>`;
  const stripped = paraXml.replace(/<w:r\b[\s\S]*?<\/w:r>/g, '');
  return stripped.includes('</w:p>')
    ? stripped.replace('</w:p>', newRun + '</w:p>')
    : stripped + newRun;
}

export function processXmlBody(xml, allLog) {
  let parasChanged = 0, eqsFound = 0;
  const result = xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, paraXml => {
    const raw = extractParaText(paraXml);
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
