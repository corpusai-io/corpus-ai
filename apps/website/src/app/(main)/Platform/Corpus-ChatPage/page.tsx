'use client'; 
import React, { useEffect, useState } from 'react';
import FeatureCard from '@/app/components/FeatureCard';

import AOS from 'aos';
import 'aos/dist/aos.css';
import SolutionFAQ from '@/app/components/SolutionFAQ';
import Pricingg from '@/app/components/Pricingg';
const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-6 w-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Verifiable Answers',
    description: 'Delivers precise responses with highlighted sources, ensuring full transparency and trustworthiness.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square h-6 w-6 text-primary" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    ),
    title: 'Chat with Any Content',
    description: 'Engage with websites, PDFs, and documents in multiple languages for instant insights and answers.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles h-6 w-6 text-primary" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
    ),
    title: 'Advanced Contextual AI',
    description: 'Accurately understands text, tables, charts, and more, handling complex queries across diverse content types.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-6 w-6 text-primary" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
    ),
    title: 'Scalable Intelligence',
    description: 'Scales to support intelligent chat systems across hundreds of thousands of webpages or documents..'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock h-6 w-6 text-primary" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    ),
    title: 'Enterprise Security',
    description: 'Provides private cloud deployment options and enterprise-grade security to protect your sensitive data'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-puzzle h-6 w-6 text-primary" aria-hidden="true"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"></path></svg>
    ),
    title: 'Seamless Integrations',
    description: 'Integrates with platforms like Slack, Zapier, Shopify, and Embeddable Widgets for smooth workflows.'
  },
];

const steps = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-5 h-5 text-primary" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
    ),
    title: 'Upload Your Content',
    description: 'Simply paste your website URL or upload your documents. We support PDFs, Word docs, and more.',
    delay: "0"
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-5 h-5 text-primary" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
    ),
    title: 'AI Processing',
    description: 'Our AI analyzes your content, understanding the context and creating a knowledge base.',
    delay:"200"
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up w-5 h-5 text-primary" aria-hidden="true"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path></svg>
    ),
    title: 'Start Chatting',
    description: 'Ask questions naturally and get accurate answers from your content instantly.',
    delay:"400"
  },
];

const corpusChatFaq = [
  {
    question: "What is a RAG Chatbot?",
    answer: "A RAG chatbot (Retrieval-Augmented Generation) is an advanced AI chatbot that combines information retrieval and generative capabilities to provide more accurate and contextually relevant responses. Unlike traditional chatbots, RAG chatbots can pull in data from external sources, enhancing their answers with up-to-date, specific information.",
  },
  {
    question: "How do RAG Chatbot works?",
    answer: "RAG chat bots work by first retrieving relevant information from a pre-established knowledge base or external database. They then generate a response based on this retrieved information, ensuring that answers are not only accurate but also tailored to the specific context of the user's query. This combination of retrieval and generation makes the RAG-based chatbot highly efficient at providing detailed, real-time answers.",
  },
  {
    question: "Why should I use a RAG AI chatbot?",
    answer: "A RAG AI bot is ideal if you're looking to offer more accurate, dynamic, and personalized interactions with your users. By integrating real-time information retrieval, these chatbots can adapt to a wide range of queries and provide answers grounded in the most current data, improving customer experience and decision-making. They're particularly useful in industries like healthcare, legal services, and customer support.",
  },
  {
    question: "How can a CorpusAI improve my business?",
    answer: "Implementing a RAG-based chatbot can drastically improve customer service, support, and engagement by providing quick, accurate, and relevant answers to customer inquiries. It can also help streamline internal operations by offering employees efficient access to crucial data, all while maintaining a high level of accuracy and efficiency.",
  },
  {
    question: "What makes CorpusAI different from other RAG chatbots?",
    answer: "CorpusAI stands out because it offers seamless integration with your existing systems and databases, making data retrieval fast and accurate. With features like continuous learning and adaptability, CorpusAI improves over time, ensuring it keeps up with evolving customer needs and expectations.",
  },
];

const animatedWords = ['Web', 'PDF', 'Doc'];

const CorpusChatPage = () => {
  const [currentWord, setCurrentWord] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 1700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AOS.init({ // Animation duration in ms
      once: true // Only animate once on scroll
    });
  }, []);

//   const [width1, setWidth] = useState('60%');

// useEffect(() => {
//   const timeout = setTimeout(() => {
//     setWidth('100%');   
//   }, 100);

//   return () => clearTimeout(timeout);
// }, []);

//   const [progress, setProgress] = useState(40);

//  useEffect(() => {
//     const timeout = setTimeout(() => {
//       setProgress(65); 
//         }, 50); 

//     return () => clearTimeout(timeout);
//   }, []);


 const [boxWidths, setBoxWidths] = useState([40, 35, 33, 30, 30]);

  // Animate progress bars after all card animations are done
  useEffect(() => {
    // Card delays: 0, 400, 800, 1200; duration: 200ms each; last card finishes at 1400ms
    const totalDelay = 1400 + 200; // 1600ms
    const timeout = setTimeout(() => {
      setBoxWidths([80, 70, 70, 65, 100]);
    }, totalDelay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col items-center justify-center px-2 sm:px-4 relative">
     
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center w-full max-w-[1300px] py-10 gap-10 lg:gap-0 relative z-10">
        
        {/* Left Section */}
        <div className="flex flex-col items-center lg:items-start justify-center text-center lg:text-left w-full lg:w-1/2 px-2 sm:px-6 lg:pl-10">
          <h1 className="text-3xl font-inter sm:text-4xl md:text-5xl font-semibold leading-tight mb-4 text-zinc-900">
            Trustworthy Chat<br />
            with your{' '}
            <span className="inline-block relative mb-1 w-[67px] md:w-[130px] h-[1.2em] align-middle overflow-hidden">
              <span className="absolute left-0 top-0  w-full h-full text-purple-400 font-semibold transition-transform duration-500 ease-in-out"
                style={{ transform: `translateY(-${currentWord * 100}%)` }}>
                {animatedWords.map((word) => (
                  <span key={word} className="block h-[1.2em]">{word}</span>
                ))}
              </span>
            </span>
          </h1>
          <p  className="text-base sm:text-lg text-[#8D8D8D] mb-8">
            Verifiable answers from PDFs, websites, and beyond all with source highlights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center sm:justify-start">
            <button className="bg-[#BF56FF] text-white rounded-[30px] px-8 py-3 text-lg font-medium shadow-md  transition w-full sm:w-auto">
              Get Started
            </button>
            <button className="bg-white text-[#1E1E1E] border border-[#F0F0F0] rounded-[30px] px-8 py-3 text-lg font-medium shadow  transition w-full sm:w-auto">
              Watch Video
            </button>
          </div>
        </div>
        {/* Right Section: Chat Cards */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="grid chatsCards grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 lg:gap-4">
            {/* Live Chat Card */}
            <div data-aos="fade-up" data-aos-duration="200" data-aos-delay="0" className="shadow-lg chatCard1 w-[280px] rounded-2xl mt-8 border border-zinc-100/20 bg-white p-5 flex flex-col items-center justify-center gap-4 relative" style={{ minHeight: '320px' }}>
              {/* Header */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="flex p-1 items-center justify-center rounded-md bg-purple-50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square text-purple-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <span className="font-medium text-zinc-900 text-base">Live Chat</span>
              </div>
              {/* Chat bubbles */}
              <div className="flex flex-col gap-2 mt-8 mb-2 w-full h-full">
                <div className="rounded-xl bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] text-xs text-zinc-700 w-fit max-w-[200px] px-3 py-2 self-center shadow-sm">Hi i need help with my account<div className="text-[10px] text-zinc-400 mt-1 text-left">2:30 PM</div></div>
                <div className="rounded-xl bg-white border border-zinc-100 text-xs text-zinc-800 w-fit max-w-[200px] px-3 py-2 self-center shadow">Hello, I'll be happy to help you with your account. What seems<div className="text-[10px] text-zinc-400 mt-1 text-left">2:30 PM</div></div>
              </div>
              {/* Model Selector Dropdown (static, centered) */}
              <div className="absolute top-40 left-2 flex flex-col items-center w-full mt-2">
                {/* Dropdown menu (visible for demo) */}
                <div className="z-10 w-36 rounded-xl bg-white shadow-lg border border-zinc-100/40 py-2 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 text-zinc-800 text-sm hover:bg-zinc-100 rounded-t-xl">
                    <span>GPT-4o</span>
                    <span className="h-2 w-2 rounded-full bg-green-600 inline-block"></span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 text-zinc-800 text-sm hover:bg-zinc-100 rounded-b-xl">
                    <span>Claude-3.5</span>
                    <span className="h-2 w-2 rounded-full bg-green-600 inline-block"></span>
                  </div>
                </div>
                {/* Selected model button */}
                <div className="flex items-center justify-between w-36 px-4 py-2 rounded-xl bg-white shadow border border-zinc-100/40 text-zinc-900 font-semibold text-base cursor-pointer gap-2 mt-2">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-zinc-700"><circle cx="16" cy="16" r="16" fill="#ECECF1"/><path d="M16 7.5c-1.6 0-2.9 1.3-2.9 2.9v.7c-.6.2-1.2.5-1.7.9l-.6-.4c-1.3-.7-2.9-.2-3.6 1.1-.7 1.3-.2 2.9 1.1 3.6l.6.4c-.1.6-.1 1.3 0 1.9l-.6.4c-1.3.7-1.8 2.3-1.1 3.6.7 1.3 2.3 1.8 3.6 1.1l.6-.4c.5.4 1.1.7 1.7.9v.7c0 1.6 1.3 2.9 2.9 2.9s2.9-1.3 2.9-2.9v-.7c.6-.2 1.2-.5 1.7-.9l.6.4c1.3.7 2.9.2 3.6-1.1.7-1.3.2-2.9-1.1-3.6l-.6-.4c.1-.6.1-1.3 0-1.9l.6-.4c1.3-.7 1.8-2.3 1.1-3.6-.7-1.3-2.3-1.8-3.6-1.1l-.6.4c-.5-.4-1.1-.7-1.7-.9v-.7c0-1.6-1.3-2.9-2.9-2.9Zm0 2c.5 0 .9.4.9.9v1.2c0 .5.3.9.8 1.1.6.2 1.1.5 1.6.9.4.3.9.3 1.3.1l1-.6c.4-.2.9-.1 1.1.3.2.4.1.9-.3 1.1l-1 .6c-.4.2-.6.7-.4 1.1.2.6.2 1.2 0 1.8-.1.4 0 .9.4 1.1l1 .6c.4.2.5.7.3 1.1-.2.4-.7.5-1.1.3l-1-.6c-.4-.2-.9-.2-1.3.1-.5.4-1 .7-1.6.9-.4.2-.8.6-.8 1.1v1.2c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-1.2c0-.5-.3-.9-.8-1.1-.6-.2-1.1-.5-1.6-.9-.4-.3-.9-.3-1.3-.1l-1 .6c-.4.2-.9.1-1.1-.3-.2-.4-.1-.9.3-1.1l1-.6c.4-.2.6-.7.4-1.1-.2-.6-.2-1.2 0-1.8.1-.4 0-.9-.4-1.1l-1-.6c-.4-.2-.5-.7-.3-1.1.2-.4.7-.5 1.1-.3l1 .6c.4.2.9.2 1.3-.1.5-.4 1-.7 1.6-.9.4-.2.8-.6.8-1.1V10.4c0-.5.4-.9.9-.9Zm0 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 2a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z" fill="#7B7B8B"/></svg>
                  <span className='text-sm'>GPT-4o</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-400"><path d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Smart Highlight Card */}
            <div data-aos="fade-up" data-aos-duration="200" data-aos-delay="400" className="shadow-lg w-[280px] h-fit rounded-2xl border border-zinc-100/20 bg-white p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex p-1 items-center justify-center rounded-md bg-purple-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-purple-400"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                </div>
                <div>
                  <span className="font-medium text-zinc-900 text-base">Smart Highlight</span>
                  <div className="text-xs text-zinc-400">Source context</div>
                </div>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-purple-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                  <span>Annual Report 2025</span>
                </div>
                <div className="text-xs text-zinc-600">Our company achieved significant growth in the past year with...</div>
                <div className="rounded-lg border-l-2 border-purple-400 bg-purple-100/60 p-2 text-zinc-900 text-xs font-medium">Revenue increased by 45% year-over-year, reaching $12.8M in total sales.</div>
                <div className="text-xs text-zinc-600">This success can be attributed to our innovative approach...</div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">Page 12 of 24</div>
              </div>
            </div>

            {/* Stats Card */}
            <div data-aos="fade-up" data-aos-duration="200" data-aos-delay="800" className="shadow-lg h-fit bg-white  w-[280px] rounded-2xl border border-zinc-100/20  p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex p-1 items-center justify-center rounded-md bg-purple-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2 text-purple-400"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
                </div>
                <span className="text-xs font-medium text-zinc-400">Last 30 days</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Response Accuracy</span>
                  <span className="text-sm font-semibold text-zinc-900">98.3%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-400/80 duration-1000" style={{ width: `${boxWidths[0]}%` }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Query Logs</span>
                  <span className="text-sm font-semibold text-zinc-900">2.4K</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-300 to-purple-400/80 duration-1000" style={{ width: `${boxWidths[1]}%` }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Lead Generation</span>
                  <span className="flex items-center text-xs text-green-600 font-medium">+30%<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg></span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-green-600 duration-1000" style={{ width: `${boxWidths[2]}%` }}></div>
                </div>
                <div className="flex justify-between gap-2 pt-1">
                  <div className="rounded-xl p-2">
                    <span className="text-xs text-zinc-500">Avg. Response time</span>
                    <span className="block text-sm font-semibold text-zinc-900">1.2s</span>
                  </div>
                  <div className="rounded-xl p-2">
                    <span className="text-xs text-zinc-500">Conversion</span>
                    <span className="block text-sm font-semibold text-zinc-900">24.8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Processing Card */}
            <div data-aos="fade-up" data-aos-duration="200" data-aos-delay="1200" className="shadow-lg w-[280px] rounded-2xl border border-zinc-100/20 bg-white p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex p-1 items-center justify-center rounded-md bg-purple-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-purple-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                </div>
                <div className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">Parsed</div>
              </div>
              <div className="flex gap-1.5 mb-2">
                <span className="rounded-md bg-zinc-100/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600">.pdf</span>
                <span className="rounded-md bg-zinc-100/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600">.doc</span>
                <span className="rounded-md bg-zinc-100/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600">.txt</span>
                <span className="rounded-md bg-zinc-100/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600">.md</span>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-purple-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                  <span>Unstructured Content</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-purple-400"></div><span className="text-xs text-zinc-700">Tables & Charts</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-purple-400"></div><span className="text-xs text-zinc-700">Headers & Lists</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-purple-400"></div><span className="text-xs text-zinc-700">Images & Captions</span></div>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div><span className="text-zinc-600">Processing</span></div>
                  <span className="text-zinc-500">65% Complete</span>
                </div>
                 <div className="w-full h-2 rounded-full bg-zinc-100 mt-2 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r bg-green-600 transition-all duration-1000 ease-in-out" style={{ width: `${boxWidths[3]}%` }}
      ></div>
    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 lg:mt-32 mb-[161px]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center mb-2">Everything you need for <br /><span className="text-[#BF56FF]">Interactive Content</span></h2>
        <p className="text-[#7D7D7D] text-center max-w-4xl mb-15 text-base sm:text-lg">Transform your websites and documents into interactive knowledge bases. Let users find answers through natural conversations.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 w-full max-w-6xl px-2 sm:px-4">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </section>
    
      <section className="w-full flex flex-col items-center mb-20">
        <div data-aos="fade-up" data-aos-duration="500" className="text-center mb-2 text-purple-400 font-semibold">How It Works</div>
        <h2 data-aos="fade-up" data-aos-duration="500" className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-2">Start in <span className="text-purple-500">Three</span> Steps</h2>
        <p data-aos="fade-up" data-aos-duration="500" className="text-[#8D8D8D] text-center max-w-2xl mb-10 text-base sm:text-lg">Setting up your AI chat assistant is quick and easy. Follow these steps to transform your content into an interactive knowledge base.</p>
        <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl gap-10 px-2 sm:px-4">
        
          <div className="flex-1 flex flex-col gap-10 w-full">
            {steps.map((step, idx) => (
              <div data-aos="fade-right"  data-aos-duration="500" data-aos-delay={step.delay} key={idx} className="flex items-start gap-4 w-full">
                <div className="flex flex-col items-center mr-2">
                  <div className="w-9 h-9 rounded-full border-purple-200 flex items-center justify-center text-lg font-bold text-purple-400 mb-1">{idx + 1}</div>
                  {idx < steps.length - 1 && <div className="w-1 h-16 bg-purple-100" />}
                </div>
                <div>
                  <div className="bg-purple-100 rounded-xl p-2 mb-2 flex items-center justify-center text-[#BF56FF] text-2xl w-10 h-10">{step.icon}</div>
                  <div className="font-semibold text-lg text-zinc-900 mb-1">{step.title}</div>
                  <div className="text-[#7D7D7D] text-sm max-w-xs">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          {/* AI Assistant Box (Right) */}
          <div data-aos="fade-up" data-aos-duration="500" className="flex-1 flex items-center justify-center w-full">
            <div className="bg-purple-50 rounded-3xl  py-3  md:py-16  w-full max-w-md shadow-md flex items-center justify-center">
              {/* AI Assistant Chat Card */}
              <div className="w-full max-w-xs bg-white/80 rounded-2xl shadow-lg border border-zinc-100/20 p-5 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center bg-purple-500 justify-center rounded-md p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot w-4 h-4 text-white" aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                  </div>
                  <span className="font-semibold text-zinc-900 text-base">AI Assistant</span>
                </div>
                <div className="wrap flex flex-col gap-2">
                <div className="flex items-center gap-2 mt-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-purple-400 lucide-sparkles w-4 text-primary" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  <span className="text-sm font-medium text-purple-500">Document Processed</span>
                </div>
               <div className="w-full h-2 rounded-full bg-purple-100 mb-2 overflow-hidden duration-1000" style={{ width: `${boxWidths[4]}%` }}>
      <div
        className="h-full rounded-full bg-purple-400 transition-all duration-1000 ease-in-out"
      ></div>
    </div>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-400">Content Analyzed</span>
                  <span className="text-zinc-900 font-medium">100%</span>
                </div>
                <div className="mb-3">
                  <div className="bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] rounded-xl px-3 py-2 text-sm text-zinc-800 shadow-sm w-fit max-w-full mt-5">
                    I've Analyzed your document. What would you like to know about it
                    <div className="text-[10px] text-zinc-400 mt-1 text-left">2:30 PM</div>
                  </div>
                </div>
                <form className="flex items-center gap-2 mt-8">
                  <input disabled type="text" placeholder="Ask about anything" className="flex-1  rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
                  <button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
     <section >
        {/* <div className="text-center py-5 px-4 max-w-7xl mx-auto">
             <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase">Pricing</h4>
             <h2 className="text-3xl sm:text-4xl font-bold mb-8">Simple Pricing</h2>
             <p className="mb-12 text-[#8D8D8D] max-w-6xl mx-auto">Use Corpus Chat for free. Upgrade to enable custom domains and more advanced features.</p>
             </div> */}
       <Pricingg/>
       </section>
      {/* <FAQSection/> */}
      <SolutionFAQ faqs={corpusChatFaq} title='FAQ' subtitle='Frequently Asked Questions' />
      <section className="text-center px-4 mt-[56px] lg:mt-32 pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
          Ready to transform your content into<br/><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent">interactive conversations?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] font-medium mx-auto text-base sm:text-lg">
          Start for free and upgrade as your needs grow.
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

export default CorpusChatPage;

