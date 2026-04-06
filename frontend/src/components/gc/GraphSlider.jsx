import {useRef, useEffect, useCallback } from 'react';
import { evaluate } from "../../utils/mathParser"
import { getNiceStep, fmt } from '../../utils/helpers';

export default function GraphCanvas({
    view, equations, mousePos,pinnedLabels,
    sliderValues,
    setMousePos,
    setHoveredPoint,onWheel, onMouseDown,
    onMouseMove, onMouseUp,
    onMouseLeave, onTouchStart,
    onTouchEnd, dragging 
}) {
    const canvasRef = useRef(null)
    const curveCache=useRef(new Map());
    const drawThrottleRef =useRef(null);

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

    useEffect(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resize=()=> {
            const dpr =window.devicePixelRatio||1;
            canvas.width= canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight *dpr;
            curveCache.current.clear()
            scheduleDraw();
        };
        resize();
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize);
    }, [scheduleDraw])

    useEffect(()=> {scheduleDraw();}, [scheduleDraw])
    useEffect(() => {curveCache.current.clear();}, [equations.map(e=>e?.expr).join('|'), view.scale, sliderValues]);

    return (
        <div className="flex-1 relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ cursor: dragging ? 'grabbing' : 'crosshair'}}
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            />
        </div>
    );
}