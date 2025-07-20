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

const WHATSAPP_INTEGRATION_IMG = '/integration-images/whatsapp-integration.svg';
const WHATSAPP_CONNECT_IMG = '/integration-images/whatsapp-connect.svg';
const GO_LIVE_IMG = '/integration-images/go-live.svg';

const features = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
        
    ),
    title: 'Unified Knowledge Access',
    description: 'Link your documents, website content, or uploaded files to your chatbot. Users can access accurate, context-aware answers without leaving WhatsApp, effectively bringing your knowledge base to their fingertips.',
    highlight: false,
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      
    ),
    title: 'Quick and Easy Setup',
    description: 'Get your chatbot live on WhatsApp in minutes with no coding required. Our intuitive setup process and lightweight permissions make integration a breeze, even for non-technical users.',
    highlight: false,
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
    ),
    title: 'Fast Customer Engagement',
    description: 'Let users interact with your chatbot directly on WhatsApp—the world’s most popular messaging app—for instant, seamless support with no extra apps or logins needed.',
    highlight: false,
  },
];
  
  const reasons = [
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
      
      ),
      title: 'Instant Personal Replies',
      description: 'Your WhatsApp bot delivers tailored responses in private chats, providing fast, focused support for individual users.'
    },
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
       
        
      ),
      title: 'Smooth Group Dynamics',
      description: 'Add your bot to WhatsApp groups to answer questions, guide discussions, or support teams, blending naturally into group conversations.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
       
      ),
      title: 'No-Code Management',
      description: 'Connect and configure your WhatsApp bot without writing a single line of code. Manage everything through Corpus AI’s user-friendly dashboard.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
      ),
      title: 'Secure Permissions',
      description: 'The WhatsApp integration requires only essential permissions to operate, ensuring user data privacy and compliance with WhatsApp’s policies.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-messages-square h-6 w-6" aria-hidden="true"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
        
       
      
      ),
      title: 'Multi-Chat Management',
      description: 'Link your bot to multiple WhatsApp chats or groups and manage all interactions from a centralized Corpus AI dashboard.'
    },
   
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
       
      ),
      title: 'Contextual Responses',
      description: 'Corpus AI’s WhatsApp replies are concise, relevant, and powered by your documents, making knowledge accessible and easy to understand.'
    },
  ];
  
const HeroLeftSideContent = {
  tagText: 'WhatsApp Integration',
  title1: 'CorpusChat:',
  title2: 'WhatsApp Integration',
  paragraph: 'Integrate your Corpus AI chatbot with WhatsApp to deliver instant, document-based answers in private or group chats—just message the bot for accurate, knowledge-driven responses right in WhatsApp.'
}

const HeroRightSideContent = {
  logo: 'whatsapp-logo.svg',
  msg1: `Hey there! Ready to connect your chatbot to WhatsApp? Let's ensure your Corpus AI bot is set up and ready to go.`,
  msg2: `Yes, my bot is ready. What's the next step?`,
  msg3: `Get started in minutes:<br/><br/>• Open the Integrations tab in your Corpus AI dashboard.<br/>• Select WhatsApp and click Install.<br/>• Connect your WhatsApp Business API account.<br/><br/>Your bot is now ready to chat in private and group conversations!`
}
const EducationFAQ = [
  {
    question: " Do I need anything before connecting my bot to WhatsApp?",
    answer: `You’ll need a WhatsApp Business API account and a Corpus AI chatbot set up with your documents or knowledge base.`,
  },
  {
    question:" How do I link my Corpus AI chatbot to WhatsApp?",
    answer: `Go to your chatbot’s Integrations page, select Whatsapp, and paste in your Whatsapp bot token. After authorizing, your bot will be ready to respond to users in Whatsapp.`,
  },
  {
    question: "Will the bot work in group chats and private messages?",
    answer: "Absolutely. Once added to a group or messaged directly, your bot can respond with helpful, accurate answers drawn from your connected knowledge base.",
  },
  {
    question: "Can I limit who the bot responds to on WhatsApp?",
    answer: "Yes. You can configure your bot to respond only to admins or specific users via your Whatsapp bot settings or by adjusting your CorpusAI chatbot behavior.",
  },
  {
    question: "Is setup really no-code?",
    answer: "Yes! The integration process is fully visual and requires no coding. Just copy your token, paste it in, and you're ready to go.",
  },
  
];


export default function Whatsapp(){
  useEffect(() => {
    AOS.init({
      duration: 0, // Animation duration
      once: true,    // Whether animation should happen only once
    });
  }, []);
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8">
          
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
            {/* Left Section */}
            <HeroLeftSide tagText = {HeroLeftSideContent.tagText} title1 = {HeroLeftSideContent.title1} title2 = {HeroLeftSideContent.title2} paragraph = {HeroLeftSideContent.paragraph}  />
            
            {/* Right Section: Chat Card */}
            <HeroRightSide logo={HeroRightSideContent.logo} msg1={HeroRightSideContent.msg1} msg2={HeroRightSideContent.msg2}  msg3={HeroRightSideContent.msg3}/>
          </div>
          {/* Features Section */}
          <section data-aos="fade-up" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Benefits of Corpus AI Whatsapp <br />Integration</h2>
            <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <B2BFeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
              ))}
            </div>
          </section>
    
          
          
             {/* Reason section */}
            <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-12">Key Integration Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl gap-[22px]">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
          
          
          <section  className="w-full flex flex-col items-center mt-20 mb-10">
            <div data-aos="fade-up" data-aos-duration="600">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-12">Simple Steps to Integrate with Whatsapp</h2>
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
              
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={WHATSAPP_INTEGRATION_IMG} width={300} height={300} alt="Slack Integration" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>

              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 1</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Access Integration Settings</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Open your Corpus AI chatbot dashboard, navigate to the Integrations tab, and select WhatsApp to start the setup process.</p>
              </div>
            </div>
            </div>
         

           {/*Slack Auth section*/}
           <div data-aos="fade-left" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
            
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 2</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Connect Your WhatsApp Business API</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Sign up for a WhatsApp Business API account through Meta’s Business Manager. Enter your API credentials in the Corpus AI dashboard to authorize the connection.</p>
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={WHATSAPP_CONNECT_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
              
            </div>
          </div>

          <div data-aos="fade-right" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
            <div className="flex-1 flex items-center justify-center w-full">
                <Image src={GO_LIVE_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 3</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Start Engaging on WhatsApp</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Add your bot to WhatsApp groups or share its number for direct messaging. Users can ask questions, and your bot will respond instantly with insights from your connected documents.</p>
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
        subtitle="WhatsApp Integration FAQ"
      />
    </div>

</section>
           <section className="text-center px-4 pt-[56px] pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Ready to Transform<br/><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> Your WhatsApp with AI?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
          Download our Whatsapp plugin today and start automating your workspace communication!
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