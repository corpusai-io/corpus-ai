'use client';
import { useState, useEffect } from 'react';

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const achievements = [
    {
      metric: "1.8x",
      title: "Customer Satisfaction",
      description: "Improved customer experience",
      delay: "0ms"
    },
    {
      metric: "1.5x",
      title: "Boost Sales", 
      description: "Increased conversion rates",
      delay: "100ms"
    },
    {
      metric: "80%",
      title: "Operation Costs Saved",
      description: "Reduced operational expenses", 
      delay: "200ms"
    },
    {
      metric: "2x",
      title: "Lead Generation",
      description: "Enhanced lead capture",
      delay: "300ms"
    }
  ];

  return (
    <div className="bg-transparent text-gray-800 relative">
      <section className="text-center py-16 px-4 max-w-7xl mx-auto relative z-10">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase tracking-wide">Deployment</h4>
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">Easy to Deploy Your Chatbot</h2>
        <p className="mb-12 text-[#8D8D8D] max-w-2xl mx-auto">Create a powerful AI chatbot with Corpus AI in minutes – no technical expertise required.</p>

        {/* Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-20 sm:gap-10 mb-20 mx-10">
          {[
            {
              title: 'Import your data',
              desc: 'Import your content from websites, documents, or Google Drive. Our system processes and organizes your data for optimal chatbot performance.',
              step: '01'
            },
            {
              title: 'Customize your chatbot', 
              desc: 'Personalize your chatbot using our intuitive builder. Customize the appearance with your logo and brand colors to create a seamless user experience.',
              step: '02'
            },
            {
              title: 'Deployment',
              desc: 'Deploy your chatbot across multiple platforms including your website and other platforms. Choose from various integration options for maximum flexibility.',
              step: '03'
            },
          ].map((item, i) => (
            <div key={i} className="text-left relative group">
              <div className="mb-6 flex items-center justify-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#BF56FF] to-[#D0A8E9] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-black">{item.title}</h3>
              </div>
              <p className="text-[#8D8D8D] mb-4 leading-relaxed">{item.desc}</p>
              <a href="#" className="text-[#BF56FF] hover:text-[#a843e6] font-medium text-sm inline-flex items-center group/link transition-colors">
                Read More 
                <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Achievement Metrics */}
        {/* <div className="relative">
          
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="blob absolute top-10 left-10 bg-[#BF56FF] opacity-10 blur-3xl rounded-full w-72 h-72"></div>
            <div className="blob2 absolute bottom-10 right-10 bg-[#D0A8E9] opacity-15 blur-3xl rounded-full w-96 h-64"></div>
            <div className="blob5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#CE89FC] opacity-8 blur-3xl rounded-full w-80 h-80"></div>
          </div>

          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Proven Results That Drive Success
            </h3>
            <p className="text-[#8D8D8D] max-w-xl mx-auto text-lg">
              Join thousands of businesses achieving remarkable growth with Corpus AI
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`
                  relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm
                  hover:bg-white/80 hover:border-[#BF56FF]/30 transition-all duration-500
                  transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                  hover:scale-[1.02] group cursor-pointer shadow-lg hover:shadow-xl
                `}
                style={{ 
                  transitionDelay: isVisible ? achievement.delay : '0ms'
                }}
              >
                <div className="relative p-8 text-center">
                 
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#BF56FF] to-[#D0A8E9] bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                    {achievement.metric}
                  </div>
                  
                 
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-[#BF56FF] transition-colors duration-300">
                    {achievement.title}
                  </h4>
                  
                 
                  <p className="text-sm text-[#8D8D8D] leading-relaxed">
                    {achievement.description}
                  </p>

                 
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#BF56FF] to-[#D0A8E9] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

              
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#BF56FF]/10 to-[#D0A8E9]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>


        </div> */}
      </section>
    </div>
  );
}