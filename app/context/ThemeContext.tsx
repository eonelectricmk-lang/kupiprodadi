'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ThemeContext = createContext({ dark: true, setDark: (_: boolean) => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true;

    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'light') return false;
    if (storedTheme === 'dark') return true;

    return !document.documentElement.classList.contains('light');
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }

    window.localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
