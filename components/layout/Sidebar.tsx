
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { CalculatorIcon, SparklesIcon, MessageSquareIcon, FolderKanbanIcon, HistoryIcon } from '../shared/Icons';

const navItems = [
  { to: '/', text: 'Chat', icon: MessageSquareIcon, gradient: 'from-blue-600 to-blue-800', lightGradient: 'from-blue-700 to-blue-900' },
  { to: '/documents', text: 'Documenti', icon: FolderKanbanIcon, gradient: 'from-blue-700 to-blue-900', lightGradient: 'from-blue-800 to-blue-900' },
  { to: '/history', text: 'Cronologia', icon: HistoryIcon, gradient: 'from-blue-800 to-blue-900', lightGradient: 'from-blue-900 to-blue-900' },
];

const NavItem: React.FC<typeof navItems[0] & { delay: number }> = ({ to, text, icon: Icon, gradient, lightGradient, delay }: typeof navItems[0] & { delay: number }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <li style={{ animationDelay: `${delay}ms` }} className="animate-[slideUp_0.6s_ease-out_forwards] opacity-0">
            <button
                onClick={() => navigate(to)}
                className={
                    `w-full flex items-center p-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl bg-gradient-to-br dark:${gradient} ${lightGradient} ${
                        isActive ? 'scale-105 shadow-xl ring-2 ring-white/30 dark:ring-white/50' : 'shadow-md'
                    }`
                }
            >
                <Icon className="w-6 h-6 mr-4" />
                <span>{text}</span>
            </button>
        </li>
    );
};


const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-72 lg:w-80 xl:w-72 p-6 bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-300 dark:border-slate-800 shadow-2xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="relative">
            <CalculatorIcon className="w-12 h-12 text-blue-800 dark:text-blue-100" />
            <SparklesIcon className="absolute -top-1 -right-1 w-5 h-5 text-blue-600 animate-pulse" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-100 dark:to-blue-300 bg-clip-text text-transparent">
          AI Contabile
        </h1>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-4">
          {navItems.map((item, index) => (
            <NavItem key={item.to} {...item} delay={100 * (index + 1)} />
          ))}
        </ul>
      </nav>

      <div className="mt-10">
        <div className="flex justify-center mb-4">
          <ThemeToggle />
        </div>
        <p className="text-center text-xs text-gray-600 dark:text-gray-300">
          Alimentato da AI Avanzata
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
