'use client';
import Image from 'next/image';
import LogoSlider from '@/app/components/LogoSlider';
import FeaturesSection from '@/app/components/FeaturesSection';
import FAQSection from '@/app/components/FAQsection'
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import SolutionFAQ from '@/app/components/SolutionFAQ';

import Pricingg from '@/app/components/Pricingg';
// import { Link } from 'lucide-react';
import Link from 'next/link';



 const faqs = [
    {
      question: "What is an AI chatbot solution?",
      answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost."
    },
    {
      question: "How can the CorpusAI chatbot solution help my business?",
      answer: "CorpusAI provides AI chatbot solutions for various industries, including legal, education, government, and healthcare. CorpusChat and Corpus Retriever leverage advanced natural language processing to enhance customer engagement, provide 24/7 support, and streamline operations, making them ideal for B2B businesses to improve customer experience and reduce operational costs."
    },
    {
      question: "Can the CorpusChat chatbot solution handle complex documents like PDFs or Word files?",
      answer: "Yes, our chatbot solution can be integrated with PDFs, Word documents, and other types of content, allowing users to interact with documents directly. This feature is handy for B2B businesses that want to automate information retrieval and responses from large documents or manuals."
    },
    {
      question: "How do these chatbot solutions improve customer satisfaction?",
      answer: "By integrating AI-powered chatbot solutions like CorpusChat and CorpusRetriever, businesses can offer faster, more personalized service. Chatbots provide instant responses to customer inquiries, reduce waiting times, and ensure 24/7 availability. This leads to higher customer satisfaction and a more streamlined experience."
    },
    {
      question: "Will these chatbot solutions save my business money?",
      answer: "Yes, both CorpusChat and CorpusRetriever can significantly reduce operational costs. CorpusChat automates customer support and lead generation, reducing the need for human agents to handle repetitive inquiries. CorpusRetriever optimizes data retrieval processes, allowing B2B businesses to operate more efficiently without requiring additional resources."
    },
    {
      question: "How easy is it to integrate CorpusChat and CorpusRetriever into my current systems?",
      answer: "Both chatbot software solutions are designed for seamless integration. CorpusChat can be easily added to websites, document management systems, and more, while CorpusRetriever can work with your existing databases and repositories. As a leading chatbot solution provider, Corpus provides full technical support to ensure a smooth and efficient implementation process."
    }
  ];
export default function Home() {
   const [index, setIndex] = useState(0);

  // Auto-rotate every 6 seconds
  
  return (
     
    <main className="min-h-screen bg-transparent overflow-x-hidden">
       
      
      <div className="flex justify-center pt-[100px]">
        <div className="inline-flex items-center text-sm font-medium rounded-full px-1 py-1 gap-2 shadow-sm bg-white">
          <span className="bg-[#C458FF] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            NEW
          </span>
          <span className="text-gray-700">
            Introducing PDF Highlights
          </span>
          <span className="text-gray-500 font-bold text-sm">→</span>
        </div>
      </div>

      
      <section className="text-center px-4 pt-8 pb-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-inter text-gray-900 leading-tight">
          AI powered Chatbot <span className="inline-block align-middle text-xl"><div className='rounded-full  border-1 border-[#E0E0E0] bg-white w-[107px] h-[47px] flex justify-center items-center space-x-2 mb-2'>
            <div className="w-[13.67px] h-[13.67px] bg-[#9E9E9E] rounded-full"></div>
            <div className="w-[13.67px] h-[13.67px] bg-[#9E9E9E] rounded-full"></div>
            <div className="w-[13.67px] h-[13.67px] bg-[#9E9E9E] rounded-full"></div>
  </div>
  </span> Built<br />
          for your <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">Website</span>
        </h1>
        <p className="mt-4 text-[#7F7A7A] max-w-xl mx-auto text-base sm:text-lg">
          Empower your website with AI conversations. Get instant answers and
          24/7 support – trusted by thousands.
        </p>

        
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
         <Link href='/Sign-In'><span
            
            className="bg-[#BF56FF] hover:bg-[#a843e6] text-white font-medium px-6 py-2 rounded-full w-full sm:w-auto text-center transition duration-200"
          >
            Get Started
          </span></Link>
          <a
            href="/demo"
            className="bg-white border-[1.5px] border-gray-300 hover:bg-gray-100 text-[#1E1E1E] font-medium px-6 py-2 rounded-full w-full sm:w-auto text-center transition duration-200"
          >
            Book a Meeting
          </a>
        </div>
      </section>

      
      <div className="relative w-full max-w-screen-xl mx-auto px-4">
  <img
    src="/img(1).svg"
    alt="Demo Image"
    className="w-full h-auto rounded-xl"
  />

  <div className="absolute inset-0 flex items-center justify-center pr-4 sm:pr-6 pb-4 sm:pb-6">
    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[60px] md:h-[60px] lg:w-[85px] lg:h-[85px] rounded-full bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#D796FF_50%,_#BF56FF_100%)] shadow-inner border-[3px] border-white flex items-center justify-center">
      <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] md:border-l-[20px] border-l-white border-t-[10px] sm:border-t-[13px] md:border-t-[15px] border-t-transparent border-b-[10px] sm:border-b-[13px] md:border-b-[15px] border-b-transparent ml-1" />
    </div>
  </div>
</div>

      <div className="text-center mt-15 px-4 sm:px-6 md:px-8 ">
  <span className="text-base sm:text-lg md:text-xl font-medium text-[#8D8D8D]">
    Trusted By Industry Leaders
  </span>
</div>

    <section className='mx-auto max-w-6xl '> <LogoSlider /> </section>
<section><FeaturesSection /></section>
<section className='w-full pt-15'>
  <section className="text-center py-[24px] px-4 max-w-7xl mx-auto">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-2 uppercase">Features</h4>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Features Built for You</h2>
        <p className="text-[#8D8D8D] max-w-2xl mx-auto">Elevate your customer experience with Corpus AI</p>

        
      </section>
<section className="grid mx-auto max-w-6xl grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-[21px] px-4 md:px-10">
  <div className="rounded-lg border border-[#EAEAEA] bg-white p-5">
    <div className="flex justify-between items-center gap-[19px]">
      <div>
        <img src="/Achievements/2.png" alt="image 01" className="mb-2" />
        <img src="/Achievements/1.png" alt="image 02" />
      </div>
      <div>
        <img src="/Achievements/3.png" alt="image 03" />
      </div>
    </div>
    <div className="mt-14">
      <h3 className="text-lg font-medium mb-1">PDF Highlighting</h3>
      <p className="text-[#8D8D8D]">Highlight sections in your PDF to clarify the chatbot&rsquo;s responses</p>
    </div>
  </div>

  <div className="rounded-lg border border-[#EAEAEA] bg-white p-5">
    <div>
      <img src="/Achievements/123.png" alt="image 04" className="w-full object-contain" />
    </div>
    <div>
      <h3 className="text-lg font-medium mb-1">Lead Generation</h3>
      <p className="text-[#8D8D8D]">Generate leads from your website with Corpus AI</p>
    </div>
  </div>
</section>
</section>

<section className="grid mx-auto max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px] bg-white px-4 sm:px-6 lg:px-10 py-[24px]">
  <div className="border rounded-lg border-[#EAEAEA] p-4">
    <img src="/Achievements/4.svg" alt="" />
    <div className='mt-7'>
    <h3 className="pt-3  text-lg font-semibold">Customizable Chatbot</h3>
    <p className="pt-3 text-[#8D8D8D]">Customize your chatbot to your brand and business</p>
    </div>
  </div>

  <div className="border rounded-lg border-[#EAEAEA] p-4">
    <img src="/Achievements/5.svg" alt="" />
    <h3 className="pt-3 text-lg font-semibold">Connect your favorite tools</h3>
    <p className="pt-3 text-[#8D8D8D]">Connect your favorite tools to Corpus AI to streamline your workflow</p>
  </div>

  <div className="border rounded-lg border-[#EAEAEA] p-4 relative">
    <img src="/Achievements/7.svg" alt="" className="float-right pb-3" />
    <img src="/Achievements/8.svg" alt="" />
    <div className='mt-12'>
    <h3 className="pt-5 text-lg font-semibold">24/7 Chat Support</h3>
    <p className="pt-3 text-[#8D8D8D]">With our AI chat support, your customers can get help 24/7</p>
    </div>
  </div>
</section>
<div   className="bg-transparent  relative mt-20">
      <section data-aos="fade-up" data-aos-duration="500" className="text-center  px-4 max-w-7xl mx-auto relative z-10">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase tracking-wide">Integrations</h4>
        <h2 className="text-3xl sm:text-4xl font-bold mb-[25px]">Integrates With</h2>
        <p className="mb-12 text-[#8D8D8D] max-w-2xl mx-auto">Seamlessly integrates with your favorite tools</p>
           <svg  viewBox="0 0 1440 637" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_2685_15442)">
<rect  fill="white"/>
<path className="mix-blend-multiply" d="M1273 51.4486V50.6096H1191.67V-5H1190.49V50.6096H1109.75V-5H1108.56V50.6096H1027.83V-5H1026.64V50.6096H945.903V-5H944.72V50.6096H863.981V-5H862.798V50.6096H782.059V-5H780.875V50.6096H700.136V-5H698.953V50.6096H618.214V-5H617.031V50.6096H536.292V-5H535.109V50.6096H454.37V-5H453.187V50.6096H372.448V-5H371.264V50.6096H290.526V-5H289.342V50.6096H208V51.4486H289.33V106.639H208V107.478H289.33V162.668H208V163.507H289.33V218.697H208V219.536H289.33V274.726H208V275.565H289.33V330.755H208V331.594H289.33V386.784H208V387.623H289.33V442.814H208V443.653H289.33V498.843H208V499.682H289.33V554.872H208V555.711H289.33V612.495H290.514V555.711H371.253V612.495H372.436V555.711H453.175V612.495H454.358V555.711H535.097V612.495H536.28V555.711H617.019V612.495H618.202V555.711H698.941V612.495H700.125V555.711H780.863V612.495H782.047V555.711H862.786V612.495H863.969V555.711H944.708V612.495H945.891V555.711H1026.63V612.495H1027.81V555.711H1108.55V612.495H1109.74V555.711H1190.47V612.495H1191.66V555.711H1272.99V554.872H1191.66V499.682H1272.99V498.843H1191.66V443.653H1272.99V442.814H1191.66V387.623H1272.99V386.784H1191.66V331.594H1272.99V330.755H1191.66V275.565H1272.99V274.726H1191.66V219.536H1272.99V218.697H1191.66V163.507H1272.99V162.668H1191.66V107.478H1272.99V106.639H1191.66V51.4486H1272.99H1273ZM1108.56 51.4486V106.639H1027.83V51.4486H1108.56ZM700.125 275.574H780.863V330.764H700.125V275.574ZM698.941 330.764H618.202V275.574H698.941V330.764ZM782.047 275.574H862.786V330.764H782.047V275.574ZM782.047 274.735V219.544H862.786V274.735H782.047ZM780.863 274.735H700.125V219.544H780.863V274.735ZM698.941 274.735H618.202V219.544H698.941V274.735ZM617.019 274.735H536.28V219.544H617.019V274.735ZM617.019 275.574V330.764H536.28V275.574H617.019ZM617.019 331.603V386.793H536.28V331.603H617.019ZM618.202 331.603H698.941V386.793H618.202V331.603ZM700.125 331.603H780.863V386.793H700.125V331.603ZM782.047 331.603H862.786V386.793H782.047V331.603ZM863.969 331.603H944.708V386.793H863.969V331.603ZM863.969 330.764V275.574H944.708V330.764H863.969ZM863.969 274.735V219.544H944.708V274.735H863.969ZM863.969 218.705V163.515H944.708V218.705H863.969ZM862.786 218.705H782.047V163.515H862.786V218.705ZM780.863 218.705H700.125V163.515H780.863V218.705ZM698.941 218.705H618.202V163.515H698.941V218.705ZM617.019 218.705H536.28V163.515H617.019V218.705ZM535.097 218.705H454.358V163.515H535.097V218.705ZM535.097 219.544V274.735H454.358V219.544H535.097ZM535.097 275.574V330.764H454.358V275.574H535.097ZM535.097 331.603V386.793H454.358V331.603H535.097ZM535.097 387.632V442.822H454.358V387.632H535.097ZM536.28 387.632H617.019V442.822H536.28V387.632ZM618.202 387.632H698.941V442.822H618.202V387.632ZM700.125 387.632H780.863V442.822H700.125V387.632ZM782.047 387.632H862.786V442.822H782.047V387.632ZM863.969 387.632H944.708V442.822H863.969V387.632ZM945.891 387.632H1026.63V442.822H945.891V387.632ZM945.891 386.793V331.603H1026.63V386.793H945.891ZM945.891 330.764V275.574H1026.63V330.764H945.891ZM945.891 274.735V219.544H1026.63V274.735H945.891ZM945.891 218.705V163.515H1026.63V218.705H945.891ZM945.891 162.676V107.486H1026.63V162.676H945.891ZM944.708 162.676H863.969V107.486H944.708V162.676ZM862.786 162.676H782.047V107.486H862.786V162.676ZM780.863 162.676H700.125V107.486H780.863V162.676ZM698.941 162.676H618.202V107.486H698.941V162.676ZM617.019 162.676H536.28V107.486H617.019V162.676ZM535.097 162.676H454.358V107.486H535.097V162.676ZM453.175 162.676H372.436V107.486H453.175V162.676ZM453.175 163.515V218.705H372.436V163.515H453.175ZM453.175 219.544V274.735H372.436V219.544H453.175ZM453.175 275.574V330.764H372.436V275.574H453.175ZM453.175 331.603V386.793H372.436V331.603H453.175ZM453.175 387.632V442.822H372.436V387.632H453.175ZM453.175 443.661V498.851H372.436V443.661H453.175ZM454.358 443.661H535.097V498.851H454.358V443.661ZM536.28 443.661H617.019V498.851H536.28V443.661ZM618.202 443.661H698.941V498.851H618.202V443.661ZM700.125 443.661H780.863V498.851H700.125V443.661ZM782.047 443.661H862.786V498.851H782.047V443.661ZM863.969 443.661H944.708V498.851H863.969V443.661ZM945.891 443.661H1026.63V498.851H945.891V443.661ZM1027.81 443.661H1108.55V498.851H1027.81V443.661ZM1027.81 442.822V387.632H1108.55V442.822H1027.81ZM1027.81 386.793V331.603H1108.55V386.793H1027.81ZM1027.81 330.764V275.574H1108.55V330.764H1027.81ZM1027.81 274.735V219.544H1108.55V274.735H1027.81ZM1027.81 218.705V163.515H1108.55V218.705H1027.81ZM1027.81 162.676V107.486H1108.55V162.676H1027.81ZM1026.63 51.457V106.647H945.891V51.457H1026.63ZM944.708 51.457V106.647H863.969V51.457H944.708ZM862.786 51.457V106.647H782.047V51.457H862.786ZM780.863 51.457V106.647H700.125V51.457H780.863ZM698.941 51.457V106.647H618.202V51.457H698.941ZM617.019 51.457V106.647H536.28V51.457H617.019ZM535.097 51.457V106.647H454.358V51.457H535.097ZM453.175 51.457V106.647H372.436V51.457H453.175ZM290.514 51.457H371.253V106.647H290.514V51.457ZM290.514 107.486H371.253V162.676H290.514V107.486ZM290.514 163.515H371.253V218.705H290.514V163.515ZM290.514 219.544H371.253V274.735H290.514V219.544ZM290.514 275.574H371.253V330.764H290.514V275.574ZM290.514 331.603H371.253V386.793H290.514V331.603ZM290.514 387.632H371.253V442.822H290.514V387.632ZM290.514 443.661H371.253V498.851H290.514V443.661ZM290.514 554.88V499.69H371.253V554.88H290.514ZM372.436 554.88V499.69H453.175V554.88H372.436ZM454.358 554.88V499.69H535.097V554.88H454.358ZM536.28 554.88V499.69H617.019V554.88H536.28ZM618.202 554.88V499.69H698.941V554.88H618.202ZM700.125 554.88V499.69H780.863V554.88H700.125ZM782.047 554.88V499.69H862.786V554.88H782.047ZM863.969 554.88V499.69H944.708V554.88H863.969ZM945.891 554.88V499.69H1026.63V554.88H945.891ZM1027.81 554.88V499.69H1108.55V554.88H1027.81ZM1190.47 554.88H1109.74V499.69H1190.47V554.88ZM1190.47 498.851H1109.74V443.661H1190.47V498.851ZM1190.47 442.822H1109.74V387.632H1190.47V442.822ZM1190.47 386.793H1109.74V331.603H1190.47V386.793ZM1190.47 330.764H1109.74V275.574H1190.47V330.764ZM1190.47 274.735H1109.74V219.544H1190.47V274.735ZM1190.47 218.705H1109.74V163.515H1190.47V218.705ZM1190.47 162.676H1109.74V107.486H1190.47V162.676ZM1190.47 106.647H1109.74V51.457H1190.47V106.647Z" fill="url(#paint0_radial_2685_15442)"/>
<g filter="url(#filter0_d_2685_15442)">
<rect x="656" y="229" width="93" height="93" rx="10" fill="white"/>
<rect x="656.5" y="229.5" width="92" height="92" rx="9.5" stroke="#E6E6E6"/>
</g>
 <defs>
    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
     <stop offset="100%" stopColor="#EBCBFF" />
      <stop offset="50%" stopColor="#F2DBFF" />
      <stop offset="100%" stopColor="#EBCBFF" />
    </linearGradient>
  </defs>
<rect
    x="666"
    y="237"
    width="73"
    height="76"
    rx="8"
    fill="url(#purpleGradient)"
    id='blink-Logo'
  />
<path d="M716.117 258.883C712.73 255.496 708.389 253.225 703.675 252.374C698.962 251.523 694.101 252.132 689.743 254.121C685.386 256.11 681.74 259.383 679.294 263.501C676.849 267.619 675.72 272.387 676.059 277.164C676.398 281.942 678.189 286.502 681.193 290.234C684.196 293.965 688.267 296.69 692.862 298.043C697.457 299.396 702.355 299.313 706.901 297.804C711.447 296.295 715.424 293.434 718.298 289.602L710.266 283.577C708.62 285.771 706.342 287.41 703.739 288.274C701.135 289.138 698.33 289.186 695.698 288.411C693.067 287.636 690.735 286.075 689.015 283.938C687.295 281.801 686.269 279.19 686.075 276.453C685.881 273.717 686.527 270.987 687.928 268.628C689.329 266.269 691.417 264.395 693.912 263.256C696.408 262.117 699.192 261.768 701.891 262.255C704.591 262.743 707.077 264.043 709.017 265.983L716.117 258.883Z" fill="black"/>
<circle cx="725.5" cy="289.5" r="3.5" fill="#BF56FF"/>
<path className='base-path' d="M657 275.647H478.839M478.839 275.647L419.141 173.88C415.551 167.76 408.986 164 401.89 164H268.16M478.839 275.647H373.499M478.839 275.647L419.107 379.94C415.544 386.162 408.922 390 401.752 390H259" stroke="#D3D3D3" strokeDasharray="6 6" />
<line className='dot' x1="30" y1="0" x2="0" y2="0" stroke="#BF56FF" strokeWidth="3" />
    <line  x1="0" y1="0" x2="20" y2="0" stroke="#BF56FF" strokeWidth="3"  className="dot branch1 linePath" />
    <line  x1="30" y1="0" x2="0" y2="0" stroke="#BF56FF" strokeWidth="3"   className="dot branch2 linePath" />
<path className='base-path' d="M760 275.647H938.161M938.161 275.647L997.859 173.88C1001.45 167.76 1008.01 164 1015.11 164H1148.84M938.161 275.647H1043.5M938.161 275.647L997.893 379.94C1001.46 386.162 1008.08 390 1015.25 390H1158" stroke="#D3D3D3" strokeDasharray="6 6"/>

<line className='dot2' x1="30" y1="0" x2="0" y2="0" stroke="#BF56FF" strokeWidth="3" />
    <line  x1="0" y1="0" x2="20" y2="0" stroke="#BF56FF" strokeWidth="3"  className="dot2 branch3 linePath2" />
    <line  x1="30" y1="0" x2="0" y2="0" stroke="#BF56FF" strokeWidth="3"   className="dot2 branch4 linePath2" />
<g filter="url(#filter1_d_2685_15442)">
<rect x="190" y="124" width="69" height="69" rx="10" fill="white"/>
<rect x="190.5" y="124.5" width="68" height="68" rx="9.5" stroke="#F4F4F4" id='zapierStroke'/>
</g>
<rect x="198" y="132" width="53" height="52" rx="7" fill="#F1F1F1" id='zapierColor'/>
<g clipPath="url(#clip1_2685_15442)">
<path fillRule="evenodd" clipRule="evenodd" d="M220.899 145C219.407 145.001 218.199 146.21 218.2 147.699C218.199 149.189 219.408 150.398 220.901 150.399H223.601L223.601 147.701C223.602 146.211 222.393 145.002 220.899 145C220.901 145 220.901 145 220.899 145ZM220.899 152.2H213.7C212.208 152.201 210.999 153.41 211 154.899C210.998 156.389 212.207 157.598 213.699 157.6H220.899C222.392 157.599 223.601 156.39 223.6 154.901C223.601 153.41 222.392 152.201 220.899 152.2Z" fill="#36C5F0"/>
<path fillRule="evenodd" clipRule="evenodd" d="M238 154.899C238.001 153.41 236.792 152.201 235.3 152.2C233.807 152.201 232.598 153.41 232.599 154.899L232.599 157.6H235.3C236.792 157.599 238.001 156.39 238 154.899ZM230.8 154.899L230.8 147.699C230.801 146.211 229.593 145.002 228.101 145C226.608 145.001 225.399 146.21 225.4 147.699L225.4 154.899C225.398 156.389 226.607 157.598 228.1 157.6C229.592 157.599 230.801 156.39 230.8 154.899Z" fill="#2EB67D"/>
<path fillRule="evenodd" clipRule="evenodd" d="M228.1 172C229.592 171.999 230.801 170.79 230.8 169.301C230.801 167.811 229.592 166.602 228.1 166.601H225.399L225.399 169.301C225.398 170.789 226.607 171.998 228.1 172ZM228.1 164.799H235.3C236.792 164.798 238.001 163.589 238 162.099C238.003 160.61 236.794 159.401 235.301 159.399H228.101C226.608 159.4 225.399 160.609 225.401 162.098C225.399 163.589 226.607 164.798 228.1 164.799Z" fill="#E01E5A"/>
<path fillRule="evenodd" clipRule="evenodd" d="M211 162.099C210.999 163.589 212.208 164.798 213.7 164.799C215.193 164.798 216.402 163.589 216.401 162.099L216.401 159.4H213.7C212.208 159.401 210.999 160.61 211 162.099ZM218.2 162.099L218.2 169.299C218.198 170.789 219.407 171.998 220.899 172C222.392 171.999 223.601 170.79 223.6 169.3L223.6 162.102C223.602 160.612 222.393 159.403 220.901 159.401C219.407 159.401 218.199 160.61 218.2 162.099Z" fill="#ECB22E"/>
</g>
<g filter="url(#filter2_d_2685_15442)">
<rect x="1156" y="132" width="69" height="69" rx="10" fill="white"/>
<rect x="1156.5" y="132.5" width="68" height="68" rx="9.5" stroke="#F4F4F4"/>
</g>
<rect x="1164" y="140" width="53" height="52" rx="7" fill="#F1F1F1" id='telegramColor'/>
<g clipPath="url(#clip2_2685_15442)">
<g clipPath="url(#clip3_2685_15442)">
<path d="M1190.5 180C1197.96 180 1204 173.956 1204 166.5C1204 159.044 1197.96 153 1190.5 153C1183.04 153 1177 159.044 1177 166.5C1177 173.956 1183.04 180 1190.5 180Z" fill="#34AADF"/>
<path d="M1182.62 166.383C1182.62 166.383 1189.37 163.613 1191.71 162.637C1192.61 162.247 1195.65 160.999 1195.65 160.999C1195.65 160.999 1197.05 160.452 1196.94 161.779C1196.9 162.325 1196.59 164.237 1196.27 166.305C1195.81 169.231 1195.3 172.431 1195.3 172.431C1195.3 172.431 1195.22 173.328 1194.56 173.484C1193.89 173.64 1192.8 172.938 1192.61 172.782C1192.45 172.665 1189.68 170.909 1188.67 170.051C1188.39 169.817 1188.08 169.348 1188.7 168.802C1190.11 167.515 1191.79 165.915 1192.8 164.9C1193.27 164.432 1193.74 163.34 1191.79 164.666C1189.02 166.578 1186.29 168.373 1186.29 168.373C1186.29 168.373 1185.66 168.763 1184.49 168.412C1183.32 168.061 1181.95 167.593 1181.95 167.593C1181.95 167.593 1181.02 167.007 1182.62 166.383Z" fill="white"/>
</g>
</g>
<g filter="url(#filter3_d_2685_15442)">
<rect x="297" y="237" width="69" height="69" rx="10" fill="white"/>
<rect x="297.5" y="237.5" width="68" height="68" rx="9.5" stroke="#F4F4F4" id='myStrokePath'/>
</g>
<rect x="305" y="245" width="53" height="52" rx="7" fill="#F1F1F1" id='wordpressColor'/>
<g clipPath="url(#clip4_2685_15442)">
<path d="M331.5 285.5C324.019 285.5 317.944 279.537 318 272C318.057 264.463 323.738 258.5 331.5 258.5C339.263 258.5 345 264.575 345 272C345 279.425 338.982 285.5 331.5 285.5ZM335.494 283.419L331.669 273.125L328.069 283.644C330.713 284.263 332.513 284.431 335.494 283.419ZM326.157 282.856L320.419 267.163C319.631 268.85 319.463 270.257 319.35 272C319.407 276.612 321.994 280.831 326.157 282.856ZM343.594 272C343.65 269.019 342.301 266.656 342.188 266.319C342.301 268.626 341.963 269.806 341.569 271.1L337.632 282.407C342.582 279.425 343.538 274.981 343.65 272H343.594ZM331.107 271.494L329.194 266.263L327.788 266.15C327.226 265.756 327.563 265.138 327.957 265.138C330.488 265.306 331.894 265.306 334.426 265.138C335.045 265.138 335.213 266.038 334.481 266.15L333.131 266.263L337.518 279.2L339.599 272.112C339.712 269.019 338.868 268.681 337.743 266.431C336.843 264.687 337.8 263 339.543 262.944C338.136 261.594 335.268 259.906 331.499 259.85C327.73 259.794 323.737 261.706 321.374 265.306L325.537 265.194C326.043 265.419 325.818 266.15 325.537 266.207L324.075 266.319L328.462 279.481L331.107 271.494Z" fill="#21759B"/>
</g>
<g filter="url(#filter4_d_2685_15442)">
<rect x="1047" y="237" width="69" height="69" rx="10" fill="white"/>
<rect x="1047.5" y="237.5" width="68" height="68" rx="9.5" stroke="#F4F4F4" id="myStrokePath"/>
</g>
<rect x="1055" y="245" width="53" height="52" rx="7" fill="#F1F1F1" id='afterColor'/>
<path d="M1081.75 282.4C1079.49 282.4 1077.38 281.719 1075.61 280.559L1071.33 281.928L1072.72 277.787C1071.38 275.953 1070.59 273.692 1070.59 271.255C1070.59 265.109 1075.59 260.11 1081.74 260.11C1087.88 260.11 1092.88 265.109 1092.88 271.255C1092.88 277.401 1087.88 282.4 1081.74 282.4H1081.75V282.4ZM1081.75 258C1074.43 258 1068.49 263.937 1068.49 271.255C1068.49 273.758 1069.19 276.104 1070.39 278.102L1068 285.211L1075.34 282.859C1077.3 283.943 1079.5 284.512 1081.75 284.51C1089.06 284.51 1095 278.574 1095 271.255C1095 263.937 1089.06 258 1081.75 258Z" fill="#FEFEFE"/>

 <defs>
    <linearGradient id="fiveColorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#6EBF61" /> 
      <stop offset="23%" stopColor="#50A557" /> 
      <stop offset="52%" stopColor="#2A904F" /> 
      <stop offset="81%" stopColor="#50A557" />
      <stop offset="100%" stopColor="#6EBF63" /> 
    </linearGradient>
  </defs>
<path d="M1081.71 260.11C1075.54 260.11 1070.53 265.077 1070.53 271.184C1070.53 273.606 1071.32 275.852 1072.66 277.675L1071.27 281.789L1075.56 280.429C1077.33 281.588 1079.44 282.258 1081.71 282.258C1087.88 282.258 1092.89 277.29 1092.89 271.184C1092.89 265.077 1087.88 260.11 1081.71 260.11H1081.71V260.11Z" fill="url(#fiveColorGradient)"/>
<path d="M1078.56 265.733C1078.34 265.218 1078.17 265.198 1077.84 265.185C1077.72 265.177 1077.59 265.172 1077.47 265.172C1077.04 265.172 1076.59 265.296 1076.32 265.57C1075.99 265.902 1075.17 266.679 1075.17 268.271C1075.17 269.862 1076.35 271.402 1076.5 271.617C1076.67 271.832 1078.79 275.146 1082.09 276.497C1084.67 277.554 1085.43 277.456 1086.02 277.332C1086.88 277.149 1087.95 276.523 1088.22 275.766C1088.49 275.01 1088.49 274.364 1088.42 274.227C1088.34 274.09 1088.12 274.012 1087.79 273.848C1087.46 273.685 1085.86 272.902 1085.55 272.798C1085.26 272.687 1084.97 272.726 1084.75 273.039C1084.43 273.477 1084.12 273.92 1083.87 274.188C1083.67 274.396 1083.35 274.423 1083.08 274.312C1082.72 274.162 1081.7 273.809 1080.45 272.707C1079.48 271.852 1078.82 270.789 1078.63 270.469C1078.44 270.143 1078.61 269.954 1078.76 269.778C1078.92 269.575 1079.08 269.432 1079.25 269.243C1079.41 269.054 1079.5 268.956 1079.61 268.734C1079.72 268.519 1079.64 268.297 1079.56 268.134C1079.49 267.97 1078.83 266.379 1078.56 265.733Z" fill="#FEFEFE"/>
<g filter="url(#filter5_d_2685_15442)">
<rect x="189" y="355" width="69" height="69" rx="10" fill="white"/>
<rect x="189.5" y="355.5" width="68" height="68" rx="9.5" stroke="#F4F4F4" id='zapierStroke'/>
</g>
<rect x="197" y="363" width="53" height="52" rx="7" fill="#F1F1F1" id='zapierColor'/>
<g clipPath="url(#clip5_2685_15442)">
<g clipPath="url(#clip6_2685_15442)">
<path d="M226.875 389.506C226.875 390.479 226.7 391.445 226.357 392.356C225.445 392.699 224.479 392.875 223.505 392.875H223.494C222.491 392.874 221.53 392.691 220.644 392.357C220.3 391.445 220.125 390.48 220.125 389.506V389.494C220.125 388.521 220.3 387.555 220.643 386.644C221.554 386.301 222.52 386.125 223.494 386.125H223.506C224.479 386.125 225.445 386.3 226.357 386.644C226.7 387.555 226.876 388.521 226.875 389.494V389.506L226.875 389.506ZM236.812 387.25H228.932L234.504 381.678C234.067 381.063 233.579 380.487 233.046 379.953V379.953C232.512 379.42 231.936 378.933 231.322 378.496L225.75 384.068V376.188C225.008 376.063 224.258 376 223.507 376H223.493C222.728 376 221.98 376.065 221.25 376.188V384.068L215.678 378.496C215.064 378.933 214.487 379.421 213.955 379.954L213.952 379.956C213.419 380.489 212.932 381.065 212.495 381.678L218.068 387.25H210.188C210.188 387.25 210 388.73 210 389.495V389.505C210 390.27 210.065 391.02 210.188 391.75H218.068L212.495 397.322C213.372 398.552 214.448 399.628 215.678 400.505L221.25 394.932V402.812C221.99 402.937 222.74 402.999 223.49 403H223.509C224.26 402.999 225.009 402.937 225.749 402.812V394.932L231.322 400.505C231.936 400.067 232.513 399.58 233.046 399.047L233.047 399.046C233.579 398.512 234.067 397.936 234.504 397.322L228.931 391.75H236.812C236.935 391.021 236.999 390.273 237 389.51V389.49C236.999 388.727 236.935 387.979 236.812 387.25Z" fill="#FF4A00"/>
</g>
</g>
<g filter="url(#filter6_d_2685_15442)">
<rect x="1164" y="355" width="69" height="69" rx="10" fill="white" />
<rect x="1164.5" y="355.5" width="68" height="68" rx="9.5" stroke="#F4F4F4" id='websiteStroke'/>
</g>
<rect x="1172" y="363" width="53" height="52" rx="7" fill="#F1F1F1" id='websiteColor'/>
<path d="M1187.31 390.625H1193.47C1193.67 394.302 1194.85 397.718 1196.76 400.616C1191.74 399.835 1187.81 395.733 1187.31 390.625ZM1187.31 388.375C1187.81 383.267 1191.74 379.164 1196.76 378.384C1194.85 381.281 1193.67 384.697 1193.47 388.375H1187.31ZM1209.69 388.375H1203.53C1203.33 384.697 1202.15 381.281 1200.24 378.384C1205.26 379.164 1209.19 383.267 1209.69 388.375ZM1209.69 390.625C1209.19 395.733 1205.26 399.835 1200.24 400.616C1202.15 397.718 1203.33 394.302 1203.53 390.625H1209.69ZM1195.72 390.625H1201.28C1201.08 393.756 1200.09 396.67 1198.5 399.165C1196.91 396.67 1195.92 393.756 1195.72 390.625ZM1195.72 388.375C1195.92 385.244 1196.91 382.33 1198.5 379.834C1200.09 382.33 1201.08 385.244 1201.28 388.375H1195.72Z" fill="#BF56FF"/>
</g>
<defs>
<filter id="filter0_d_2685_15442" x="640" y="221" width="125" height="125" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="8"/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.556791 0 0 0 0 0.556791 0 0 0 0 0.556791 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2685_15442"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2685_15442" result="shape"/>
</filter>
<filter id="filter1_d_2685_15442" x="182" y="120" width="85" height="85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="4"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2685_15442"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2685_15442" result="shape"/>
</filter>
<filter id="filter2_d_2685_15442" x="1148" y="128" width="85" height="85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="4"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2685_15442"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2685_15442" result="shape"/>
</filter>
<filter id="filter3_d_2685_15442" x="289" y="233" width="85" height="85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="4"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2685_15442"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2685_15442" result="shape"/>
</filter>
<filter id="filter4_d_2685_15442" x="1039" y="233" width="85" height="85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="4"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2685_15442"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2685_15442" result="shape"/>
</filter>
<filter id="filter5_d_2685_15442" x="181" y="351" width="85" height="85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="4"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2685_15442"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2685_15442" result="shape"/>
</filter>
<filter id="filter6_d_2685_15442" x="1156" y="351" width="85" height="85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="4"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0 0.740826 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2685_15442"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2685_15442" result="shape"/>
</filter>
<radialGradient id="paint0_radial_2685_15442" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(740.5 303.756) scale(603.678 428.021)">
<stop stopColor="#C3C3C3"/>
<stop offset="0.05" stopColor="#D6D6D6" stopOpacity="0.9"/>
<stop offset="0.15" stopColor="#E9E9E9" stopOpacity="0.8"/>
<stop offset="0.28" stopColor="#E8E8E8" stopOpacity="0.7"/>
<stop offset="0.36" stopColor="#D1D0D2" stopOpacity="0.6"/>
<stop offset="0.45" stopColor="#E2DFE4" stopOpacity="0.5"/>
<stop offset="0.59" stopColor="#FBF5FF" stopOpacity="0.4"/>
<stop offset="0.77" stopColor="#EFF5FF" stopOpacity="0.23"/>
<stop offset="0.98" stopColor="#FDFDFF" stopOpacity="0.03"/>
<stop offset="1" stopColor="white" stopOpacity="0"/>
</radialGradient>
<clipPath id="clip0_2685_15442">
<rect width="1440" height="637" fill="white"/>
</clipPath>
<clipPath id="clip1_2685_15442">
<rect width="27" height="27" fill="white" transform="translate(211 145)"/>
</clipPath>
<clipPath id="clip2_2685_15442">
<rect width="27" height="27" fill="white" transform="translate(1177 153)"/>
</clipPath>
<clipPath id="clip3_2685_15442">
<rect width="27" height="27" fill="white" transform="translate(1177 153)"/>
</clipPath>
<clipPath id="clip4_2685_15442">
<rect width="27" height="27" fill="white" transform="translate(318 258)"/>
</clipPath>
<clipPath id="clip5_2685_15442">
<rect width="27" height="27" fill="white" transform="translate(210 376)"/>
</clipPath>
<clipPath id="clip6_2685_15442">
<rect width="27" height="27" fill="white" transform="translate(210 376)"/>
</clipPath>
</defs>
</svg>

        </section></div>
{/* <section className='bg-[#FAF6FF] mx-auto max-w-6xl' >
  <div className="text-center pt-5 px-4 max-w-7xl mx-auto">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase">Reviews</h4>
        <h2 className="text-3xl sm:text-4xl font-bold mb-[19px]">What Our Clients Says</h2>
        <p className="mb-[64px] text-[#8D8D8D]  mx-auto">Discover how Coprus AI is transforming businesses through intelligent automation and exceptional customer service</p>
        </div>
  <TestimonialsSlider/>
  </section> */}
{/* <section className='bg-[#FAF6FF] mx-auto max-w-6xl'><TestimonialsSliders/></section> */}
<section className="bg-white">
  <div className="relative w-full">
    <img
      src="/blogimages/Group 2366.png"
      alt="Demo Image"
      className='w-full'
    />

    <div className="absolute  inset-0 flex mx-auto items-center justify-center ">
      <section className="text-center  px-4 pt-4 sm:pt-6 md:pt-8 ">
        <h1 className="text-sm mt-8 md:text-2xl lg:text-3xl font-semibold text-[#1E1E1E] leading-snug sm:leading-tight">
          With Corpus AI, Your business is <br />
          in the palm of
          <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">
            {" "}your hands
          </span>
        </h1>

       

        <div className="mt-5 sm:mt-6 md:mt-8 flex flex-col sm:flex-row  justify-center items-center gap-3 sm:gap-4">
          <a
            href="#"
            className="bg-white text-[#BF56FF] shadow-[0_0_15px_rgba(191,86,255,0.4)] font-medium px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full w-fit sm:w-auto text-sm sm:text-base md:text-lg"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  </div>
</section>

 <div className="min-h-screen w-full  flex flex-col items-center justify-center bg-gradient-to-br bg-transparent px-2 sm:px-4 py-8">
<section >
   {/* <div className="text-center py-5 px-4 max-w-7xl mx-auto">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase">Pricing</h4>
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">Simple Pricing</h2>
        <p className="mb-12 text-[#8D8D8D] max-w-2xl mx-auto">Use Corpus Chat for free. Upgrade to enable custom domains and more advanced features.</p>
        </div> */}
  <Pricingg/>
  </section>
  </div>
<section className="bg-white">
  <div className="max-w-6xl mx-auto px-4 py-12">
    
    <div className="mb-12 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Blog and articles</h1>
        <p className="text-gray-600 text-lg">
          Explore more information about cutting-edge chatbot solutions, AI, machine learning, and data science through our expert insights.
        </p>
      </div>
      <div className="text-left md:text-right text-[#BF56FF] mt-4 md:mt-0">
        View All
      </div>
    </div>

    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <div className="bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="h-60 sm:h-72 md:h-80 bg-gray-200 relative">
          <Image 
            src="/blogimages/image 1.png" 
            alt="Create a chatbot with your docs"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Create a chatbot with your docs</h2>
          <p className="text-gray-600 mb-4">
            Creating a chatbot based on your documents allows you to build on content you already have.
          </p>
         <a href="#" className="text-black hover:text-[#a843e6] font-semibold text-sm inline-flex items-center group/link transition-colors">
                Read More 
               <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-short w-5 h-5 -rotate-45  transition-transform duration-200" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
            </svg>
              </a>
        </div>
      </div>

      
      <div className="bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="h-60 sm:h-72 md:h-80 bg-gray-200 relative">
          <Image 
            src="/blogimages/image 2.png" 
            alt="What are chat boxes used for"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">What are chat boxes used for?</h2>
          <p className="text-gray-600 mb-4">
            Chatbots streamline business operations by automating customer service and complex processes.
          </p>
          {/* <a href="#" className="text-black font-medium inline-flex items-center hover:ml-3 duration-200 transition-all">
            Read More
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a> */}
          <a href="#" className="text-black hover:text-[#a843e6] font-semibold text-sm inline-flex items-center group/link transition-colors">
                Read More 
                <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-short w-5 h-5 -rotate-45  transition-transform duration-200" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
            </svg>
              </a>
        </div>
      </div>

      
      <div className="bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="h-60 sm:h-72 md:h-80 bg-gray-200 relative">
          <Image 
            src="/blogimages/image 3.png" 
            alt="CorpusRetriever: AI retriever for RAG"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">CorpusRetriever: AI retriever for RAG</h2>
          <p className="text-gray-600 mb-4">
            Corpus Retriever benchmarks retrieval accuracy using the MTB dataset.
          </p>
          <a href="#" className="text-black hover:text-[#a843e6] font-semibold text-sm inline-flex items-center group/link transition-colors">
                Read More 
                {/* <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg> */}
                
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-short w-5 h-5 -rotate-45  transition-transform duration-200" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
            </svg>
              </a>
        </div>
      </div>
    </div>
  </div>
</section>

<section className='lg:mt-10'>
  {/* <FAQSection/> */}
  <SolutionFAQ faqs={faqs} title='FAQ' subtitle='Frequently Asked Questions'/>
</section>
 <section>
      <div className='md:mt-[154px] mt-[100px] md:mb-[188px] mb-[110px] text-center px-3'>

        
          <h2 className='font-semibold lg:text-[40px] text-2xl md:text-3xl leading-snug px-2' >
“Corpus became the operating system for<br/> my day- cleared my plate and gave me back<br/> 12 hours a week”
          </h2>
        

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          viewport={{ once: true }}
          className="w-[500px] max-w-full mx-auto mt-[45px] h-[2px] bg-[#BBBBBB] origin-left"
        />

        {/* Author info */}
        <div className='flex flex-col gap-[15px] mt-[45px] font-semibold'
        >
          <h2 className='hover:text-purple-600 transition duration-300 cursor-pointer'>
           Hamza Fayaz
          </h2>
          <h2 className='text-[#7B7B7B] text-sm md:text-base'>
           CEO, Corpus AI
          </h2>
        </div>
      </div>
    </section>

 




 <section className="text-center px-4 pt-8 pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-6xl font-semibold text-[#1E1E1E] ">
          Create Your<br/>Corpus <span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent">Chatbot</span>
        </h1>
        <p className="mt-4 text-[#7F7A7A] mx-auto text-base sm:text-lg">
          Build an AI assistant that delivers concise, focused responses tailored to your customers
        </p>

        
        <div className="mt-[24px] flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href='/Sign-In'
            className="hover:bg-gradient-to-r from-[#FC5990] to-[#AC5DE6]  text-black border-[#E0E0E0] shadow font-medium px-6 py-2 rounded-lg w-full sm:w-auto "
          >
            Get Started for Free
          </Link>
        </div>
      </section>
   
    </main>
    
  );
}
