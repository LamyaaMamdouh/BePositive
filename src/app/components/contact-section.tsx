import { motion } from 'motion/react';
import { Mail, Github, Linkedin, Twitter, Send } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/language-context';

export function ContactSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
    alert('Thank you for your message! We will get back to you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <section id="contact" className="relative py-24 overflow-hidden bg-gradient-to-br from-gray-900 to-black dark:from-neutral-950 dark:to-black text-white transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-5xl font-bold mb-6">{t('contact.title')}</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t('contact.description')}
            </p>

            <div className="flex flex-col items-center lg:items-start">
              <h3 className="text-2xl font-bold mb-4">{t('contact.connect')}</h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9, rotate: -5 }}
                      className="w-14 h-14 bg-gray-800 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer"
                      aria-label={social.label}
                    >
                      <Icon className="w-7 h-7" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="backdrop-blur-lg p-8 rounded-3xl shadow-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-semibold mb-2">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:border-red-500 focus:outline-none focus:ring-2 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '--tw-ring-color': 'rgba(239, 68, 68, 0.5)'
                  } as React.CSSProperties}
                  placeholder={t('contact.form.placeholder.name')}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold mb-2">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:border-red-500 focus:outline-none focus:ring-2 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '--tw-ring-color': 'rgba(239, 68, 68, 0.5)'
                  } as React.CSSProperties}
                  placeholder={t('contact.form.placeholder.email')}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-semibold mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border focus:border-red-500 focus:outline-none focus:ring-2 transition-all duration-300 resize-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '--tw-ring-color': 'rgba(239, 68, 68, 0.5)'
                  } as React.CSSProperties}
                  placeholder={t('contact.form.placeholder.message')}
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <Send className="w-5 h-5" />
                {t('contact.form.submit')}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}