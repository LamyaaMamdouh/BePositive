import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  ChevronDown,
  Search,
  Mail,
} from "lucide-react";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "../contexts/language-context";
import { useTheme } from "../contexts/theme-context";
import { HeaderControls } from "../components/header-controls";
import logo from "figma:asset/3f35df7cfae4b7e07dd792e186ad9730949c3216.png";
import apiClient from "../../api/apiClient";
import ENDPOINTS from "../../api/endpoints";

// ─── Types ────────────────────────────────────────────────────

interface Governorate {
  id: string;
  nameen: string;
  namear: string;
}

interface City {
  id: string;
  nameen: string;
  namear: string;
  governorate?: {
    id: string;
    nameen: string;
    namear: string;
  };
}

interface FormData {
  hospitalName: string;
  licenseNumber: string;
  email: string;
  phoneNumber: string;
  cityId: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  email?: string;
  licenseNumber?: string;
  general?: string;
}

// ─── Component ────────────────────────────────────────────────

export function OrgRegisterPage() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  // ── OTP state ────────────────────────────────────────────────
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // ── Form state ───────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    hospitalName: "",
    licenseNumber: "",
    email: "",
    phoneNumber: "",
    cityId: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // ── Governorates ─────────────────────────────────────────────
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [governoratesLoading, setGovernoratesLoading] = useState(false);
  const [selectedGovernorateId, setSelectedGovernorateId] = useState("");

  // ── Cities by governorate ────────────────────────────────────
  const [governorateCities, setGovernorateCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // ── City autocomplete search ─────────────────────────────────
  const [cityDisplayName, setCityDisplayName] = useState("");
  const [citySearchResults, setCitySearchResults] = useState<City[]>([]);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch governorates on mount ──────────────────────────────
  useEffect(() => {
    const fetchGovernorates = async () => {
      setGovernoratesLoading(true);
      try {
        const res = await apiClient.get(ENDPOINTS.LOCATIONS.GOVERNORATES);
        setGovernorates(res.data?.value ?? []);
      } catch {
        // non-fatal
      } finally {
        setGovernoratesLoading(false);
      }
    };
    fetchGovernorates();
  }, []);

  // ── Fetch cities when governorate changes ────────────────────
  useEffect(() => {
    if (!selectedGovernorateId) {
      setGovernorateCities([]);
      return;
    }
    const fetchCities = async () => {
      setCitiesLoading(true);
      setGovernorateCities([]);
      setFormData((prev) => ({ ...prev, cityId: "" }));
      setCityDisplayName("");
      try {
        const url = ENDPOINTS.LOCATIONS.CITIES_BY_GOV(selectedGovernorateId);
        const res = await apiClient.get(url);
        setGovernorateCities(res.data?.value ?? []);
      } catch {
        // non-fatal
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, [selectedGovernorateId]);

  // ── City autocomplete search (debounced 300ms) ───────────────
  const searchCities = useCallback((query: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (query.length < 2) {
      setCitySearchResults([]);
      setCitySearchLoading(false);
      return;
    }
    setCitySearchLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      try {
        const res = await apiClient.get(ENDPOINTS.LOCATIONS.CITIES_SEARCH, {
          params: { query, limit: 10 },
          signal: controller.signal,
        });
        setCitySearchResults(res.data?.value ?? []);
      } catch (err: unknown) {
        const axiosErr = err as { name?: string };
        if (
          axiosErr?.name !== "CanceledError" &&
          axiosErr?.name !== "AbortError"
        ) {
          setCitySearchResults([]);
        }
      } finally {
        setCitySearchLoading(false);
      }
    }, 300);
  }, []);

  // ── City input change ────────────────────────────────────────
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCityDisplayName(val);
    setFormData((prev) => ({ ...prev, cityId: "" }));
    setShowCityDropdown(true);
    searchCities(val);
  };

  // ── City selection from dropdown ─────────────────────────────
  const handleSelectCity = (city: City) => {
    setFormData((prev) => ({ ...prev, cityId: city.id }));
    setCityDisplayName(language === "ar" ? city.namear : city.nameen);
    setCitySearchResults([]);
    setShowCityDropdown(false);
    if (city.governorate) {
      setSelectedGovernorateId(city.governorate.id);
    }
  };

  // ── Close city dropdown on outside click ─────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(e.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Dropdown items to show ────────────────────────────────────
  const dropdownItems: City[] =
    citySearchResults.length > 0
      ? citySearchResults
      : cityDisplayName.length < 2
        ? governorateCities
        : [];

  // ── Form field change ─────────────────────────────────────────
  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      if (fieldErrors[field as keyof FieldErrors]) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  // ── Submit ────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);
    try {
      await apiClient.post(ENDPOINTS.AUTH.HOSPITAL_REGISTER, {
        hospitalName: formData.hospitalName,
        licenseNumber: formData.licenseNumber,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        cityId: formData.cityId,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setRegisteredEmail(formData.email);
      setShowOtpScreen(true);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status: number;
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      };
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 409) {
        const msg = data?.message?.toLowerCase() ?? "";
        if (msg.includes("email")) {
          setFieldErrors({
            email: "This email is already registered.",
          });
        } else if (msg.includes("license")) {
          setFieldErrors({
            licenseNumber:
              "A hospital with this license number already exists.",
          });
        } else {
          setFieldErrors({
            general: data?.message ?? "Conflict. Please check your details.",
          });
        }
      } else if (status === 400) {
        const serverMsg =
          data?.message ??
          Object.values(data?.errors ?? {})
            .flat()
            .join(" ") ??
          "Invalid data. Please check your inputs.";
        setFieldErrors({ general: serverMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP handlers ──────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError(
        language === "ar"
          ? "يرجى إدخال رمز مكون من 6 أرقام"
          : "Please enter a 6-digit code",
      );
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, {
        email: registeredEmail,
        otp: otpCode,
      });
      if (res.data?.success === true) {
        setShowOtpScreen(false);
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status: number } };
      const status = error?.response?.status;
      if (status === 400) {
        setOtpError(
          language === "ar"
            ? "رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى."
            : "Invalid or expired verification code. Please try again.",
        );
      } else if (status === 404) {
        setOtpError(
          language === "ar"
            ? "البريد الإلكتروني غير موجود. يرجى التسجيل مرة أخرى."
            : "Email not found. Please register again.",
        );
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendCode = () => {
    if (resendDisabled) return;
    setResendDisabled(true);
    setResendCountdown(60);
    // TODO: Call resend endpoint when available
  };

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendCountdown, resendDisabled]);

  // ── OTP Screen ────────────────────────────────────────────────
  if (showOtpScreen && !isSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 py-12 px-4 transition-colors duration-300"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <HeaderControls className={`fixed top-4 z-50 ${language === 'ar' ? 'left-4' : 'right-4'}`} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-[#f3f4f6] dark:border-neutral-800 p-10 text-center space-y-6 transition-colors duration-300"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                delay: 0.2,
              }}
            >
              <Mail
                className="w-10 h-10 text-red-600 dark:text-red-500"
                strokeWidth={1.5}
              />
            </motion.div>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {language === "ar"
              ? "تأكيد البريد الإلكتروني"
              : "Verify Your Email"}
          </h2>

          <p className="text-sm text-gray-600 dark:text-neutral-400">
            {language === "ar"
              ? "لقد أرسلنا رمز التحقق المكون من 6 أرقام إلى:"
              : "We sent a 6-digit verification code to:"}
          </p>
          <p className="text-sm font-bold text-red-600 dark:text-red-500">
            {registeredEmail}
          </p>

          <div className="flex justify-center gap-2 mt-6" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpInputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                autoFocus={index === 0}
                className="w-12 h-14 text-center text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-neutral-950 border-2 border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            ))}
          </div>

          {otpError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {otpError}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerifyOtp}
            disabled={otpLoading}
            className="w-full flex justify-center py-3 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-medium rounded-xl shadow-md shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 focus:ring-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {otpLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : language === "ar" ? (
              "تأكيد البريد الإلكتروني"
            ) : (
              "Verify Email"
            )}
          </motion.button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-neutral-400 inline">
              {language === "ar"
                ? "لم تستلم الرمز؟ "
                : "Didn't receive the code? "}
            </p>
            <button
              onClick={handleResendCode}
              disabled={resendDisabled}
              className={`text-sm font-medium inline transition-colors ${
                resendDisabled
                  ? "text-gray-400 dark:text-neutral-500 cursor-not-allowed"
                  : "text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
              }`}
            >
              {resendDisabled
                ? `${language === "ar" ? "إعادة الإرسال في" : "Resend in"} ${resendCountdown}s`
                : language === "ar"
                  ? "إعادة إرسال الرمز"
                  : "Resend Code"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Success Screen ────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 py-12 px-4 transition-colors duration-300"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-[#f3f4f6] dark:border-neutral-800 p-10 text-center space-y-6 transition-colors duration-300"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                delay: 0.2,
              }}
            >
              <CheckCircle
                className="w-20 h-20 text-green-500"
                strokeWidth={1.5}
              />
            </motion.div>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {language === "ar"
              ? "تم تقديم الطلب!"
              : "Registration Submitted!"}
          </h2>
          <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">
            {language === "ar"
              ? "طلبك قيد المراجعة. سيقوم فريقنا بتفعيل حسابك قريباً."
              : "Your application is under review. Our team will activate your account shortly."}
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/"
              className="inline-block w-full py-3 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-medium rounded-xl shadow-md shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 focus:ring-red-500 transition-all duration-200"
            >
              {language === "ar"
                ? "العودة إلى الرئيسية"
                : "Back to Home"}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Registration Form ─────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
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
        className="max-w-2xl w-full space-y-6 relative z-10"
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {/* 🔴 رُجعنا اللوجو الهادي البسيط زي صفحة الـ Login بالظبط 🔴 */}
          <Link to="/" className="inline-block">
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
          {/* 🔴 نهاية اللوجو البسيط 🔴 */}
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("register.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            {t("register.subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-neutral-900 py-6 px-4 shadow-2xl rounded-2xl sm:px-8 border border-[#f3f4f6] dark:border-neutral-800 transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Hospital Name */}
            <div>
              <label
                htmlFor="hospital-name"
                className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
              >
                {t("register.name")}
              </label>
              <motion.div
                className="mt-1"
                whileFocus={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  id="hospital-name"
                  name="hospital-name"
                  type="text"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange("hospitalName")}
                  placeholder={t("register.placeholder.name")}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20"
                />
              </motion.div>
            </div>

            {/* License Number */}
            <div>
              <label
                htmlFor="license"
                className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
              >
                {t("register.license")}
              </label>
              <motion.div
                className="mt-1"
                whileFocus={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  id="license"
                  name="license"
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={handleChange("licenseNumber")}
                  placeholder={t("register.placeholder.license")}
                  className={`appearance-none block w-full px-3.5 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 ${
                    fieldErrors.licenseNumber
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-neutral-700 focus:border-red-500"
                  }`}
                />
              </motion.div>
              {fieldErrors.licenseNumber && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.licenseNumber}
                </p>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
                >
                  {t("login.email")}
                </label>
                <motion.div
                  className="mt-1"
                  whileFocus={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange("email")}
                    placeholder={t("login.placeholder.email")}
                    className={`appearance-none block w-full px-3.5 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 ${
                      fieldErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-neutral-700 focus:border-red-500"
                    }`}
                  />
                </motion.div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
                >
                  {t("register.phone")}
                </label>
                <motion.div
                  className="mt-1"
                  whileFocus={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    placeholder={t("register.placeholder.phone")}
                    className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20"
                  />
                </motion.div>
              </div>
            </div>

            {/* Location — Governorate + City */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Governorate dropdown */}
              <div>
                <label
                  htmlFor="governorate"
                  className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
                >
                  {language === "ar" ? "المحافظة" : "Governorate"}
                </label>
                <div className="mt-1 relative">
                  <select
                    id="governorate"
                    value={selectedGovernorateId}
                    onChange={(e) => setSelectedGovernorateId(e.target.value)}
                    disabled={governoratesLoading}
                    className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 disabled:opacity-60 cursor-pointer"
                  >
                    <option value="">
                      {governoratesLoading
                        ? language === "ar"
                          ? "جاري التحميل..."
                          : "Loading..."
                        : language === "ar"
                          ? "اختر المحافظة"
                          : "Select Governorate"}
                    </option>
                    {governorates.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {language === "ar" ? gov.namear : gov.nameen}
                      </option>
                    ))}
                  </select>
                  <div
                    className={`pointer-events-none absolute inset-y-0 flex items-center ${language === "ar" ? "left-3" : "right-3"}`}
                  >
                    {governoratesLoading ? (
                      <Loader2 className="w-4 h-4 text-gray-400 dark:text-neutral-500 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* City autocomplete */}
              <div>
                <label
                  htmlFor="city-search"
                  className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
                >
                  {t("register.location")}
                </label>
                <div className="mt-1 relative">
                  <div
                    className={`pointer-events-none absolute inset-y-0 flex items-center ${language === "ar" ? "right-3" : "left-3"}`}
                  >
                    {citySearchLoading || citiesLoading ? (
                      <Loader2 className="w-4 h-4 text-gray-400 dark:text-neutral-500 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                    )}
                  </div>
                  <input
                    id="city-search"
                    ref={cityInputRef}
                    type="text"
                    autoComplete="off"
                    required
                    value={cityDisplayName}
                    onChange={handleCityInputChange}
                    onFocus={() => {
                      setShowCityDropdown(true);
                      if (cityDisplayName.length < 2) searchCities("");
                    }}
                    placeholder={
                      language === "ar" ? "ابحث عن مدينة..." : "Search city..."
                    }
                    className={`appearance-none block w-full py-2.5 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 ${language === "ar" ? "pr-10 pl-3" : "pl-10 pr-3"}`}
                  />

                  {/* Dropdown list */}
                  {showCityDropdown &&
                    (dropdownItems.length > 0 ||
                      (cityDisplayName.length >= 2 && !citySearchLoading)) && (
                      <div
                        ref={cityDropdownRef}
                        className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                      >
                        {dropdownItems.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-neutral-400">
                            {language === "ar"
                              ? "لا توجد مدن"
                              : "No cities found"}
                          </div>
                        ) : (
                          dropdownItems.map((city) => (
                            <button
                              key={city.id}
                              type="button"
                              onMouseDown={() => handleSelectCity(city)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-150 flex flex-col"
                            >
                              <span className="font-medium">
                                {language === "ar" ? city.namear : city.nameen}
                              </span>
                              {city.governorate && (
                                <span className="text-xs text-gray-400 dark:text-neutral-500">
                                  {language === "ar"
                                    ? city.governorate.namear
                                    : city.governorate.nameen}
                                </span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                </div>
                {/* Hidden validation — ensures cityId is filled before submit */}
                <input
                  type="text"
                  required
                  value={formData.cityId}
                  readOnly
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
                >
                  {t("login.password")}
                </label>
                <motion.div
                  className="mt-1 relative"
                  whileFocus={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange("password")}
                    placeholder="••••••••"
                    className={`appearance-none block w-full px-3.5 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 ${language === "ar" ? "pl-10" : "pr-10"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 ${language === "ar" ? "left-0 pl-3" : "right-0 pr-3"} flex items-center cursor-pointer text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </motion.div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
                >
                  {t("register.confirm")}
                </label>
                <motion.div
                  className="mt-1 relative"
                  whileFocus={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    placeholder="••••••••"
                    className={`appearance-none block w-full px-3.5 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 ${language === "ar" ? "pl-10" : "pr-10"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute inset-y-0 ${language === "ar" ? "left-0 pl-3" : "right-0 pr-3"} flex items-center cursor-pointer text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 rounded cursor-pointer"
              />
              <label
                htmlFor="terms"
                className={`block text-sm text-gray-900 dark:text-neutral-300 cursor-pointer ${language === "ar" ? "mr-2" : "ml-2"}`}
              >
                {t("register.terms")}{" "}
                <a
                  href="#"
                  className="font-medium text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors"
                >
                  {t("register.terms.link")}
                </a>{" "}
                {language === "en" ? "and" : "و"}{" "}
                <a
                  href="#"
                  className="font-medium text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors"
                >
                  {t("register.privacy")}
                </a>
              </label>
            </div>

            {/* General error */}
            {fieldErrors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border px-4 py-3"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(69, 10, 10, 0.3)' : '#fef2f2',
                  borderColor: theme === 'dark' ? 'rgba(153, 27, 27, 0.5)' : '#fecaca'
                }}
              >
                <p className="text-sm text-red-700 dark:text-red-400">
                  {fieldErrors.general}
                </p>
              </motion.div>
            )}

            <div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 focus:ring-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-red-500/20"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t("register.submit")
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-neutral-900 text-gray-500 dark:text-neutral-400">
                  {t("register.hasaccount")}
                </span>
              </div>
            </div>
            <div className="mt-5 text-center">
              <Link
                to="/org/login"
                className="font-medium text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors"
              >
                {t("register.signin")}
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}