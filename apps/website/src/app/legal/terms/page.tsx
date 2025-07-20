// apps/website/src/app/legal/terms/page.tsx
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-transparent overflow-x-hidden">
      {/* Hero Section */}
      <section className="text-center px-4 pt-[120px] pb-8">
        <div className="inline-flex items-center text-sm font-medium rounded-full px-1 py-1 gap-2 shadow-sm bg-white mb-8">
          <span className="bg-[#C458FF] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            LEGAL
          </span>
          <span className="text-gray-700">
            Terms of Service
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-inter text-gray-900 leading-tight mb-6">
          Terms of <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">Service</span>
        </h1>
        
        <p className="mt-4 text-[#7F7A7A] max-w-2xl mx-auto text-base sm:text-lg mb-8">
          Please read these terms carefully before using Corpus AI services.
        </p>
      </section>

      {/* Content Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using Corpus AI's website and services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our platform.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Use of Services</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Eligibility</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You must be at least 18 years of age to use our services. By using Corpus AI, you confirm that you meet this age requirement.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">User Account</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To access certain features, you may be required to create a user account. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Acceptable Use</h3>
                <p className="text-gray-700 leading-relaxed">
                  You agree to use the platform in compliance with all applicable laws and regulations. You must not engage in any activity that could harm Corpus AI, its users, or the integrity of the platform.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Intellectual Property</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Ownership</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All intellectual property related to the platform—including software, content, trademarks, and branding—is the sole property of Corpus AI.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">License</h3>
                <p className="text-gray-700 leading-relaxed">
                  We grant you a limited, non-exclusive, non-transferable license to access and use Corpus AI's services for lawful personal or commercial use, in accordance with these Terms.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Privacy</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Data Collection</h3>
                <p className="text-gray-700 leading-relaxed">
                  Corpus AI collects and processes personal data as described in our Privacy Policy. By using our services, you consent to the collection and use of your data in accordance with our policy.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Disclaimer of Warranties</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are provided on an "as-is" and "as-available" basis. Corpus AI makes no warranties or representations regarding the reliability, availability, or suitability of the platform for any particular purpose.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  To the fullest extent permitted by law, Corpus AI and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from or related to the use of our services.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to update or modify these Terms of Service at any time. Significant changes will be communicated through appropriate channels. Continued use of the platform after such changes constitutes your acceptance of the revised terms.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  Corpus AI reserves the right to suspend or terminate your access to the platform, with or without notice, for any violation of these Terms of Service or any applicable law.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Service shall be governed by and construed in accordance with the laws of the United States. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in the United States.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions or concerns about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-[#BF56FF] font-medium">📧 support@corpusai.io</p>
                </div>
              </div>

              <div className="text-center mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}