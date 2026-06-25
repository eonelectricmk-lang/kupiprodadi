import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`
        w-full px-4 py-3 rounded-lg
        bg-white border border-gray-300
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200
        outline-none transition
        text-gray-900
        placeholder:text-gray-500
        ${className || ''}
      `}
    />
  );
}
