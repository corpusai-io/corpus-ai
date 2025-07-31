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



const TELEGRAM_INTEGRATION_IMG = '/integration-images/telegram-integration.svg';
const TELEGRAM_CONNECT_IMG = '/integration-images/telegram-connect.svg';
const TELEGRAM_CHANNEL_IMG = '/integration-images/telegram-channel.svg';

const features = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Fast, Frictionless Setup',
    description: `Get started in just a few steps — no developer needed. With lightweight permissions and intuitive setup, your chatbot can be live on Telegram in minutes.`,
    highlight: false,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-messages-square h-6 w-6" aria-hidden="true"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
    ),
    title: 'Instant Chat Engagement',
    description: `Let users interact with your chatbot directly in Telegram — no need for extra platforms or logins. Your bot responds instantly to questions in group chats or DMs, providing a seamless support experience.`,
    highlight: false,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text size-6 text-primary" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
        
    ),
    title: 'Knowledge Access',
    description: `Let users interact with your chatbot directly in Telegram — no need for extra platforms or logins. Your bot responds instantly to questions in group chats or DMs, providing a seamless support experience.`,
    highlight: false,
  },
];
  
  const reasons = [
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
      
      ),
      title: 'Multi-Chat Management',
      description: 'Easily link your bot to multiple Telegram chats or communities and manage all interactions from one central dashboard.'
    },
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
       
        
      ),
      title: 'Seamless Interactions',
      description: 'Integrated directly into Telegram groups, your bot joins the conversation naturally—answering questions or guiding users.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-messages-square h-6 w-6" aria-hidden="true"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
      ),
      title: 'Secure Permissions',
      description: 'Telegram integration requires only basic access to function—keeping user data safe and your privacy protected.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
      ),
      title: 'Instant Personal Replies',
      description: 'Your Telegram bot can respond directly in private chats, offering fast and focused support without the noise of public channels.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2 lucide-share-2 size-6 text-primary" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
       
      
      ),
      title: 'Structured Answers',
      description: 'CorpusAI’s Telegram replies are concise, contextual, and easy to follow—making knowledge instantly accessible across your conversations.'
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
  tagText: 'Telegram Integration',
  title1: 'CorpusChat:',
  title2: 'Chatbot for Telegram',
  paragraph: 'Integrate your CorpusAI chatbot with Telegram to deliver instant, knowledge-based answers in private chats or group conversations. Just send a message to your bot, and it will respond with accurate insights from your connected sources.'
}

const HeroRightSideContent = {
  logo: 'telegram-logo.png',
  msg1: 'Hey there! Ready to connect your chatbot to Telegram? Let\'s make sure you\'ve already set up your CorpusAI bot.',
  msg2: 'Yes, my bot is ready to go. What\'s the next step?',
  msg3: `Awesome! Just follow these quick steps:<br/>• Find the Telegram integration tile<br/>• Select the Telegram integration<br/>• Hit Install and grant the necessary permissions<br/><br/>Once that\'s done, you can chat with your bot directly on Telegram — in groups or one-on-one!`
}

const EducationFAQ = [
  {
    question: "Do I need anything before connecting my bot to Telegram?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question:"How do I link my CorpusAI chatbot to my Telegram bot?",
    answer: "Absolutely. Once added to a group or messaged directly, your bot can respond with helpful, accurate answers drawn from your connected knowledge base.",
  },
  {
    question: "Will the bot work in group chats and private messages?",
    answer: "Yes. You can configure your bot to respond only to admins or specific users via your Telegram bot settings or by adjusting your CorpusAI chatbot behavior.",
  },
  {
    question: "Can I limit who the bot responds to in Telegram?",
    answer: "Yes! The integration process is fully visual and requires no coding. Just copy your token, paste it in, and you're ready to go.",
  },
  {
    question: "Is setup really no-code?",
    answer: `You can disconnect your Telegram bot anytime from the Integrations panel in your CorpusAI dashboard. This won’t delete your chatbot or knowledge base.`,
  },
  
];


export default function Telegram(){
  useEffect(() => {
    AOS.init({
      duration: 0, // Animation duration
      once: true,    // Whether animation should happen only once
    });
  }, []);
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8">
          
          <div className="flex mt-8 lg:mt-12 flex-col md:flex-row items-center justify-between  w-full max-w-6xl gap-10 md:gap-16">
            {/* Left Section */}
            <HeroLeftSide tagText = {HeroLeftSideContent.tagText} title1 = {HeroLeftSideContent.title1} title2 = {HeroLeftSideContent.title2} paragraph = {HeroLeftSideContent.paragraph}  />
            
            {/* Right Section: Chat Card */}
            <HeroRightSide logo={HeroRightSideContent.logo} msg1={HeroRightSideContent.msg1} msg2={HeroRightSideContent.msg2}  msg3={HeroRightSideContent.msg3}/>
          </div>
          {/* Features Section */}
          <section data-aos="fade-up" data-aos-duration="600" className="w-full max-w-7xl flex flex-col items-center mt-20 lg:mt-32 mb-10">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Benefits of Corpus AI Telegram Integration</h2>
            <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <B2BFeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
              ))}
            </div>
          </section>
    
          
          
             {/* Reason section */}
            <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">Key Integration Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto place-items-center">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
          
          
          <section  className="w-full flex flex-col items-center bg-[#F9F0FF] pt-20 pb-10">
            <div data-aos="fade-up" data-aos-duration="600">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-12">Simple Steps to Integrate with Telegram</h2>
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
              
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={TELEGRAM_INTEGRATION_IMG} width={300} height={300} alt="Slack Integration" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>

              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 1</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Access Integration Settings</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Open your chatbot dashboard, go to the Integrations tab, and select Telegram to begin setup.</p>
              </div>
            </div>
            </div>
         

           {/*Slack Auth section*/}
           <div data-aos="fade-left" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
            
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 2</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Connect Your Telegram Bot</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Paste your bot token from @BotFather, authorize connection, and confirm the bot name and icon.</p>
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={TELEGRAM_CONNECT_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
              
            </div>
          </div>

          <div data-aos="fade-right" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
            <div className="flex-1 flex items-center justify-center w-full">
                <Image src={TELEGRAM_CHANNEL_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Setup 3</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Start Using in Channels</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Invite your bot to any Telegram group or message it directly. Users can ask questions and get instant replies based on your knowledge base.</p>
              </div>
              
            </div>
          </div>
          </section>
    
          
          <section>
                <div className='mt-16'>
      {/* Your other content */}
      <SolutionFAQ
        faqs={EducationFAQ}
        title="FAQ"
        subtitle="Telegram Integration FAQ"
      />
    </div>

</section>
           <section className="text-center px-4 mt-[56px] lg:mt-32 pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Ready to Add<span> AI Power to</span><br/><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> Your Telegram?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
          Download our Telegram plugin today and start automating your workspace communication!
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