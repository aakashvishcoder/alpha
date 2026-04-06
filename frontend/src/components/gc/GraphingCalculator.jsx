import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './Sidebar';
import GraphCanvas from './GraphCanvas';
import { evaluate, isValidExpr, inputToJS } from '../../utils/mathParser';
import { extractVariables, fmt, COLORS } from '../../utils/helpers';

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
      const error = jsExpr?.trim() ? !isValidExpr(jsExpr, { ...sliderValues }) : false;
      return { ...e, expr: jsExpr, variables, error };
    }));
  };

  const updateSlider = (variable, value) => {
    setSliderValues(prev => ({ ...prev, [variable]: value }));
  };

  const toggleVisible = (id) => {
    setEquations(eq => eq.map(e => e.id === id ? { ...e, visible: !e.visible } : e));
  };
  
  const removeEquation = (id) => {
    setEquations(eq => eq.filter(e => e.id !== id));
  };
  
  const resetView = () => { setView({ x: 0, y: 0, scale: 60 }); };

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

  const onWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
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
  const worldCoords = mousePos && canvasRef.current ? (() => {
    const dpr = window.devicePixelRatio || 1;
    const W = canvasRef.current.width / dpr, H = canvasRef.current.height / dpr;
    return { 
      wx: (mousePos.x - W/2) / view.scale + view.x, 
      wy: -(mousePos.y - H/2) / view.scale + view.y 
    };
  })() : null;

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
        .func, .const { font-style: italic; }
        .op { margin: 0 3px; font-weight: 500; }
        .placeholder { color: #2a2a2a; font-style: italic; opacity: 0.7; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #c8a96e;
          cursor: pointer;
          border: 2px solid #0a0a0a;
        }
        input[type="range"]::-moz-range-thumb {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #c8a96e;
          cursor: pointer;
          border: 2px solid #0a0a0a;
        }
      `}</style>

      <Sidebar
        equations={equations}
        hoveredEq={hoveredEq}
        setHoveredEq={setHoveredEq}
        toggleVisible={toggleVisible}
        removeEquation={removeEquation}
        updateExpr={updateExpr}
        onEqKeyDown={onEqKeyDown}
        addEquation={addEquation}
        sliderValues={sliderValues}
        updateSlider={updateSlider}
        worldCoords={worldCoords}
        fmt={fmt}
        resetView={resetView}
        setView={setView}
        view={view}
      />

      <GraphCanvas
        canvasRef={canvasRef}
        view={view}
        equations={equations}
        mousePos={mousePos}
        pinnedLabels={pinnedLabels}
        sliderValues={sliderValues}
        setMousePos={setMousePos}
        setHoveredPoint={setHoveredPoint}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { touchRef.current = null; }}
        dragging={dragging}
      />
    </div>
  );
}