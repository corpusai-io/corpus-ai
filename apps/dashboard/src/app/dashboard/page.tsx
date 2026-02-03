'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Corpus AI Dashboard
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Welcome back, {user.email}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Tier
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {user.tier === 0 ? 'Free' : user.tier === 1 ? 'Starter' : user.tier === 2 ? 'Standard' : 'Business'}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Chat Usage
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {user.chat_usage}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Username
              </p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {user.username}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Information
          </h3>
          <dl className="grid grid-cols-1 gap-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.email}
              </dd>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Username
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.username}
              </dd>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Created
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Subscription Tier
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.tier === 0 && 'Free Tier - 20 chats/month, 1 chatbot'}
                {user.tier === 1 && 'Starter - 1,500 chats/month, 2 chatbots'}
                {user.tier === 2 && 'Standard - 7,500 chats/month, 4 chatbots'}
                {user.tier === 3 && 'Business - 15,000 chats/month, 8 chatbots'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> This is a test dashboard. More features coming soon!
          </p>
        </div>
      </main>
    </div>
  );
}
