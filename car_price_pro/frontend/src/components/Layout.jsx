import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

function Layout({ onLogout }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-primary font-inter transition-colors duration-300 overflow-x-hidden">
      {/* Desktop Sidebar - Persistent on Large Screens */}
      <div className="hidden lg:flex w-72 shrink-0 border-r border-border">
        <Sidebar onLogout={onLogout} />
      </div>
      
      {/* Main Content Area - flex-1 with min-w-0 prevents layout compression */}
      <main className="flex-1 min-w-0 flex flex-col relative">
        {/* Adaptive padding and max-width shell */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 
                        pb-24 lg:pb-10 pt-4 md:pt-8 transition-all">
          <Outlet />
        </div>
      </main>

      {/* Mobile-Only Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

export default Layout;
