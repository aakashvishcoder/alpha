import {useState, useEffect, useRef, useCallback} from 'react';

const COLORS = ['#c8a96e', '#7eb8c9', '#a97ec8', '#7ec98a','#c97e7e', '#c9b87e'];

function preprocess(raw) {
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
        .replace(/round/g, 'Math.round')
        .replace(/log10/g, 'Math.log10')
        .replace(/log2/g, 'Math.log2')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/exp/g, 'Math.exp')
        .replace(/sign/g, 'Math.sign')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\btau\b/gi, '(2*Math.PI)')
        .replace(/\be\b/g, 'Math.E');
}

function evaluate(raw, x, constants = {}) {
    try {
        let e = preprocess(raw);
        Object.entries(constants).forEach(([k, v]) => {
            e = e.replace(new RegExp(`\\b${k}\\b`, 'g'), `(${v})`);
        });
        e = e.replace(/\bx\b/g, `(${x})`);
        const result = new Function(`return ${e}`)();
        return isFinite(result) ? result : null;
    } catch {
        return null;
    }
}

function isValidExpr(raw, constants = {}) {
    if (!raw.trim()) return true;
    return evaluate(raw, 1, constants) !== null || evaluate(raw, 0, constants) !== null;
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
    if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toPrecision(3);
    return parseFloat(n.toFixed(decimals)).toString();
}

export default function GraphingCalculator() {
    const canvasRef = useRef(null);
    const [equations, setEquations] = useState([]);
    const [view, setView] = useState({x: 0, y: 0, scale: 60});
    const [dragging, setDragging] = useState(null);
    const [hoveredEq, setHoveredEq] = useState(null);
    const [mousePos, setMousePos] = useState(null);
    const inputRefs = useRef({});
    const [nextEqId, setNextEqId] = useState(1);
    const constMap = {};

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const {x: ox, y: oy, scale} = view;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, H)
        ctx.clip();

        const toScreen = (wx, wy) => ({
            sx: W/2 + (wx - ox) * scale,
            sy: H/2 - (wy - oy) * scale,
        });
        const toWorld = (sx, sy) => ({
            wx: (sx - W/2) / scale + ox,
            wy: -(sy - H/2) / scale + oy,
        });

        const step = getNiceStep(scale);
        const worldLeft   = toWorld(0, 0).wx;
        const worldRight  = toWorld(W, 0).wx;
        const worldTop    = toWorld(0, 0).wy;
        const worldBottom = toWorld(0, H).wy;
        const startX = Math.floor(worldLeft   / step) * step;
        const startY = Math.floor(worldBottom / step) * step;

        const {sx: ax} = toScreen(0, 0);
        const {sy: ay} = toScreen(0, 0);

        // grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth=1;
        ctx.beginPath();
        for (let wx = startX; wx <= worldRight; wx += step) {
            const {sx} = toScreen(wx, 0);
            ctx.moveTo(sx, 0); ctx.lineTo(sx, H); 
        }
        for (let wy = startY; wy <= worldTop; wy += step) {
            const { sy} = toScreen(0, wy);
            ctx.moveTo(0, sy); ctx.lineTo(W, sy); 
        }
        ctx.stroke();

        // axes with glow
        ctx.save();
        ctx.shadowColor = 'rgba(240,230,208,0.12)';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = 'rgba(240,230,208,0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(W, ay); ctx.stroke();
        ctx.restore();

        // tick marks
        ctx.strokeStyle='rgba(240,230, 208, 0.25)'
        ctx.lineWidth =1 
        ctx.beginPath();
        for (let wx = startX; wx <= worldRight; wx += step) {
            if (Math.abs(wx) < step * 0.1) continue;
            const {sx} = toScreen(wx, 0);
            const ty = Math.min(Math.max(ay, 0), H);
            ctx.moveTo(sx, ty- 3); ctx.lineTo(sx, ty + 3);
        }
        for(let wy=startY; wy <= worldTop; wy +=step) {
            if(Math.abs(wy) <step*0.1) continue;
            const { sy } = toScreen(0, wy);
            const tx = Math.min(Math.max(ax, 0), W)
            ctx.moveTo(tx-3, sy); ctx.lineTo(tx+3,sy)
        }
        ctx.stroke();

        // labels
        ctx.font = "10px 'DM Mono', monospace";
        ctx.fillStyle = 'rgba(240,230,208,0.22)';
        ctx.textAlign = 'center';
        for (let wx = startX; wx <= worldRight; wx += step) {
            if (Math.abs(wx) < step * 0.1) continue;
            const {sx} = toScreen(wx, 0);
            if (sx < 12 || sx > W - 12) continue;
            ctx.fillText(fmt(wx), sx, Math.min(Math.max(ay + 16, 14), H - 6));
        }
        ctx.textAlign = 'right';
        for (let wy = startY; wy <= worldTop; wy += step) {
            if (Math.abs(wy) < step * 0.1) continue;
            const {sy} = toScreen(0, wy);
            if (sy < 12 || sy > H - 12) continue;
            ctx.fillText(fmt(wy), Math.min(Math.max(ax - 8, 30), W - 8), sy + 4);
        }
        // origin
        ctx.fillStyle = 'rgba(240,230,208,0.1)';
        ctx.textAlign = 'right';
        ctx.fillText('0', Math.min(Math.max(ax - 6, 24), W - 6), Math.min(Math.max(ay + 14, 14), H - 6));

        // curves
        equations.forEach(({expr, color, visible, error}) => {
            if (!visible || error || !expr.trim()) return;

            const pts = [];
            const steps = Math.min(W * 2, Math.max(W, Math.round(W*Math.sqrt(scale/60))));
            for (let i = 0; i <= steps; i++) {
                const sx = (i / steps) * W;
                const wx = toWorld(sx, 0).wx;
                const wy = evaluate(expr, wx, constMap);
                if (wy === null) { pts.push(null); continue; }
                const {sy} = toScreen(wx, wy);
                pts.push({sx, sy});
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

            // glow pass
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

            // sharp pass
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            drawPath();
            ctx.stroke();
            ctx.restore();
        });

        // crosshair
        if (mousePos) {
            const {wx} = toWorld(mousePos.x, mousePos.y);
            ctx.save();
            ctx.strokeStyle = 'rgba(200,169,110,0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 6]);
            ctx.beginPath(); ctx.moveTo(mousePos.x, 0); ctx.lineTo(mousePos.x, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, mousePos.y); ctx.lineTo(W, mousePos.y); ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            equations.forEach(({expr, color, visible, error}) => {
                if (!visible || error || !expr.trim()) return;
                const wy = evaluate(expr, wx, constMap);
                if (wy === null) return;
                const {sx, sy} = toScreen(wx, wy);
                if (sy < 0 || sy > H) return;

                ctx.save();
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2); ctx.fill();
                ctx.restore();

                ctx.strokeStyle = '#0a0a0a';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2); ctx.stroke();
            });
        }
        ctx.restore();
    }, [view, equations, mousePos]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resize = () => {
            const dpr = window.devicePixelRatio||1;
            canvas.width = canvas.offsetWidth *dpr;
            canvas.height=canvas.offsetHeight*dpr;
            canvas.getContext('2d').scale(dpr, dpr)
            draw();
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [draw]);

    useEffect(() => { draw(); }, [draw]);

    const onWheel = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.width / dpr, H = canvas.height /dpr;
        const factor = e.deltaY < 0 ? 1.12 : 1/1.12;
        setView(v => {
            const wx = (mx - W/2) / v.scale + v.x;
            const wy = -(my - H/2) / v.scale + v.y;
            const newScale = Math.min(Math.max(v.scale * factor, 5), 2000);
            return {x: wx - (mx - W/2) / newScale, y: wy + (my - H/2) / newScale, scale: newScale};
        });
    };

    const onMouseDown = (e) => setDragging({x: e.clientX, y: e.clientY, ox: view.x, oy: view.y});
    const animationRef = useRef(null)
    const onMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const pos = {x: e.clientX - rect.left, y: e.clientY - rect.top }

        if (dragging) {
            const dx = e.clientX - dragging.x;
            const dy = e.clientY - dragging.y;
            setView(v => ({...v, x: dragging.ox - dx/v.scale, y: dragging.oy + dy/v.scale}));
        }
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
        animationRef.current = requestAnimationFrame(() => {
            setMousePos(pos);
        });
    }
    const onMouseLeave = () => { setDragging(null); setMousePos(null); };
    const onMouseUp = () => setDragging(null);

    const touchRef = useRef(null);
    const onTouchStart = (e) => {
        if (e.touches.length === 1) {
            touchRef.current = {x: e.touches[0].clientX, y: e.touches[0].clientY, ox: view.x, oy: view.y, type: 'drag'};
        } else if (e.touches.length === 2) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            touchRef.current = {dist: d, scale: view.scale, type: 'pinch'};
        }
    };
    const onTouchMove = (e) => {
        e.preventDefault();
        if (!touchRef.current) return;
        if (touchRef.current.type === 'drag' && e.touches.length === 1) {
            const dx = e.touches[0].clientX - touchRef.current.x;
            const dy = e.touches[0].clientY - touchRef.current.y;
            setView(v => ({...v, x: touchRef.current.ox - dx/v.scale, y: touchRef.current.oy + dy/v.scale}));
        } else if (touchRef.current.type === 'pinch' && e.touches.length === 2) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            setView(v => ({...v, scale: Math.min(Math.max(touchRef.current.scale * (d/touchRef.current.dist), 5), 2000)}));
        }
    };

    const addEquation = () => {
        const id = nextEqId;
        setEquations(eq => [...eq, {id, expr: '', color: COLORS[id % COLORS.length], visible: true, error: false}]);
        setNextEqId(n => n + 1);
        setTimeout(() => inputRefs.current[id]?.focus(), 50);
    };

    const updateExpr = (id, val) => {
        setEquations(eq => eq.map(e => {
            if (e.id !== id) return e;
            const error = val.trim() ? !isValidExpr(val, constMap) : false;
            return {...e, expr: val, error};
        }));
    };

    const worldCoords = mousePos && canvasRef.current ? (() => {
        const dpr= window.devicePixelRatio ||1;
        const W = canvasRef.current.width /dpr, H = canvasRef.current.height /dpr;
        return {wx: (mousePos.x - W/2) / view.scale + view.x, wy: -(mousePos.y - H/2) / view.scale + view.y};
    })() : null;

    const toggleVisible = (id) => setEquations(eq => eq.map(e => e.id === id ? {...e, visible: !e.visible} : e));
    const removeEquation = (id) => setEquations(eq => eq.filter(e => e.id !== id));
    const resetView = () => setView({x: 0, y: 0, scale: 60});

    const onEqKeyDown = (e, id, idx) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEquation();
        }
        if (e.key === 'Backspace' && equations[idx].expr === '') {
            e.preventDefault();
            removeEquation(id);
            const prev = equations[idx - 1];
            if (prev) setTimeout(() => inputRefs.current[prev.id]?.focus(), 50);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = equations[idx - 1];
            if (prev) inputRefs.current[prev.id]?.focus();
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = equations[idx + 1];
            if (next) inputRefs.current[next.id]?.focus();
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden" style={{fontFamily: "'DM Sans', sans-serif"}}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
                .font-playfair { font-family: 'Playfair Display', serif }
                .font-mono-dm  { font-family: 'DM Mono', monospace }
                .eq-input {
                    background: transparent;
                    outline: none;
                    width: 100%;
                    color: #f0e6d0;
                    font-family: 'DM Mono', monospace;
                    font-size: 0.85rem;
                    border: none;
                    padding: 0;
                    caret-color: #c8a96e;
                }
                .eq-input::placeholder { color: #2a2a2a }
                .eq-row:focus-within .eq-num { color: #c8a96e }
                .scrollbar-hide::-webkit-scrollbar { display: none }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
            `}</style>

            <div className="w-64 flex-shrink-0 bg-[#111] border-r border-[#1e1e1e] flex flex-col">

                <div className="border-b border-[#1e1e1e] px-5 py-3.5 flex items-center gap-2">
                    <span className="font-playfair text-lg font-black text-[#f0e6d0] tracking-tight">alpha</span>
                    <span className="w-1 h-1 rounded-full bg-[#c8a96e]" />
                    <span className="font-mono-dm text-[0.55rem] text-[#333] uppercase tracking-widest mt-0.5">Grapher</span>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {equations.map((eq, idx) => (
                        <div
                            key={eq.id}
                            className={`eq-row group flex items-center border-b border-[#1a1a1a] transition-colors ${
                                eq.error ? 'bg-[#1a0d0d]' : 'hover:bg-[#151515]'
                            }`}
                        >
                            <button
                                onClick={() => toggleVisible(eq.id)}
                                className="flex-shrink-0 w-1 self-stretch transition-all"
                                style={{
                                    background: eq.visible ? eq.color : '#2a2a2a',
                                    boxShadow: eq.visible ? `2px 0 8px ${eq.color}44` : 'none',
                                }}
                            />
                            <span className="eq-num font-mono-dm text-[0.6rem] text-[#2a2a2a] w-7 text-center flex-shrink-0 transition-colors select-none">
                                {idx + 1}
                            </span>
                            <input
                                ref={el => { inputRefs.current[eq.id] = el; }}
                                className="eq-input flex-1 py-3.5 pr-3"
                                value={eq.expr}
                                placeholder="y = f(x)"
                                onChange={e => updateExpr(eq.id, e.target.value)}
                                onKeyDown={e => onEqKeyDown(e, eq.id, idx)}
                                spellCheck={false}
                                autoComplete="off"
                            />
                            <div className="flex items-center gap-1.5 pr-2.5 flex-shrink-0">
                                {eq.error && <span className="font-mono-dm text-[#c97e7e] text-[0.55rem]">err</span>}
                                <button
                                    onClick={() => removeEquation(eq.id)}
                                    className="opacity-0 group-hover:opacity-100 text-[#333] hover:text-[#c97e7e] transition-all text-sm leading-none"
                                >×</button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => addEquation()}
                        className="w-full flex items-center border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors group"
                    >
                        <div className="w-1 self-stretch bg-transparent" />
                        <span className="font-mono-dm text-[0.6rem] text-[#2a2a2a] w-7 text-center group-hover:text-[#444] transition-colors select-none">
                            {equations.length + 1}
                        </span>
                        <span className="font-mono-dm text-[0.75rem] text-[#2a2a2a] group-hover:text-[#444] py-3.5 transition-colors">
                            + expression
                        </span>
                    </button>
                </div>

                <div className="border-t border-[#1e1e1e] px-4 py-2.5 space-y-2">
                    <div className="font-mono-dm text-[0.6rem] text-[#333] h-3.5">
                        {worldCoords ? `(${fmt(worldCoords.wx, 3)}, ${fmt(worldCoords.wy, 3)})` : ''}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setView(v => ({...v, scale: Math.min(v.scale * 1.3, 2000)}))}
                            className="flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#f0e6d0] font-mono-dm text-sm py-1 rounded-sm transition-all">+</button>
                        <button onClick={resetView}
                            className="flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#444] font-mono-dm text-[0.6rem] py-1 rounded-sm transition-all hover:text-[#f0e6d0]">reset</button>
                        <button onClick={() => setView(v => ({...v, scale: Math.max(v.scale / 1.3, 5)}))}
                            className="flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#f0e6d0] font-mono-dm text-sm py-1 rounded-sm transition-all">−</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative">
                <canvas
                    ref={canvasRef}
                    className='w-full h-full'
                    style={{cursor: dragging? 'grabbing':"crosshair"}}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseLeave}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={() => {touchRef.current = null;}}
                />
            </div>
        </div>
    );
}