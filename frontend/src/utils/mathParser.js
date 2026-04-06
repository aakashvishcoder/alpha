export const inputToJS=(input) => {
  if (!input) return '';
  return input
    .replace(/\\begin\\{.*?\}|\{|\}|\\end\{.*?\}/g, '')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]*)\}/g, 'Math.sqrt($1)')
    .replace(/\\sqrt\[(\d+)\]\{([^}]*)\}/g, 'Math.pow($2,1/$1)')
    .replace(/\^(\d+)/g, '**$1')
    .replace(/\^\{([^}]+)\}/g, "**($1)")
    .replace(/_\{?[^}]*\}?/g, '')
    .replace(/\\?(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh)/g, 'Math.$1')
    .replace(/\\?(ln|log10|log2|abs|floor|ceil|round|sign|exp)/g, 'Math.$1')
    .replace(/\\log(?!\d)/g, 'Math.log10')
    .replace(/\\pi/g, 'Math.PI')
    .replace(/\\e\b/g, 'Math.E')
    .replace(/\\infty/g, 'Infinity')
    .replace(/\\\|([^|]+)\\\|/g, 'Math.abs($1)')
    .replace(/\|([^|]+)\|/g, 'Math.abs($1)')
    .replace(/(\d)([a-z])/gi, '$1*$2')
    .replace(/([a-z])(\()/gi, '$1*$2')
    .replace(/\)(\()/g,')*(')
    .replace(/\)([a-z])/gi, ')*$2')
    .replace(/\s+/g, '')
    .trim();
};

export function preprocess(raw) {
  if (!raw) return '';
  
  return raw
    .trim()
    .replace(/\s+/g, '')
    .replace(/(\d)(x)/g, '$1*$2')
    .replace(/(\d)(\()/g, '$1*$2')
    .replace(/(\))(\()/g, '$1*$2')
    .replace(/(\))(x)/g, '$1*$2')
    .replace(/(x)(\()/g, '$1*$2')
    .replace(/^(y=|f\(x\)=)/i, '')
    .replace(/\^/g, '**')
    .replace(/arcsinh/g, 'Math.asinh')
    .replace(/arccosh/g, 'Math.acosh')
    .replace(/arctanh/g, 'Math.atanh')
    .replace(/arcsin/g, 'Math.asin')
    .replace(/arccos/g, 'Math.acos')
    .replace(/arctan/g, 'Math.atan')
    .replace(/sinh/g, 'Math.sinh')
    .replace(/cosh/g, 'Math.cosh')
    .replace(/tanh/g, 'Math.tanh')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/cbrt/g, 'Math.cbrt')
    .replace(/abs/g, 'Math.abs')
    .replace(/ceil/g, 'Math.ceil')
    .replace(/floor/g, 'Math.floor')
    .replace(/round/g, "Math.round")
    .replace(/log10/g, 'Math.log10')
    .replace(/log2/g, 'Math.log2')
    .replace(/log/g, 'Math.log10')
    .replace(/ln/g, 'Math.ln')
    .replace(/exp/g, 'Math.exp')
    .replace(/sign/g, 'Math.sign')
    .replace(/\bpi\b/gi, 'Math.PI')
    .replace(/\btau\b/gi, '(2*Math.PI)')
    .replace(/\be\b/g, 'Math.E');
};

export function evaluate(raw, x, variables = {}) {
    if (!raw) return null;
    try {
      let e = preprocess(raw);
      Object.entries(variables || {}).forEach(([k, v]) => {
        e = e.replace(new RegExp(`\\b${k}\\b`, 'g'), `(${v})`);
      });
      e = e.replace(/\bx\b/g, `(${x})`);
      const result = new Function(`return ${e}`)();
      return isFinite(result) ? result : null;
    } catch {
      return null;
    }
}

export function isValidExpr(raw, variables = {}) {
    if (!raw?.trim()) return true;
    return evaluate(raw, 1, variables) !== null || evaluate(raw, 0, variables) !== null;
  }