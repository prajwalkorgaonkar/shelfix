import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useLibrary } from '../contexts/LibraryContext';
import { 
  BookOpen, Home, Users, Book, LogOut, Menu, X, Sun, Moon, 
  Bell, ChevronDown, ChevronLeft, ChevronRight, Settings, Calendar, History
} from 'lucide-react';

const SidebarItem = ({ item, isActive, isCollapsed, onClick }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
      }`}
      title={isCollapsed ? item.name : undefined}
    >
      {/* Active Indicator Line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md transition-all duration-300" />
      )}
      
      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
      
      {!isCollapsed && (
        <span className="truncate transition-opacity duration-300 opacity-100">
          {item.name}
        </span>
      )}
    </Link>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Close dropdowns on outside click (simplified for brevity)
  useEffect(() => {
    const closeDropdown = () => setUserMenuOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const { profile } = useUser();
  const { triggerToast } = useLibrary();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setUserMenuOpen(false);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    triggerToast('Logged Out Successfully');
  };

  const mainNav = [
    { name: 'Dashboard', path: '/', icon: Home, roles: ['Admin', 'Student'] },
    { name: 'Books', path: '/books', icon: Book, roles: ['Admin', 'Student'] },
  ];
  
  const accountNav = [
    { name: 'My Profile', path: '/profile', icon: BookOpen, roles: ['Student'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['Admin'] },
  ];

  const systemNav = [
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin', 'Student'] },
  ];

  const filterNav = (items) => items.filter(item => item.roles.includes(user?.role || 'Student'));

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const rawName = path.split('/')[1];
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-darkBg overflow-hidden transition-colors duration-300 w-full relative">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white dark:bg-darkCard border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col shrink-0
        ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-3 text-primary overflow-hidden">
            <BookOpen className="w-8 h-8 flex-shrink-0" />
            {!isCollapsed && <span className="text-xl font-bold whitespace-nowrap">Shelfix</span>}
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-6 px-3 flex flex-col gap-6">
          
          {/* Main Section */}
          <div className="space-y-1">
            {!isCollapsed && <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Main</p>}
            {filterNav(mainNav).map((item) => (
              <SidebarItem 
                key={item.name} 
                item={item} 
                isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')) || (item.path === '/books' && location.pathname.startsWith('/books'))}
                isCollapsed={isCollapsed}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>

          {/* Account Section */}
          <div className="space-y-1">
            {!isCollapsed && <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Account</p>}
            {filterNav(accountNav).map((item) => (
              <SidebarItem 
                key={item.name} 
                item={item} 
                isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')) || (item.path === '/books' && location.pathname.startsWith('/books'))}
                isCollapsed={isCollapsed}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>

          {/* System Section */}
          <div className="space-y-1 mt-auto">
            {!isCollapsed && <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">System</p>}
            {filterNav(systemNav).map((item) => (
              <SidebarItem 
                key={item.name} 
                item={item} 
                isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')) || (item.path === '/books' && location.pathname.startsWith('/books'))}
                isCollapsed={isCollapsed}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group"
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Collapse Toggle (Desktop Only) */}
        <div className="hidden lg:flex p-4 border-t border-gray-200 dark:border-gray-800 justify-end">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 transition-colors duration-300">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">{getBreadcrumbs()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Date/Time */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <Calendar className="w-4 h-4" />
              {currentDate}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1"></div>

            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-darkCard"></span>
            </button>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400 overflow-hidden group"
            >
              <div className="relative w-5 h-5">
                <Sun className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`} />
                <Moon className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`} />
              </div>
            </button>

            {/* User Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 md:gap-3 p-1 pr-2 rounded-full border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300"
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs leading-none">{user?.name || user?.username}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight mt-0.5">{user?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 hidden md:block transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate font-mono">{user?.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.department || user?.branch || 'System Admin'}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <BookOpen className="w-4 h-4 text-gray-400" /> My Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" /> Settings
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <History className="w-4 h-4 text-gray-400" /> Borrow History
                  </Link>
                  <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-400" />} 
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                  <button 
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50/30 dark:bg-darkBg/30 scroll-smooth">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 w-full animate-in fade-in duration-500">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsLogoutModalOpen(false)} />
          <div className="bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sign Out</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to logout? You will need to sign in again to access the library.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;
