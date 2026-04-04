'use client';
import React, { useState } from 'react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
     
      <div className="text-center mb-12">
        <h1 className="text-lg font-bold text-[#BF56FF] mb-2">FAQ</h1>
        <h2 className="text-4xl font-semibold text-black mb-4">Frequently Asked Questions</h2>
        <p className="text-[#8D8D8D]">
          If you have any questions, please don&rsquo;t hesitate to contact us.
        </p>
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

export default FAQSection;