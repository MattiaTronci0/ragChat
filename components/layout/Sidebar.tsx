
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { CalculatorIcon, SparklesIcon, MessageSquareIcon, FolderKanbanIcon, HistoryIcon } from '../shared/Icons';

const navItems = [
  { to: '/', text: 'Chat', icon: MessageSquareIcon, gradient: 'from-blue-500 to-purple-600' },
  { to: '/documents', text: 'Documents', icon: FolderKanbanIcon, gradient: 'from-emerald-500 to-teal-600' },
  { to: '/history', text: 'History', icon: HistoryIcon, gradient: 'from-orange-500 to-red-600' },
];

const NavItem: React.FC<typeof navItems[0] & { delay: number }> = ({ to, text, icon: Icon, gradient, delay }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <li style={{ animationDelay: `${delay}ms` }} className="animate-[slideUp_0.6s_ease-out_forwards] opacity-0">
            <button
                onClick={() => navigate(to)}
                className={
                    `w-full flex items-center p-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${gradient} ${
                        isActive ? 'scale-105 shadow-xl ring-2 ring-white/50' : 'shadow-md'
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
    <aside className="hidden md:flex flex-col w-72 lg:w-80 xl:w-72 p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 shadow-2xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="relative">
            <CalculatorIcon className="w-12 h-12 text-slate-800 dark:text-white" />
            <SparklesIcon className="absolute -top-1 -right-1 w-5 h-5 text-indigo-500 animate-pulse" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          Accountant AI
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
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Powered by Advanced AI
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
