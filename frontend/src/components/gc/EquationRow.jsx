import MathInput from './MathInput';
import VariableSlider from './VariableSlider';

export default function EquationRow({ 
  eq, 
  idx, 
  hoveredEq, 
  setHoveredEq, 
  toggleVisible, 
  removeEquation, 
  updateExpr, 
  onEqKeyDown, 
  sliderValues, 
  updateSlider 
}) {
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
}