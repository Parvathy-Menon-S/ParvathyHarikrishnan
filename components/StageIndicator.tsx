'use client';

interface StageIndicatorProps {
  current: number;
  total: number;
  accentColor: string;
}

export function StageIndicator({ current, total, accentColor }: StageIndicatorProps) {
  return (
    <div className="absolute top-6 right-6 z-20 flex items-center gap-3" role="status" aria-label={`Stage ${current + 1} of ${total}`}>
      <span
        className="text-xs tracking-[0.2em] font-light tabular-nums"
        style={{ color: accentColor }}
      >
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="block rounded-full transition-all duration-500 ease-out"
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              backgroundColor: i === current ? accentColor : `${accentColor}50`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
