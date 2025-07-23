
import React from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { SunIcon, MoonIcon } from '../shared/Icons';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle between light and dark mode</span>
      <div
        className={`absolute top-1 left-1 bg-white dark:bg-gray-800 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        <SunIcon className={`absolute w-4 h-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-500 transition-opacity duration-300 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
        <MoonIcon className={`absolute w-4 h-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </button>
  );
};

export default ThemeToggle;
