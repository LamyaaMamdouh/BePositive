import { motion } from 'motion/react';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useLanguage } from '../contexts/language-context';
import { HeaderControls } from '../components/header-controls';
import logo from 'figma:asset/3f35df7cfae4b7e07dd792e186ad9730949c3216.png';
import apiClient from '../../api/apiClient';
import ENDPOINTS from '../../api/endpoints';

const API_BASE_URL = 'https://bepositive.runasp.net/api/auth';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function VerifyOTPPage() {
  const { t, language, setLanguage } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Try to get email from state, fallback to sessionStorage
  const email = location.state?.email || sessionStorage.getItem('resetEmail');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = window.setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/org/forgot-password');
    }
  }, [email, navigate]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    // Validate OTP
    if (otpCode.length !== 6) {
      return;
    }

    setStatus('loading');
    setError('');

    try {
      // Call real API to verify OTP
      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_RESET_OTP, {
        email,
        otp: otpCode,
      });

      // Check success from response.data.value.success
      if (response.status === 200 && response.data.value?.success) {
        // Store reset token in sessionStorage
        const resetToken = response.data.value.resettoken;
        sessionStorage.setItem('resetToken', resetToken);

        setStatus('success');

        // Navigate to reset password page
        setTimeout(() => {
          navigate('/org/reset-password', {
            state: {
              email,
              resetToken,
            },
          });
        }, 500);
      }
    } catch (err: any) {
      setStatus('error');
      
      // Handle specific error codes
      const statusCode = err.response?.status;
      
      if (statusCode === 400) {
        setError('Invalid or expired verification code. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }

      // Reset OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resendDisabled) return;

    setResendDisabled(true);
    setError('');

    try {
      // Call real API to resend OTP
      const response = await apiClient.post(
        `${ENDPOINTS.AUTH.RESEND_RESET_OTP}?email=${encodeURIComponent(email || '')}`
      );

      if (response.status === 200 && response.data.value?.success) {
        // Reset OTP inputs
        setOtp(['', '', '', '', '', '']);
        
        // Reset timer to 60 seconds
        setTimer(60);
        
        // Re-enable resend button after 60 seconds
        setTimeout(() => {
          setResendDisabled(false);
        }, 60000);

        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      const statusCode = err.response?.status;
      
      if (statusCode === 429) {
        setError('Too many resend attempts. Please wait.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
      
      setResendDisabled(false);
    }
  };

  const handleBack = () => {
    navigate('/org/forgot-password');
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 py-6 px-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Controls - Fixed position using conditional left/right for RTL support */}
      <HeaderControls className={`fixed top-4 z-50 ${language === 'ar' ? 'left-4' : 'right-4'}`} />

      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 dark:bg-red-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-500/10 dark:bg-red-400/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white dark:bg-neutral-900 backdrop-blur-xl py-6 px-6 sm:py-8 sm:px-8 shadow-2xl rounded-3xl border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
          
          <motion.div 
            className="text-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto h-20 w-20 bg-gradient-to-tr from-red-600 to-red-500 dark:from-red-500 dark:to-red-600 rounded-3xl flex items-center justify-center shadow-lg shadow-red-500/30 dark:shadow-red-500/50 mb-6"
            >
              <ShieldCheck className="w-10 h-10 text-white" strokeWidth={1.5} />
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
              {t('verify.title')}
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm max-w-[320px] mx-auto leading-relaxed px-2">
              {language === 'ar' ? 'أدخل رمز التحقق المكون من 6 أرقام المرسل إلى' : 'Enter the 6-digit verification code sent to'}<br/>
              <strong className="text-gray-900 dark:text-white font-semibold mt-1 inline-block break-all">{email}</strong>
            </p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6 sm:space-y-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm flex gap-2 items-start"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={status === 'loading'}
                  whileFocus={{ y: -3, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-gray-50 dark:bg-neutral-950 border-2 border-gray-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl focus:border-red-600 dark:focus:border-red-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-4 focus:ring-red-600/10 dark:focus:ring-red-500/20 focus:outline-none focus:shadow-md dark:focus:shadow-red-500/20 transition-all disabled:opacity-50 text-gray-900 dark:text-white"
                />
              ))}
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={status === 'loading' || otp.join('').length !== 6}
                className="w-full flex justify-center items-center gap-2 py-3.5 sm:py-4 px-4 border border-transparent rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 focus:ring-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('verify.submit')
                )}
              </motion.button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-800/50 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-gray-500 dark:text-neutral-400 text-sm font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                {t('verify.back')}
              </button>

              <div className="text-center sm:text-right">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0}
                  className={`text-sm font-semibold transition-colors ${
                    timer > 0 
                      ? 'text-gray-400 dark:text-neutral-600 cursor-not-allowed' 
                      : 'text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400'
                  }`}
                >
                  {timer > 0 ? (
                    language === 'ar' ? `إعادة الإرسال (${timer}ث)` : `Resend code in ${timer}s`
                  ) : (
                    t('verify.resend')
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}