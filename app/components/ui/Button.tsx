import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg text-sm transition font-medium';

  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
}
