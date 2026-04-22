import { motion } from 'motion/react';
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useLanguage } from '../contexts/language-context';
import { useTheme } from '../contexts/theme-context';
import { HeaderControls } from '../components/header-controls';
import logo from 'figma:asset/3f35df7cfae4b7e07dd792e186ad9730949c3216.png';
import apiClient from '../../api/apiClient';
import ENDPOINTS from '../../api/endpoints';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function ForgotPasswordPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setError('');

    // Validate email
    if (!email) {
      setEmailError(t('forgot.invalid.email'));
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(t('forgot.invalid.email'));
      return;
    }

    setStatus('loading');

    try {
      // Call real API with email as query parameter
      const response = await apiClient.post(
        `${ENDPOINTS.AUTH.FORGOT_PASSWORD}?email=${encodeURIComponent(email)}`
      );

      // Check success from response.data.value.success
      if (response.status === 202 && response.data.value?.success) {
        // Store email in sessionStorage
        sessionStorage.setItem('resetEmail', email);
        
        // Store OTP expiration time if provided
        if (response.data.value.otpexpiresat) {
          sessionStorage.setItem('otpExpiresAt', response.data.value.otpexpiresat);
        }

        setStatus('success');
        
        // Navigate to OTP verification page after short delay
        setTimeout(() => {
          navigate('/org/verify-otp', { state: { email } });
        }, 1000);
      }
    } catch (err: any) {
      setStatus('error');
      
      // Handle specific error codes
      const statusCode = err.response?.status;
      
      if (statusCode === 400) {
        setError('Invalid email format.');
      } else if (statusCode === 429) {
        setError('Too many attempts. Please wait before trying again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Controls - Fixed position using conditional left/right for RTL support */}
      <HeaderControls className={`fixed top-4 z-50 ${language === 'ar' ? 'left-4' : 'right-4'}`} />

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-red-100 dark:bg-red-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-red-200 dark:bg-red-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-6 relative z-10"
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Link to="/" className="inline-block">
            {/* 🔴 NEW LOGO DESIGN APPLIED HERE 🔴 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mx-auto h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-md dark:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all duration-300"
            >
              <img
                src={logo}
                alt="Be Positive"
                className="h-14 w-auto object-contain"
              />
            </motion.div>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {language === 'ar' ? 'نسيت كلمة المرور' : 'Forgot Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            {t('forgot.subtitle')}
          </p>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-neutral-900 py-6 px-4 shadow-2xl rounded-2xl sm:px-8 border border-[#f3f4f6] dark:border-neutral-800 transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {status === 'success' ? (
            // Success State
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: theme === 'dark' ? 'rgba(6, 78, 59, 0.3)' : '#dcfce7' }}
              >
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('forgot.success').split('!')[0]}!
              </h3>
              <p className="text-gray-600 dark:text-neutral-400 mb-2">
                {t('forgot.success').split('!')[1]}
              </p>
              <p className="text-sm text-gray-500 dark:text-neutral-500">
                Redirecting to verification...
              </p>
            </motion.div>
          ) : (
            <>
              {status === 'error' && (
                // Error State
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-xl p-4 mb-6"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(69, 10, 10, 0.3)' : '#fef2f2',
                    borderColor: theme === 'dark' ? 'rgba(153, 27, 27, 0.5)' : '#fecaca'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-400 text-sm mb-1">Error</h4>
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                    {t('forgot.email.label')}
                  </label>
                  <motion.div 
                    className="relative"
                    whileFocus={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <Mail className="h-5 w-5 text-gray-400 dark:text-neutral-500" />
                    </div>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder={t('forgot.email.placeholder')}
                      disabled={status === 'loading'}
                      className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border ${
                        emailError ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-neutral-700 focus:ring-red-500 focus:border-red-500'
                      } rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 disabled:bg-gray-50 dark:disabled:bg-neutral-900 disabled:cursor-not-allowed`}
                      required
                    />
                  </motion.div>
                  {emailError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </motion.p>
                  )}
                </div>

                <div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 focus:ring-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-red-500/20"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      t('forgot.submit')
                    )}
                  </motion.button>
                </div>
              </form>

              <div className="mt-5 text-center">
                <Link 
                  to="/org/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white font-medium hover:underline transition-colors"
                >
                  <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  {t('forgot.back')}
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}