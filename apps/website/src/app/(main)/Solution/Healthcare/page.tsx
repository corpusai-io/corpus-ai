import EducationFeatureCard from '@/app/components/EducationFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';

import SolutionFAQ from '@/app/components/SolutionFAQ';
const features = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Complete Patient Analysis',
    description: 'Instantly analyze patient histories, lab results, medications, and previous treatments. Our chatbot helps doctors quickly identify patterns and potential concerns across years of medical records.',
    highlight: false,
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-headphones size-6 text-primary" aria-hidden="true"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path></svg>
    ),
    title: 'Clinical Decision Support',
    description: 'Access evidence-based recommendations and medical guidelines relevant to each case. The chatbot cross-references patient data with current medical literature to suggest appropriate diagnostic paths.',
    highlight: true,
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap size-6 text-primary" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path><path d="M22 10v6"></path><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path></svg>
    ),
    title: 'Risk Assessment',
    description: 'Evaluate potential complications and risk factors by analyzing patient data against clinical databases. This helps doctors identify high-risk patients and prioritize interventions.',
    highlight: false,
  },
];

const reasons = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
    ),
    title: 'Advanced Analysis',
    description: 'Process complex medical histories and clinical data to give doctors clear patient insights and evidence-based recommendations.'
  },
  {
   icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
    ),
    title: 'Pattern Recognition',
    description: 'Spot trends and correlations in patient data often missed in routine reviews, aiding doctors in making informed clinical decisions.'
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]" >
 <path d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 18.5L14.5 17M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2ZM15.5 14.5C15.5 16.433 13.933 18 12 18C10.067 18 8.5 16.433 8.5 14.5C8.5 12.567 10.067 11 12 11C13.933 11 15.5 12.567 15.5 14.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>

    ),
    title: 'Literature Integration',
    description: "Access and analyze relevant medical research and clinical guidelines while reviewing patient cases for evidence-based decision making."
  },
  {
    icon: (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]">
 <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Precision Medicine',
    description: "Tailor treatment recommendations based on individual patient histories, genetic factors, and response patterns to previous interventions."
  },
  {
    icon: (
       <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]">
 <path d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Collaborative Care',
    description: 'Share insights with healthcare teams and specialists to ensure coordinated care based on comprehensive patient data.'
  },
  {
    icon: (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]">
 <path d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Treatment Monitoring',
    description: 'Track treatment effectiveness and patient progress, with alerts for concerning trends or potential complications.'
  },
];

const EducationFAQ = [
  {
    question: "How does the AI assistant help with clinical decision-making?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question: "What types of medical data can the system process?",
    answer: "The system can process diverse medical data including lab results, imaging reports, medication histories, clinical notes, vital signs, and research literature. This comprehensive analysis helps provide a complete picture for clinical decision-making.",
  },
  {
    question:`What makes Corpus' clinical AI assistant different from other solutions?`,
    answer: "Our system uniquely combines advanced RAG technology with medical knowledge processing, enabling real-time analysis of patient data against current medical literature and clinical guidelines. This provides doctors with contextually relevant insights and evidence-based recommendations specific to each patient case.",
  }
];

export default function Healthcare(){
    
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-20">
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
            {/* Left Section */}
            <div className="flex-1 flex flex-col items-start justify-center text-left max-w-lg">
              <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">Medical Solutions</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4 text-[#000000]">
                AI-powered

<br />
        Clinical Assistant

 <br />for
 <span className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#BF56FF]"> Medical Professionals
</span>
              </h1>
              <p className="text-[#7F7A7A] mb-8 text-base sm:text-lg">
                Enhance clinical decisions with our AI medical assistant—offering instant access to patient histories, lab results, and medical literature for smarter diagnostics and treatments.
              </p>
              <button className="bg-[#BF56FF] text-white rounded-full px-6 py-3 text-base font-medium shadow-md  ">Get Started</button>
            </div>
            {/* Right Section: Chat Card */}
            <div className="flex-1 bg-[#FCF6FF] p-4 md:p-12 rounded-2xl border border-purple-200 flex items-center justify-center w-full">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md border border-white/40">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500 text-white rounded-md p-2 flex items-center justify-center text-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot w-4 h-4 text-white" aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                  </div>
                  <div className="wrap flex gap-2 items-center">
                  <span className="font-semibold text-zinc-800 text-lg">AI Assistant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-4 text-purple-500" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  </div>
                </div>
                {/* Chat Bubbles */}
                <div className="flex flex-col gap-2 mb-4">
                  <div data-aos="fade-up" data-aos-duration="200" className="self-start bg-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[80%]">Reviewing patient #247's history. What specific information would you like to know, Dr. Smith?</div>
                  <div data-aos="fade-up" data-aos-duration="400" className="self-end bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] rounded-lg px-4 py-2 text-sm max-w-[80%]">Show me their recent cardiac symptoms and medication history.</div>
                  <div data-aos="fade-up" data-aos-duration="600" className="self-start mt-2 bg-zinc-100 border border-zinc-100 text-[#1E1E1E] rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm">
                    <span className='font-bold'>Patient #247 Summary:</span><br/>
                    <br/>History: Hypertension (2020), Type 2 Diabetes Symptoms: Chest pain, shortness of breath, nocturnal dyspnea <br/>Meds: Metformin 1000mg, Lisinopril 10mg<br/> Note: BP rising over last 3 visits<br/><br/><span className='font-bold'>Next Steps:</span><br/><br/>Cardiac stress test<br/> Adjust BP meds<br/> Cardiology referral
                  </div>
                </div>
                {/* Input Box */}
                <div className="flex items-center gap-2 mt-10">
                  <input disabled
                    type="text"
                    className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 placeholder-zinc-400"
                    placeholder="Ask about anything"
                  />
                  <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-md py-2 px-3 transition flex items-center justify-center">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Features Section */}
          <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 lg:mt-32 mb-10">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 text-center mb-10">How AI Chatbot Assists Medical <br className='hidden sm:block'/> Professionals</h2>
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <EducationFeatureCard key={i} icon={f.icon} title={f.title} description={f.description}  />
              ))}
            </div>
          </section>
    
         
         <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#000000] text-center mb-12">Why Choose Corpus Chat for Clinical Practice?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
    
          {/* Deploy & Scale Section */}
         <div className='bg-[#F9F0FF] mt-10 lg:mt-20 px-4 pb-7 md:pb-10'>
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center pl-7 pr-2 justify-center  mt-20 mb-10 mx-auto max-w-7xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">How It Works</h2>
          <div className="flex flex-col lg:flex-row md:justify-between items-center justify-center w-full  gap-10">
            {/* Left: Card with Tabs and Form */}
            <img className='order-2 lg:order-1 lg:w-1/2' src="/assets/healthcare 1.png" alt="" />
            {/* Right: Setup Info */}
            <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0 order-1">
              <span className="mb-2 px-2 py-1 rounded-full  text-purple-500 text-sm font-medium inline-block">Step 1</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Data Integration</h3>
              <p className="text-zinc-500 text-base sm:text-lg">Seamlessly integrate with your existing systems to gather comprehensive patient records, lab results, imaging data, and clinical notes into a unified knowledge base.</p>
            </div>
          </div>
        </section>
  
        {/* Analyze Section */}
        <section data-aos="fade-left" data-aos-duration="500" className="w-full overflow-x-hidden pl-7 pr-2 flex flex-col lg:flex-row items-center justify-center mt-2 mb-10 max-w-7xl mx-auto">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0">
            <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Step 2</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Secure Deployment</h3>
            <p className="text-zinc-500 text-base sm:text-lg">Deploy Corpus Chat in your secure healthcare environment, protecting sensitive patient information while maintaining high performance.
</p>
          </div>
          {/* Right: Image Card */}
          <div className="flex-1 flex items-center justify-center">
            <img src="/assets/healthcare 2.png" alt="Chatbot Build Status" className="w-full" />
          </div>
        </section>
  
        {/* Chat Section */}
      <section
  data-aos="fade-right"
  data-aos-duration="500"
  className="w-full flex flex-col-reverse lg:flex-row gap-8 px-6 items-center justify-between mt-20 mb-10 max-w-7xl mx-auto"
>
   <img
    src="/assets/healthcare 3.png"
    alt="Is Corpusbot Free?"
    className="mb-10 lg:mb-0 lg:w-1/2"
  />
  {/* Text first in DOM */}
  <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0">
    <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Step 3</span>
    <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Clinical Support</h3>
    <p className="text-zinc-500 text-base sm:text-lg">
      Medical professionals can quickly access and analyze patient histories, receive evidence-based recommendations, and make informed clinical decisions with AI assistance.
    </p>
  </div>

  {/* Image second in DOM */}
 
</section>
          </div>
            <section>
                <div className='mt-12'>
      {/* Your other content */}
      <SolutionFAQ
        faqs={EducationFAQ}
        title="FAQ"
        subtitle="Healthcare AI Assistant FAQ"
      />
    </div>

</section>
          {/* Why Choose Section */}
          
         
          <section className="text-center px-4 mt-[56px] lg:mt-32 pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Ready to Transform <br/><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> Your Health Care Portal?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
          Contact us to see how Corpus Chat can transform medical information access, improve patient care, and <br/>streamline workflows!
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