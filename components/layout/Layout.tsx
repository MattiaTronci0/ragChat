
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-black transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
