import { useEffect, useRef, useState } from 'react';

interface ScoreDisplayProps {
  score: number;
  label?: string;
  className?: string;
}

export default function ScoreDisplay({ score, label = 'Score', className = '' }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score === prevScore.current) return;

    // Animate score counting up/down
    const diff = score - prevScore.current;
    const steps = Math.min(Math.abs(diff), 20);
    const stepSize = diff / steps;
    let current = prevScore.current;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += stepSize;
      setDisplayScore(Math.round(current));
      if (step >= steps) {
        clearInterval(interval);
        setDisplayScore(score);
        prevScore.current = score;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider font-[var(--font-body)]">
        {label}
      </span>
      <span className="text-2xl font-extrabold text-[var(--color-primary)] font-[var(--font-heading)] tabular-nums">
        {displayScore.toLocaleString()}
      </span>
    </div>
  );
}
