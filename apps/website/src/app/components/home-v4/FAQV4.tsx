'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How is Corpus AI different from a regular chatbot?',
    answer:
      'Traditional chatbots follow pre-written scripts and keyword matching. Corpus AI agents use RAG (Retrieval-Augmented Generation) to understand your actual data, reason through complex queries, and even execute actions like querying databases or triggering workflows. It\u2019s the difference between a phone tree and a knowledgeable team member.',
  },
  {
    question: 'What data sources can I connect?',
    answer:
      'You can upload PDFs, Word documents, text files, and web pages. You can also crawl entire websites, connect databases (PostgreSQL, MySQL, MongoDB, DynamoDB), and integrate with tools via Zapier. All data is chunked, embedded, and indexed automatically.',
  },
  {
    question: 'How does database connectivity work?',
    answer:
      'Connect your database credentials securely, and your agent can translate natural language questions into optimized SQL queries. It operates in read-only mode by default, understands your schema relationships, and returns results as formatted tables or plain English explanations.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We use isolated AWS infrastructure with SOC 2 compliance standards. Your training data is never shared across accounts or used to train public models. You can also configure domain whitelisting and IP-based access controls.',
  },
  {
    question: 'Can I deploy on multiple channels simultaneously?',
    answer:
      'Yes. A single agent can be live on your website, Slack, WhatsApp, Telegram, and WordPress at the same time. All channels share the same training data, conversation history, and configuration.',
  },
  {
    question: 'What happens when the agent can\u2019t answer?',
    answer:
      'You have full control over fallback behavior: hand off to a human agent with conversation context, capture the user\u2019s contact info for follow-up, or display a custom message. All unanswered questions are logged so you can improve training data over time.',
  },
  {
    question: 'Do I need technical expertise to set up?',
    answer:
      'Not at all. Most users have a working agent in under five minutes \u2014 upload your data, customize the look, and embed a code snippet. For advanced features like database connectivity and API integrations, we provide step-by-step guides and priority support.',
  },
];

export default function FAQV4() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold text-[#7C3AED] uppercase tracking-widest mb-4">
          FAQ
        </p>
        <h2 className="text-4xl font-bold text-[#111827] tracking-tight">
          Questions &amp; answers
        </h2>
        <p className="text-lg text-[#6B7280] mt-4">
          Everything you need to know before you build.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i} className={`border-b border-[#E5E7EB] last:border-b-0`}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-[#FAFAFA] transition-colors"
            >
              <span className="text-base font-medium text-[#111827] pr-4">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#9CA3AF] flex-shrink-0 transition-transform duration-200 ${
                  openIndex === i ? 'rotate-180 text-[#7C3AED]' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-[#6B7280] leading-relaxed px-6 pb-5">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
