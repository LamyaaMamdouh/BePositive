import { Heart } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-16 border-t border-gray-800 dark:border-neutral-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        {/* App Download Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-6">{language === 'ar' ? 'حمّل التطبيق' : 'Download Our App'}</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Google Play Button */}
            <a
              href="#"
              className="flex items-center gap-3 bg-black hover:bg-gray-800 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left">
                <div className="text-xs">{language === 'ar' ? 'متوفر على' : 'GET IT ON'}</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </a>

            {/* Apple Store Button */}
            <a
              href="#"
              className="flex items-center gap-3 bg-black hover:bg-gray-800 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left">
                <div className="text-xs">{language === 'ar' ? 'حمّل من' : 'Download on the'}</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-8"></div>

        {/* Bottom Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span className="text-2xl font-bold">{t('hero.title')}</span>
          </div>
          <p className="text-gray-400 mb-4">
            {t('footer.tagline')}
          </p>
          <p className="text-sm text-gray-500">
            © 2026 {t('hero.title')}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t('footer.made')} <span className="text-red-500">❤️</span> {t('footer.team')}
          </p>
        </div>
      </div>
    </footer>
  );
}