'use client';
import React, { useState } from 'react';

type FAQ = {
  question: string;
  answer: string;
};

interface WebsiteFAQProps {
  faqs: FAQ[];
  title?: string;
  subtitle?: string;
  desc?:string;
}

const SolutionFAQ: React.FC<WebsiteFAQProps> = ({
  faqs,
  title = 'FAQ',
  subtitle = 'Education Chatbot FAQ',
  desc = "If you have any questions, please don't hesitate to contact us."
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
 

  return (
    <div data-aos = "fade-up" data-aos-duration = "300" className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-lg font-semibold text-[#BF56FF] mb-2">{title}</h1>
        <h2 className="text-4xl font-semibold text-black mb-4">{subtitle}</h2>
        <h1 className="text-lg font-medium text-[#8D8D8D] mb-2">{desc}</h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-b-[#C9C9C9] overflow-hidden">
            <button
              className={`w-full px-6 py-4 text-left flex justify-between gap-4 items-start ${openIndex === index ? '' : 'bg-white'}`}
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <h3 className="text-lg font-medium text-black">{faq.question}</h3>
              <span className="text-[#8D8D8D] text-xl font-light">
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`faq-answer-static${openIndex === index ? ' open' : ''}  px-6`}
              aria-hidden={openIndex !== index}
            >
              {faq.answer ? (
                <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
              ) : (
                <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolutionFAQ;