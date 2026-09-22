import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface ThemeSwitcherProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ showLabel = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 border ${
        theme === 'dark'
          ? 'bg-slate-900/90 text-amber-400 hover:text-amber-300 border-white/10 hover:border-amber-500/40 hover:bg-slate-800'
          : 'bg-white text-amber-600 hover:text-amber-500 border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/50 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-semibold select-none">
          {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        </span>
      )}
    </button>
  );
};
