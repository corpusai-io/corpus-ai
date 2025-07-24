"use client"
import B2BFeatureCard from '@/app/components/B2BFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';
import HeroLeftSide from '@/app/components/HeroLeftSide';
import HeroRightSide from '@/app/components/HeroRightSide';
import SolutionFAQ from '@/app/components/SolutionFAQ';
import Image from 'next/image';
import 'aos/dist/aos.css';
import AOS from 'aos';

import { useEffect } from 'react';



const INTEGRATE_SLACK_IMG = '/integration-images/integrate-slack.svg';
const SLACK_AUTH_IMG = '/integration-images/slack-auth.svg';
const CHANNEL_IMAGE_IMG = '/integration-images/channel-image.svg';

const features = [
  {
    icon: (
      
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
      
    ),
    title: 'Minimal Setup Required',
    description: 'Quick and simple integration process with minimal permissions required. Start using your chatbot in Slack within minutes of installation, with no delays or complicated configuration steps involved.',
    highlight: false,
  },
  {
    icon: (
      
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-messages-square size-6 text-primary" aria-hidden="true"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
      
    ),
    title: 'Direct Channel Access',
    description: 'Ask questions directly in any Slack channel by mentioning @CorpusAI. Get instant, helpful responses as threaded replies, keeping conversations organized, searchable, and accessible for everyone on your team.',
    highlight: true,
  },
  {
    icon: (
      
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text size-6 text-primary" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
      
    ),
    title: 'Info Base Integration',
    description: 'Quick integration process with minimal permissions required. Start using your chatbot in Slack within minutes of installation, with no complicated setup, technical hurdles, or additional configuration needed.',
    highlight: false,
  },
];
  
  const reasons = [
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
      
      ),
      title: 'Smart Responses',
      description: 'Get accurate answers based on your knowledge base directly within Slack conversations.'
    },
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        
      ),
      title: 'Minimal Permissions',
      description: 'CorpusAI requests only essential permissions to operate in your Slack workspace, ensuring security and privacy.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-messages-square h-6 w-6" aria-hidden="true"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
      ),
      title: 'Threaded Responses',
      description: 'All responses appear in threads, keeping your channels organized and conversations easy to follow.'
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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2 lucide-share-2 size-6 text-primary" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
      ),
      title: 'Workspace Flexibility',
      description: 'Choose which workspace to integrate with and easily manage multiple workspace connections.'
    },
    {
      icon: (
        <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z"/>
      </svg>
      ),
      title: 'Easy Updates',
      description: 'Automatic plugin updates through WordPress ensure you always have the latest features and security improvements.'
    },
  ];
  
const HeroLeftSideContent = {
  tagText: 'Slack Integration',
  title1: 'CorpusChat:',
  title2: 'Chatbot for Slack',
  paragraph: 'Integrate your CorpusAI chatbot with Slack channels to provide instant answers and support. Simply mention @CorpusAI in any channel to get accurate responses based on your knowledge base.'
}

const HeroRightSideContent = {
  logo: 'slackLogo.svg',
  msg1: 'Hi! I noticed you want to set up Slack integration. Have you already created your CorpusAI chatbot?',
  msg2: 'Yes, I have my chatbot ready. How do I connect it to Slack?',
  msg3: `Perfect! Here’s how to connect:<br/> 
              • Go to your chatbot’s Integrations page<br />
              • Find the Slack integration tile<br />
              • Click Install and authorize access<br />
              <br />
              After setup, just mention <b>@CorpusAI</b> in any channel to ask questions!`
}
const EducationFAQ = [
  {
    question: "What do I need before integrating with Slack?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question:"How do I use the chatbot in Slack?",
    answer: "Simply create a message starting with @CorpusAI followed by your question in any Slack channel. The chatbot will respond within the message thread in a few seconds.",
  },
  {
    question: "How can I test the integration?",
    answer: "We recommend creating a dedicated test channel to avoid disturbing other users. You can ask questions and verify the chatbot's responses in this channel.",
  },
  {
    question: "What permissions does the integration require?",
    answer: "CorpusAI requests minimal permissions to access your Slack workspace. You can review all requested permissions during the authorization process.",
  },
  {
    question: "How do I remove the Slack integration?",
    answer: "You can easily revoke the integration by clicking the red 'Uninstall' button on the Slack integration tile. This will remove the chatbot's access to your workspace.",
  },
  
];


export default function Slack(){
  useEffect(() => {
    AOS.init({
      duration: 0, // Animation duration
      once: true,    // Whether animation should happen only once
    });
  }, []);
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8">
          
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-10 md:gap-16">
            {/* Left Section */}
            <HeroLeftSide tagText = {HeroLeftSideContent.tagText} title1 = {HeroLeftSideContent.title1} title2 = {HeroLeftSideContent.title2} paragraph = {HeroLeftSideContent.paragraph}  />
            
            {/* Right Section: Chat Card */}
            <HeroRightSide logo={HeroRightSideContent.logo} msg1={HeroRightSideContent.msg1} msg2={HeroRightSideContent.msg2}  msg3={HeroRightSideContent.msg3}/>
          </div>
          {/* Features Section */}
          <section data-aos="fade-up" data-aos-duration="600" className="w-full flex flex-col items-center max-w-6xl mt-20 mb-10">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Benefits of CorpusAI Slack Integration</h2>
            <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <B2BFeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
              ))}
            </div>
          </section>
    
          
          
             {/* Reason section */}
            <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center  mt-20 mb-10  max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">Key Integration Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl gap-[22px]">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
          
          {/*Slack Integraion section*/}
          <section  className="w-full flex max-w-7xl flex-col items-center bg-[#F9F0FF] pt-20 pb-10">
            <div data-aos="fade-up" data-aos-duration="600">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-12">Simple Steps to Integrate with Slack</h2>
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
            <div className="flex-1 flex items-center justify-center w-full">
                <Image src={INTEGRATE_SLACK_IMG} width={300} height={300} alt="Slack Integration" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 1</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Access Integration Settings</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Navigate to your chatbot&apos;s main screen and select Integrations to find the Slack integration tile.</p>
              </div>
              
            </div>
            </div>
         

           {/*Slack Auth section*/}
           <div data-aos="fade-left" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 2</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Install and Authorize</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Click the Install button on the Slack tile and authorize access on the Slack authentication page. Choose your workspace if you have multiple options.</p>
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={SLACK_AUTH_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
            </div>
          </div>

          <div data-aos="fade-right" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
            <div className="flex-1 flex items-center justify-center w-full">
                <Image src={CHANNEL_IMAGE_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 3</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Start Using in Channels</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Create a message starting with @CorpusAI followed by your question in any Slack channel. Receive responses within the message thread.</p>
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
        subtitle="Slack Integration FAQ"
      />
    </div>

</section>
           <section className="text-center px-4 pt-[56px] pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Ready to Add<span> AI Power to</span><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> your Slack?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
          Download our Slack plugin today and start automating your workspace communication!
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