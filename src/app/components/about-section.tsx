import { motion } from 'motion/react';
import { Users, Lightbulb, Zap, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';

export function AboutSection() {
  const { t } = useLanguage();

  const strengths = [
    {
      icon: Lightbulb,
      titleKey: 'about.innovation.title',
      descKey: 'about.innovation.desc',
      gradient: 'from-[#fef2f2] to-[#fee2e2]',
    },
    {
      icon: Heart,
      titleKey: 'about.impact.title',
      descKey: 'about.impact.desc',
      gradient: 'from-[#fdf2f8] to-[#fef2f2]',
    },
    {
      icon: Zap,
      titleKey: 'about.technology.title',
      descKey: 'about.technology.desc',
      gradient: 'from-[#fee2e2] to-[#fff7ed]',
    },
    {
      icon: Users,
      titleKey: 'about.collaboration.title',
      descKey: 'about.collaboration.desc',
      gradient: 'from-[#fff7ed] to-[#fef2f2]',
    },
  ];

  return (
    <section id="about" className="py-24 bg-white dark:bg-neutral-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t('about.title')}</h2>
          <p className="text-xl text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            {t('about.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {strengths.map((strength, index) => {
            const Icon = strength.icon;
            return (
              <motion.div
                key={strength.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`bg-gradient-to-br ${strength.gradient} dark:from-neutral-900 dark:to-neutral-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent dark:border-neutral-700`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t(strength.titleKey)}</h3>
                <p className="text-gray-700 dark:text-neutral-300 leading-relaxed">{t(strength.descKey)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}