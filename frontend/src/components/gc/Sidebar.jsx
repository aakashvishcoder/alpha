import EquationRow from './EquationRow'

export default function Sidebar({
    equations,
    hoveredEq,
    setHoveredEq,
    toggleVisible,
    removeEquation,
    updateExpr,
    onEqKeyDown,
    addEquation,
    sliderValues,
    updateSlider,
    worldCoords,
    fmt,
    resetView,
    setView,
    view
}) {
    return (
        <div className="w-64 flex-shrink-0 bg-[#111] border-r border-[#1e1e1e] flex flex-col">
            <div className='border-b border-[#1e1e1e] px-5 py-3.5 flex items-center gap-2'>
                <span className="font-playfair text-lg font-black text-[#f0e6d0] tracking-tight">alpha</span>
                <span className="w-1 h-1 rounded-full bg-[#c8a96e]" />
                <span className="font-mono-dm text-[0.55rem] text-[#333] uppercase tracking-widest mt-0.5">Grapher</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {equations.map((eq, idx) => (
                    <EquationRow
                        key={eq.id}
                        eq={eq}
                        idx={idx}
                        hoveredEq={hoveredEq}
                        setHoveredEq={setHoveredEq}
                        toggleVisible={toggleVisible}
                        removeEquation={removeEquation}
                        updateExpr={updateExpr}
                        onEqKeyDown={onEqKeyDown}
                        sliderValues={sliderValues}
                        updateSlider={updateSlider}
                    />
                ))}
                <button onClick={()=>addEquation()} className='w-full flex items-center border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors group'>
                    <div className="w-1 self-stretch bg-transparent" />
                    <span className="font-mono-dm text-[0.6rem] text-[#2a2a2a] w-7 text-center group-hover:text-[#444] transition-colors select-none">{equations.length + 1}</span>
                    <span className="font-mono-dm text-[0.75rem] text-[#2a2a2a] group-hover:text-[#444] py-3.5 transition-colors">+ expression</span>
                </button>
            </div>

            <div className="border-t border-[#1e1e1e] px-4 py-2.5 space-y-2">
                <div className="font-mono-dm text-[0.6rem] text-[#333] h-3.5">
                    {worldCoords ? `(${fmt(worldCoords.wx, 3)}, ${fmt(worldCoords.wy,3)})` : ''}
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() =>setView(v => ({...v, scale:Math.min(v.scale*1.3, 2000)}))} className='flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#f0e6d0] font-mono-dm text-sm py-1 rounded-sm transition-all'>+</button>
                    <button onClick={resetView} className='flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#444] font-mono-dm text-[0.6rem] py-1 rounded-sm transition-all hover:text-[#f0e6d0]'>reset</button>
                    <button onClick={()=> setView(v => ({...v, scale:Math.max(v.scale / 1.3, 5)}))} className="flex-1 bg-[#0d0d0d] border border-[#222] hover:border-[#333] text-[#f0e6d0] font-mono-dm text-sm py-1 rounded-sm transition-all">-</button>
                </div>
            </div>
        </div>
    );
}