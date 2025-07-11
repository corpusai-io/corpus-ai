'use client';
import React, { useState } from 'react';

const CustomerCareFAQ= () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is a customer service chatbot and how does it work?",
      answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost."
    },
    {
      question: "Who can benefit from using AI-powered customer service chatbots?",
      answer: ""
    },
    {
      question: "How can AI chatbots improve customer service?",
      answer: ""
    },
    {
      question: "Can I create my own customer service chatbot?",
      answer: ""
    },
    {
      question: "Can the chatbot for customer service handle complex issues?",
      answer: ""
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
     
      <div className="text-center mb-12">
        <h1 className="text-lg font-bold text-[#BF56FF] mb-2">FAQ</h1>
        <h2 className="text-4xl font-semibold text-black mb-4">Customer Service Chatbot FAQ</h2>
      </div>

      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border-b border-b-[#C9C9C9] overflow-hidden"
          >
            <button
              className={`w-full px-6 py-4 text-left flex justify-between items-center ${openIndex === index ? 'bg-gray-50' : 'bg-white'}`}
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-medium text-black">{faq.question}</h3>
              <span className="text-[#8D8D8D] text-xl font-light">
                {openIndex === index ? '−' : '+'}
              </span>
            </button>

            {openIndex === index && (
              <div className="px-6 pb-4 pt-2 bg-gray-50">
                {faq.answer ? (
                  <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                ) : (
                  <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerCareFAQ;