'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Mail, Lock, User } from 'lucide-react';
import { authApi } from '@/lib/api';
import NavbarV4 from '@/app/components/home-v4/NavbarV4';

export default function AuthPage() {
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

  // Verification code states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'code'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const searchParams = useSearchParams();

  // Pick up error from Google SSO redirect (e.g. user denied or token exchange failed)
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

  // Password validation for AWS Cognito
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain at least one special character';
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

  // Derive title / subtitle from current view
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

  // Shared input classes
  const inputCls =
    'w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/50 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-40';

  return (
    <main className="relative min-h-screen bg-[#08080A] overflow-hidden flex flex-col">
      {/* Hero glow */}
      <div className="v4-glow-hero absolute inset-0 pointer-events-none" />

      <NavbarV4 />

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-6 pt-28 pb-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={showForgotPassword ? 'forgot' : showVerification ? 'verify' : isSignUp ? 'signup' : 'signin'}
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
          >
            {/* Logo + heading */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6">
                <img src="/logo.svg" alt="Corpus AI" className="h-8 brightness-0 invert opacity-80 mx-auto" />
              </Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">{heading}</h1>
              <p className="text-sm text-[#71717A] mt-2">{subheading}</p>
            </div>

            {/* Form card */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/40">

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 bg-[#EC4899]/10 border border-[#EC4899]/20 text-[#EC4899] px-4 py-3 rounded-lg text-sm mb-5"
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
                    className="flex items-start gap-3 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-4 py-3 rounded-lg text-sm mb-5"
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
                      <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3F3F46]" />
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
                        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Reset Code</label>
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
                        <p className="text-xs text-[#3F3F46] mt-1.5">Check {email} for the code</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">New Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3F3F46]" />
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3F46] hover:text-[#A1A1AA] transition-colors"
                            disabled={loading}
                          >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#BF56FF] hover:bg-[#A83DE8] text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? 'Please wait…' : forgotPasswordStep === 'email' ? 'Send Reset Code' : 'Reset Password'}
                  </button>

                  <button
                    type="button"
                    className="w-full text-sm text-[#A1A1AA] hover:text-white transition-colors pt-1"
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
                    ← Back to Sign In
                  </button>
                </form>

              /* ── VERIFY EMAIL ── */
              ) : showVerification ? (
                <form onSubmit={handleVerification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Verification Code</label>
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#BF56FF] hover:bg-[#A83DE8] text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying…' : 'Verify Email'}
                  </button>

                  <p className="text-sm text-center text-[#71717A]">
                    Didn&apos;t receive the code?{' '}
                    <button
                      type="button"
                      className="text-[#BF56FF] hover:text-[#D08AFF] transition-colors font-medium"
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
                  {/* Google SSO — shown first */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#A1A1AA] hover:bg-white/[0.04] hover:border-white/[0.14] hover:text-white transition-all duration-200 disabled:opacity-40 mb-5"
                  >
                    <FcGoogle size={18} className="shrink-0" />
                    {loading ? 'Redirecting…' : 'Continue with Google'}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-xs text-[#3F3F46] font-medium">OR</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                      <div>
                        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Full Name</label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3F3F46]" />
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
                      <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3F3F46]" />
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
                        <label className="text-sm font-medium text-[#A1A1AA]">Password</label>
                        {!isSignUp && (
                          <button
                            type="button"
                            className="text-xs text-[#BF56FF] hover:text-[#D08AFF] transition-colors"
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
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3F3F46]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          required
                          name="password"
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={isSignUp ? 'Min 8 chars, uppercase, number, special' : '••••••••'}
                          className={`${inputCls} pl-10 pr-11`}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3F46] hover:text-[#A1A1AA] transition-colors"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {isSignUp && (
                        <p className="text-xs text-[#3F3F46] mt-1.5">
                          Must include uppercase, lowercase, number and special character
                        </p>
                      )}
                    </div>

                    {isSignUp && (
                      <div>
                        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3F3F46]" />
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3F46] hover:text-[#A1A1AA] transition-colors"
                            disabled={loading}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#BF56FF] hover:bg-[#A83DE8] text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                    >
                      {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Toggle sign-in / sign-up */}
            {!showVerification && !showForgotPassword && (
              <p className="text-center text-sm text-[#71717A] mt-6">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  className="text-[#BF56FF] hover:text-[#D08AFF] transition-colors font-medium"
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
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
