import { motion } from 'motion/react';
import { Smartphone, Database, MapPin, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';

export function IdeaSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Smartphone,
      titleKey: 'idea.feature1.title',
      descKey: 'idea.feature1.desc',
    },
    {
      icon: Database,
      titleKey: 'idea.feature2.title',
      descKey: 'idea.feature2.desc',
    },
    {
      icon: MapPin,
      titleKey: 'idea.feature3.title',
      descKey: 'idea.feature3.desc',
    },
    {
      icon: Bell,
      titleKey: 'idea.feature4.title',
      descKey: 'idea.feature4.desc',
    },
  ];

  return (
    <section id="idea" className="py-24 bg-gradient-to-br from-red-50 via-white to-gray-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t('idea.title')}</h2>
          <p className="text-xl text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed mb-4">
            {t('idea.description')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-xl border border-transparent dark:border-neutral-800">
              <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t('idea.problem.title')}</h3>
              <p className="text-lg text-gray-700 dark:text-neutral-300 leading-relaxed">
                {t('idea.problem.desc')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 rounded-3xl shadow-xl text-white">
              <h3 className="text-3xl font-bold mb-4">{t('idea.solution.title')}</h3>
              <p className="text-lg leading-relaxed">
                {t('idea.solution.desc')}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent dark:border-neutral-800"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t(feature.titleKey)}</h4>
                    <p className="text-gray-600 dark:text-neutral-400">{t(feature.descKey)}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}