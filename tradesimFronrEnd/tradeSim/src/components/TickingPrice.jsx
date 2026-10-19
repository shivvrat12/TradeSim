import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '../lib/format';

// Shows a price and briefly tints it green/red when it moves up/down.
// Tabular figures keep columns aligned; standalone headline prices read better without them.
function TickingPrice({ value, tabular = true, className = '' }) {
  const previous = useRef(value);
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    const prev = Number(previous.current);
    const next = Number(value);
    if (next > prev) setDirection('up');
    else if (next < prev) setDirection('down');
    previous.current = value;
  }, [value]);

  const tint = direction === 'up' ? 'tick-up' : direction === 'down' ? 'tick-down' : '';
  return (
    // Keyed on the value so the animation restarts on every change
    <span key={`${value}-${direction}`} className={`${tabular ? 'num' : ''} rounded px-1 ${tint} ${className}`}>
      {formatPrice(value)}
    </span>
  );
}

export default TickingPrice;
