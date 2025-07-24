
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { CalculatorIcon, SparklesIcon, MessageSquareIcon, FolderKanbanIcon, HistoryIcon } from '../shared/Icons';

const navItems = [
  { to: '/', text: 'Chat', icon: MessageSquareIcon, gradient: 'from-green-600 to-green-700', lightGradient: 'from-green-500 to-green-600' },
  { to: '/documents', text: 'Documenti', icon: FolderKanbanIcon, gradient: 'from-gray-600 to-gray-700', lightGradient: 'from-gray-500 to-gray-600' },
  { to: '/history', text: 'Cronologia', icon: HistoryIcon, gradient: 'from-amber-600 to-amber-700', lightGradient: 'from-amber-500 to-amber-600' },
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
                    `w-full flex items-center p-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
                        isActive 
                            ? `bg-gradient-to-br ${gradient} scale-105 shadow-xl ring-2 ring-white/30` 
                            : `bg-gradient-to-br ${lightGradient} shadow-md hover:bg-gradient-to-br ${gradient}`
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
    <aside className="hidden md:flex flex-col w-72 lg:w-80 xl:w-72 p-6 bg-white/90 backdrop-blur-xl border-r border-gray-300 shadow-2xl">
              <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <CalculatorIcon className="w-12 h-12 text-green-700" />
            <SparklesIcon className="absolute -top-1 -right-1 w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold font-professional bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
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
        <p className="text-center text-xs text-gray-600 font-classical">
          Alimentato da AI Avanzata
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
