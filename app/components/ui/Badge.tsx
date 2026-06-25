import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={`
        text-xs px-2 py-1 rounded-full
        bg-slate-700 text-slate-200
        font-medium
        ${className || ''}
      `}
    >
      {children}
    </span>
  );
}
