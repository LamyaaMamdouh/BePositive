import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/language-context';
import { useTheme } from '../contexts/theme-context';
import { HeaderControls } from './header-controls';

import logoDark from '../../imports/Untitled_design_(7)-3.png';
import logoLight from 'figma:asset/3f35df7cfae4b7e07dd792e186ad9730949c3216.png';

import { Menu, X } from 'lucide-react';

export function Navbar() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const sections = ['home', 'about', 'idea', 'mission', 'features', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(`#${sectionId}`);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: language === 'ar' ? 'الرئيسية' : 'Home', href: '#home' },
    { label: language === 'ar' ? 'عن الفريق' : 'About Us', href: '#about' },
    { label: language === 'ar' ? 'فكرتنا' : 'Our Idea', href: '#idea' },
    { label: language === 'ar' ? 'مهمتنا' : 'Mission', href: '#mission' },
    { label: language === 'ar' ? 'المميزات' : 'Features', href: '#features' },
    { label: language === 'ar' ? 'تواصل معنا' : 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const sectionId = href.replace('#', '');
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navbarHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    setActiveSection(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-lg shadow-lg dark:shadow-neutral-800/50'
            : 'bg-transparent'
        }`}
        style={isScrolled ? {
          backgroundColor: theme === 'dark' ? 'rgba(23, 23, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)'
        } : undefined}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-nowrap">
            
            {/* Logo & Text Section */}
            <motion.button
              onClick={() => scrollToSection('#home')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer outline-none shrink-0"
            >
              <div className="relative h-20 w-auto flex items-center justify-center shrink-0">
                <img 
                  src={logoLight} 
                  alt="Be Positive" 
                  className="h-full w-auto object-contain block dark:hidden shrink-0" 
                />
                <img
                  src={logoDark}
                  alt="Be Positive"
                  className="h-full w-auto object-contain hidden dark:block shrink-0 scale-125"
                />
              </div>

              <div className="hidden sm:block shrink-0">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight whitespace-nowrap">
                  {language === 'ar' ? (
                    <>
                      <span className="text-gray-900 dark:text-white transition-colors duration-300">كن</span>{' '}
                      <span className="text-red-600 transition-colors duration-300">إيجابياً</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-900 dark:text-white transition-colors duration-300">Be</span>{' '}
                      <span className="text-red-600 transition-colors duration-300">Positive</span>
                    </>
                  )}
                </span>
              </div>
            </motion.button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 shrink-0">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-500 font-medium transition-colors duration-200 relative group cursor-pointer outline-none"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 dark:bg-red-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}

              <HeaderControls />
            </div>

            {/* Mobile Menu Button & Controls */}
            <div className="lg:hidden flex items-center gap-3 shrink-0">
              <HeaderControls />
              
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-500 cursor-pointer outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Animated Sidebar Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            />
            
            {/* 🔴 Sidebar Panel: قللنا bottom لـ 6 عشان يدي مساحة أكبر للقائمة 🔴 */}
            <motion.div
              initial={{ x: language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? '100%' : '-100%' }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0, 0.2, 1] 
              }}
              className={`fixed top-[112px] sm:top-[128px] ${language === 'ar' ? 'right-4' : 'left-4'} bottom-6 w-72 bg-white dark:bg-neutral-900 shadow-2xl rounded-3xl z-40 lg:hidden flex flex-col overflow-hidden`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* 🔴 السحر هنا: كلاسات إخفاء السكرول بار تماماً مع الحفاظ على السكرول لو احتجناه 🔴 */}
              <div className="flex-1 px-6 py-6 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href;
                  return (
                    <motion.button
                      key={item.href}
                      onClick={() => scrollToSection(item.href)}
                      className={`block w-full ${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 rounded-xl font-medium transition-all duration-200 cursor-pointer relative group ${
                        isActive
                          ? 'text-white bg-red-600 dark:bg-red-600 shadow-lg shadow-red-500/50 dark:shadow-red-900/50'
                          : 'text-gray-700 dark:text-neutral-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:shadow-md hover:shadow-red-500/30'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span
                        className={`absolute ${language === 'ar' ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'} top-1/2 -translate-y-1/2 h-8 transition-all duration-300 ${
                          isActive
                            ? 'w-1.5 bg-white shadow-lg'
                            : 'w-0 bg-red-600 group-hover:w-1'
                        }`}
                        style={isActive ? { boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.5)' } : {}}
                      />

                      <span className="relative z-10">{item.label}</span>

                      <span
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          backgroundImage: 'linear-gradient(to right, rgba(248, 113, 113, 0.2), rgba(220, 38, 38, 0.2))'
                        }}
                      />
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Footer Note */}
              <div className="w-full py-6 px-6 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0 rounded-b-3xl">
                <p className="text-xs text-center text-gray-500 dark:text-neutral-500 font-medium">
                  {language === 'ar' ? 'منصة التبرع بالدم' : 'Blood Donation Platform'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}