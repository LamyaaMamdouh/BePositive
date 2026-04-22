import { motion } from 'motion/react';
import { useLanguage } from '../contexts/language-context';
import { LayoutDashboard, Droplet, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';

export function NotFoundPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    navigate('/org/dashboard');
  };

  // Blood drop animation
  const bloodDrops = [
    { left: '10%', delay: 0, duration: 3 },
    { left: '25%', delay: 0.5, duration: 3.5 },
    { left: '50%', delay: 1, duration: 4 },
    { left: '75%', delay: 0.3, duration: 3.2 },
    { left: '90%', delay: 0.8, duration: 3.8 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 relative overflow-hidden">
      {/* Animated background blood drops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bloodDrops.map((drop, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{ left: drop.left, top: '-50px' }}
            animate={{
              y: ['0vh', '110vh'],
            }}
            transition={{
              duration: drop.duration,
              repeat: Infinity,
              delay: drop.delay,
              ease: 'linear',
            }}
          >
            <Droplet className="w-8 h-8 text-red-200 fill-red-100" />
          </motion.div>
        ))}
      </div>

      {/* Floating background elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-40"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* 404 with blood drop */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="relative inline-block">
            <motion.h1
              className="text-[180px] md:text-[240px] font-bold leading-none text-gray-900"
              animate={{
                textShadow: [
                  '0 0 20px rgba(220, 38, 38, 0)',
                  '0 0 30px rgba(220, 38, 38, 0.3)',
                  '0 0 20px rgba(220, 38, 38, 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              4
              <span className="relative inline-block">
                <span className="text-red-600">0</span>
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Droplet className="w-20 h-20 md:w-28 md:h-28 text-red-600 fill-red-600 opacity-90" />
                </motion.div>
              </span>
              4
            </motion.h1>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
        >
          {t('notfound.subtitle')}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          {t('notfound.description')}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            onClick={handleGoDashboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3 cursor-pointer"
          >
            <LayoutDashboard className="w-5 h-5" />
            Return to Dashboard
          </motion.button>
        </motion.div>

        {/* Decorative hearts */}
        <div className="mt-16 flex justify-center gap-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            >
              <Heart className="w-8 h-8 text-red-400 fill-red-400 opacity-60" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
