"use client"
import B2BFeatureCard from '@/app/components/B2BFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';
import SolutionFAQ from '@/app/components/SolutionFAQ';
import Image from 'next/image';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';
import HeroLeftSide from '@/app/components/HeroLeftSide';
import HeroRightSide from '@/app/components/HeroRightSide';

const WORDPRESS_INTEGRATION_IMG = '/integration-images/wordpress-integration.svg';
const CONFIGURE_CHATBOT_IMG = '/integration-images/configure-chatbot.svg';
const GO_LIVE_IMG = '/integration-images/go-live.svg';

const features = [
  {
    icon: (
      
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
      
    ),
    title: 'Simple Installation',
    description: 'Get started in just a few steps — no developer needed. With lightweight permissions and intuitive setup, your chatbot can be live on Telegram in minutes.',
    highlight: false,
  },
  {
    icon: (
      
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
      
    ),
    title: 'Public Access Ready',
    description: 'Set up your chatbot for public visitors with easy security configuration and enable seamless, intuitive interaction for all website users across various devices and platforms.',
    highlight: true,
  },
  {
    icon: (
      
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      
    ),
    title: 'Flexible Configuration',
    description: 'Choose where your chatbot appears: all pages, homepage only, or specific pages by ID. Gain perfect control over your chatbots presence and user interaction experience site-wide.',
    highlight: false,
  },
];
  
  const reasons = [
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
      
      ),
      title: 'Trustworthy AI Responses',
      description: 'AI provides answers with verifiable sources, ensuring every response can be traced back to your official documentation and knowledge base.'
    },
    {
      icon: (
        
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        
      ),
      title: 'Location Control',
      description: 'Choose exactly where your chatbot appears with three options: all pages, homepage only, or specific pages by ID.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-line h-6 w-6" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
      ),
      title: 'Scalability',
      description: 'Handle increasing website traffic and chat volumes while maintaining consistent performance. Perfect for growing WordPress sites of any size.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
      ),
      title: 'Public Access',
      description: 'Enable public mode for anonymous visitors to interact with your chatbot seamlessly across your website.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text size-6 text-primary" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
      ),
      title: 'No Code Required',
      description: 'Skip manual code embedding with our WordPress plugin. Simple installation process works with any WordPress site.'
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
  tagText: 'WordPress Integration',
  title1: 'CorpusChat:',
  title2: 'WordPress Plugin',
  paragraph: 'Seamlessly integrate your CorpusAI chatbot with WordPress using our official plugin. No code embedding required—just install, activate, and configure.'
}

const HeroRightSideContent = {
  logo: 'wordpressLogo.svg',
  msg1: 'Hello! Do you already have a CorpusAI chatbot created?',
  msg2: 'Yes, I have my chatbot ID ready. How do I add it to WordPress?',
  msg3: `Perfect! Here's how to integrate:
  <br/>

        • Install Corpus plugin from WordPress 
        <br/>
        • Activate the plugin
        <br/>
        • Enter your chatbot ID in Settings`
}

const EducationFAQ = [
  {
    question: "What do I need before installing the WordPress plugin?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question:"How do I configure where the chatbot appears?",
    answer: "In the plugin settings, you can choose between three options: All Pages, Home Page Only, or Specific Pages. For specific pages, you can list page IDs separated by commas.",
  },
  {
    question: "Can anonymous visitors use the chatbot?",
    answer: "Yes, but you need to set the chatbot mode to 'public' in your Corpus Security configuration. This allows public visitors to interact with the chatbot on your website.",
  },
  {
    question: "Is coding knowledge required for installation?",
    answer: "No coding knowledge is required. The plugin can be installed directly from WordPress or uploaded as a ZIP file, with simple point-and-click configuration.",
  },
  {
    question: "How do I find my Corpus Chatbot ID?",
    answer: "You can find your chatbot ID in your Corpus account. This ID needs to be entered in the plugin settings to connect your WordPress site with your specific chatbot.",
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
          
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
            {/* Left Section */}
            <HeroLeftSide tagText = {HeroLeftSideContent.tagText} title1 = {HeroLeftSideContent.title1} title2 = {HeroLeftSideContent.title2} paragraph = {HeroLeftSideContent.paragraph}  />
            
            {/* Right Section: Chat Card */}
            <HeroRightSide logo={HeroRightSideContent.logo} msg1={HeroRightSideContent.msg1} msg2={HeroRightSideContent.msg2}  msg3={HeroRightSideContent.msg3}/>
          </div>
          {/* Features Section */}
          <section data-aos="fade-up" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-10">Easy WordPress Integration</h2>
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
          
          {/*Slack Integraion section*/}
          <section  className="w-full flex flex-col items-center pt-20 pb-10 bg-[#F9F0FF]">
            <div data-aos="fade-up" data-aos-duration="600">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">Simple Integration Steps</h2>
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
              
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={WORDPRESS_INTEGRATION_IMG} width={300} height={300} alt="Slack Integration" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>

              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 1</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Install WordPress Plugin</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Choose between two installation methods: directly through WordPress plugins or manual ZIP upload. You will need an existing Corpus chatbot before starting.</p>
              </div>
            </div>
            </div>
         

           {/*Slack Auth section*/}
           <div data-aos="fade-left" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 2</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Configure Chatbot Settings</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Enter your Corpus chatbot ID in the Settings panel and enable public mode for website visitors. Select where your chatbot appears: all pages, homepage only, or specific pages by ID.</p>
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
                <Image src={CONFIGURE_CHATBOT_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
            </div>
          </div>

          <div data-aos="fade-right" data-aos-duration="600" className="w-full flex flex-col items-center mt-20 mb-10">
            
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
            <div className="flex-1 flex items-center justify-center w-full">
                <Image src={GO_LIVE_IMG} width={300} height={300} alt="Slack auth" className="w-full max-w-xs sm-max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain" />
              </div>
              <div className="flex-1 flex flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
                <span className="mb-2 px-1 py-1 rounded-full text-purple-500 text-sm font-semibold inline-block">Setup 3</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">Go Live</h3>
                <p className="text-[#7F7A7A] text-base sm:text-lg">Save your settings and your chatbot will be instantly available on your selected pages. No code embedding required - the plugin handles everything automatically.</p>
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
         Ready to Add<span> AI Power to</span><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> WordPress Sites?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
          Download our WordPress plugin today and start automating your workspace communication!
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