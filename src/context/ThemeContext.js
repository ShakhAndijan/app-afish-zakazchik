import React, { createContext, useContext, useState } from 'react';

const dark = {
  isDark: true,
  bg: '#0c1828',
  cover: '#11243c',
  card: '#142639',
  inputBg: '#0a1626',
  border: 'rgba(255,255,255,0.07)',
  navBg: 'rgba(12,22,36,0.96)',
  text: '#ffffff',
  subtext: 'rgba(255,255,255,0.92)',
  muted: '#8da0ba',
  faint: '#6c7f9a',
  rowIconBg: 'rgba(255,255,255,0.05)',
  orange: '#e87a45',
  orangeD: '#d8602a',
  gold: '#f5c451',
  green: '#2fa37a',
  blue: '#3f7fd4',
  violet: '#9b6cd1',
  red: '#e0473a',
};

const light = {
  isDark: false,
  bg: '#eef2f7',
  cover: '#dce8f5',
  card: '#ffffff',
  inputBg: '#e8eef6',
  border: 'rgba(0,0,0,0.08)',
  navBg: 'rgba(238,242,247,0.97)',
  text: '#1a2535',
  subtext: 'rgba(26,37,53,0.85)',
  muted: '#546880',
  faint: '#7a90a8',
  rowIconBg: 'rgba(0,0,0,0.04)',
  orange: '#e87a45',
  orangeD: '#d8602a',
  gold: '#c9930a',
  green: '#2fa37a',
  blue: '#3f7fd4',
  violet: '#9b6cd1',
  red: '#e0473a',
};

const ThemeContext = createContext({ theme: dark, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  return (
    <ThemeContext.Provider value={{ theme: isDark ? dark : light, toggleTheme: () => setIsDark(v => !v) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
