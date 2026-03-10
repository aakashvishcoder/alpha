import {useState, useEffect, useRef, useCallback} from 'react';

const COLORS = ['#c8a96e', '#7eb8c9', '#a97ec8', '#7ec98a','#c97e7e', '#c9b87e'];

function evaluate(expression, x) { //graph the functions
    try {
        let e = expression
        .replace(/\^/g, "**")
        .replace(/sin/g, "Math.sin")
        .replace(/cos/g, "Math.cos")
        .replace(/tan/g, "Math.tan")
        .replace(/sqrt/g, "Math.sqrt")
        .replace(/abs/g, "Math.abs")
        .replace(/log/g, "Math.log10")
        .replace(/ln/g, "Math.log")
        .replace(/pi/g, "Math.PI")
        .replace(/e(?![a-zA-Z])/g, "Math.E")
        .replace(/x/g, `(${x})`);
        const result = new Function(`return ${e}`)();
        return isFinite(result) ? result : null;
    } catch {
        return null;
    }
}; 

function getNiceStep(scale) {
    const target = 80/scale;
    const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
    const normal = target / magnitude;
    if (normal < 1.5) return magnitude;
    if (normal < 3.5) return 3 * magnitude;
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
    const [nextId, setNextId]= useState(3);
    const [view, setView] = useState({x: 0, y: 0, scale: 60});
    const [dragging, setDragging] = useState(null);
    const [hoveredEq, setHoveredEq] = useState(null);
    const [mousePos, setMousePos] = useState(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const H = canvas.height;
        const { x: ox, y: oy, scale} = view;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        const toScreen = (wx, wy) => ({
            sx: W / 2 + (wx - ox) * scale,
            sy: H / 2 - (wy - oy) * scale,
        });
        const toWorld = (sx, sy) => ({
            wx: (sx - W / 2) / scale + ox,
            wy: -(sy - H /2) / scale + oy,
        });

        const step = getNiceStep(scale);
        const worldLeft = toWorld(0, 0).wx;
        const worldRight = toWorld(W, 0).wx;
        const worldTop = toWorld(0, 0).wy;
        const worldBottom = toWorld(0, H).wy;
        const startX = Math.floor(worldLeft / step) * step;
        const startY = Math.floor(worldBottom / step) * step;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        for (let wx = startX; wx <= worldRight; wx += step) {
            const { sx} = toScreen(wx, 0);
            ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
        }
        for (let wy = startY; wy <= worldTop; wy += step) {
            const { sy} = toScreen(0, wy);
            ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
        }

        const { sx: ax} = toScreen(0,0);
        const { sy: ay } = toScreen(0,0);
        ctx.strokeStyle = "rgba(240, 230, 208, 0.2)";
        ctx.lineWidth =1;
        ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(W, ay); ctx.stroke();

        ctx.fillStyle = "rgba(240, 230, 208, 0.35)";
        ctx.font= "10px 'DM Mono', monospace";
        ctx.textAlign = 'center';
        for (let wx = startX; wx <= worldRight; wx += step) {
            if (Math.abs(wx) < step * 0.1) continue;
            const { sx } = toScreen(wx, 0);
            const labelY = Math.min(Math.max(ay + 14, 14), H - 6);
            ctx.fillText(fmt(wx), sx, labelY);
        }
        ctx.textAlign= "right";
        for(let wy = startY; wy <= worldTop; wy += step) {
            if (Math.abs(wy) < step * 0.1) continue;
            const { sy } = toScreen(0, wy);
            const labelX = Math.min(Math.max(ax - 6, 28), W-6);
            ctx.fillText(fmt(wy), labelX, sy + 4);
        } 

        equations.forEach(({ expr, color, visible, error }) => {
            if (!visible || error) return;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.lineJoin = "round";
            ctx.beginPath();
            let penDown = false;
            const steps = W * 2;
            let prevY = null;
            for (let i = 0; i <= steps; i++) {
                const sx = (i / steps) * W;
                const wx = toWorld(sx, 0).wx;
                const wy = evaluate(expr, wx);
                if (wy === null) { penDown = false; prevY = null; continue; }
                const { sy} = toScreen(wx, wy);
                if (prevY !== null && Math.abs(sy - prevY) > H * 1.5) { penDown = false;}
                if (!penDown) { ctx.moveTo(sx, sy); penDown = true;}
                else ctx.lineTo(sx, sy);
                prevY = sy;
            }
            ctx.stroke();
        });

        if (mousePos) {
            const { wx } = toWorld(mousePos.x, mousePos.y);
            ctx.strokeStyle = "rgba(200, 169, 110, 0.3)";
            ctx.lineWidth = 1;
            ctx.setLineDash([4,4]);
            ctx.beginPath(); ctx.moveTo(mousePos.x, 0); ctx.lineTo(mousePos.x, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, mousePos.y); ctx.lineTo(W, mousePos.y); ctx.stroke();
            ctx.setLineDash([]);
            equations.forEach(({ expr, color, visible, error}) => {
                if (!visible || error) return;
                const wy = evaluate(expr, wx);
                if (wy === null) return;
                const { sx, sy } = toScreen(wx, wy);
                if ( sy < 0 || sy > H) return;
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.arc(sx, sy, 4, 0 , Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); 
            });
        }
    }, [view, equations, mousePos]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    },[draw]);

    useEffect(() => {draw();}, [draw]);

    const onWheel = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const W = canvas.width, H = canvas.height;
        const factor = e.deltaY < 0 ? 1.12 : 1/1.12;
        setView(v => {
            const wx = (mx - W / 2) / v.scale + v.x;
            const wy = -(my - H / 2) / v.scale + v.y;
            const newScale = Math.min(Math.max(v.scale * factor, 5), 2000);
            return { x: wx - (mx - W / 2) / newScale, y: wy + (my - H / 2) / newScale, scale: newScale};
        })
    };

    const onMouseDown = (e) => setDragging({ x: e.clientX, y: e.clientY, ox: view.x, oy: view.y});
    const onMouseMove = (e)=> {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top})
        if (!dragging) return;
        const dx = e.clientX - dragging.x;
        const dy = e.clientY - dragging.y;
        setView(v => ({ ...v, x: dragging.ox - dx/v.scale, y: dragging.oy + dy/v.scale}))
    };
    const onMouseLeave = () => {setDragging(null); setMousePos(null)}
    const onMouseUp = () => setDragging(null);

    const touchRef = useRef(null)

    const onTouchStart = (e)=> {
        if (e.touches.length === 1) {
            touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: view.x, oy: view.y, type: "drag"}
        } else if (e.touches.length === 2) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            touchRef.current = { dist: d, scale: view.scale, type:"pinch"};
        }
    }

    const onTouchMove = (e)=> {
        e.preventDefault();
        if (!touchRef.current) return;
        if (touchRef.current.type === "drag" && e.touches.length === 1) {
            const dx = e.touches[0].clientX - touchRef.current.x;
            const dy = e.touches[0].clientY - touchRef.current.y;
            setView(v => ({...v, x: touchRef.current.ox - dx/v.scale, y: touchRef.current.oy + dy/v.scale }))
        } else if (touchRef.current.type === "pinch" && e.touches.length === 2) {
            const d= Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            setView(v => ({...v, scale: Math.min(Math.max(touchRef.current.scale * (d/touchRef.current.dist), 5), 2000) }));
        }
    };

    const addEquation = () => {
        setEquations(eq=> [...eq, { id: nextId, expr: "", color: COLORS[nextId % COLORS.length], visible: true, error: false}])
        setNextId(n=>n+1);
    };

    const updateExpr = (id, val) => {
        setEquations(eq=>eq.map(e=>{
            if (e.id !== id) return e;
            const error = val.trim() ? evaluate(val, 1) === null: false;
            return {...e, expr: val, error};
        }))
    };

    const worldCoords = mousePos && canvasRef.current ? (() => {
        const W = canvasRef.current.width, H = canvasRef.current.height;
        return { wx: (mousePos.x - W / 2) / view.scale + view.x, wy: -(mousePos.y - H /2)/view.scale + view.y};
    })() : null;

    const toggleVisible = (id) => setEquations(eq=>eq.map(e=>e.id === id? {...e, visible: !e.visible} : e));
    const removeEquation = (id) => setEquations(eq=>eq.filter(e=>e.id !== id));
    const resetView = () => setView({ x: 0, y: 0, scale: 60});

    return (
        <div className='flex h-screen w-full bg-[#0a0a0a] overflow-hidden' style={{ fontFamily: "'DM Sans', sans-serif"}}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
                .font-playfair { font-family: 'Playfair Display', serif}
                .font-mono-dm { font-family: 'DM Mono', monospace}
                .eq-input { background: transparent; outline: none; width: 100%; color: #f0e6d0; font-family: 'DM Mono', monospace; font-size: 0.82rem; border:none; }
                .eq-input::placeholder { color: #333}
                .scrollbar-hide::-webkit-scrollbar { display: none}
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none;}
            `}</style>

            <div className="w-72 flex-shrink-0 bg-[#111] border-r border-[#2a2a2a] flex flex-col">
                <div className="border-b border-[#2a2a2a] px-6 py-4 flex items-center gap-2">
                    <span className="font-playfair text-xl font-black text-[#f0e6d0] tracking-tight">alpha</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8a96e] mb-0.5" />
                    <span className="font-mono-dm text-[0.6rem] text-[#444] uppercase tracking-widest ml-1 mt-0.5">Graphing Calculator</span>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-1.3">
                    {equations.map((eq)=>(
                        <div
                            key={eq.id}
                            onMouseEnter={() => setHoveredEq(eq.id)}
                            onMouseLeave={() => setHoveredEq(null)}
                            className={`group flex items-center gap-2 rounded-sm border px-3 py-2.5 transition-all ${
                                eq.error ? "border-[#c97e7e]/40 bg-[#1a0d0d]"
                                : hoveredEq === eq.id ? "border-[#3a3a3a] bg-[#181818]"
                                : "border-[#2a2a2a] bg-[#0d0d0d]"
                            }`}
                        >
                            <button
                                onClick={() => toggleVisible(eq.id)}
                                className="flex-shrink-0 w-3 h-3 rounded-full border transition-all"
                                style={{
                                    background: eq.visible ? eq.color: "transparent",
                                    borderColor: eq.color,
                                    boxShadow: eq.visible ? `0 0 6px ${eq.color}55` : "none",
                                }}
                            />
                            <input
                                className="eq-input"
                                value={eq.expr}
                                placeholder="y = f(x)"
                                onChange={(e)=>updateExpr(eq.id, e.target.value)}
                                spellCheck={false}
                            />
                            {eq.error && <span className="font-mono-dm text-[#c97e7e] text-[0.6rem] flex-shrink-0">err</span>}
                            <button
                                onClick={() => removeEquation(eq.id)}
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[#444] hover:text-[#c97e7e] transition-all text-xs"
                            >x</button>
                        </div>
                    ))}

                    <button
                        onClick={addEquation}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-sm border border-dashed border-[#2a2a2a] text-[#444] hover:border-[#c8a96e]/40 hover:text-[#c8a96e]/60 transition-all font-mono-dm text-xs"
                    >
                        <span className="text-base leading-none mb-0.5">+</span> Add equations
                    </button>
                </div>

                <div className="border-t border-[#2a2a2a] px-4 py-3 space-y-2">
                    <div className="font-mono-dm text-[0.6rem] text-[#444] h-4">
                        {worldCoords ? `x: ${fmt(worldCoords.wx, 3)} y: ${fmt(worldCoords.wy, 3)}` : "hover graph"}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setView(v=> ({...v, scale: Math.min(v.scale *1.3, 2000) }))}
                            className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] hover:border-[#3a3a3a] text-[#f0e6d0] font-mono-dm text-sm py-1.5 rounded-sm transition-all">+</button>
                        <button onClick={resetView}
                            className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] hover:border-[#3a3a3a] text-[#555] font-mono-dm text-[0.65rem] py-1.5 rounded-sm transition-all hover:text-[#f0e6d0]">reset</button>
                        <button onClick={() =>setView(v=>({...v, scale:Math.max(v.scale / 1.3, 5)}))}
                            className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] hover:border-[#3a3a3a] text-[#f0e6d0] font-mono-dm text-sm py-1.5 rounded-sm transition-all">-</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{cursor:dragging ? "grabbing": "crosshair"}}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseLeave}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={() => { touchRef.current = null;}}
                />
                <div className="absolute bottom-4 right-4 font-mono-dm text-[0.6rem] text-[#333] select-none">
                    scale {Math.round(view.scale)}px/unit
                </div>
            </div>
        </div>
    );
};