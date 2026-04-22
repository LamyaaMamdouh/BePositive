import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/theme-context';
import { useLanguage } from '../contexts/language-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  const isRTL = language === 'ar';

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-14 h-7 bg-gray-200 dark:bg-neutral-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        className="w-5 h-5 bg-white dark:bg-neutral-900 rounded-full shadow-md flex items-center justify-center"
        initial={false}
        animate={{
          x: isDark ? (isRTL ? -24 : 24) : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-red-500" strokeWidth={2.5} />
        ) : (
          <Sun className="w-3 h-3 text-red-600" strokeWidth={2.5} />
        )}
      </motion.div>
    </motion.button>
  );
}