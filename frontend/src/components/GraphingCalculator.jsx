import { useState, useEffect, useRef, useCallback } from 'react';

const COLORS = ['#c8a96e', '#7eb8c9', '#a97ec8', '#7ec98a', '#c97e7e', '#c9b87e'];

function MathInput({ value, onChange, onKeyDown, placeholder, hasError, color }) {
  const formatPath = (text)=>{
    if (!text?.trim()) {
      return <span className="placeholder">{placeholder || ''}</span>
    }
    const elements = [];
    let i =0;
    let key=0;

    while (i < text.length) {
      const char=text[i];

      if (char ==='^' &&text[i+1] === '{') {
        const end= text.indexOf('}', i+2)

        if (end !== -1) {
          const expContent=text.slice(i+2, end);
          elements.push(<sup key={key++} className="sub">{formatPath(expContent)}</sup>)
          i =end+1;
          continue;
        }
      }
      if(char ==='^'&& /[a-zA-Z0-9]/.test(text[i+1])) {
        elements.push(<sup key={key++} className="sub">{text[i+1]}</sup>)
        i += 2;
        continue;
      }
      if (char === '_' && text[i+1] === '{') {
        const end= text.indexOf('}', i+2);
        if (end !== -1) {
          const subContext = text.slice(i+2, end);
          elements.push(<sub key={key++} className='sub'>{formatPath(subContext)}</sub>);
          i =end+1
          continue;
        }
      }
      if (char === '_' && /[a-zA-Z0-9]/.test(text[i+1])) {
        elements.push(<sub key={key++} className='sub'>{text[i +1]}</sub>)
        i+=2;
        continue
      }
      if (char === '\\') {
        const rest = text.slice(i);
        if(rest.startsWith('\\pi')) { elements.push(<span key={key++} className='const'>π</span>); i+=3; continue}
        if (rest.startsWith('\\alpha')) {elements.push(<span key={key++} className='const'>α</span>); i+=6; continue;}
        if (rest.startsWith('\\theta')) { elements.push(<span key={key++} className='const'>θ</span>); i += 6; continue}
        if (rest.startsWith('\\infty')) { elements.push(<span key={key++} className='const'>∞</span>); i+=6; continue;}
        if (rest.startsWith('\\e') && !/[a-zA-Z]/.test(text[i+2] ||'')) { elements.push(<span key={key++} className='const'>e</span>); i+=2; continue; }
      }

      const funcMatch = text.slice(i).match(/\b(sin|cos|tan|ln|log|exp)\b/); 
      if (funcMatch && funcMatch.index === 0) {
        elements.push(<i key={key++}>{funcMatch[1]}</i>)
        i+=funcMatch[1].length;
        continue;
      }

      if (char === '&') elements.push('&amp;');
      if (char === '<') elements.push('&lt;');
      if (char === '>') elements.push('&gt;');
      if ( char === '"') elements.push('&quot;');
      else if (char ==='"') elements.push('&#39;');
      else elements.push(char);

      i++;
    }
    return elements.length >0 ? elements:text;
  }

  return (
    <div className="relative flex-1 py-2.5 pr-2">
      <input
        className="w-full bg-transparent outline-none font-mono-dm text-[0.9rem] leading-snug caret-[#c8a96e] opacity-0 absolute inset-0 z-10"
        value={value||''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete='off'
        style={{ caretColor: color || '#c8a96e'}}
      />
      <div
        className={`pointer-events-none font-mono-dm text-[0.9rem] leading-snug whitespace-nowrap overflow-hidden ${hasError ? 'text-[#c97e7e]' : ''}`}
        style={{ color: hasError ? undefined : (color || '#f0e6d0') }}
      >
        {formatPath(value)}
      </div>
    </div>
  );
};

function VariableSlider({ variable, value, onChange, color}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f0f0f] rounded-md border border-[#222]">
      <span className="font-mono-dm text-[0.7rem] text-[#888] w-4">{variable}</span>
      <input
        type="range"
        min="-10"
        max="10"
        step="0.1"
        value={value}
        onChange={(e) => onChange(variable, parseFloat(e.target.value))}
        className="flex-1 h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#c8a96e]"
        style={{ accentColor: color}}
      />
      <span className='font-mono-dm text-[0.7rem] text-[#c8a96e] w-8 text-right'>{value.toFixed(1)}</span>
    </div>
  );
};

function EquationBadge({ type }) {
  const badges = {
    'y' : { label: 'y =', color: 'bg-[#c8a96e]/20 text-[#c8a96e]'},
    'x' : { label: 'x = ', color: 'bg-[#7ab8c9]/20 text-[#7ab8c9]'},
    'param' : { label: '◉', color:'bg-[#a97ec8]/20 text-[#a97ec8'},
  };

  const badge = badges[type] || badges['y'];
  return (
    <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-mono-dm ${badge.color}`}>
      {badge.label}
    </span>
  );
}

const inputToJS=(input) => {
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

function preprocess(raw) {
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

function detectEquationType(input) {
  if (!input) return 'y';
  const clean = input.trim().toLowerCase();
  if (/^x\s=/.test(clean)) return 'x';
  if (/^y\s=/.test(clean) || !/[=]/.test(clean)) return 'y';
  return 'param';
};

function extractVariables(expr) {
  const vars = new Set();
  const matches = expr.match(/\b([a-df-hj-np-z])\b/g);
  if (matches) matches.forEach(m => vars.add(m));
  return Array.from(vars);
}

export default function GraphingCalculator() {
  const canvasRef = useRef(null);
  const [equations, setEquations] = useState([]);
  const [view, setView] = useState({ x: 0, y: 0, scale: 60 });
  const [dragging, setDragging] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const inputRefs = useRef({});
  const [nextEqId, setNextEqId] = useState(1);
  const [hoveredEq, setHoveredEq] = useState(null);
  const [pinnedLabels, setPinnedLabels] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [sliderValues, setSliderValues] = useState({}); 
  const animationRef = useRef(null);
  const touchRef = useRef(null);
  const curveCache = useRef(new Map());
  const drawThrottleRef = useRef(null);

  function extractVariables(expr) {
    const vars = new Set();
    const matches = expr.match(/\b([a-df-hj-np-z])\b/g);
    if (matches) matches.forEach(m => vars.add(m));
    return Array.from(vars);
  }

  function evaluate(raw, x, variables = {}) {
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

  function isValidExpr(raw, variables = {}) {
    if (!raw?.trim()) return true;
    return evaluate(raw, 1, variables) !== null || evaluate(raw, 0, variables) !== null;
  }

  function getNiceStep(scale) {
    const target = 80 / scale;
    const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
    const normal = target / magnitude;
    if (normal < 1.5) return magnitude;
    if (normal < 3.5) return 2 * magnitude;
    if (normal < 7.5) return 5 * magnitude;
    return 10 * magnitude;
  }

  function fmt(n, decimals = 2) {
    if (!n && n !== 0) return '';
    if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toPrecision(3);
    return parseFloat(n.toFixed(decimals)).toString();
  }

  const calculateCurvePoints = (expr, view, canvasDims, variables, maxPoints = 2000) => {
    if (!expr) return [];
    const { x: ox, y: oy, scale } = view;
    const { W, H } = canvasDims;
    const toWorld = (sx) => (sx - W/2) / scale + ox;
    const toScreen = (wx, wy) => ({
      sx: W/2 + (wx - ox) * scale,
      sy: H/2 - (wy - oy) * scale,
    });
    const steps = Math.min(maxPoints, Math.round(W * Math.sqrt(scale / 60)));
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const sx = (i / steps) * W;
      const wx = toWorld(sx);
      const wy = evaluate(expr, wx, variables);
      if (wy === null) { pts.push(null); continue; }
      const { sy } = toScreen(wx, wy);
      pts.push({ sx, sy });
    }
    return pts;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    const { x: ox, y: oy, scale } = view;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();

    const toScreen = (wx, wy) => ({
      sx: W/2 + (wx - ox) * scale,
      sy: H/2 - (wy - oy) * scale,
    });

    const step = getNiceStep(scale);
    const worldLeft = -W/2/scale + ox;
    const worldRight = W/2/scale + ox;
    const worldTop = H/2/scale + oy;
    const worldBottom = -H/2/scale + oy;
    const startX = Math.floor(worldLeft / step) * step;
    const startY = Math.floor(worldBottom / step) * step;
    const { sx: ax } = toScreen(0, 0);
    const { sy: ay } = toScreen(0, 0);

    
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let wx = startX; wx <= worldRight; wx += step) {
      const { sx } = toScreen(wx, 0);
      ctx.moveTo(sx, 0); ctx.lineTo(sx, H);
    }
    for (let wy = startY; wy <= worldTop; wy += step) {
      const { sy } = toScreen(0, wy);
      ctx.moveTo(0, sy); ctx.lineTo(W, sy);
    }
    ctx.stroke();

    
    ctx.save();
    ctx.shadowColor = 'rgba(240,230,208,0.12)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(240,230,208,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(W, ay); ctx.stroke();
    ctx.restore();

    
    ctx.strokeStyle = 'rgba(240,230,208,0.25)';
    ctx.lineWidth = 1;
    ctx.font = "10px 'DM Mono', monospace";
    ctx.fillStyle = 'rgba(240,230,208,0.22)';
    ctx.textAlign = 'center';
    
    ctx.beginPath();
    for (let wx = startX; wx <= worldRight; wx += step) {
      if (Math.abs(wx) < step * 0.1) continue;
      const { sx } = toScreen(wx, 0);
      if (sx < 12 || sx > W - 12) continue;
      const ty = Math.min(Math.max(ay, 0), H);
      ctx.moveTo(sx, ty - 3); ctx.lineTo(sx, ty + 3);
      ctx.fillText(fmt(wx), sx, Math.min(Math.max(ay + 16, 14), H - 6));
    }
    ctx.stroke();
    
    ctx.textAlign = 'right';
    ctx.beginPath();
    for (let wy = startY; wy <= worldTop; wy += step) {
      if (Math.abs(wy) < step * 0.1) continue;
      const { sy } = toScreen(0, wy);
      if (sy < 12 || sy > H - 12) continue;
      const tx = Math.min(Math.max(ax, 0), W);
      ctx.moveTo(tx - 3, sy); ctx.lineTo(tx + 3, sy);
      ctx.fillText(fmt(wy), Math.min(Math.max(ax - 8, 30), W - 8), sy + 4);
    }
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(240,230,208,0.1)';
    ctx.textAlign = 'right';
    ctx.fillText('0', Math.min(Math.max(ax - 6, 24), W - 6), Math.min(Math.max(ay + 14, 14), H - 6));

    
    equations.forEach((eq) => {
      const { expr = '', color = '#c8a96e', visible = true, error = false, id, variables = [] } = eq || {};
      if (!visible || error || !expr?.trim()) return;
      
      const cacheKey = `${id}_${ox}_${oy}_${scale}_${W}_${H}_${JSON.stringify(sliderValues)}`;
      let pts = curveCache.current.get(cacheKey);
      
      if (!pts) {
        pts = calculateCurvePoints(expr, view, { W, H }, { ...constMap, ...sliderValues });
        curveCache.current.set(cacheKey, pts);
      }
      
      const drawPath = () => {
        ctx.beginPath();
        let penDown = false, prevSy = null;
        for (const pt of pts) {
          if (pt === null) { penDown = false; prevSy = null; continue; }
          if (prevSy !== null && Math.abs(pt.sy - prevSy) > H * 1.5) penDown = false;
          if (!penDown) { ctx.moveTo(pt.sx, pt.sy); penDown = true; }
          else ctx.lineTo(pt.sx, pt.sy);
          prevSy = pt.sy;
        }
      };
      
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color + '55';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      drawPath();
      ctx.stroke();
      ctx.restore();
      
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      drawPath();
      ctx.stroke();
      ctx.restore();
    });

    const specialPts = [];
    const scanSteps = Math.min(W * 1.5, 1000);

    equations.forEach((eq) => {
      const { expr = '', color = '#c8a96e', visible = true, error = false } = eq || {};
      if (!visible || error || !expr?.trim()) return;
      
      let prevWy = null, prevWx = null;
      for (let i = 0; i <= scanSteps; i++) {
        const sx = (i / scanSteps) * W;
        const curWx = (sx - W/2) / scale + ox;
        const curWy = evaluate(expr, curWx, sliderValues);
        if (curWy !== null && prevWy !== null && prevWy * curWy < 0) {
          let lo = prevWx, hi = curWx;
          for (let b = 0; b < 20; b++) {
            const mid = (lo + hi) / 2;
            const mwy = evaluate(expr, mid, sliderValues);
            if (mwy === null) break;
            if (evaluate(expr, lo, sliderValues) * mwy < 0) hi = mid;
            else lo = mid;
          }
          const rootX = (lo + hi) / 2;
          const { sx: rsx, sy: rsy } = toScreen(rootX, 0);
          if (rsx >= 0 && rsx <= W)
            specialPts.push({ sx: rsx, sy: rsy, label: `(${fmt(rootX, 3)}, 0)`, color });
        }
        prevWy = curWy; prevWx = curWx;
      }
      
      const yint = evaluate(expr, 0, sliderValues);
      if (yint !== null) {
        const { sx: ysx, sy: ysy } = toScreen(0, yint);
        if (ysy >= 0 && ysy <= H)
          specialPts.push({ sx: ysx, sy: ysy, label: `(0, ${fmt(yint, 3)})`, color });
      }
    });

    for (let a = 0; a < equations.length; a++) {
      for (let b = a + 1; b < equations.length; b++) {
        const ea = equations[a] || {}, eb = equations[b] || {};
        const { expr: exprA = '', visible: visA = true, error: errA = false } = ea;
        const { expr: exprB = '', visible: visB = true, error: errB = false } = eb;
        
        if (!visA || !visB || errA || errB || !exprA?.trim() || !exprB?.trim()) continue;
        
        let prevDiff = null, prevWx = null;
        for (let i = 0; i <= scanSteps; i++) {
          const sx = (i / scanSteps) * W;
          const curWx = (sx - W/2) / scale + ox;
          const ya = evaluate(exprA, curWx, sliderValues);
          const yb = evaluate(exprB, curWx, sliderValues);
          if (ya !== null && yb !== null) {
            const curDiff = ya - yb;
            if (prevDiff !== null && prevDiff * curDiff < 0) {
              let lo = prevWx, hi = curWx;
              for (let k = 0; k < 20; k++) {
                const mid = (lo + hi) / 2;
                const ma = evaluate(exprA, mid, sliderValues);
                const mb = evaluate(exprB, mid, sliderValues);
                if (ma === null || mb === null) break;
                if ((evaluate(exprA, lo, sliderValues) - evaluate(exprB, lo, sliderValues)) * (ma - mb) < 0) hi = mid;
                else lo = mid;
              }
              const ix = (lo + hi) / 2;
              const iy = evaluate(exprA, ix, sliderValues);
              if (iy !== null) {
                const { sx: isx, sy: isy } = toScreen(ix, iy);
                if (isx >= 0 && isx <= W && isy >= 0 && isy <= H)
                  specialPts.push({ sx: isx, sy: isy, label: `(${fmt(ix, 3)}, ${fmt(iy, 3)})`, color: '#f0e6d0' });
              }
            }
            prevDiff = curDiff;
          }
          prevWx = curWx;
        }
      }
    }

    specialPts.forEach(({ sx, sy, label, color }) => {
      const isHovered = mousePos && Math.hypot(mousePos.x - sx, mousePos.y - sy) < 16;
      const isPinned = pinnedLabels.some(p => p.label === label);
      const showLabel = isHovered || isPinned;

      ctx.save();
      ctx.strokeStyle = color + (showLabel ? 'cc' : '33');
      ctx.lineWidth = showLabel ? 1.5 : 1;
      if (showLabel) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath(); 
      ctx.arc(sx, sy, 4, 0, Math.PI * 2); 
      ctx.stroke();
      ctx.restore();

      if (showLabel) {
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
      }

      if (showLabel) {
        ctx.font = "10px 'DM Mono', monospace";
        const textW = ctx.measureText(label).width;
        const boxW = textW + 16, boxH = 20, pad = 10;
        let lx = sx + pad, ly = sy - pad - boxH;
        if (lx + boxW > W) lx = sx - boxW - pad;
        if (ly < 0) ly = sy + pad;
        
        ctx.save();
        ctx.fillStyle = isPinned ? 'rgba(25,20,10,0.97)' : 'rgba(15,12,8,0.92)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(lx, ly, boxW, boxH, 2);
        else ctx.rect(lx, ly, boxW, boxH);
        ctx.fill();
        ctx.strokeStyle = color + (isPinned ? 'cc' : '66');
        ctx.lineWidth = isPinned ? 1.5 : 1;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, lx + 8, ly + boxH / 2);
        ctx.restore();
      }
    });

    if (mousePos) {
      let closestPoint = null;
      let minDist = 25;
      
      equations.forEach((eq) => {
        const { expr = '', color = '#c8a96e', visible = true, error = false } = eq || {};
        if (!visible || error || !expr?.trim()) return;
        
        const cacheKey = `${expr}_${ox}_${oy}_${scale}_${W}_${H}`;
        const pts = curveCache.current.get(cacheKey);
        if (!pts) return;
        
        for (const pt of pts) {
          if (!pt) continue;
          const dist = Math.hypot(mousePos.x - pt.sx, mousePos.y - pt.sy);
          if (dist < minDist) {
            minDist = dist;
            const wx = (pt.sx - W/2) / scale + ox;
            const wy = evaluate(expr, wx, sliderValues);
            if (wy !== null) {
              closestPoint = { 
                sx: pt.sx, sy: pt.sy, 
                wx, wy, color, label: `(${fmt(wx, 3)}, ${fmt(wy, 3)})` 
              };
            }
          }
        }
      });
      
      setHoveredPoint(closestPoint);
      
      if (closestPoint) {
        ctx.save();
        ctx.strokeStyle = closestPoint.color + '88';
        ctx.lineWidth = 4;
        ctx.shadowColor = closestPoint.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(closestPoint.sx, closestPoint.sy, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.arc(closestPoint.sx, closestPoint.sy, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = closestPoint.color;
        ctx.beginPath();
        ctx.arc(closestPoint.sx, closestPoint.sy, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.font = "11px 'DM Mono', monospace";
        const textW = ctx.measureText(closestPoint.label).width;
        const boxW = textW + 16, boxH = 24, pad = 10;
        
        let lx = mousePos.x + 15, ly = mousePos.y - 15 - boxH;
        if (lx + boxW > W - 10) lx = mousePos.x - boxW - 15;
        if (ly < 10) ly = mousePos.y + 15;
        if (ly + boxH > H - 10) ly = mousePos.y - boxH - 15;
        
        ctx.save();
        ctx.fillStyle = 'rgba(20,18,16,0.96)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(lx, ly, boxW, boxH, 4);
        else {
          ctx.moveTo(lx + 4, ly);
          ctx.lineTo(lx + boxW - 4, ly);
          ctx.quadraticCurveTo(lx + boxW, ly, lx + boxW, ly + 4);
          ctx.lineTo(lx + boxW, ly + boxH - 4);
          ctx.quadraticCurveTo(lx + boxW, ly + boxH, lx + boxW - 4, ly + boxH);
          ctx.lineTo(lx + 4, ly + boxH);
          ctx.quadraticCurveTo(lx, ly + boxH, lx, ly + boxH - 4);
          ctx.lineTo(lx, ly + 4);
          ctx.quadraticCurveTo(lx, ly, lx + 4, ly);
        }
        ctx.fill();
        
        ctx.strokeStyle = closestPoint.color + 'aa';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.fillStyle = closestPoint.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(closestPoint.label, lx + 8, ly + boxH/2);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [view, equations, mousePos, pinnedLabels, sliderValues]);

  const scheduleDraw = useCallback(() => {
    if (drawThrottleRef.current) cancelAnimationFrame(drawThrottleRef.current);
    drawThrottleRef.current = requestAnimationFrame(() => {
      draw();
      drawThrottleRef.current = null;
    });
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      curveCache.current.clear();
      scheduleDraw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [scheduleDraw]);

  useEffect(() => { scheduleDraw(); }, [scheduleDraw]);
  useEffect(() => { curveCache.current.clear(); }, [equations.map(e => e?.expr).join('|'), view.scale, sliderValues]);

  const onWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    const factor = e.deltaY < 0 ? 1.12 : 1/1.12;
    setView(v => {
      const wx = (mx - W/2) / v.scale + v.x;
      const wy = -(my - H/2) / v.scale + v.y;
      const newScale = Math.min(Math.max(v.scale * factor, 5), 2000);
      return { x: wx - (mx - W/2) / newScale, y: wy + (my - H/2) / newScale, scale: newScale };
    });
  };

  const onMouseDown = (e) => setDragging({ x: e.clientX, y: e.clientY, ox: view.x, oy: view.y });
  
  const onMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (dragging) {
      const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
      setView(v => ({ ...v, x: dragging.ox - dx/v.scale, y: dragging.oy + dy/v.scale }));
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(() => setMousePos(pos));
  };
  
  const onMouseLeave = () => { setDragging(null); setMousePos(null); setHoveredPoint(null); };
  
  const onMouseUp = (e) => {
    setDragging(null);
    if (!dragging) return;
    const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
    if (Math.hypot(dx, dy) > 4) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    const { x: ox, y: oy, scale } = view;
    const toScreen = (wx, wy) => ({ sx: W/2 + (wx-ox)*scale, sy: H/2 - (wy-oy)*scale });
    const toWorld = (sx) => (sx - W/2) / scale + ox;

    const clickablePts = [];
    const scanSteps = Math.min(W * 1.5, 1000);

    equations.forEach((eq) => {
      const { expr = '', color = '#c8a96e', visible = true, error = false } = eq || {};
      if (!visible || error || !expr?.trim()) return;
      
      let prevWy = null, prevWx = null;
      for (let i = 0; i <= scanSteps; i++) {
        const sx = (i / scanSteps) * W;
        const curWx = toWorld(sx);
        const curWy = evaluate(expr, curWx, {});
        if (curWy !== null && prevWy !== null && prevWy * curWy < 0) {
          let lo = prevWx, hi = curWx;
          for (let b = 0; b < 20; b++) {
            const mid = (lo + hi) / 2;
            const mwy = evaluate(expr, mid, {});
            if (mwy === null) break;
            if (evaluate(expr, lo, {}) * mwy < 0) hi = mid; else lo = mid;
          }
          const rootX = (lo + hi) / 2;
          const { sx: rsx, sy: rsy } = toScreen(rootX, 0);
          clickablePts.push({ sx: rsx, sy: rsy, label: `(${fmt(rootX, 3)}, 0)`, color });
        }
        prevWy = curWy; prevWx = curWx;
      }
      
      const yint = evaluate(expr, 0, {});
      if (yint !== null) {
        const { sx: ysx, sy: ysy } = toScreen(0, yint);
        clickablePts.push({ sx: ysx, sy: ysy, label: `(0, ${fmt(yint, 3)})`, color });
      }
    });

    for (let a = 0; a < equations.length; a++) {
      for (let b = a + 1; b < equations.length; b++) {
        const ea = equations[a] || {}, eb = equations[b] || {};
        const { expr: exprA = '', visible: visA = true, error: errA = false } = ea;
        const { expr: exprB = '', visible: visB = true, error: errB = false } = eb;
        
        if (!visA || !visB || errA || errB || !exprA?.trim() || !exprB?.trim()) continue;
        
        let prevDiff = null, prevWx = null;
        for (let i = 0; i <= scanSteps; i++) {
          const sx = (i / scanSteps) * W;
          const curWx = toWorld(sx);
          const ya = evaluate(exprA, curWx, {});
          const yb = evaluate(exprB, curWx, {});
          if (ya !== null && yb !== null) {
            const curDiff = ya - yb;
            if (prevDiff !== null && prevDiff * curDiff < 0) {
              let lo = prevWx, hi = curWx;
              for (let k = 0; k < 20; k++) {
                const mid = (lo + hi) / 2;
                const ma = evaluate(exprA, mid, {});
                const mb = evaluate(exprB, mid, {});
                if (ma === null || mb === null) break;
                if ((evaluate(exprA, lo, {}) - evaluate(exprB, lo, {})) * (ma - mb) < 0) hi = mid;
                else lo = mid;
              }
              const ix = (lo + hi) / 2;
              const iy = evaluate(exprA, ix, {});
              if (iy !== null) {
                const { sx: isx, sy: isy } = toScreen(ix, iy);
                clickablePts.push({ sx: isx, sy: isy, label: `(${fmt(ix, 3)}, ${fmt(iy, 3)})`, color: '#f0e6d0' });
              }
            }
            prevDiff = curDiff;
          }
          prevWx = curWx;
        }
      }
    }

    const hit = clickablePts.find(p => Math.hypot(cx - p.sx, cy - p.sy) < 16);
    if (hit) {
      setPinnedLabels(prev => {
        const exists = prev.findIndex(p => p.label === hit.label);
        if (exists >= 0) return prev.filter((_, i) => i !== exists);
        return [...prev, { ...hit }];
      });
    }
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 1)
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: view.x, oy: view.y, type: 'drag' };
    else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      touchRef.current = { dist: d, scale: view.scale, type: 'pinch' };
    }
  };
  
  const onTouchMove = (e) => {
    e.preventDefault();
    if (!touchRef.current) return;
    if (touchRef.current.type === 'drag' && e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      setView(v => ({ ...v, x: touchRef.current.ox - dx/v.scale, y: touchRef.current.oy + dy/v.scale }));
    } else if (touchRef.current.type === 'pinch' && e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setView(v => ({ ...v, scale: Math.min(Math.max(touchRef.current.scale * (d/touchRef.current.dist), 5), 2000) }));
    }
  };

  const addEquation = () => {
    const id = nextEqId;
    setEquations(eq => [...eq, { 
      id, 
      expr: '',
      variables: [],
      color: COLORS[id % COLORS.length], 
      visible: true, 
      error: false 
    }]);
    setNextEqId(n => n + 1);
    setTimeout(() => inputRefs.current[id]?.focus?.(), 50);
  };

  const updateExpr = (id, userInput) => {
    const jsExpr = inputToJS(userInput);
    const variables = extractVariables(jsExpr);

    setSliderValues(prev => {
      const updated = { ...prev };
      variables.forEach(v => {
        if (!(v in updated)) updated[v] = 1;
      });
      return updated;
    });
    
    setEquations(eq => eq.map(e => {
      if (e.id !== id) return e;
      const error = jsExpr?.trim() ? !isValidExpr(jsExpr, sliderValues) : false;
      return { ...e, expr: jsExpr, variables, error };
    }));
    
    curveCache.current.clear();
  };

  const updateSlider = (variable, value) => {
    setSliderValues(prev => ({ ...prev, [variable]: value }));
  };

  const worldCoords = mousePos && canvasRef.current ? (() => {
    const dpr = window.devicePixelRatio || 1;
    const W = canvasRef.current.width / dpr, H = canvasRef.current.height / dpr;
    return { wx: (mousePos.x - W/2) / view.scale + view.x, wy: -(mousePos.y - H/2) / view.scale + view.y };
  })() : null;

  const toggleVisible = (id) => {
    setEquations(eq => eq.map(e => e.id === id ? { ...e, visible: !e.visible } : e));
    curveCache.current.clear();
  };
  
  const removeEquation = (id) => {
    setEquations(eq => eq.filter(e => e.id !== id));
    curveCache.current.clear();
  };
  
  const resetView = () => { setView({ x: 0, y: 0, scale: 60 }); curveCache.current.clear(); };

  const onEqKeyDown = (e, id, idx) => {
    if (e.key === 'Enter') { e.preventDefault(); addEquation(); }
    if (e.key === 'Backspace' && !equations[idx]?.expr) {
      e.preventDefault();
      removeEquation(id);
      const prev = equations[idx - 1];
      if (prev) setTimeout(() => inputRefs.current[prev.id]?.focus?.(), 50);
    }
    if (e.key === 'ArrowUp') { e.preventDefault(); const prev = equations[idx-1]; if (prev) inputRefs.current[prev.id]?.focus?.(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); const next = equations[idx+1]; if (next) inputRefs.current[next.id]?.focus?.(); }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif }
        .font-mono-dm  { font-family: 'DM Mono', monospace }
        .eq-row:focus-within .eq-num { color: #c8a96e }
        .scrollbar-hide::-webkit-scrollbar { display: none }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
        .exp { vertical-align: super; font-size: 0.65em; line-height: 1; margin-left: -1px; font-style: italic; }
        .sub { vertical-align: sub; font-size: 0.65em; line-height: 1; margin-right: -1px; font-style: italic; }
        .func { font-style: italic; margin-right: 2px; }
        .const { font-style: italic; }
        .op { margin: 0 3px; font-weight: 500; }
        .placeholder { color: #2a2a2a; font-style: italic; opacity: 0.7; }
        input.font-mono-dm { font-variant-numeric: tabular-nums; letter-spacing: 0.5px; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #c8a96e;
          cursor: pointer;
          border: 2px solid #0a0a0a;
        }
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #c8a96e;
          cursor: pointer;
          border: 2px solid #0a0a0a;
        }
      `}</style>

      <div className="w-64 flex-shrink-0 bg-[#111] border-r border-[#1e1e1e] flex flex-col">
        <div className="border-b border-[#1e1e1e] px-5 py-3.5 flex items-center gap-2">
          <span className="font-playfair text-lg font-black text-[#f0e6d0] tracking-tight">alpha</span>
          <span className="w-1 h-1 rounded-full bg-[#c8a96e]" />
          <span className="font-mono-dm text-[0.55rem] text-[#333] uppercase tracking-widest mt-0.5">Grapher</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {equations.map((eq, idx) => {
            const { id, expr = '', variables = [], color, visible, error } = eq || {};
            const hasSliders = variables?.length > 0;
            
            return (
              <div key={id}>
                <div
                  onMouseEnter={() => setHoveredEq(id)}
                  onMouseLeave={() => setHoveredEq(null)}
                  className={`eq-row group flex items-center border-b border-[#1a1a1a] transition-colors ${
                    hoveredEq === id ? 'bg-[#1a1a1a]/50' : ''
                  } ${error ? 'bg-[#1a0d0d]/50' : ''}`}
                >
                  <button
                    onClick={() => toggleVisible(id)}
                    className="flex-shrink-0 w-1 self-stretch transition-all hover:w-2"
                    style={{
                      background: visible ? color : '#2a2a2a',
                      boxShadow: visible ? `2px 0 8px ${color}44` : 'none',
                      opacity: visible ? 1 : 0.5,
                    }}
                  />
                  <span className="eq-num font-mono-dm text-[0.6rem] text-[#2a2a2a] w-7 text-center flex-shrink-0 transition-colors select-none">
                    {idx + 1}
                  </span>
                  <MathInput
                    value={expr}
                    onChange={(val) => updateExpr(id, val)}
                    onKeyDown={(e) => onEqKeyDown(e, id, idx)}
                    placeholder="y = f(x)"
                    hasError={error}
                    color={color}
                  />
                  <div className="flex items-center gap-1.5 pr-2.5 flex-shrink-0">
                    {error && <span className="font-mono-dm text-[#c97e7e] text-[0.55rem]">err</span>}
                    <button onClick={() => removeEquation(id)} className="opacity-0 group-hover:opacity-100 text-[#333] hover:text-[#c97e7e] transition-all text-sm leading-none">×</button>
                  </div>
                </div>

                {hasSliders && visible && (
                  <div className="px-3 pb-2 space-y-1.5 border-b border-[#1a1a1a] bg-[#0f0f0f]/30">
                    {variables.map((v) => (
                      <VariableSlider
                        key={v}
                        variable={v}
                        value={sliderValues[v] ?? 1}
                        onChange={updateSlider}
                        color={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={() => addEquation()} className="w-full flex items-center border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors group">
            <div className="w-1 self-stretch bg-transparent" />
            <span className="font-mono-dm text-[0.6rem] text-[#2a2a2a] w-7 text-center group-hover:text-[#444] transition-colors select-none">{equations.length + 1}</span>
            <span className="font-mono-dm text-[0.75rem] text-[#2a2a2a] group-hover:text-[#444] py-3.5 transition-colors">+ expression</span>
          </button>
        </div>

        <div className="border-t border-[#1e1e1e] px-4 py-2.5 space-y-2">
          <div className="font-mono-dm text-[0.6rem] text-[#333] h-3.5">
            {worldCoords ? `(${fmt(worldCoords.wx, 3)}, ${fmt(worldCoords.wy, 3)})` : ''}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setView(v => ({...v, scale: Math.min(v.scale * 1.3, 2000)}))} className="flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#f0e6d0] font-mono-dm text-sm py-1 rounded-sm transition-all">+</button>
            <button onClick={resetView} className="flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#444] font-mono-dm text-[0.6rem] py-1 rounded-sm transition-all hover:text-[#f0e6d0]">reset</button>
            <button onClick={() => setView(v => ({...v, scale: Math.max(v.scale / 1.3, 5)}))} className="flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#f0e6d0] font-mono-dm text-sm py-1 rounded-sm transition-all">−</button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: dragging ? 'grabbing' : 'crosshair' }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => { touchRef.current = null; }}
        />
      </div>
    </div>
  );
}