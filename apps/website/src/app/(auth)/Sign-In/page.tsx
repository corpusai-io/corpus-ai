'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api';

/* ─── Animation ───────────────────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
};

/* ─── Shared styles ───────────────────────────────────────────────────────── */

const inputCls =
  'w-full bg-white border border-[#E8E8E8] rounded-lg px-4 py-3 text-sm text-[#171717] placeholder-[#A1A1AA] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717]/10 transition-all disabled:opacity-40';

const btnPrimaryCls =
  'w-full bg-[#171717] hover:bg-[#171717]/90 text-white rounded-md px-6 py-3.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

/* ─── Auth Page ───────────────────────────────────────────────────────────── */

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'code'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const ssoError = searchParams.get('error');
    if (ssoError) {
      setError(ssoError);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams]);

  function handleGoogleLogin() {
    setLoading(true);
    authApi.googleLogin();
  }

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return 'Password must be at least 8 characters long';
    if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(pw)) return 'Password must contain at least one number';
    if (!/[^a-zA-Z0-9]/.test(pw)) return 'Password must contain at least one special character';
    return null;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName || !email || !password || !confirmPassword) {
          setError('All fields are required for sign up');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }
        await authApi.register(email, password, fullName);
        setSuccessMessage('Account created! Check your email for the verification code.');
        setEmailToVerify(email);
        setShowVerification(true);
        setPassword('');
        setConfirmPassword('');
      } else {
        if (!email || !password) {
          setError('Email and password are required');
          setLoading(false);
          return;
        }
        const result = await authApi.login(email, password);
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:8080/dashboard';
          const tokens = {
            idToken: result.IdToken,
            accessToken: result.AccessToken,
            refreshToken: result.RefreshToken,
            user: result.user,
          };
          window.location.href = `${dashboardUrl}#auth=${encodeURIComponent(JSON.stringify(tokens))}`;
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!verificationCode) {
        setError('Please enter the verification code');
        setLoading(false);
        return;
      }
      await authApi.confirmSignup(emailToVerify, verificationCode);
      setSuccessMessage('Email verified successfully! You can now login.');
      setVerificationCode('');
      setTimeout(() => {
        setShowVerification(false);
        setIsSignUp(false);
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (forgotPasswordStep === 'email') {
        if (!email) {
          setError('Please enter your email address');
          setLoading(false);
          return;
        }
        await authApi.forgotPassword(email);
        setSuccessMessage('A reset code has been sent to your email.');
        setForgotPasswordStep('code');
      } else {
        if (!resetCode || !newPassword) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }
        await authApi.confirmForgotPassword(email, resetCode, newPassword);
        setSuccessMessage('Password reset successfully! You can now log in.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep('email');
          setResetCode('');
          setNewPassword('');
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Derive heading / subheading ── */

  const heading = showForgotPassword
    ? forgotPasswordStep === 'email' ? 'Reset your password' : 'Enter reset code'
    : showVerification
    ? 'Check your email'
    : isSignUp
    ? 'Create an account'
    : 'Welcome back';

  const subheading = showForgotPassword
    ? forgotPasswordStep === 'email'
      ? "We'll send a reset code to your email"
      : `Enter the code sent to ${email}`
    : showVerification
    ? `We sent a verification code to ${emailToVerify}`
    : isSignUp
    ? 'Start building with Corpus AI for free'
    : 'Sign in to your Corpus AI account';

  /* ── Render ── */

  return (
    <main className="relative min-h-screen bg-[#F7F7F7] overflow-hidden flex flex-col">
      {/* ── Minimal top bar ── */}
      <nav className="w-full px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="Corpus AI" className="h-8 brightness-0 opacity-90" />
          </Link>
          <Link
            href="/"
            className="text-sm text-[#737373] hover:text-[#171717] transition-colors font-[family-name:var(--font-inter)]"
          >
            Back to home
          </Link>
        </div>
      </nav>

      {/* ── Centered form ── */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={showForgotPassword ? 'forgot' : showVerification ? 'verify' : isSignUp ? 'signup' : 'signin'}
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* ── Heading ── */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-medium text-[#171717] tracking-[-0.02em]">
                {heading}
              </h1>
              <p className="text-sm font-[family-name:var(--font-inter)] text-[#737373] mt-3">
                {subheading}
              </p>
            </motion.div>

            {/* ── Card ── */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-5"
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success banner */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-5"
                  >
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── FORGOT PASSWORD ── */}
              {showForgotPassword ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  {forgotPasswordStep === 'email' ? (
                    <div>
                      <label className="block text-sm font-medium text-[#171717] mb-2">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className={`${inputCls} pl-10`}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#171717] mb-2">Reset Code</label>
                        <input
                          type="text"
                          required
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className={inputCls}
                          disabled={loading}
                          maxLength={6}
                        />
                        <p className="text-xs text-[#737373] mt-1.5">Check {email} for the code</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#171717] mb-2">New Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 8 chars, uppercase, number, special"
                            className={`${inputCls} pl-10 pr-11`}
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#171717] transition-colors"
                            disabled={loading}
                          >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <button type="submit" disabled={loading} className={`${btnPrimaryCls} mt-2`}>
                    {loading ? 'Please wait...' : forgotPasswordStep === 'email' ? 'Send Reset Code' : 'Reset Password'}
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 text-sm text-[#737373] hover:text-[#171717] transition-colors pt-1"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordStep('email');
                      setResetCode('');
                      setNewPassword('');
                      setError('');
                      setSuccessMessage('');
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft size={14} />
                    Back to Sign In
                  </button>
                </form>

              /* ── VERIFY EMAIL ── */
              ) : showVerification ? (
                <form onSubmit={handleVerification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#171717] mb-2">Verification Code</label>
                    <input
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className={inputCls}
                      disabled={loading}
                      maxLength={6}
                    />
                  </div>

                  <button type="submit" disabled={loading} className={btnPrimaryCls}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>

                  <p className="text-sm text-center text-[#737373]">
                    Didn&apos;t receive the code?{' '}
                    <button
                      type="button"
                      className="text-[#171717] hover:underline transition-colors font-medium"
                      onClick={() => {
                        setShowVerification(false);
                        setIsSignUp(true);
                        setError('');
                        setSuccessMessage('');
                      }}
                      disabled={loading}
                    >
                      Try again
                    </button>
                  </p>
                </form>

              /* ── SIGN IN / SIGN UP ── */
              ) : (
                <>
                  {/* Google SSO */}
                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 border border-[#E8E8E8] rounded-lg px-4 py-3 text-sm text-[#171717] bg-white hover:bg-[#F7F7F7] transition-all disabled:opacity-40 mb-5 shadow-sm"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FcGoogle size={18} className="shrink-0" />
                    {loading ? 'Redirecting...' : 'Continue with Google'}
                  </motion.button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex-1 h-px bg-[#E8E8E8]" />
                    <span className="text-xs text-[#A1A1AA] font-medium">OR</span>
                    <div className="flex-1 h-px bg-[#E8E8E8]" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                      <div>
                        <label className="block text-sm font-medium text-[#171717] mb-2">Full Name</label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                          <input
                            name="fullName"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className={`${inputCls} pl-10`}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[#171717] mb-2">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                        <input
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className={`${inputCls} pl-10`}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-[#171717]">Password</label>
                        {!isSignUp && (
                          <button
                            type="button"
                            className="text-xs text-[#737373] hover:text-[#171717] transition-colors"
                            onClick={() => {
                              setShowForgotPassword(true);
                              setError('');
                              setSuccessMessage('');
                            }}
                            disabled={loading}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          required
                          name="password"
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={isSignUp ? 'Min 8 chars, uppercase, number, special' : 'Enter your password'}
                          className={`${inputCls} pl-10 pr-11`}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#171717] transition-colors"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {isSignUp && (
                        <p className="text-xs text-[#737373] mt-1.5">
                          Must include uppercase, lowercase, number and special character
                        </p>
                      )}
                    </div>

                    {isSignUp && (
                      <div>
                        <label className="block text-sm font-medium text-[#171717] mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            required
                            name="confirmPassword"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className={`${inputCls} pl-10 pr-11`}
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#171717] transition-colors"
                            disabled={loading}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      className={`${btnPrimaryCls} mt-1`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>

            {/* Toggle sign-in / sign-up */}
            {!showVerification && !showForgotPassword && (
              <motion.p variants={itemVariants} className="text-center text-sm text-[#737373] mt-6 font-[family-name:var(--font-inter)]">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  className="text-[#171717] hover:underline transition-colors font-medium"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccessMessage('');
                    setFullName('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={loading}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up free'}
                </button>
              </motion.p>
            )}

            {/* Trust signal */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-1 mt-6 flex-wrap">
              {['SOC 2 compliant', 'No credit card', 'Free forever plan'].map((text, i, arr) => (
                <span key={text} className="text-xs text-[#A1A1AA]">
                  {text}{i < arr.length - 1 && <span className="mx-2">&middot;</span>}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}
