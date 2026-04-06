export default function MathInput({ value, onChange, onKeyDown, placeholder, hasError, color }) {
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