'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: 'slack',     name: 'Slack',     icon: '/socials-icons/slack.png',     desc: 'Deploy as a Slack workspace bot',  category: 'Messaging' },
  { id: 'whatsapp',  name: 'WhatsApp',  icon: '/socials-icons/whatsapp.png',  desc: 'WhatsApp Business API messaging',  category: 'Messaging' },
  { id: 'telegram',  name: 'Telegram',  icon: '/socials-icons/telegram.png',  desc: 'Telegram bot with full context',   category: 'Messaging' },
  { id: 'wordpress', name: 'WordPress', icon: '/socials-icons/wordpress.png', desc: 'Embed widget on WordPress sites',  category: 'Web'       },
  { id: 'domain',    name: 'Website',   icon: '/socials-icons/domain.png',    desc: 'Widget on any web property',       category: 'Web'       },
  { id: 'shopify',   name: 'Shopify',   icon: '/socials-icons/shopify.png',   desc: 'E-commerce AI agent',              category: 'Commerce'  },
  { id: 'stripe',    name: 'Stripe',    icon: '/socials-icons/stripe.png',    desc: 'Payment intelligence & refunds',   category: 'Payments'  },
  { id: 'email',     name: 'Email',     icon: '/socials-icons/email.png',     desc: 'Gmail and Outlook integration',    category: 'Comms'     },
  { id: 'database',  name: 'Database',  icon: '/socials-icons/database.png',  desc: 'SQL & NoSQL live queries',         category: 'Data'      },
] as const;

// ─── Animation ────────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0, 0, 0.2, 1] as const },
  }),
};

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function IntegrationsOrbit() {
  return (
    <section className="py-16 md:py-28 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            className="inline-flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-full px-4 py-1.5 text-sm text-[#5C5C5C] shadow-sm mb-5"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-3.5 h-3.5 text-[#171717]" />
            Integrations
          </motion.span>
          <motion.h2
            className="text-4xl md:text-5xl font-medium tracking-[-0.02em] text-[#171717]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            One agent, every channel
          </motion.h2>
          <motion.p
            className="text-base font-[family-name:var(--font-inter)] text-[#5C5C5C] mt-4 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            Deploy your AI agent wherever your customers already are.
            Connect once, reach everywhere — live data flows in real time.
          </motion.p>
        </div>

        {/* ── Integration grid ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {INTEGRATIONS.map((integ, i) => (
            <motion.div
              key={integ.id}
              variants={cardVariants}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <Link
                href="/Sign-In"
                className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-[#E8E8E8] bg-white p-4 text-center sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:p-4 sm:text-left transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-[#171717]/20 hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <Image
                  src={integ.icon}
                  alt={integ.name}
                  width={28}
                  height={28}
                  className="h-7 w-7 flex-shrink-0 object-contain sm:h-6 sm:w-6"
                  unoptimized
                />
                <div className="min-w-0 sm:flex-1">
                  <div className="flex items-center justify-center gap-2 sm:justify-between">
                    <p className="text-[13px] font-medium text-[#171717] sm:text-sm">{integ.name}</p>
                    <span className="hidden font-mono text-[9px] uppercase tracking-wider text-[#A1A1A1] sm:inline">
                      {integ.category}
                    </span>
                  </div>
                  <p className="mt-0.5 hidden truncate text-xs leading-relaxed text-[#5C5C5C] sm:block">
                    {integ.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Zapier catch-all ───────────────────────────────────── */}
        <motion.div
          className="mt-3 md:mt-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0, 0, 0.2, 1] }}
        >
          <Link
            href="/Sign-In"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[#D4D4D4] bg-[#F7F7F7] px-6 py-5 transition-colors duration-200 ease-out hover:border-[#171717]/30 hover:bg-[#F2F2F2]"
          >
            <div>
              <p className="text-sm font-medium text-[#171717]">
                + 5,000 more apps via Zapier
              </p>
              <p className="mt-1 text-[13px] text-[#5C5C5C]">
                Connect Corpus AI to anything in your stack — no code required.
              </p>
            </div>
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[13px] font-medium text-[#5C5C5C] transition-colors duration-200 ease-out group-hover:text-[#171717]">
              Browse
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
