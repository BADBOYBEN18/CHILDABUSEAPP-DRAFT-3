import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Shield, Briefcase, UserRound, FileText, Bell, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Briefcase size={20} /> },
    { name: 'Cases', path: '/cases', icon: <FileText size={20} /> },
    { name: 'Team', path: '/team', icon: <UserRound size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 transition-opacity bg-neutral-800 bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-500" />
              <span className="text-lg font-semibold text-neutral-900">ChildSafe</span>
            </div>
            <button 
              className="lg:hidden text-neutral-500 hover:text-neutral-700"
              onClick={closeSidebar}
            >
              <X size={24} />
            </button>
          </div>

          {/* Sidebar content */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-neutral-100 hover:text-primary-600 transition-colors"
                onClick={() => {
                  navigate(item.path);
                  closeSidebar();
                }}
              >
                <span className="mr-3 text-neutral-500">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-700 truncate">{user?.name}</p>
                <p className="text-xs font-medium text-neutral-500 truncate">{user?.role}</p>
              </div>
              <button 
                className="ml-auto text-neutral-400 hover:text-error-500 transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="z-10 py-4 bg-white shadow-sm lg:shadow-none border-b border-neutral-200">
          <div className="px-4 flex items-center justify-between">
            <button
              className="lg:hidden text-neutral-500 focus:outline-none"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;