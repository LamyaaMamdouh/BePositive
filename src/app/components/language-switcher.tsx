import { motion, AnimatePresence } from 'motion/react';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/language-context';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    {
      code: 'en' as const,
      name: 'English',
      flag: '🇺🇸',
      nativeName: 'English',
    },
    {
      code: 'ar' as const,
      name: 'Arabic',
      flag: '🇪🇬',
      nativeName: 'العربية',
    },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];
  const otherLanguages = languages.filter(lang => lang.code !== language);

  return (
    <div className={`fixed top-6 z-50 transition-all duration-300 ${language === 'ar' ? 'left-6' : 'right-6'}`}>
      <motion.div
        className="relative"
        onHoverStart={() => setIsOpen(true)}
        onHoverEnd={() => setIsOpen(false)}
      >
        {/* Current Language Button */}
        <motion.button
          className={`flex items-center gap-3 shadow-xl rounded-full px-5 py-3 hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer ${
            isScrolled
              ? 'bg-white border-[#f3f4f6]'
              : 'bg-white/90 backdrop-blur-md border-white/50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Globe Icon */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center"
          >
            <Globe className="w-4 h-4 text-white" />
          </motion.div>

          {/* Flag */}
          <span className="text-2xl">{currentLanguage.flag}</span>

          {/* Language Name */}
          <span className="font-semibold text-gray-900">{currentLanguage.nativeName}</span>

          {/* Arrow Indicator */}
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#f3f4f6] min-w-[200px] ${
                language === 'ar' ? 'left-0' : 'right-0'
              }`}
            >
              {otherLanguages.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  {/* Flag */}
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {lang.flag}
                  </span>

                  {/* Language Name */}
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-gray-900">{lang.nativeName}</span>
                    <span className="text-xs text-gray-500">{lang.name}</span>
                  </div>

                  {/* Selection Indicator */}
                  <motion.div
                    className="ml-auto w-2 h-2 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600 to-red-700 -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
}