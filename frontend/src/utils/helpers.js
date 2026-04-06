export function extractVariables(expr) {
    const vars = new Set();
    const matches = expr.match(/\b([a-df-hj-np-z])\b/g);
    if (matches) matches.forEach(m => vars.add(m));
    return Array.from(vars);
  }

export function getNiceStep(scale) {
    const target = 80 / scale;
    const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
    const normal = target / magnitude;
    if (normal < 1.5) return magnitude;
    if (normal < 3.5) return 2 * magnitude;
    if (normal < 7.5) return 5 * magnitude;
    return 10 * magnitude;
  }

export function fmt(n, decimals = 2) {
    if (!n && n !== 0) return '';
    if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toPrecision(3);
    return parseFloat(n.toFixed(decimals)).toString();
  }

  
export const COLORS = ['#c8a96e', '#7eb8c9', '#a97ec8', '#7ec98a', '#c97e7e', '#c9b87e'];