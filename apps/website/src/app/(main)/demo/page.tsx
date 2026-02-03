// apps/website/src/app/demo/page.tsx
'use client';

import { InlineWidget } from "react-calendly";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-transparent overflow-x-hidden">
      {/* Hero Section */}
      <section className="text-center px-4 pt-[120px] pb-16">
        <div className="inline-flex items-center text-sm font-medium rounded-full px-1 py-1 gap-2 shadow-sm bg-white mb-8">
          <span className="bg-[#C458FF] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            DEMO
          </span>
          <span className="text-gray-700">
            Schedule Your Free Consultation
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-inter text-gray-900 leading-tight mb-6">
          Book a <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">Demo</span> with Our Team
        </h1>
        
        <p className="mt-4 text-[#7F7A7A] max-w-2xl mx-auto text-base sm:text-lg mb-12">
          Ready to see Corpus AI in action? Schedule a personalized 30-minute demo 
          and discover how our AI-powered chatbot can transform your business.
        </p>

        {/* Benefits List */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#BF56FF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Personalized Walkthrough</h3>
                <p className="text-[#7F7A7A] text-sm">See how Corpus AI works with your specific use case</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#BF56FF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Live Q&A Session</h3>
                <p className="text-[#7F7A7A] text-sm">Get all your questions answered by our experts</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#BF56FF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Custom Strategy</h3>
                <p className="text-[#7F7A7A] text-sm">Learn implementation strategies for your business</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendly Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Preferred Time</h2>
              <p className="text-[#7F7A7A]">Select a convenient 30-minute slot for your demo</p>
            </div>
            
            <div className="calendly-container">
              <InlineWidget
                url="https://calendly.com/hamzafayaz002/corpus-ai"
                styles={{
                  height: '920px',
                  minWidth: '320px',
                }}
                pageSettings={{
                  backgroundColor: 'ffffff',
                  hideEventTypeDetails: false,
                  hideLandingPageDetails: false,
                  primaryColor: 'BF56FF',
                  textColor: '4d5055'
                }}
                prefill={{
                  name: '',
                  email: '',
                  customAnswers: {
                    a1: 'Corpus AI Demo Request'
                  }
                }}
                utm={{
                  utmCampaign: 'Demo Booking',
                  utmSource: 'Website',
                  utmMedium: 'Demo Page'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Can't find a suitable time?
          </h3>
          <p className="text-[#7F7A7A] mb-6">
            No worries! Reach out to us directly and we'll find a time that works for you.
          </p>
          <a
            href="mailto:hamzafayaz@corpusai.com"
            className="inline-flex items-center justify-center bg-white border-2 border-[#BF56FF] text-[#BF56FF] hover:bg-[#BF56FF] hover:text-white font-medium px-6 py-3 rounded-full transition duration-200"
          >
            Contact Us Directly
          </a>
        </div>
      </section>
    </main>
  );
}