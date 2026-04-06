export default function VariableSlider({ variable, value, onChange, color}) {
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