
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';

import Layout from './components/layout/Layout';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import HistoryPage from './pages/HistoryPage';

const App: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ChatPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
