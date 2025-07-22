'use client';

import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  
  const email = formData.get("email");
  alert("Email is " + email);
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-10 p-8">
        {/* Left Side - Form */}
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center">
            <img src="/socials-icons/new-logo.svg" />
            <h2 className="text-2xl font-semibold mt-4">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-[#7E7E7E] font-medium">
              {isSignUp ? 'Get started with Corpus AI' : 'Sign into your corpus chatbot'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                name='email'
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name='userName'
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                required
                name='password'
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button className="w-full bg-[#BF56FF] cursor-pointer hover:bg-purple-500 duration-300 text-white py-2 rounded-md font-medium shadow-lg">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>



                  <div className="text-sm text-[#7E7E7E] text-center">
                      {isSignUp ? 'Already have an account? ' : "Forget Password? "}
                      <button
                          className="text-[#BF56FF] font-medium cursor-pointer hover:underline"
                          onClick={() => setIsSignUp(!isSignUp)}
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

          <button className="w-full border border-gray-300 flex cursor-pointer duration-300 items-center justify-center py-2 rounded-md hover:bg-[#BF56FF] hover:text-white transition duration-200">
            <FcGoogle className="text-xl mr-2 bg-white rounded-full" />
            <span>Google</span>
          </button>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:block w-full max-w-xl">
          <img src="logo.svg" />
          <p className="text-gray-600 mb-6 text-center lg:text-left">
            Trustworthy with Your{' '}
            <span className="text-[#BF56FF] font-medium">Website and Data</span>
          </p>
          <img src="/socials-icons/sign-in-image.png" alt="Illustration" className="w-full" />
        </div>
      </div>
    </div>
  );
}
