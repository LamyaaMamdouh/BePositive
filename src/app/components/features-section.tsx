import { motion } from 'motion/react';
import { Shield, Clock, Users, Activity, MessageCircle, Award } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      titleKey: 'features.secure.title',
      descKey: 'features.secure.desc',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Clock,
      titleKey: 'features.instant.title',
      descKey: 'features.instant.desc',
      color: 'from-red-600 to-red-700',
    },
    {
      icon: Users,
      titleKey: 'features.community.title',
      descKey: 'features.community.desc',
      color: 'from-red-700 to-red-800',
    },
    {
      icon: Activity,
      titleKey: 'features.track.title',
      descKey: 'features.track.desc',
      color: 'from-pink-600 to-red-600',
    },
    {
      icon: MessageCircle,
      titleKey: 'features.communication.title',
      descKey: 'features.communication.desc',
      color: 'from-red-600 to-pink-600',
    },
    {
      icon: Award,
      titleKey: 'features.recognition.title',
      descKey: 'features.recognition.desc',
      color: 'from-red-500 to-red-700',
    },
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t('features.title')}</h2>
          <p className="text-xl text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            {t('features.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="group relative bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-transparent dark:border-neutral-800"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t(feature.titleKey)}</h3>
                  <p className="text-gray-600 dark:text-neutral-300 leading-relaxed">{t(feature.descKey)}</p>
                </div>

                {/* Decorative corner element */}
                <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${feature.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}