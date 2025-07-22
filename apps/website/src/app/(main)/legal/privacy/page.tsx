// apps/website/src/app/legal/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-transparent overflow-x-hidden">
      {/* Hero Section */}
      <section className="text-center px-4 pt-[120px] pb-8">
        <div className="inline-flex items-center text-sm font-medium rounded-full px-1 py-1 gap-2 shadow-sm bg-white mb-8">
          <span className="bg-[#C458FF] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            LEGAL
          </span>
          <span className="text-gray-700">
            Privacy Policy
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-inter text-gray-900 leading-tight mb-6">
          Privacy <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">Policy</span>
        </h1>
        
        <p className="mt-4 text-[#7F7A7A] max-w-2xl mx-auto text-base sm:text-lg mb-8">
          Learn how we collect, use, and protect your personal information.
        </p>
      </section>

      {/* Content Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">
                  This Privacy Policy has been prepared by Corpus AI ("we," "our," or "us"). We are committed to protecting and maintaining the privacy of our users when visiting our website or interacting with us electronically.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  This policy outlines how we handle personal data collected from you or provided by you through our website or social media platforms. We ensure that your information is kept secure and that we fully comply with all relevant data protection laws and regulations. Please read this policy carefully to understand how we collect, use, and protect your information. By submitting your information to us, you accept and consent to the practices described in this policy.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Information We May Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may collect, store, and use the following types of personal information from individuals who visit and interact with our website or social media channels:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1. Information You Provide</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may provide us with personal details by filling out forms on our website or through direct communication. This includes, but is not limited to, your name and email address when submitting a contact or inquiry form.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the collected information in the following ways:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>To provide you with the information, services, or support you request from us.</li>
                  <li>To contact you in response to inquiries or messages you submit.</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Data Storage and Disclosure</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Any information you provide may be emailed directly to us or stored securely on our servers.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not rent, sell, or share your personal data with third parties or unaffiliated entities.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We will take all reasonable steps to ensure that your data is not disclosed to any governmental or regulatory body unless we are legally obligated to do so.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Please note:</strong> While we strive to protect your personal data, data transmission over the internet is not entirely secure. Any transmission is done at your own risk. Once your data is received, we apply strict procedures and security measures to prevent unauthorized access.
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Your Rights: Access to Your Data</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the legal right to access and confirm the lawful processing of your personal data ("Subject Access Request"). You may submit a request in writing to support@corpusai.io.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may need to request additional information to locate your data and respond appropriately. We will respond within the timeframes stipulated by applicable data protection laws.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you are dissatisfied with how we have handled your data, you have the right to file a complaint with your local data protection authority.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Any updates or changes to this Privacy Policy will be posted on this page. Where necessary, you will be notified via email. We recommend checking this page regularly to stay informed about any changes.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions, comments, or requests regarding this Privacy Policy, please contact us at:
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