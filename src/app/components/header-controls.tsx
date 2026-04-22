import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';
import { ThemeToggle } from './theme-toggle';

interface HeaderControlsProps {
  className?: string;
}

export function HeaderControls({ className = '' }: HeaderControlsProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full hover:border-red-600 dark:hover:border-red-500 transition-all duration-300 shadow-sm cursor-pointer"
      >
        <Globe className={`w-4 h-4 text-red-600 dark:text-red-500 ${language === 'ar' ? 'mr-5' : ''}`} />
        <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
          {language === 'en' ? 'العربية' : 'English'}
        </span>
      </button>
      <ThemeToggle />
    </div>
  );
}