import React from 'react';
import SolutionFAQ from '@/app/components/SolutionFAQ';

export default function AffiliateBenefits() {
  const benefits = [
    {
      title: '30% Commission',
      description: 'Earn a 30% commission on every sale you refer to Corpus.ai.',
    },
    {
      title: '60-Day Cookie Period',
      description: `Our 60-day cookie period ensures you get credited for sales even if they don’t happen immediately after the referral.`,
    },
    {
      title: 'Seamless Integration',
      description: 'Easily promote Corpus with our comprehensive marketing materials and resources.',
    },
    {
      title: 'Innovative AI Solutions',
      description: 'You will be introducing cutting-edge technology to your audience by promoting our products.',
    },
  ];
const EducationFAQ = [
  {
    question: "How much commission can I earn?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question:"Is there a minimum payout threshold?",
    answer: "Yes, we have a minimum payout threshold of $50. Once your commissions reach this threshold, you'll be eligible for a payout.",
  },
  {
    question: "How do I track my referrals and commissions?",
    answer: "Upon signing up for our affiliate program, you'll receive access to a personalized dashboard where you can track your referrals, clicks, and commissions in real-time.",
  },
  {
    question: "Can I promote Corpus products through paid advertising?",
    answer: "No, we do not allow affiliates to promote Corpus.ai products through paid advertising channels such as Google Ads or Facebook Ads. However, you can promote our products through organic channels such as your website, blog, social media, or email newsletter.",
  },
  
];

  return (
    
    <div className="bg-transparent py-16">
        <div className="flex-1 flex flex-col items-start px-4 md:px-0  justify-center text-center mt-10 w-full mx-auto max-w-7xl">
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl mx-auto font-semibold leading-tight mb-4 text-black">
                Be our affiliate.<br />
                <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#BF56FF] bg-clip-text text-transparent mx-auto">
                Earn 30% Commission
                </span>
              </h1>
              <p className="text-[#7F7A7A] mb-8 mx-auto text-base sm:text-lg">
                Join our affiliate program and start earning passive income today! Corpus.ai offers cutting-edge <br/>AI-powered solutions, and we're excited to partner with you to spread the word.
              </p>
              <button className="bg-[#BF56FF] text-white rounded-full px-4 py-3 text-base  mx-auto shadow-md">Join Our Affliate Program</button>
            </div>
      <div className="max-w-5xl mx-auto px-4 text-center mt-[252px]">
        <h2 className="text-3xl font-semibold mb-12">Why Become our Affiliate?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((item, idx) => (
            <div
              key={idx}
              className="border border-[#F0F0F0] rounded-lg p-6 text-left shadow-sm hover:shadow-md transition group hover:border-[#BF56FF]"
            >
              <div className="mb-4">
                
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 font-base group-hover:text-[#BF56FF]">
 <path d="M15.0002 15.0001V9.00005M15.0002 9.00005H9.00019M15.0002 9.00005L9.00019 14.9999M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='font-light '/>
 </svg>
                 
            
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-[#BF56FF]">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 text-center mt-[192px]">
        <h2 className="text-3xl font-semibold mb-[25px]">How Do I Get Started?</h2>
        <p className="text-[#7F7A7A] mx-auto text-base sm:text-lg">
            Becoming an affiliate is easy and it only takes a few minutes.
        </p>
       </div>
       <div className="w-full max-w-7xl mx-auto px-5 py-10">
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-[69px]">

  <div className="group border border-[#F0F0F0] rounded-md relative p-5 hover:scale-105 transition duration-300 hover:shadow-md ">
    <svg
      width="71"
      height="139"
      viewBox="0 0 71 139"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 left-0 ml-4 mt-2 blink-on-group-hover "
    >
      <defs>
        <linearGradient id="gradient1" x1="35.8515" y1="22.701" x2="35.8462" y2="145.286" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D8D6D6" />
          <stop offset="0.520824" stopColor="#E5E5E5" stopOpacity="0.479176" />
          <stop offset="1" stopColor="#F7F7F7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        opacity="0.8"
        d="M23.0304 35.3718L0 36.459V66.082H41.2258V139H71V0H41.2258V16.2972C41.2258 21.8634 38.7971 27.1526 34.5755 30.7803C31.3466 33.555 27.283 35.1711 23.0304 35.3718Z"
        fill="url(#gradient1)"
      />
    </svg>
    <div className="relative z-10 mt-20 ml-2 flex flex-col gap-2 ">
      <h3 className="font-semibold text-lg">Sign Up</h3>
      <p className="text-sm text-gray-600">Register for our affiliate program and receive your unique referral link.</p>
    </div>
  </div>

 
  <div className="group border border-[#F0F0F0] rounded-md relative p-5 hover:scale-105 transition duration-300 hover:shadow-md bg-white">
    <svg
      width="103"
      height="134"
      viewBox="0 0 103 134"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 left-0 mt-2 ml-4 blink-on-group-hover"
    >
      <defs>
        <linearGradient id="gradient2" x1="51.5" y1="16.1978" x2="48.7228" y2="131.423" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D8D6D6" />
          <stop offset="0.653999" stopColor="#E6E5E5" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FFFCFC" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        opacity="0.8"
        d="M6.72617 31.8093L4.79157 39.1414H32.879C34.3257 30.6883 42.6624 25.2558 50.9797 27.3463L53.0181 27.8586L56.3415 28.7655C65.7179 31.3242 71.6992 40.4911 70.2644 50.104C69.5192 55.0965 66.8362 59.594 62.7972 62.6216L0 109.693L2.20714 134H102.805L103 109.693H41.5588L86.6345 75.2039C96.8223 67.4088 102.302 54.9347 101.151 42.1584C100.667 36.7752 99.0203 31.5611 96.326 26.8755L94.1427 23.0786C91.3268 18.1817 87.6334 13.8451 83.2473 10.2856C75.0478 3.63164 64.8094 0 54.2497 0H48.0171C39.8825 0 31.9171 2.3234 25.0581 6.69681C16.009 12.4667 9.46418 21.4323 6.72617 31.8093Z"
        fill="url(#gradient2)"
        fillOpacity="0.8"
      />
    </svg>
    <div className="relative z-10 mt-20 ml-2 flex flex-col gap-2">
      <h3 className="font-semibold text-lg">Promote</h3>
      <p className="text-sm text-gray-600">Promote corpus.ai using your unique referral link and marketing materials.</p>
    </div>
  </div>

 
  <div className="group border border-[#F0F0F0] rounded-md relative p-5 hover:scale-105 transition duration-300 hover:shadow-md bg-white">
    <svg
      width="91"
      height="156"
      viewBox="0 0 91 156"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 left-0 ml-4 mt-2 blink-on-group-hover"
    >
      <defs>
        <linearGradient id="gradient3" x1="45.5" y1="33.4848" x2="39.5165" y2="147.469" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D8D6D6" />
          <stop offset="0.515567" stopColor="#E5E5E5" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFFCFC" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M1.88411 29.7342L0 37.0237H26.0258L26.0542 36.8542C27.4722 28.3966 34.7929 22.201 43.3687 22.201C45.3771 22.201 47.3707 22.5457 49.2626 23.2199L51.5432 24.0328C58.2149 26.4106 62.6698 32.7277 62.6698 39.8105C62.6698 47.4101 57.5535 54.0573 50.207 56.0024L26.3421 62.3209L26.0258 89.1335L48.6261 95.0442C54.3714 96.5468 58.7576 101.193 59.9268 107.016L60.0514 107.636C60.6363 110.549 60.2549 113.573 58.965 116.249C58.3363 117.554 57.5039 118.75 56.4992 119.793L53.2352 123.181C50.2882 126.24 46.1929 127.969 41.9452 127.969C33.2448 127.969 26.1685 120.824 26.3421 112.125H0V140.156L26.0258 156H46.4037L75.3349 141.871C77.6466 140.742 79.6796 139.115 81.2877 137.107C86.081 131.121 89.2088 123.976 90.3548 116.394L90.6317 114.562C90.8769 112.94 91 111.301 91 109.661C91 97.1043 83.8304 85.6503 72.5364 80.1635L64.2918 76.1581L73.9815 70.0385C84.4317 63.4387 90.3172 51.5521 89.2309 39.2401C88.8186 34.5663 87.4141 30.0341 85.1113 25.946L82.7144 21.6908C80.1569 17.1506 76.788 13.1181 72.7752 9.79382C65.1342 3.46388 55.5231 0 45.6007 0H40.281C32.5998 0 25.084 2.23058 18.6464 6.42077C10.3431 11.8254 4.36339 20.1421 1.88411 29.7342Z"
        fill="url(#gradient3)"
        fillOpacity="0.8"
      />
    </svg>
    <div className="relative z-10 mt-20 ml-2 flex flex-col gap-2">
      <h3 className="font-semibold text-lg">Earn</h3>
      <p className="text-sm text-gray-600">Earn a 30% commission on every sale you refer to Corpus.ai.</p>
    </div>
  </div>

</div>

</div>
 <section>
    <div>
      
      <SolutionFAQ
        faqs={EducationFAQ}
        title="FAQ"
        subtitle="Affiliate Terms"
      />
    </div>

</section>
  <section className="text-center px-4 pt-[56px] pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Trustworthy Chat with <span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> Your Data</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
         Verifiable answers from PDFs, websites, and beyond with source highlights.
        </p>

        
        <div className="mt-[24px] flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="#"
            className="hover:bg-gradient-to-r from-[#FC5990] to-[#AC5DE6]  text-black  border-[#E0E0E0] shadow font-medium px-6 py-2 border rounded-[15px] w-full sm:w-auto "
          >
            Get Started for Free
          </a>
        </div>
      </section>

    </div>
  );
}
