
import B2BFeatureCard from '@/app/components/B2BFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';
import FAQSection from '@/app/components/FAQsection';
import Navbar from '@/app/components/navbar';
import SolutionFAQ from '@/app/components/SolutionFAQ';


const features = [
  {
    icon: (
      <div className="wrap rounded-full border-2 border-purple-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign size-6 text-primary" aria-hidden="true"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      </div>
    ),
    title: 'Lead Generation',
    description: 'Convert website visitors into qualified leads. Our B2B chatbot engages prospects, qualifies them through intelligent conversations, and seamlessly hands them off to your sales team.',
    highlight: false,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-headphones size-6 text-primary" aria-hidden="true"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path></svg>
    ),
    title: '24/7 Support',
    description: 'Provide round-the-clock support to your B2B clients. Handle inquiries, troubleshoot issues, and maintain client satisfaction with our always-available chatbot solution.',
    highlight: true,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles h-6 w-6 text-primary" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
    ),
    title: 'Seamless Integration',
    description: 'Integrate with your existing CRM, sales tools, and business systems. Our B2B chatbot works harmoniously with your tech stack to streamline operations and data flow.',
    highlight: false,
  },
];

const reasons = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-purple-500" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>,
    title: 'Intelligent Conversations',
    description: 'Advanced AI that understands complex B2B queries and provides accurate, contextual responses based on your business knowledge base.'
  },
  {
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Always Available',
    description: '24/7 automated support for your global B2B clients, ensuring no inquiry goes unanswered regardless of time zones.'
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-6 w-6 text-purple-500" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>,
    title: 'Multi-Language Support',
    description: 'Break language barriers with automatic translation capabilities, enabling seamless communication with international B2B partners.'
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-line h-6 w-6 text-purple-500" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>,
    title: 'Scalability',
    description: 'Handle increasing website traffic and chat volumes while maintaining consistent performance. Perfect for growing WordPress sites of any size.'
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6 text-purple-500" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    title: 'Enterprise Integration',
    description: 'Seamless integration with your existing B2B tools - CRM, ERP, help desk, and more for streamlined business processes.'
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket h-6 w-6 text-purple-500" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>,
    title: 'Scalable Solution',
    description: 'Grow your B2B communications effortlessly. Handle increasing chat volumes while maintaining consistent quality and response times.'
  },
];


const b2BFaq = [
  {
    question: "How can a B2B chatbot benefit my enterprise?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question: "Can the chatbot integrate with our existing business tools?",
    answer: "Yes, our B2B chatbot is designed to integrate seamlessly with common business tools including CRM systems, help desk software, and enterprise resource planning (ERP) systems. This ensures smooth data flow and consistent operations across your business processes.",
  },
  {
    question: "How does the B2B chatbot handle complex business queries?",
    answer: "Our B2B chatbot uses advanced AI to understand and respond to complex business queries. For highly specific or sensitive matters, it can seamlessly escalate to human agents while maintaining context. The bot learns from interactions to continuously improve its responses.",
  },
  {
    question: "Is the B2B chatbot secure for enterprise use?",
    answer: "Yes, our B2B chatbot is built with enterprise-grade security. It includes data encryption, secure authentication, and compliance with major security standards. You can also configure access controls and data handling policies to match your security requirements.",
  },
  {
    question: "Can we customize the chatbot for our specific industry?",
answer: "Absolutely. Our B2B chatbot is highly customizable to your industry, business processes, and brand voice. You can train it on your specific products, services, and industry terminology to ensure accurate and relevant responses to your business clients."
  },
];

export default function B2BChatBotPage() {
  // const [tab, setTab] = useState('Web');
  return (

        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
        {/* Left Section */}
        <div className="flex-1 flex flex-col items-start justify-center text-left max-w-lg">
          <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">Enterprise Solutions</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-zinc-900">
            Trustworthy<br />
            B2B Chatbot<br />
            for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Enterprises</span>
          </h1>
          <p className="text-zinc-500 mb-8 text-base sm:text-lg">
            A powerful, AI-driven chatbot built to help B2B organizations automate inquiries, gather leads, and increase customer satisfaction—24/7.
          </p>
          <button className="bg-purple-500 text-white rounded-full px-7 py-3 text-base font-semibold shadow-md hover:bg-purple-600 transition">Get Started</button>
        </div>
        {/* Right Section: Chat Card */}
        <div className="flex-1 p-4 md:p-12  rounded-2xl border border-purple-200 flex items-center justify-center">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-4 w-full max-w-md border border-white/40">
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
              <div data-aos="fade-up" data-aos-duration="200" className="self-start bg-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[80%]">Hi! How can I help you today?</div>
              <div data-aos="fade-up" data-aos-duration="400" className="self-end bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] rounded-lg px-4 py-2 text-sm max-w-[80%]">I'd like to learn more about your enterprise solutions.</div>
              <div data-aos="fade-up" data-aos-duration="600" className="self-start bg-white border border-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm">
                I'd be happy to help! Our enterprise solutions include:<br />
                <ul className="list-disc pl-5 mt-1">
                  <li>24/7 Customer Support</li>
                  <li>Multi-language Support</li>
                  <li>Custom Integration</li>
                </ul>
              </div>
            </div>
            {/* Input Box */}
            <div className="flex items-center gap-2 mt-16">
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
      <section data-aos="fade" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-[130px]">
        <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Enterprise-Grade B2B Chat<br className='hidden sm:block'/> Solutions</h2>
        <div className="w-full flex flex-col  md:flex-row items-center justify-center gap-3 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <B2BFeatureCard key={i} icon={f.icon} title={f.title} description={f.description}/>
          ))}
        </div>
      </section>

      {/* 3 Steps Section */}
      <section data-aos="fade" data-aos-duration="600" className="w-full bg-[#F9F0FF] flex flex-col items-center pt-[80px] pb-[63px]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">Build Your B2B Chatbot in 3 Steps</h2>
        <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-10 px-2 sm:px-4">
          {/* Left: Card with Tabs and Form */}
          <img className='' src="/assets/addChatBotImage.svg" alt="" />
          {/* Right: Setup Info */}
          <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
            <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Setup</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Configure Your Knowledge Base</h3>
            <p className="text-zinc-500 text-base sm:text-lg">A powerful, AI-driven chatbot built to help B2B organizations automate inquiries, gather leads, and increase customer satisfaction—24/7.</p>
          </div>
        </div>
      </section>

      {/* Customize Section */}
      <section data-aos="fade-left" data-aos-duration="600"  className="w-full bg-[#F9F0FF] flex max-w-7xl px-12 flex-col lg:flex-row items-center justify-center pt-[63px] pb-[63px]  mx-auto">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-start justify-center max-w-lg mb-10 lg:mb-0">
          <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Customize</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Customize Your Bot</h3>
          <p className="text-zinc-500 text-base sm:text-lg">A powerful, AI-driven chatbot built to help B2B organizations automate inquiries, gather leads, and increase customer satisfaction—24/7.</p>
        </div>
        {/* Right: Glass Card with Form and Chat Preview */}
        <img src="/assets/custom.svg" alt="custom-integration-img" />
      </section>

      {/* Deploy & Scale Section */}
      <section className="w-full  bg-[#F9F0FF]  pt-[63px] pb-[150px] max-w-7xl px-4">
        <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between'>
        {/* Left: Integrations Card */}
        <img className='w-1/2' src="/assets/integrate.svg" alt="" />
        {/* Right: Text */}
        <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
          <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Launch</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Deploy & Scale</h3>
          <p className="text-zinc-500 text-base sm:text-lg">Launch your B2B chatbot across multiple channels - website, messaging platforms, and more. Monitor performance, gather insights, and scale your automated B2B communications.</p>
        </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-[150px] mb-10 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black text-center mb-12">Why Choose Corpus AI for B2B</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {reasons.map((r, i) => (
            <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
          ))}
        </div>
      </section>
      <section className='mt-20'><SolutionFAQ faqs={b2BFaq} title='FAQ' subtitle='B2B Chatbot FAQ'/></section>
      <section className="text-center px-4 pt-[56px] pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Trustworthy Chat with<span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> Your Data</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto text-base sm:text-lg">
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
};

