"use client"
import B2BFeatureCard from '@/app/components/B2BFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';
import Image from 'next/image';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';
import HeroLeftSide from '@/app/components/HeroLeftSide';
import HeroRightSide from '@/app/components/HeroRightSide';
import SolutionFAQ from '@/app/components/SolutionFAQ';
const ZAPIER_INTEGRATION_IMG = '/integration-images/zapier-integration.svg';
const ZAPIER_CONFIGURE_IMG = '/integration-images/zapier-configure.svg';
const GO_LIVE_IMG = '/integration-images/go-live.svg';

const features = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Automated Workflows',
    description: `Say goodbye to repetitive tasks! By delegating routine inquiries, data syncing, and notifications to the Corpus Zapier chatbot, you'll free up valuable time to focus on what really matters.`,
    highlight: false,
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2 lucide-share-2 size-6 text-primary" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
    ),
    title: 'Seamless Integration',
    description: `No coding is required! In just a few minutes, you can effortlessly connect CorpusAI to over 6,000 applications on the Zapier platform, streamlining your workflows with automation.`,
    highlight: false,
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
    ),
    title: 'User-Friendly Setup',
    description: `Whether users reach out through social media, email, or your website, your Zapier AI chatbot is always ready to deliver fast, personalized responses, helping you create an exceptional customer experience.`,
    highlight: false,
  },
];
  
  const reasons = [
    {
      icon: (
        
        <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"/>
</svg>

      
      ),
      title: 'Slack Integration',
      description: 'Automatically answer Slack questions by setting triggers and actions, mapping responses back to channels for smooth communication.'
    },
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text size-6 text-primary" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
        
      ),
      title: 'Google Sheets Logger',
      description: 'Log chat interactions by setting CorpusAI as trigger and Google Sheets as action. Map chatbot outputs to sheet columns.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-messages-square h-6 w-6" aria-hidden="true"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
      ),
      title: 'Corpus Chat as Trigger',
      description: 'Use chatbot responses to trigger app actions: log responses, create tickets, and send notifications based on responses.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
      ),
      title: 'Lead Generation',
      description: 'Automatically capture leads from chats, send to CRM, trigger emails, or create follow-up tasks in sales tools.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
      
      ),
      title: 'Corpus Chat as Action',
      description: 'Trigger your chatbot from other apps: auto-answer Slack, process forms, and respond to social mentions.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-6 w-6" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
      
      ),
      title: 'Multi-Language Support',
      description: 'Support over 80 languages to engage a global audience and deliver automated multilingual support across diverse regions.'
    },
  ];
  
const HeroLeftSideContent = {
  tagText: 'Zapier Integration',
  title1: 'CorpusChat:',
  title2: 'Zapier Chatbot',
  paragraph: 'Easily connect your Corpus chatbot to over 6,000 apps through Zapier integration, automating repetitive tasks and streamlining your workflows.'
}

const HeroRightSideContent = {
  logo: 'zapierLogo.svg',
  msg1: 'Hello! I can help you automate workflows with Zapier integration.',
  msg2: 'How can I connect CorpusAI to Slack?',
  msg3: `I\'ll guide you through the Slack integration:<br/>• Set up Slack trigger<br/>• Configure CorpusAI action<br/>• Map responses to channel`
}
const EducationFAQ = [
  {
    question: "What is a Zapier Chatbot?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question:"Is there customer support for setting up my Zapier Chatbot?",
    answer: "Before starting, ensure you have: An existing Corpus.ai chatbot (Create one using our Website Chatbot or File Chatbot guides), a Zapier account, and access to the applications you want to integrate. Follow our step-by-step guide to connect CorpusAI to your Zapier workflows in minutes!",
  },
  {
    question: "What do I need to set up CorpusAI on Zapier?",
    answer: "Absolutely! Our team is here to help you make the most of your Zapier AI chatbot integration. Whether you need technical assistance or advice on optimizing workflows, we're just a message away.",
  },
  {
    question: "What kind of tasks can the Corpus chatbot automate in Zapier?",
    answer: "Yes, CorpusAI integrated with Zapier supports over 80 languages, allowing you to engage with a global audience. Whether you're managing customer inquiries or automating workflows, the multilingual feature ensures you can offer personalized and seamless support to clients from diverse regions.",
  },
  {
    question: "Does CorpusAI's Zapier bot support multiple languages?",
    answer: "Zapier chatbot can automate various tasks to improve workflow efficiency. For example, it can automatically respond to messages in Slack by processing text and posting replies directly to channels. It can also log chat interactions into Google Sheets by creating a new row for every conversation, allowing you to track customer inquiries seamlessly.",
  },
  
];


export default function Zapier(){
  useEffect(() => {
    AOS.init({
      duration: 0, // Animation duration
      once: true,    // Whether animation should happen only once
    });
  }, []);
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br bg-transparent px-2 sm:px-4 py-8">
          
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
            {/* Left Section */}
            <HeroLeftSide tagText = {HeroLeftSideContent.tagText} title1 = {HeroLeftSideContent.title1} title2 = {HeroLeftSideContent.title2} paragraph = {HeroLeftSideContent.paragraph}  />
            
            {/* Right Section: Chat Card */}
            <HeroRightSide logo={HeroRightSideContent.logo} msg1={HeroRightSideContent.msg1} msg2={HeroRightSideContent.msg2}  msg3={HeroRightSideContent.msg3}/>
          </div>
          {/* Features Section */}
          <section data-aos="fade-up" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-10">Boost Your Business Efficiency with Zapier <br /> Chatbot Integration</h2>
            <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <B2BFeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
              ))}
            </div>
          </section>
    
          
          
             {/* Reason section */}
            <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-12">Integrations Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl gap-[22px]">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
          
          
          <section  className="w-full flex flex-col items-center mt-20 mb-10">
            <div data-aos="fade-up" data-aos-duration="600">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-12">How to Build a No-Code Zapier Chatbot</h2>
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
              
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={ZAPIER_INTEGRATION_IMG} width={300} height={300} alt="Slack Integration" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>

              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Setup Integration</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Log in to your Zapier account, click Create Zap, and search for CorpusAI. Choose your trigger or action event and connect your Corpus Chat account using your API key.</p>
              </div>
            </div>
            </div>
         

           {/*Slack Auth section*/}
           <div data-aos="fade-left" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Configure</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Configure Workflow</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Configure your workflow steps by selecting triggers and actions. Map data between apps and set up the automation rules according to your needs.</p>
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={ZAPIER_CONFIGURE_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
            </div>
          </div>

          <div data-aos="fade-right" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
            <div className="flex-1 flex items-center justify-center w-full">
                <Image src={GO_LIVE_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm-max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Test</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Test and Deploy</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Test your integration to ensure everything works as expected. Once satisfied, turn on your Zap and start automating your workflows.</p>
              </div>
              
            </div>
          </div>
          </section>
    
           <section>
                <div>
      {/* Your other content */}
      <SolutionFAQ
        faqs={EducationFAQ}
        title="FAQ"
        subtitle="Zapier Integration FAQ"
      />
    </div>

</section>
           <section className="text-center px-4 pt-[56px] pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Ready to Add<span> AI Power to</span><br/><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> Your Workflows?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
          Start integrating CorpusAI with Zapier today and discover the power of automated communication!
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