import { motion } from 'motion/react';
import { Target, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';

export function MissionSection() {
  const { t } = useLanguage();

  return (
    <section id="mission" className="py-16 md:py-24 bg-white dark:bg-neutral-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl md:rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
            <div className="relative bg-white dark:bg-neutral-900 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl border border-transparent dark:border-neutral-800">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-gray-900 dark:text-white">{t('mission.title')}</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-300 leading-relaxed">
                {t('mission.description')}
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl md:rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
            <div className="relative bg-gradient-to-br from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl text-white">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white dark:bg-neutral-900 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                <Eye className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-600 dark:text-red-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">{t('mission.vision.title')}</h2>
              <p className="text-base sm:text-lg leading-relaxed opacity-95">
                {t('mission.vision.description')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}