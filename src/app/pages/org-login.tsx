import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Clock,
  ShieldOff,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "../contexts/language-context";
import { useTheme } from "../contexts/theme-context";
import { HeaderControls } from "../components/header-controls";
import logo from "figma:asset/3f35df7cfae4b7e07dd792e186ad9730949c3216.png";
import apiClient from "../../api/apiClient";
import ENDPOINTS from "../../api/endpoints";
import { TOKEN_KEYS } from "../../api/api.config";

// ─── Hospital account status codes ────────────────────────────
const HOSPITAL_STATUS = {
  UNDER_REVIEW: 1,
  ACTIVE: 2,
  SUSPENDED: 3,
} as const;

// ─── Response shape from /api/Auth/HospitalAdminlogin ─────────
interface LoginResponse {
  success: boolean;
  message: string;
  errorcode: string | null;
  auth: {
    token: string;
    refreshtoken: string;
    tokenexpiry: string;
  } | null;
  verification: {
    requiresotpverification: boolean;
    emailconfirmed: boolean;
    email: string;
  } | null;
  user: {
    id: string;
    username: string;
    email: string;
    usertype: string;
    roles: string[];
  } | null;
}

// ─── Remember Me Storage Key ──────────────────────────────────
const REMEMBER_ME_KEY = "rememberMe";

// ─── Component ────────────────────────────────────────────────
export function OrgLoginPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ── Form state ───────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ── Remember Me state (loaded from localStorage) ──────────────
  const [rememberMe, setRememberMe] = useState(() => {
    // Load saved "Remember Me" preference from localStorage
    const saved = localStorage.getItem(REMEMBER_ME_KEY);
    return saved === "true";
  });

  // ── Error / status messages ───────────────────────────────────
  const [fieldError, setFieldError] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "under_review" | "suspended";
    text: string;
  } | null>(null);

  // ── Auto-login check (The Logic We Agreed Upon) ───────────────
  useEffect(() => {
    // 1. Check if "Remember Me" was checked (True)
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";

    if (savedRememberMe) {
      // 2. If True, check if we have a valid token
      const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      if (token) {
        // 3. Auto-login: bypass login page and redirect directly to dashboard
        navigate("/org/dashboard", { replace: true });
        return;
      }
    }

    // 4. If Remember Me is False, we stay on this page to let user login normally.
    // (We also check sessionStorage just in case they are logged in during this active session)
    const sessionToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (sessionToken && !savedRememberMe) {
      navigate("/org/dashboard", { replace: true });
    }
  }, [navigate]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    setStatusMessage(null);
    setIsLoading(true);

    try {
      const res = await apiClient.post(
        ENDPOINTS.AUTH.HOSPITAL_LOGIN,
        { email, password }
      );

      const payload = res.data?.value;

      // ── OTP required — email not confirmed yet ───────────────
      if (
        payload?.verification?.requiresotpverification === true ||
        payload?.verification?.emailconfirmed === false
      ) {
        navigate("/org/verify-email", { state: { email } });
        return;
      }

      // ── Store tokens based on "Remember Me" selection ─────────
      const storage = rememberMe ? localStorage : sessionStorage;

      if (payload?.auth?.token) {
        storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, payload.auth.token);
      }
      if (payload?.auth?.refreshtoken) {
        storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, payload.auth.refreshtoken);
      }

      // ── Save "Remember Me" preference ─────────────────────────
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());

      navigate("/org/dashboard");
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status: number;
          data?: {
            message?: string;
            errorcode?: string;
          };
        };
      };

      const httpStatus = error?.response?.status;
      const serverMsg = error?.response?.data?.message ?? "";
      const errorCode = error?.response?.data?.errorcode ?? "";

      if (httpStatus === 403) {
        if (errorCode === "HOSPITAL_UNDER_REVIEW") {
          setStatusMessage({
            type: "under_review",
            text:
              language === "ar"
                ? "حسابك لا يزال قيد المراجعة. يرجى الانتظار حتى يتم تفعيله."
                : "Your account is still under review. Please wait for activation.",
          });
        } else if (errorCode === "HOSPITAL_SUSPENDED") {
          setStatusMessage({
            type: "suspended",
            text:
              language === "ar"
                ? "تم تعليق حسابك. يرجى التواصل مع الدعم."
                : "Your account has been suspended. Please contact support.",
          });
        } else {
          setFieldError(
            serverMsg ||
              (language === "ar"
                ? "ليس لديك صلاحية الوصول."
                : "You do not have permission to access.")
          );
        }
      } else if (httpStatus === 401) {
        setFieldError(
          language === "ar"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
            : "Invalid email or password."
        );
      } else if (httpStatus === 400) {
        setFieldError(
          serverMsg ||
            (language === "ar"
              ? "طلب غير صالح. يرجى التحقق من بياناتك."
              : "Invalid request. Please check your details.")
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <HeaderControls className={`absolute sm:fixed top-6 z-50 ${language === "ar" ? "left-4 sm:left-6" : "right-4 sm:right-6"}`} />

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
            {t("login.welcome")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            {t("login.subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-neutral-900 py-6 px-4 shadow-2xl rounded-2xl sm:px-8 border border-[#f3f4f6] dark:border-neutral-800 transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email */}
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldError("");
                    setStatusMessage(null);
                  }}
                  placeholder={t("login.placeholder.email")}
                  className={`appearance-none block w-full px-3.5 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 ${
                    fieldError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-neutral-700 focus:border-red-500"
                  }`}
                />
              </motion.div>
            </div>

            {/* Password */}
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldError("");
                    setStatusMessage(null);
                  }}
                  placeholder="••••••••"
                  className={`appearance-none block w-full px-3.5 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 sm:text-sm transition-all duration-200 focus:shadow-md dark:focus:shadow-red-500/20 ${
                    language === "ar" ? "pl-10" : "pr-10"
                  } ${
                    fieldError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-neutral-700 focus:border-red-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 ${
                    language === "ar" ? "left-0 pl-3" : "right-0 pr-3"
                  } flex items-center cursor-pointer text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors`}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </motion.div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center group">
                <div className="relative">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setRememberMe(newValue);
                      localStorage.setItem(REMEMBER_ME_KEY, newValue.toString());
                    }}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="remember-me"
                    className={`flex items-center justify-center w-4 h-4 border-2 rounded cursor-pointer transition-all duration-200
                      ${
                        rememberMe
                          ? "bg-red-600 dark:bg-red-600 border-red-600 dark:border-red-600"
                          : "bg-white dark:bg-neutral-950 border-gray-300 dark:border-neutral-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      }
                      peer-focus:ring-2 peer-focus:ring-red-500 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-neutral-900
                    `}
                  >
                    {rememberMe && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </label>
                </div>
                <label
                  htmlFor="remember-me"
                  className={`block text-sm text-gray-900 dark:text-neutral-300 cursor-pointer transition-colors group-hover:text-gray-700 dark:group-hover:text-neutral-200 ${
                    language === "ar" ? "mr-2" : "ml-2"
                  }`}
                >
                  {t("login.remember")}
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/org/forgot-password"
                  className="font-medium text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors"
                >
                  {t("login.forgot")}
                </Link>
              </div>
            </div>

            {/* Inline field error (401 / 400) */}
            {fieldError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border px-4 py-3 flex items-start gap-2"
                style={{
                  backgroundColor: theme === "dark" ? "rgba(69, 10, 10, 0.3)" : "#fef2f2",
                  borderColor: theme === "dark" ? "rgba(153, 27, 27, 0.5)" : "#fecaca",
                }}
              >
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{fieldError}</p>
              </motion.div>
            )}

            {/* Hospital status messages (403) */}
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border px-4 py-3 flex items-start gap-2 ${
                  statusMessage.type === "under_review"
                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50"
                    : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"
                }`}
              >
                {statusMessage.type === "under_review" ? (
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
                )}
                <p
                  className={`text-sm ${
                    statusMessage.type === "under_review"
                      ? "text-amber-800 dark:text-amber-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {statusMessage.text}
                </p>
              </motion.div>
            )}

            {/* Submit */}
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
                  t("login.submit")
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
                  {t("login.noaccount")}
                </span>
              </div>
            </div>
            <div className="mt-5 text-center">
              <Link
                to="/org/register"
                className="font-medium text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors"
              >
                {t("login.register")}
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}