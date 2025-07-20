"use client"
import B2BFeatureCard from '@/app/components/B2BFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';
import Image from 'next/image';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';
import PricingPage from '../components/Pricing';
import SolutionFAQ from '@/app/components/SolutionFAQ';
import Pricingg from '../components/Pricingg';

const EducationFAQ = [
  {
    question: "What is an AI chatbot solution?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question:"How can the CorpusAI chatbot solution help my business?",
    answer: "CorpusAI provides AI chatbot solutions for various industries, including legal, education, government, and healthcare. DenserChat and Denser Retriever leverage advanced natural language processing to enhance customer engagement, provide 24/7 support, and streamline operations, making them ideal for B2B businesses to improve customer experience and reduce operational costs.",
  },
  {
    question: "Can the CorpusChat chatbot solution handle complex documents like PDFs or Word files?",
    answer: "Yes, our chatbot solution can be integrated with PDFs, Word documents, and other types of content, allowing users to interact with documents directly. This feature is handy for B2B businesses that want to automate information retrieval and responses from large documents or manuals.",
  },
  {
    question: "How do the chatbot solutions improve customer satisfaction?",
    answer: "By integrating AI-powered chatbot solutions like DenserChat and DenserRetriever, businesses can offer faster, more personalized service. Chatbots provide instant responses to customer inquiries, reduce waiting times, and ensure 24/7 availability. This leads to higher customer satisfaction and a more streamlined experience.",
  },
  {
    question: "Will these chatbot solutions save my business money?",
    answer: "Yes, both DenserChat and DenserRetriever can significantly reduce operational costs. DenserChat automates customer support and lead generation, reducing the need for human agents to handle repetitive inquiries. DenserRetriever optimizes data retrieval processes, allowing B2B businesses to operate more efficiently without requiring additional resources.",
  },
   {
    question: "How easy is it to integrate CorpusChat and CorpusRetriever into my current systems?",
    answer: "Both chatbot software solutions are designed for seamless integration. DenserChat can be easily added to websites, document management systems, and more, while DenserRetriever can work with your existing databases and repositories. As a leading chatbot solution provider, Denser provides full technical support to ensure a smooth and efficient implementation process.",
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
          
        
    {/* <section className='mt-5'>
        <div className="text-center py-5 px-4 max-w-7xl mx-auto">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase">Pricing</h4>
        <h2 className="text-3xl sm:text-4xl font-semibold mb-5">Simple Pricing</h2>
        <p className="mb-1 text-[#8D8D8D] font-medium mx-auto">Use Corpus Chat for free. Upgrade to enable custom domains and more advanced features.</p>
        </div></section> */}
        <Pricingg/>
           <section>
                <div>
      {/* Your other content */}
      <SolutionFAQ
        faqs={EducationFAQ}
        title="FAQ"
        subtitle="Frequently Asked Questions"
        desc="If you have any questions, please don't hesitate to contact us."
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