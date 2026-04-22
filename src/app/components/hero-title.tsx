import { useLanguage } from '../contexts/language-context';

export function HeroTitle() {
  const { language } = useLanguage();

  if (language === 'ar') {
    return (
      <span className="text-6xl font-bold">
        <span className="text-gray-900 dark:text-white">كن</span>{' '}
        <span className="text-red-600 dark:text-red-500">إيجابياً</span>
      </span>
    );
  }

  return (
    <span className="text-6xl font-bold">
      <span className="text-gray-900 dark:text-white">Be</span>{' '}
      <span className="text-red-600 dark:text-red-500">Positive</span>
    </span>
  );
}