import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/language-context';

export function ScrollToTop() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 100 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={t('scroll.top')}
        >
          {/* Pulsing outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600 to-red-700"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Main button with heart shape effect */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Gradient overlay animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-red-500 via-pink-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Heart icon background - subtle */}
            <Heart className="absolute w-8 h-8" style={{ color: 'rgba(255, 255, 255, 0.2)', fill: 'rgba(255, 255, 255, 0.2)' }} />
            
            {/* Arrow icon */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <ChevronUp className="w-7 h-7 text-white" strokeWidth={3} />
            </motion.div>

            {/* Sparkle effect on hover */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0,
                }}
              />
              <motion.div
                className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-white rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
              <motion.div
                className="absolute top-1/2 right-1 w-1 h-1 bg-white rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
            </motion.div>
          </div>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none"
          >
            {t('scroll.top')}
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}