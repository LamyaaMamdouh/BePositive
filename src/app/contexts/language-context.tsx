import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Language Context for Be Positive Platform
type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Hero Section
    'hero.title': 'Be Positive',
    'hero.tagline': 'Connecting Donors, Saving Lives',
    'hero.description': 'A revolutionary platform that bridges the gap between blood donors and those in urgent need. Our mission is to make blood donation accessible, efficient, and life-saving through technology.',
    'hero.cta': 'Explore Our Idea',
    'hero.hospitals': 'For Hospitals:',
    'hero.login': 'Log In',
    'hero.register': 'Register',

    // About Section
    'about.title': 'About Our Team',
    'about.description': 'We are a passionate team of innovators, developers, and healthcare enthusiasts committed to revolutionizing blood donation. Our diverse expertise drives us to create solutions that matter.',
    'about.innovation.title': 'Innovation',
    'about.innovation.desc': 'Pioneering solutions that transform the blood donation landscape with cutting-edge technology.',
    'about.impact.title': 'Impact',
    'about.impact.desc': 'Creating meaningful change by connecting donors with recipients in real-time, saving countless lives.',
    'about.technology.title': 'Technology',
    'about.technology.desc': 'Leveraging modern tech stack to build a seamless, efficient, and user-friendly platform.',
    'about.collaboration.title': 'Collaboration',
    'about.collaboration.desc': 'Building bridges between hospitals, donors, and communities to create a unified ecosystem.',

    // Idea Section
    'idea.title': 'Our Idea',
    'idea.description': 'Be Positive is a comprehensive digital platform that revolutionizes the blood donation process. We connect blood donors with those in urgent need through an intelligent, location-based system.',
    'idea.problem.title': 'The Problem',
    'idea.problem.desc': 'Thousands of people die each year due to blood shortages. The current system is fragmented, inefficient, and relies on outdated methods of communication. Finding a matching donor in time can be a matter of life and death.',
    'idea.solution.title': 'Our Solution',
    'idea.solution.desc': 'Be Positive creates a digital ecosystem where donors can register, receive alerts when needed, and connect with recipients instantly. Our platform ensures no request goes unheard and every donor can make a difference.',
    'idea.feature1.title': 'Mobile-First Experience',
    'idea.feature1.desc': 'Access the platform anywhere, anytime through our intuitive mobile interface.',
    'idea.feature2.title': 'Smart Matching',
    'idea.feature2.desc': 'Advanced algorithms match donors with recipients based on blood type and location.',
    'idea.feature3.title': 'Location Services',
    'idea.feature3.desc': 'Find the nearest donation centers or donors in your area instantly.',
    'idea.feature4.title': 'Real-Time Alerts',
    'idea.feature4.desc': 'Get notified immediately when your blood type is needed nearby.',

    // Mission Section
    'mission.title': 'Our Mission',
    'mission.desc1': 'To eliminate blood shortages by creating a seamless, technology-driven platform that connects willing donors with those in need, ensuring that no life is lost due to unavailability of blood.',
    'mission.desc2': 'We strive to make blood donation as simple as sending a message, fostering a community where every individual can be a hero.',
    'vision.title': 'Our Vision',
    'vision.desc1': 'To create a world where blood is always available when needed, where every potential donor is aware and empowered, and where technology serves humanity at its finest.',
    'vision.desc2': 'We envision a future where Be Positive becomes the global standard for blood donation networks, saving millions of lives annually.',

    // Features Section
    'features.title': 'Platform Features',
    'features.description': 'Discover the powerful features that make Be Positive the ultimate blood donation platform',
    'features.secure.title': 'Secure & Private',
    'features.secure.desc': 'Your data is protected with enterprise-grade security and encryption.',
    'features.instant.title': 'Instant Matching',
    'features.instant.desc': 'Find compatible donors in seconds with our advanced matching algorithm.',
    'features.community.title': 'Community Driven',
    'features.community.desc': 'Join a growing network of lifesavers making a real difference.',
    'features.track.title': 'Track Donations',
    'features.track.desc': "Monitor your donation history and see the lives you've impacted.",
    'features.communication.title': 'Direct Communication',
    'features.communication.desc': 'Connect with donors and recipients through secure messaging.',
    'features.recognition.title': 'Recognition System',
    'features.recognition.desc': 'Earn badges and rewards for your life-saving contributions.',

    // Contact Section
    'contact.title': 'Get In Touch',
    'contact.description': 'Join us in revolutionizing blood donation! Whether you\'re an organization ready to make a difference or have questions about our blockchain-powered platform, we\'re here to help.',
    'contact.email': 'Email Us',
    'contact.connect': 'Connect With Us',
    'contact.form.name': 'Your Name',
    'contact.form.email': 'Email Address',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
    'contact.form.placeholder.name': 'John Doe',
    'contact.form.placeholder.email': 'john@example.com',
    'contact.form.placeholder.message': 'Tell us about your inquiry...',

    // Footer
    'footer.tagline': 'Connecting Donors, Saving Lives',
    'footer.copyright': '© 2026 Be Positive. All rights reserved.',
    'footer.made': 'Made with',
    'footer.team': 'by our team',

    // Scroll to top
    'scroll.top': 'Back to Top',

    // 404 Page
    'notfound.title': '404',
    'notfound.subtitle': 'Page Not Found',
    'notfound.description': 'Oops! Looks like this page took a detour. The page you are looking for might have been removed or is temporarily unavailable.',
    'notfound.home': 'Back to Home',
    'notfound.donate': 'Start Saving Lives',

    // Org Login
    'login.welcome': 'Welcome Back',
    'login.subtitle': 'Sign in to your hospital dashboard',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.remember': 'Remember me',
    'login.forgot': 'Forgot password?',
    'login.submit': 'Sign In',
    'login.noaccount': "Don't have an account?",
    'login.register': 'Register Hospital',
    'login.placeholder.email': 'admin@hospital.com',

    // Forgot Password
    'forgot.title': 'Reset Password',
    'forgot.subtitle': 'Enter your email to receive a password reset code',
    'forgot.email.label': 'Email Address',
    'forgot.email.placeholder': 'admin@hospital.com',
    'forgot.submit': 'Send Reset Code',
    'forgot.cancel': 'Cancel',
    'forgot.success': 'Reset code sent! Check your email.',
    'forgot.error': 'Failed to send reset code. Please try again.',
    'forgot.invalid.email': 'Please enter a valid email address',
    'forgot.back': 'Back to login',

    // Verify OTP
    'verify.title': 'Verify Code',
    'verify.subtitle': 'Enter the 6-digit code sent to your email',
    'verify.code.label': 'Verification Code',
    'verify.code.placeholder': '000000',
    'verify.submit': 'Verify Code',
    'verify.resend': 'Resend Code',
    'verify.success': 'Code verified successfully!',
    'verify.error': 'Invalid or expired code. Please try again.',
    'verify.invalid.code': 'Please enter a valid 6-digit code',
    'verify.back': 'Back to forgot password',
    'verify.resend.success': 'New code sent to your email',
    'verify.resend.wait': 'Please wait before requesting a new code',

    // Reset Password
    'reset.title': 'Set New Password',
    'reset.subtitle': 'Create a strong password for your account',
    'reset.password.label': 'New Password',
    'reset.password.placeholder': '••••••••',
    'reset.confirm.label': 'Confirm Password',
    'reset.confirm.placeholder': '••••••••',
    'reset.submit': 'Reset Password',
    'reset.success': 'Password reset successful! Redirecting to login...',
    'reset.error': 'Failed to reset password. Please try again.',
    'reset.password.mismatch': 'Passwords do not match',
    'reset.password.weak': 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    'reset.back': 'Back to login',

    // Org Register
    'register.title': 'Hospital Registration',
    'register.subtitle': 'Create your Be Positive account',
    'register.name': 'Hospital / Organization Name',
    'register.license': 'Medical License Number',
    'register.phone': 'Phone Number',
    'register.location': 'City / Location',
    'register.confirm': 'Confirm Password',
    'register.terms': 'I agree to the',
    'register.terms.link': 'Terms & Conditions',
    'register.privacy': 'Privacy Policy',
    'register.submit': 'Register Hospital',
    'register.hasaccount': 'Already have an account?',
    'register.signin': 'Sign In',
    'register.placeholder.name': 'City General Hospital',
    'register.placeholder.license': 'ML-XXXX-XXXX',
    'register.placeholder.phone': '+1 234 567 890',
    'register.placeholder.location': 'New York',
  },
  ar: {
    // Hero Section
    'hero.title': 'كن إيجابياً',
    'hero.tagline': 'ربط المتبرعين، إنقاذ الأرواح',
    'hero.description': 'منصة ثورية تربط بين المتبرعين بالدم والمحتاجين إليه بشكل عاجل. مهمتنا هي جعل التبرع بالدم متاحًا وفعالًا ومنقذًا للحياة من خلال التكنولوجيا.',
    'hero.cta': 'اكتشف فكرتنا',
    'hero.hospitals': 'للمستشفيات:',
    'hero.login': 'تسجيل الدخول',
    'hero.register': 'تسجيل',

    // About Section
    'about.title': 'عن فريقنا',
    'about.description': 'نحن فريق شغوف من المبتكرين والمطورين وعشاق الرعاية الصحية الملتزمين بإحداث ثورة في التبرع بالدم. خبراتنا المتنوعة تدفعنا لإنشاء حلول ذات أهمية.',
    'about.innovation.title': 'الابتكار',
    'about.innovation.desc': 'حلول رائدة تحول مشهد التبرع بالدم بتكنولوجيا متطورة.',
    'about.impact.title': 'التأثير',
    'about.impact.desc': 'إحداث تغيير ذي مغزى من خلال ربط المتبرعين بالمستفيدين في الوقت الفعلي، وإنقاذ عدد لا يحصى من الأرواح.',
    'about.technology.title': 'التكنولوجيا',
    'about.technology.desc': 'الاستفادة من أحدث التقنيات لبناء منصة سلسة وفعالة وسهلة الاستخدام.',
    'about.collaboration.title': 'التعاون',
    'about.collaboration.desc': 'بناء جسور بين المستشفيات والمتبرعين والمجتمعات لإنشاء نظام بيئي موحد.',

    // Idea Section
    'idea.title': 'فكرتنا',
    'idea.description': 'كن إيجابياً هي منصة رقمية شاملة تُحدث ثورة في عملية التبرع بالدم. نربط المتبرعين بالدم بالمحتاجين إليه بشكل عاجل من خلال نظام ذكي قائم على الموقع.',
    'idea.problem.title': 'المشكلة',
    'idea.problem.desc': 'يموت الآلاف من الناس كل عام بسبب نقص الدم. النظام الحالي مجزأ وغير فعال ويعتمد على أساليب تواصل قديمة. إيجاد متبرع مطابق في الوقت المناسب يمكن أن يكون مسألة حياة أو موت.',
    'idea.solution.title': 'حلنا',
    'idea.solution.desc': 'كن إيجابياً يخلق نظامًا بيئيًا رقميًا حيث يمكن للمتبرعين التسجيل وتلقي التنبيهات عند الحاجة والاتصال بالمستفيدين على الفور. تضمن منصتنا عدم مرور أي طلب دون أن يُسمع وأن كل متبرع يمكنه إحداث فرق.',
    'idea.feature1.title': 'تجربة محمولة أولاً',
    'idea.feature1.desc': 'الوصول إلى المنصة في أي مكان وفي أي وقت من خلال واجهتنا المحمولة البديهية.',
    'idea.feature2.title': 'مطابقة ذكية',
    'idea.feature2.desc': 'خوارزميات متقدمة تطابق المتبرعين مع المستفيدين بناءً على فصيلة الدم والموقع.',
    'idea.feature3.title': 'خدمات الموقع',
    'idea.feature3.desc': 'اعثر على أقرب مراكز التبرع أو المتبرعين في منطقتك على الفور.',
    'idea.feature4.title': 'تنبيهات فورية',
    'idea.feature4.desc': 'احصل على إشعار فوري عندما تكون فصيلة دمك مطلوبة بالقرب منك.',

    // Mission Section
    'mission.title': 'مهمتنا',
    'mission.desc1': 'القضاء على نقص الدم من خلال إنشاء منصة سلسة تعتمد على التكنولوجيا تربط المتبرعين الراغبين بالمحتاجين، مما يضمن عدم فقدان أي حياة بسبب عدم توفر الدم.',
    'mission.desc2': 'نسعى جاهدين لجعل التبرع بالدم بسيطًا مثل إرسال رسالة، وتعزيز مجتمع حيث يمكن لكل فرد أن يكون بطلا.',
    'vision.title': 'رؤيتنا',
    'vision.desc1': 'خلق عالم يكون فيه الدم متاحًا دائمًا عند الحاجة، حيث يكون كل متبرع محتمل على دراية وتمكين، وحيث تخدم التكنولوجيا الإنسانية في أفضل حالاتها.',
    'vision.desc2': 'نتصور مستقبلًا يصبح فيه كن إيجابياً المعيار العالمي لشبكات التبرع بالدم، لإنقاذ ملايين الأرواح سنويًا.',

    // Features Section
    'features.title': 'مميزات المنصة',
    'features.description': 'اكتشف المميزات القوية التي تجعل من كن إيجابياً منصة التبرع بالدم المثالية',
    'features.secure.title': 'آمن وخاص',
    'features.secure.desc': 'بياناتك محمية بأمان وتشفير على مستوى المؤسسات.',
    'features.instant.title': 'مطابقة فورية',
    'features.instant.desc': 'ابحث عن متبرعين متوافقين في ثوانٍ باستخدام خوارزمية المطابقة المتقدمة لدينا.',
    'features.community.title': 'يقودها المجتمع',
    'features.community.desc': 'انضم إلى شبكة متنامية من منقذي الحياة الذين يحدثون فرقًا حقيقيًا.',
    'features.track.title': 'تتبع التبرعات',
    'features.track.desc': 'راقب سجل تبرعاتك وشاهد الأرواح التي أثرت عليها.',
    'features.communication.title': 'تواصل مباشر',
    'features.communication.desc': 'تواصل مع المتبرعين والمستفيدين من خلال الرسائل الآمنة.',
    'features.recognition.title': 'نظام التقدير',
    'features.recognition.desc': 'احصل على شارات ومكافآت لمساهماتك المنقذة للحياة.',

    // Contact Section
    'contact.title': 'تواصل معنا',
    'contact.description': 'انضم إلينا في ثورة التبرع بالدم! سواء ��نت منظمة مستعدة للتأثير أو لديك أسئلة حول منصتنا القائمة على البلوكتشين، نحن هنا للمساعدة.',
    'contact.email': 'راسلنا عبر البريد الإلكتروني',
    'contact.connect': 'تواصل معنا',
    'contact.form.name': 'اسمك',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.message': 'الرسالة',
    'contact.form.submit': 'إرسال الرسالة',
    'contact.form.placeholder.name': 'أحمد محمد',
    'contact.form.placeholder.email': 'ahmed@example.com',
    'contact.form.placeholder.message': 'أخبرنا عن استفسارك...',

    // Footer
    'footer.tagline': 'ربط المتبرعين، إنقاذ الأرواح',
    'footer.copyright': '© 2026 كن إيجابياً. جميع الحقوق محفوظة.',
    'footer.made': 'صنع بـ',
    'footer.team': 'من قبل فريقنا',

    // Scroll to top
    'scroll.top': 'العودة للأعلى',

    // 404 Page
    'notfound.title': '404',
    'notfound.subtitle': 'الصفحة غير موجودة',
    'notfound.description': 'عذرًا! يبدو أن هذه الصفحة أخذت منعطفًا. قد تكون الصفحة التي تبحث عنها قد تمت إزالتها أو غير متاحة مؤقتًا.',
    'notfound.home': 'العودة للرئيسية',
    'notfound.donate': 'ابدأ في إنقاذ الأرواح',

    // Org Login
    'login.welcome': 'مرحباً بعودتك',
    'login.subtitle': 'تسجيل الدخول إلى لوحة تحكم المستشفى',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.remember': 'تذكرني',
    'login.forgot': 'نسيت كلمة المرور؟',
    'login.submit': 'تسجيل الدخول',
    'login.noaccount': 'ليس لديك حساب؟',
    'login.register': 'تسجيل مستشفى',
    'login.placeholder.email': 'admin@hospital.com',

    // Forgot Password
    'forgot.title': 'إعادة تعيين كلمة المرور',
    'forgot.subtitle': 'أدخل بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور',
    'forgot.email.label': 'عنوان البريد الإلكتروني',
    'forgot.email.placeholder': 'admin@hospital.com',
    'forgot.submit': 'إرسال رابط إعادة تعيين كلمة المرور',
    'forgot.cancel': 'إلغاء',
    'forgot.success': 'تم إرسال رابط إعادة تعيين كلمة المرور! تحقق من بريدك الإلكتروني.',
    'forgot.error': 'فشل في إرسال رابط إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.',
    'forgot.invalid.email': 'يرجى إدخال عنوان بريد إلكتروني صالح',
    'forgot.back': 'العودة إلى تسجيل الدخول',

    // Verify OTP
    'verify.title': 'تحقق من الكود',
    'verify.subtitle': 'أدخل الكود الستة الأرقام المرسل إلى بريدك الإلكتروني',
    'verify.code.label': 'كود التحقق',
    'verify.code.placeholder': '000000',
    'verify.submit': 'تحقق من الكود',
    'verify.resend': 'إعادة إرسال الكود',
    'verify.success': 'تم التحقق من الكود بنجاح!',
    'verify.error': 'كود غير صالح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.',
    'verify.invalid.code': 'يرجى إدخال كود ستة أرقام صالح',
    'verify.back': 'العودة إلى إعادة تعيين كلمة المرور',
    'verify.resend.success': 'تم إرسال كود جديد إلى بريدك الإلكتروني',
    'verify.resend.wait': 'يرجى الانتظار قبل طلب كود جديد',

    // Reset Password
    'reset.title': 'تعيين كلمة مرور جديدة',
    'reset.subtitle': 'إنشاء كلمة مرور قوية لحسابك',
    'reset.password.label': 'كلمة مرور جديدة',
    'reset.password.placeholder': '••••••••',
    'reset.confirm.label': 'تأكيد كلمة المرور',
    'reset.confirm.placeholder': '••••••••',
    'reset.submit': 'إعادة تعيين كلمة المرور',
    'reset.success': 'تم إعادة تعيين كلمة المرور بنجاح! يتم تحويلك إلى صفحة تسجيل الدخول...',
    'reset.error': 'فشل في إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.',
    'reset.password.mismatch': 'كلمات المرور غير متطابقة',
    'reset.password.weak': 'يجب أن تكون كلمة المرور على الأقل 8 أحرف تتضمن حرفًا كبيرًا وحرفًا صغيرًا ورقمًا وحرفًا خاصًا',
    'reset.back': 'العودة إلى تسجيل الدخول',

    // Org Register
    'register.title': 'تسجيل مستشفى',
    'register.subtitle': 'أنشئ حسابك في كن إيجابياً',
    'register.name': 'اسم المستشفى / المنظمة',
    'register.license': 'رقم الترخيص الطبي',
    'register.phone': 'رقم الهاتف',
    'register.location': 'المدينة / الموقع',
    'register.confirm': 'تأكيد كلمة المرور',
    'register.terms': 'أوافق على',
    'register.terms.link': 'الشروط والأحكام',
    'register.privacy': 'سياسة الخصوصية',
    'register.submit': 'تسجيل المستشفى',
    'register.hasaccount': 'لديك حساب بالفعل؟',
    'register.signin': 'تسجيل الدخول',
    'register.placeholder.name': 'مستشفى المدينة العام',
    'register.placeholder.license': 'ML-XXXX-XXXX',
    'register.placeholder.phone': '+20 123 456 7890',
    'register.placeholder.location': 'القاهرة',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Apply RTL for Arabic
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguageState(savedLang);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}