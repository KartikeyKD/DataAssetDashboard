import React from 'react';

interface TreeConnectionProps {
  isVisible: boolean;
  level: number;
  direction?: 'horizontal' | 'vertical';
  isLast?: boolean;
}

export const TreeConnection: React.FC<TreeConnectionProps> = ({ 
  isVisible, 
  level, 
  direction = 'horizontal',
  isLast = false 
}) => {
  if (!isVisible) return null;

  if (direction === 'horizontal') {
    return (
      <div className="flex items-center">
        <svg width="60" height="20" className="overflow-visible">
          <path
            d="M 0 10 Q 15 10 30 10 Q 45 10 60 10"
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth="2"
            fill="none"
            className="transition-all duration-300"
          />
          <circle
            cx="60"
            cy="10"
            r="3"
            fill="hsl(var(--primary) / 0.6)"
            className="transition-all duration-300"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
        <svg width="20" height="40" className="overflow-visible">
          <path
            d="M 10 0 Q 10 10 10 20 Q 10 30 10 40"
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            className="transition-all duration-300"
          />
          <circle
            cx="10"
            cy="40"
            r="4"
            fill="#3b82f6"
            className="transition-all duration-300"
          />
        </svg>
    </div>
  );
};
