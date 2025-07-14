import EducationFeatureCard from '@/app/components/EducationFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';
import CustomerCareFAQ from '@/app/components/CustomerCareFAQ';
import SolutionFAQ from '@/app/components/SolutionFAQ';

const features = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Service Automation',
    description: `Some government chatbots handle over a million monthly interactions, simplifying complex processes by breaking them into steps and tailoring guidance to citizens’ responses.`,
    highlight: false,
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
    ),
    title: 'Cost Saving',
    description: "The local government chatbot efficiently handles high query volumes, easing agent workload, reducing operational costs, and enabling better resource allocation for complex tasks.",
    highlight: true,
  },
  {
    icon: (
       <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]">
 <path d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Citizen Satisfaction',
    description: 'Offering 24/7 instant, personalized responses, the local government chatbot quickly resolves concerns, cuts wait times, and gathers feedback to improve services.',
    highlight: false,
  },
 
];

const reasons = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
    ),
    title: 'NLP-Powered Bot',
    description: 'Residents receive fast, efficient answers through a natural, conversational interface that easily scales and adapts to their needs.'
  },
  {
   icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
    ),
    title: 'Scalability',
    description: 'Corpus Chat processes hundreds of thousands of web pages and handles high interaction volumes for local governments of all sizes.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>

    ),
    title: 'Privacy & Confidentiality',
    description: "Secure government data with robust measures and private cloud deployment, keeping sensitive information confidential."
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe size-6 text-primary" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
    ),
    title: 'Multilingual Support',
    description: "Supporting 80+ languages, our government chatbot handles queries in multiple languages, helping governments engage more citizens."
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]">
 <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Data-Driven Decisions',
    description: 'Chatbots help governments make informed decisions by analyzing citizen behavior, preferences, and needs to guide data-driven strategies.'
  },
  {
    icon: (
       <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-globe size-6 text-primary">
 <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Seamless Integration',
    description: 'Our government chatbot seamlessly integrates with websites and multiple data formats, providing real-time access to essential information.'
  },
];


const EducationFAQ = [
  {
    question: "How scalable is your chatbot for different government departments?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question:"How do you ensure the chatbot's responses are accurate and reliable?",
    answer: "",
  },
  {
    question: "How do you ensure the chatbot's performance during high-traffic periods?",
    answer: "",
  },
  {
    question: "Can the chatbot be used to guide citizens through complex government processes?",
    answer: "",
  },
  
];

export default function Government(){
   
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-20">
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
            {/* Left Section */}
            <div className="flex-1 flex flex-col items-start justify-center text-left max-w-lg">
              <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">Government Solutions</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4 text-[#000000]">
                Human-Centered

<br />
        Chatbot



 <br />for
 <span className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#BF56FF]"> Government
</span>
              </h1>
              <p className="text-[#7F7A7A] mb-8 text-base sm:text-lg">
                Transform citizen-government interaction with our AI chatbot—handling everything from tax inquiries to permit applications, boosting engagement and improving public services.
              </p>
              <button className="bg-[#BF56FF] text-white rounded-full px-6 py-3 text-base font-medium shadow-md  ">Get Started</button>
            </div>
            {/* Right Section: Chat Card */}
            <div className="flex-1 p-4 md:p-12 rounded-2xl border border-purple-200 flex items-center justify-center w-full">
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
                  <div data-aos="fade-up" data-aos-duration="200" className="self-start bg-zinc-100 text-[#1E1E1E] rounded-lg px-4 py-2 text-sm max-w-[80%]">How can I assist you with workplace operations today?</div>
                  <div data-aos="fade-up" data-aos-duration="400" className="self-end bg-purple-100 text-[#1E1E1E] rounded-lg px-4 py-2 text-sm max-w-[80%]">I need help accessing the employee vacation policy.</div>
                  <div data-aos="fade-up" data-aos-duration="600" className="self-start bg-[#F0F0F0] border border-zinc-100 text-[#1E1E1E] rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm">
                    <span className='font-medium'>I'll help you find the vacation policy document:</span><br/>
                    <br/>• Retrieving policy from knowledge base<br/>• You can access it at the HR portal?<br/> • Would you like me to summarize the key points
                  </div>
                </div>
                {/* Input Box */}
                <div className="flex items-center gap-2 mt-20">
                  <input
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
          <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-20">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 text-center mb-10">Why Does the Government Need a<br className='hidden sm:block'/>  Chatbot?</h2>
            <div className="w-full grid grid-cols-1  md:grid-cols-3 items-stretch justify-center gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <EducationFeatureCard key={i} icon={f.icon} title={f.title} description={f.description}  />
              ))}
            </div>
          </section>
    
         
         <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-20 max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#000000] text-center mb-12">Why Choose Our Local Government Chatbot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
    
          {/* Deploy & Scale Section */}
          
         <section data-aos="fade-right" data-aos-duration="600" className="w-full flex bg-[#F9F0FF] flex-col gap-4 md:gap-8 lg:justify-between  lg:flex-row items-center justify-center pt-20 pb-10 max-w-7xl mx-auto">
           
            {/* Left: Integrations Card */}
            <img className=' ' src="/assets/Government 1.png" alt="" />
            {/* Right: Text */}
            <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
              <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-[#BF56FF] text-sm font-medium inline-block">Step 1</span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">Ingest</h3>
              <p className="text-[#7F7A7A] text-base font-medium sm:text-lg">The Corpus AI chatbot helps gather and parse all relevant documents and web pages from your government portal.</p>
            </div>
          </section>

           <section data-aos="fade-right" data-aos-duration="600" className="w-full flex bg-[#F9F0FF] flex-col gap-4 md:gap-8 lg:justify-between  lg:flex-row items-center justify-center pt-20 pb-10 max-w-7xl mx-auto">
           
            {/* Left: Integrations Card */}
           
            {/* Right: Text */}
            <div className="flex-1 flex flex-col items-start ml-3 justify-center max-w-lg">
              <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-[#BF56FF] text-sm font-medium inline-block">Step 2</span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">Deploy</h3>
              <p className="text-[#7F7A7A] text-base font-medium sm:text-lg">After ingesting the knowledge, you can deploy Denser Chat to your website—whether internally or externally—with just a few lines of code.</p>
            </div>
            <img className=' ' src="/assets/Group 1321315412.png" alt="" />
          </section>

          <section data-aos="fade-right" data-aos-duration="600" className="w-full flex bg-[#F9F0FF] flex-col gap-4 md:gap-8 lg:justify-between  lg:flex-row items-center justify-center pt-20 pb-10 max-w-7xl mx-auto">
           
            {/* Left: Integrations Card */}
            <img className=' ' src="/assets/Group 1321315410.png" alt="" />
            {/* Right: Text */}
            <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
              <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-[#BF56FF] text-sm font-medium inline-block">Step 3</span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">Ask Away</h3>
              <p className="text-[#7F7A7A] text-base font-medium sm:text-lg">Citizens and staff simply type their questions—Corpus Chat delivers fast and accurate answers.</p>
            </div>
          </section>
            <section>
                <div>
      {/* Your other content */}
      <SolutionFAQ
        faqs={EducationFAQ}
        title="FAQ"
        subtitle="Government Chatbot FAQ"
      />
    </div>

</section>
          {/* Why Choose Section */}
          
         
          <section className="text-center px-4 pt-[56px] pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Ready to Transform <br/><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> your Public Portal?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
          Contact us today to see how Corpus Chat can revolutionize information access for your community!
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