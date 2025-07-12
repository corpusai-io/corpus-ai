// src/components/Test.jsx
import React from 'react';
 // Import external CSS for animation

const Test = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-white">
      
      {/* 💠 Blobs (floating and animated clockwise) */}
      <div
        className="blob absolute w-[470px] h-[835px] bg-[#FCA4FF] blur-[200px] opacity-20 mix-blend-multiply rounded-full"
        style={{ top: '5%', left: '5%', animationDelay: '0s' }}
      ></div>

      <div
        className="blob absolute w-[390px] h-[648px] bg-[#CE89FC] blur-[200px] opacity-20 mix-blend-multiply rounded-full"
        style={{ top: '10%', left: '35%', animationDelay: '3s' }}
      ></div>

      <div
        className="blob absolute w-[411px] h-[477px] bg-[#DEC7FE] blur-[200px] opacity-30 mix-blend-multiply rounded-full"
        style={{ top: '8%', left: '65%', animationDelay: '6s' }}
      ></div>

      <div
        className="blob absolute w-[511px] h-[477px] bg-[#FFAAF9] blur-[100px] opacity-30 mix-blend-multiply rounded-full"
        style={{ top: '30%', left: '55%', animationDelay: '9s' }}
      ></div>

      <div
        className="blob absolute w-[400px] h-[400px] bg-[#f2d5f3] blur-[100px] opacity-10 mix-blend-multiply rounded-full"
        style={{ top: '40%', left: '30%', animationDelay: '12s' }}
      ></div>

      {/* 🌟 Glassmorphic Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          AI powered Chatbot <span className="bg-white text-black px-2 py-1 rounded-full text-xl">💬</span> Built for your <span className="text-purple-500">Website</span>
        </h1>
        <p className="mt-4 text-gray-700 max-w-xl">
          Empower your website with AI conversations. Get instant answers and 24/7 support – trusted by thousands.
        </p>
        <div className="mt-6 flex gap-4">
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow">
            Get Started
          </button>
          <button className="bg-white hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-lg border">
            Book a Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
