import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useLanguage } from '../contexts/language-context';
import { useTheme } from '../contexts/theme-context';
import { HeaderControls } from '../components/header-controls';
import logo from 'figma:asset/3f35df7cfae4b7e07dd792e186ad9730949c3216.png';
import apiClient from '../../api/apiClient';
import ENDPOINTS from '../../api/endpoints';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function ResetPasswordPage() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || sessionStorage.getItem('resetEmail');
  const resetToken = location.state?.resetToken || sessionStorage.getItem('resetToken');

  useEffect(() => {
    if (!email || !resetToken) {
      navigate('/org/forgot-password');
    }
  }, [email, resetToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('reset.password.mismatch'));
      return;
    }

    setStatus('loading');

    try {
      // Call real API with lowercase field names
      const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
        token: resetToken,  // lowercase 'token' not 'resetToken'
        newpassword: newPassword,  // lowercase 'newpassword' not 'newPassword'
      });

      // Check success from response.data.value.success
      if (response.status === 200 && response.data.value?.success) {
        setStatus('success');

        // Clear sessionStorage
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('otpExpiresAt');

        // Navigate to login after 2 seconds
        setTimeout(() => {
          navigate('/org/login');
        }, 2000);
      }
    } catch (err: any) {
      setStatus('error');
      
      // Handle specific error codes
      const statusCode = err.response?.status;
      
      if (statusCode === 400) {
        // Try to get error message from response
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.value?.message ||
                           'Invalid or expired reset link. Please start over.';
        setError(errorMessage);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  if (!email || !resetToken) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-50 dark:bg-neutral-950 px-4 relative transition-colors duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🔴 Controls: Absolute in mobile to scroll away, Fixed in desktop 🔴 */}
      <div className={`absolute sm:fixed top-6 z-50 ${language === 'ar' ? 'left-6' : 'right-6'} transition-all`}>
        <HeaderControls className="scale-90 sm:scale-100" />
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-72 h-72 sm:w-96 sm:h-96 bg-red-100 dark:bg-red-500/10 rounded-full filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 sm:w-96 sm:h-96 bg-red-200 dark:bg-red-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      </div>

      {/* 🔴 Layout: Flex behavior to prevent cutting content on any screen 🔴 */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 relative z-10 py-20 sm:min-h-screen sm:flex sm:flex-col sm:justify-center"
      >
        <div className="w-full space-y-8">
          {/* Logo Section */}
          <div className="text-center">
            <Link to="/" className="inline-block group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-full flex items-center justify-center shadow-lg dark:shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-gray-50 dark:border-neutral-800"
              >
                <img src={logo} alt="Be Positive" className="h-12 sm:h-14 w-auto object-contain" />
              </motion.div>
            </Link>
            <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t('reset.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
              {t('reset.subtitle')}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-neutral-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-gray-100 dark:border-neutral-800 transition-colors">
            {status === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="dark:text-white font-bold">{t('reset.success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-xs flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="space-y-5">
                  {[
                    { id: 'new', label: t('reset.password.label'), val: newPassword, set: setNewPassword, show: showNewPassword, setShow: setShowNewPassword },
                    { id: 'confirm', label: t('reset.confirm.label'), val: confirmPassword, set: setConfirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword }
                  ].map((f) => (
                    <div key={f.id} className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-neutral-300 ml-1">{f.label}</label>
                      <div className="relative">
                        <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-3.5 h-5 w-5 text-gray-400`} />
                        <input
                          type={f.show ? 'text' : 'password'}
                          value={f.val}
                          onChange={(e) => f.set(e.target.value)}
                          // 🔴 Placeholder added as requested 🔴
                          placeholder="••••••••"
                          className={`w-full ${language === 'ar' ? 'pr-10 pl-12' : 'pl-10 pr-12'} py-3 bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all`}
                          required
                        />
                        <button type="button" onClick={() => f.setShow(!f.show)} className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-3.5 text-gray-400`}>
                          {f.show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 dark:bg-neutral-950/50 p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {[
                      { l: '8+ Characters', m: newPassword.length >= 8 },
                      { l: 'Uppercase', m: /[A-Z]/.test(newPassword) },
                      { l: 'Number', m: /\d/.test(newPassword) },
                      { l: 'Special Symbol', m: /[@$!%*?&]/.test(newPassword) }
                    ].map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${r.m ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={r.m ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500'}>{r.l}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                  {status === 'loading' ? <Loader2 className="animate-spin mx-auto" /> : t('reset.submit')}
                </button>

                <div className="text-center">
                  <Link to="/org/login" className="text-sm text-gray-500 hover:text-red-600 flex items-center justify-center gap-2 transition-colors">
                    <Lock size={14} /> {t('reset.back')}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}