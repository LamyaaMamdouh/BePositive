import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LanguageProvider } from './contexts/language-context';
import { ThemeProvider } from './contexts/theme-context';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </ThemeProvider>
  );
}
