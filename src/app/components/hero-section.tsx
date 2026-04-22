import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/language-context';
import { useTheme } from '../contexts/theme-context';
import { HeroTitle } from './hero-title';
import { TOKEN_KEYS } from '../../api/api.config';

export function HeroSection() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const scrollToNext = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  // ─── Handle Login button click with "Remember Me" & Session logic ───
  const handleLoginClick = () => {
    // 1. Check if "Remember Me" is true in localStorage
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    if (rememberMe) {
      // If true, check for token in localStorage
      const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      if (token) {
        // Auto-login: bypass login screen and go directly to dashboard
        navigate('/org/dashboard');
        return;
      }
    } else {
      // 2. If Remember Me is false, check if they are currently logged in right now (sessionStorage)
      const sessionToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      if (sessionToken) {
        navigate('/org/dashboard');
        return;
      }
    }

    // 3. Otherwise: go to standard login page to enter credentials
    navigate('/org/login');
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 pt-20 transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-50 dark:opacity-40"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2'
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-40 dark:opacity-30"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(220, 38, 38, 0.1)' : '#fecaca'
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-25"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(248, 113, 113, 0.08)' : '#f3f4f6'
          }}
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Dark mode exclusive gradient overlays */}
        {theme === 'dark' && (
          <>
            <motion.div
              className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full filter blur-3xl"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.08), transparent)'
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full filter blur-3xl"
              style={{
                backgroundImage: 'linear-gradient(to top right, rgba(220, 38, 38, 0.08), transparent)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <HeroTitle />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-[22px] text-gray-700 dark:text-neutral-200 mb-4 font-medium"
        >
          {t('hero.tagline')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg text-gray-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          {t('hero.description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-4 flex flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleLoginClick}
            className="px-8 py-3 bg-white dark:bg-neutral-800 text-red-600 dark:text-red-500 border-2 border-red-300 rounded-full font-semibold hover:bg-gradient-to-r hover:from-red-50 hover:to-white dark:hover:from-neutral-700 dark:hover:to-neutral-800 hover:border-red-400 dark:hover:border-red-500 transition-all duration-300 shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transform"
            style={{
              borderColor: theme === 'dark' ? 'rgba(220, 38, 38, 0.5)' : undefined,
              boxShadow: theme === 'dark' ? '0 10px 15px -3px rgba(239, 68, 68, 0.2)' : undefined
            }}
          >
            {t('hero.login')}
          </button>
          <button
            onClick={() => navigate('/org/register')}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-full font-semibold hover:from-red-700 hover:to-red-800 hover:border-red-700 transition-all duration-300 shadow-lg cursor-pointer hover:shadow-2xl hover:scale-105 transform"
          >
            {t('hero.register')}
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={scrollToNext}
      >
        <ChevronDown className="w-8 h-8 text-red-600" />
      </motion.div>
    </section>
  );
}