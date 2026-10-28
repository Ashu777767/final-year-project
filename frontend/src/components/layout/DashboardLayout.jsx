import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { NAV_ITEMS } from '../../utils/constants';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Find title based on current path
  const currentNav = NAV_ITEMS?.find(item => item.path === location.pathname);
  const title = currentNav ? currentNav.label : 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 md:ml-16 lg:ml-64 transition-all duration-300">
        <Navbar 
          title={title} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
