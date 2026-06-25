import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`
        bg-slate-800
        border border-slate-700
        rounded-2xl
        p-4
        hover:shadow-lg
        transition
        ${className || ''}
      `}
    >
      {children}
    </div>
  );
}
