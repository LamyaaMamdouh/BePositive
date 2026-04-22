import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  Users,
  Droplets,
  MessageCircle,
  BarChart3,
  Building2,
  Settings,
  X,
  LogOut,
  Menu,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useLanguage } from '../contexts/language-context';
import { useTheme } from '../contexts/theme-context';
import { HeaderControls } from './header-controls';
import { TOKEN_KEYS } from '../../api/api.config';
import logoLight from 'figma:asset/3f35df7cfae4b7e07dd792e186ad9730949c3216.png';
import * as Tooltip from '@radix-ui/react-tooltip';

export function DashboardLayout() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.setItem('rememberMe', 'false');
    navigate('/org/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: language === 'ar' ? 'لوحة القيادة' : 'Dashboard', path: '/org/dashboard' },
    { icon: PlusCircle, label: language === 'ar' ? 'إنشاء طلب' : 'Create Request', path: '/org/dashboard/requests/create' },
    { icon: ListTodo, label: language === 'ar' ? 'الطلبات النشطة' : 'Active Requests', path: '/org/dashboard/requests/active' },
    { icon: Users, label: language === 'ar' ? 'مراقبة المتبرعين' : 'Donor Monitoring', path: '/org/dashboard/donors' },
    { icon: Droplets, label: language === 'ar' ? 'مخزون الدم' : 'Blood Inventory', path: '/org/dashboard/inventory-management' },
    { icon: MessageCircle, label: language === 'ar' ? 'الرسائل' : 'Messages', path: '/org/dashboard/messaging' },
    { icon: BarChart3, label: language === 'ar' ? 'التحليلات' : 'Analytics', path: '/org/dashboard/analytics' },
    { icon: Building2, label: language === 'ar' ? 'ملف المستشفى' : 'Hospital Profile', path: '/org/dashboard/profile' },
    { icon: Settings, label: language === 'ar' ? 'الإعدادات' : 'Settings', path: '/org/dashboard/settings' },
  ];

  const isRtl = language === 'ar';

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="h-[100dvh] bg-gray-50 dark:bg-[#121212] flex overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
        
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        <aside
          className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} lg:relative h-full bg-white dark:bg-neutral-950 border-${isRtl ? 'l' : 'r'} border-gray-200 dark:border-neutral-800 z-50 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-[80px] w-[288px]' : 'w-[288px]'}`}
        >
          {/* Sidebar Header */}
          <div className={`p-5 flex items-center justify-between lg:justify-normal ${sidebarCollapsed ? 'lg:justify-center' : 'gap-3'} mb-2`}>
            {/* 🔴 تم تعديل الرابط ليوجه للـ Home الرئيسية (/) بدلاً من الـ Dashboard 🔴 */}
            <Link to="/" className="flex items-center gap-3 group outline-none">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-[0_0_12px_rgba(220,38,38,0.25)] flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <img src={logoLight} alt="Be Positive" className="h-6 w-auto object-contain" />
              </div>
              <span className={`text-xl font-bold truncate flex gap-1.5 transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                {isRtl ? (
                  <><span className="text-red-600 dark:text-white">كن</span><span className="text-gray-900 dark:text-red-500">إيجابياً</span></>
                ) : (
                  <><span className="text-red-600 dark:text-white">Be</span><span className="text-gray-900 dark:text-red-500">Positive</span></>
                )}
              </span>
            </Link>
            
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2 
            [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800 
            hover:[&::-webkit-scrollbar-thumb]:bg-red-200 dark:hover:[&::-webkit-scrollbar-thumb]:bg-red-900/30
            [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const NavButton = (
                <Link key={item.path} to={item.path}>
                  <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : ''} gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 font-medium' : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white'
                  }`}>
                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-red-600 dark:text-red-500' : ''}`} />
                    <span className={`whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden lg:w-0 lg:opacity-0' : 'block'}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
              
              return sidebarCollapsed ? (
                <Tooltip.Root key={item.path}>
                  <Tooltip.Trigger asChild>{NavButton}</Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content 
                      side={isRtl ? 'left' : 'right'} 
                      sideOffset={10} 
                      className="hidden lg:block bg-white dark:bg-neutral-800 text-gray-800 dark:text-white border border-gray-100 dark:border-neutral-700 px-3 py-2 rounded-lg text-sm shadow-xl z-[60] font-medium"
                    >
                      {item.label}
                      <Tooltip.Arrow className="fill-white dark:fill-neutral-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ) : NavButton;
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden lg:flex w-full items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900 rounded-xl transition-all duration-200 group mb-1`}
            >
              {sidebarCollapsed ? (
                isRtl ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />
              ) : (
                <>
                  {isRtl ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
                  <span className="text-sm font-medium">{isRtl ? 'تصغير' : 'Collapse'}</span>
                </>
              )}
            </button>

            <button 
              onClick={handleLogout} 
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center' : ''} gap-3 px-4 py-2.5 text-gray-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 rounded-xl transition-all duration-200 group`}
            >
              <LogOut className={`w-5 h-5 flex-shrink-0 transition-transform ${isRtl ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
              <span className={`font-medium transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                {isRtl ? 'تسجيل الخروج' : 'Logout'}
              </span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-gray-200 dark:border-neutral-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="hidden lg:block text-lg sm:text-xl font-semibold text-gray-800 dark:text-white truncate">
                {menuItems.find(item => item.path === location.pathname)?.label || (isRtl ? 'لوحة القيادة' : 'Dashboard')}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <HeaderControls />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#121212] p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8
            [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800 
            hover:[&::-webkit-scrollbar-thumb]:bg-red-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-red-900/50 
            [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
            <motion.div 
              key={location.pathname} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.3 }} 
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </Tooltip.Provider>
  );
}