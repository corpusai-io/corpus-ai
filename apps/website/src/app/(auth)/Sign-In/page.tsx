'use client';

import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from "lucide-react";
import { authApi } from '@/lib/api';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password validation for AWS Cognito
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        if (!email) {
          setError('Email is required for sign up');
          setLoading(false);
          return;
        }

        await authApi.register(email, password, username);

        setSuccessMessage('Account created! Please check your email to verify your account before logging in.');
        // Clear form
        setUsername('');
        setEmail('');
        setPassword('');
        // Switch to sign-in mode after 2 seconds
        setTimeout(() => {
          setIsSignUp(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        // Sign In
        const loginIdentifier = email || username; // Can use either email or username
        if (!loginIdentifier) {
          setError('Please enter your email or username');
          setLoading(false);
          return;
        }

        const result = await authApi.login(loginIdentifier, password);

        // Successful login - redirect to dashboard
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = 'http://localhost:8080/dashboard';
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex mt-7 md:items-center justify-center">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row lg:items-start items-center justify-between gap-10 p-8">
        {/* Left Side - Form */}
        <div className="w-full  max-w-md space-y-6">
          <div className="flex flex-col items-center">
            <img src="/socials-icons/new-logo.svg" alt="Corpus AI Logo" />
            <h2 className="text-2xl font-semibold mt-4">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-[#7E7E7E] font-medium">
              {isSignUp ? 'Get started with Corpus AI' : 'Sign into your corpus chatbot'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  name='email'
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  disabled={loading}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                {isSignUp ? 'Username (optional)' : 'Email or Username *'}
              </label>
              <input
                type="text"
                name='userName'
                required={!isSignUp}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isSignUp ? "Username (optional)" : "Email or Username"}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                disabled={loading}
              />
            </div>
            {!isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-1">Email (if using email login)</label>
                <input
                  name='email'
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  disabled={loading}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  required
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Min 8 chars, 1 uppercase, 1 number, 1 special" : "Password"}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 "
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-2.5 text-sm text-purple-500 hover:underline focus:outline-none bg-white"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#BF56FF] cursor-pointer hover:bg-purple-500 duration-300 text-white py-2 rounded-md font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="text-sm text-[#7E7E7E] text-center">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              className="text-[#BF56FF] font-medium cursor-pointer hover:underline"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or Continue With</span>
            </div>
          </div>

          <button
            className="w-full border border-gray-300 flex cursor-pointer duration-300 items-center justify-center py-2 rounded-md hover:bg-[#BF56FF] hover:text-white transition disabled:opacity-50"
            disabled={loading}
          >
            <FcGoogle className="text-xl mr-2 bg-white rounded-full" />
            <span>Google (Coming Soon)</span>
          </button>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:block w-full max-w-xl">
          <img className='ml-10' src="/logo.svg" alt="Corpus AI Logo" />
          <p className="text-gray-600 ml-10 text-center lg:text-left">
            Trustworthy with Your{' '}
            <span className="text-[#BF56FF] font-medium">Website and Data</span>
          </p>
          <img src="/socials-icons/sign-in-image.png" alt="Illustration" className="w-full" />
        </div>
      </div>
    </div>
  );
}
