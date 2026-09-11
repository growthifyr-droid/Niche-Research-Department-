/**
 * Niche Research Department - Application Shell
 * Desktop foundation for an agentic AI niche research system
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { UpdaterProvider } from './context/UpdaterContext';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { UpdateBanner } from './components/updater/UpdateBanner';
import { ToastContainer } from './components/common/ToastContainer';

import { DashboardPage } from './pages/DashboardPage';
import { NewResearchPage } from './pages/NewResearchPage';
import { NicheModulePage } from './pages/NicheModulePage';
import { ReportsPage } from './pages/ReportsPage';
import { ConsultantChatPage } from './pages/ConsultantChatPage';
import { SchedulerPage } from './pages/SchedulerPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract page ID from hash router path (e.g. /settings -> settings)
  const getPageFromPath = (pathname: string): PageId => {
    const cleaned = pathname.replace(/^\//, '') as PageId;
    const validPages: PageId[] = [
      'dashboard',
      'new-research',
      'niche-module',
      'reports',
      'consultant-chat',
      'scheduler',
      'settings'
    ];
    return validPages.includes(cleaned) ? cleaned : 'dashboard';
  };

  const [activePage, setActivePage] = useState<PageId>(() => getPageFromPath(location.pathname));

  // Sync state when location.pathname updates (e.g. browser back/forward or hash change)
  useEffect(() => {
    const pageFromPath = getPageFromPath(location.pathname);
    if (pageFromPath !== activePage) {
      setActivePage(pageFromPath);
    }
  }, [location.pathname]);

  // Navigate function that keeps hash router in sync
  const handlePageSelect = (page: PageId) => {
    setActivePage(page);
    navigate(`/${page}`);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handlePageSelect} />;
      case 'new-research':
        return <NewResearchPage />;
      case 'niche-module':
        return <NicheModulePage />;
      case 'reports':
        return <ReportsPage />;
      case 'consultant-chat':
        return <ConsultantChatPage />;
      case 'scheduler':
        return <SchedulerPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handlePageSelect} />;
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <UpdaterProvider>
          <div
            id="app-container"
            className="flex flex-col h-screen w-screen overflow-hidden select-none bg-[var(--bg-app)] text-[var(--text-main)]"
          >
            {/* Professional Custom Title Bar */}
            <TitleBar onNavigateToSettings={() => handlePageSelect('settings')} />

            {/* Main Application Layout (Sidebar + Content Stage) */}
            <div className="flex-1 flex overflow-hidden">
              <Sidebar activePage={activePage} onSelectPage={handlePageSelect} />

              <main
                id="main-stage"
                className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)] relative"
              >
                {/* Persistent In-App Update Alert Banner (when available) */}
                <UpdateBanner />

                {/* Scrollable View Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  {renderActivePage()}
                </div>
              </main>
            </div>

            {/* Global Floating Toast Container */}
            <ToastContainer />
          </div>
        </UpdaterProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
