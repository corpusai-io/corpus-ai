'use client';
import React from 'react';

const PricingSection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
     
      <div className="flex justify-center mb-12">
        <div className="relative w-72 h-16 bg-white border border-gray-200 rounded-full shadow-md">
          <div className="absolute left-2 top-2 w-36 h-12 bg-purple-500 border border-gray-300 rounded-full shadow-md flex items-center justify-center">
            <span className="text-white font-semibold">Monthly</span>
          </div>
          <div className="absolute right-8 top-4">
            <span className="text-gray-800 font-semibold">Yearly</span>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Free</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">$0</p>
          <p className="text-gray-500 mb-4">Good for getting started</p>
          
          <button className="w-full py-2 mb-6 border border-gray-300 rounded-lg text-gray-800 font-medium">
            Get Started
          </button>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>1 Corpus Bot</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>20 queries</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>1 Corpus Bot</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Max 100 docs or 50MB</span>
            </li>
          </ul>
        </div>

       
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Starter</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">$29</p>
          <p className="text-gray-500 mb-4">Suite for personal</p>
          
          <button className="w-full py-2 mb-6 border border-gray-300 rounded-lg text-gray-800 font-medium">
            Get Started
          </button>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>2 Corpus Bot</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>1500 queries</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Maximum of 100 docs/webpages or 50M doc storage per DenserBot</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>REST Api</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>30 days query log retention</span>
            </li>
          </ul>
        </div>

        
        <div className="bg-white border-2 border-purple-500 rounded-xl p-6 shadow-lg relative">
          
          <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-gradient-to-r from-[#DFC9FF] to-[#BF56FF] px-4 py-1 rounded-full text-white text-sm font-medium flex ">
           <span><img src="/Achievements/fire-fill 1.svg" alt='fire-logo'/></span> Most Popular
          </div>
          
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Standard</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">$119</p>
          <p className="text-gray-500 mb-4">Good for small team.</p>
          
          <button className="w-full py-2 mb-6 bg-purple-500 text-white rounded-lg font-medium shadow-md">
            Get Started
          </button>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>4 Corpus Bot</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>7500 queries</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Maximum of 2000 docs/webpages or 1G doc storage per DenserBot</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>REST Api</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>30 days query log retention</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Remove "powered by Corpus.ai" label</span>
            </li>
          </ul>
        </div>

        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Business</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">$399</p>
          <p className="text-gray-500 mb-4">Perfect for businesses.</p>
          
          <button className="w-full py-2 mb-6 border border-gray-300 rounded-lg text-gray-800 font-medium">
            Get Started
          </button>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>8 DenserBots</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>15000 queries</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Maximum of 10000 docs/webpages or 5G doc storage per Corpus Bot</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>REST Api</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>365 days query log retention</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Remove "powered by Corpus.ai" label</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Dedicated accuracy support</span>
            </li>
          </ul>
        </div>
      </div>

      
      <div className="mt-12 bg-gray-900 rounded-xl p-8 text-white">
  <div className="max-w-4xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-center md:text-left">
        <h3 className="text-2xl font-bold mb-4">Enterprise Plan</h3>
        <p className="text-gray-300 mb-6 md:mb-0">
          Need a custom solution? Let's work together to create the perfect package for your organization.
        </p>
      </div>
      <div>
        <button className="w-full md:w-[182px] h-[54px] bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] px-6 py-3 rounded-full font-medium transition hover:opacity-90">
          Contact Sales
        </button>
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default PricingSection;