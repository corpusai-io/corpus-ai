'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Database, ShoppingCart, Stethoscope, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TabContent {
  label: string;
  content: React.ReactNode;
}

interface AgentExample {
  id: string;
  icon: typeof Database;
  label: string;
  badge: string;
  heading: string;
  description: string;
  features: string[];
  cta: string;
  tabs: TabContent[];
}

// ─── Code syntax colors (inside dark code panels) ─────────────────────────────

function Kw({ children }: { children: React.ReactNode }) {
  return <span className="text-[#E2E8F0]">{children}</span>;
}
function Val({ children }: { children: React.ReactNode }) {
  return <span className="text-[#93C5FD]">{children}</span>;
}
function Col({ children }: { children: React.ReactNode }) {
  return <span className="text-[#94A3B8]">{children}</span>;
}
function Cmt({ children }: { children: React.ReactNode }) {
  return <span className="text-[#4B5563]">{children}</span>;
}
function Grn({ children }: { children: React.ReactNode }) {
  return <span className="text-[#34D399]">{children}</span>;
}
function Ref({ children }: { children: React.ReactNode }) {
  return <span className="text-[#CBD5E1]">{children}</span>;
}

// ─── 3 Agent Examples ─────────────────────────────────────────────────────────

const agentExamples: AgentExample[] = [
  {
    id: 'database',
    icon: Database,
    label: 'Database Agent',
    badge: 'SQL + Natural Language',
    heading: 'Query any database with natural language',
    description:
      'Connect PostgreSQL, MySQL, MongoDB, or DynamoDB — your agent translates natural questions into precise queries, returns structured results, and explains the data in plain English.',
    features: [
      'Read-only mode by default — your data stays safe',
      'Auto-generates optimized SQL from natural language',
      'Schema-aware — understands table relationships',
      'Results as tables, charts, or natural language',
    ],
    cta: 'Connect your database',
    tabs: [
      {
        label: 'Schema',
        content: (
          <div className="font-mono text-xs leading-relaxed text-[#CBD5E1]">
            <Cmt>{'// Connected: production_db (PostgreSQL)'}</Cmt>
            <br /><br />
            <div><Kw>TABLE</Kw> <Col>orders</Col> <Cmt>{'{'}</Cmt></div>
            <div className="pl-4"><Col>id</Col>{'          '}<Kw>SERIAL</Kw> <Kw>PRIMARY KEY</Kw></div>
            <div className="pl-4"><Col>customer_id</Col>{' '}<Kw>INTEGER</Kw> <Ref>&rarr;</Ref> <Val>customers.id</Val></div>
            <div className="pl-4"><Col>total</Col>{'       '}<Kw>DECIMAL</Kw><Val>(10,2)</Val></div>
            <div className="pl-4"><Col>status</Col>{'      '}<Kw>VARCHAR</Kw><Val>(20)</Val></div>
            <div className="pl-4"><Col>created_at</Col>{'  '}<Kw>TIMESTAMP</Kw></div>
            <Cmt>{'}'}</Cmt>
          </div>
        ),
      },
      {
        label: 'Query',
        content: (
          <div className="font-mono text-xs leading-relaxed text-[#CBD5E1]">
            <Cmt>{'// User: "How many orders last week?"'}</Cmt>
            <br /><br />
            <Kw>SELECT</Kw> <Col>COUNT</Col><Val>(*)</Val> <Kw>AS</Kw> <Col>total_orders</Col>,<br />
            {'  '}<Col>SUM</Col><Val>(total)</Val> <Kw>AS</Kw> <Col>revenue</Col><br />
            <Kw>FROM</Kw> <Col>orders</Col><br />
            <Kw>WHERE</Kw> <Col>created_at</Col> {'>'} <Val>NOW</Val><Val>()</Val> - <Kw>INTERVAL</Kw> <Val>&apos;7 days&apos;</Val><br />
            {'  '}<Kw>AND</Kw> <Col>status</Col> = <Val>&apos;completed&apos;</Val>;
            <br /><br />
            <Cmt>{'// Execution time: 12ms'}</Cmt><br />
            <Cmt>{'// Rows scanned: 2,847'}</Cmt>
          </div>
        ),
      },
      {
        label: 'Result',
        content: (
          <div className="font-mono text-xs leading-relaxed">
            <Cmt>{'// Query result'}</Cmt>
            <br /><br />
            <div className="border border-white/[0.08] rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-white/[0.04] border-b border-white/[0.08]">
                <div className="px-3 py-2 text-[#94A3B8] font-medium">Metric</div>
                <div className="px-3 py-2 text-[#94A3B8] font-medium">Value</div>
                <div className="px-3 py-2 text-[#94A3B8] font-medium">Change</div>
              </div>
              <div className="grid grid-cols-3 border-b border-white/[0.08]">
                <div className="px-3 py-2 text-[#64748B]">Orders</div>
                <div className="px-3 py-2"><Grn>2,847</Grn></div>
                <div className="px-3 py-2"><Grn>+23%</Grn></div>
              </div>
              <div className="grid grid-cols-3 border-b border-white/[0.08]">
                <div className="px-3 py-2 text-[#64748B]">Revenue</div>
                <div className="px-3 py-2"><Grn>$184,320</Grn></div>
                <div className="px-3 py-2"><Grn>+18%</Grn></div>
              </div>
              <div className="grid grid-cols-3">
                <div className="px-3 py-2 text-[#64748B]">Avg Order</div>
                <div className="px-3 py-2"><Val>$64.72</Val></div>
                <div className="px-3 py-2"><Val>-3%</Val></div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'ecommerce',
    icon: ShoppingCart,
    label: 'E-Commerce Agent',
    badge: 'RAG + Actions',
    heading: 'Your smartest sales associate, 24/7',
    description:
      'Combines deep product knowledge (RAG) with autonomous actions — track orders, process returns, recommend products, and upsell intelligently, all in a single conversation.',
    features: [
      'Product recommendations based on browsing and purchase history',
      'Real-time order tracking and status updates',
      'Automated returns, exchanges, and refund processing',
      'Upsell and cross-sell with contextual awareness',
    ],
    cta: 'Build your store agent',
    tabs: [
      {
        label: 'Prompt',
        content: (
          <div className="font-mono text-xs leading-relaxed space-y-3 text-[#CBD5E1]">
            <div><Cmt>{'// Customer conversation'}</Cmt></div>
            <div>
              <Col>Customer:</Col> <span className="text-[#E2E8F0]">&quot;I bought the wireless headphones last week but the left earbud stopped working. Can I get a replacement?&quot;</span>
            </div>
            <br />
            <div><Cmt>{'// Agent reasoning'}</Cmt></div>
            <div className="space-y-1">
              <div><Kw>[Search]</Kw> <span className="text-[#64748B]">Finding order → #ORD-7234</span></div>
              <div><Kw>[Verify]</Kw> <span className="text-[#64748B]">Within 30-day warranty ✓</span></div>
              <div><Kw>[Action]</Kw> <span className="text-[#64748B]">Creating replacement order</span></div>
              <div><Kw>[Action]</Kw> <span className="text-[#64748B]">Generating return label</span></div>
            </div>
          </div>
        ),
      },
      {
        label: 'Actions',
        content: (
          <div className="font-mono text-xs leading-relaxed space-y-3 text-[#CBD5E1]">
            <Cmt>{'// Executed actions'}</Cmt>
            <br /><br />
            <div className="space-y-3">
              {[
                { label: 'Order lookup', detail: 'GET /api/orders/ORD-7234 → ' },
                { label: 'Warranty check', detail: 'Purchased 6 days ago → ' },
                { label: 'Replacement created', detail: 'POST /api/orders/replace → ' },
                { label: 'Return label sent', detail: 'Email → customer@email.com ' },
              ].map(({ label, detail }) => (
                <div key={label} className="flex items-start gap-2">
                  <Grn>✓</Grn>
                  <div>
                    <div className="text-[#94A3B8]">{label}</div>
                    <div className="text-[#4B5563]">{detail}<Grn>200 OK</Grn></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        label: 'Response',
        content: (
          <div className="font-mono text-xs leading-relaxed text-[#CBD5E1]">
            <Cmt>{'// Agent response'}</Cmt>
            <br /><br />
            <div className="bg-white/[0.04] border border-white/[0.08] p-4 rounded-xl space-y-3">
              <div className="text-[#E2E8F0] leading-relaxed">
                &quot;I&apos;m sorry about the issue with your headphones! I&apos;ve already set up a replacement for you:&quot;
              </div>
              <div className="space-y-2 text-[#94A3B8]">
                <div>• <Grn>Replacement order #ORD-7301</Grn> created</div>
                <div>• Ships within <Val>24 hours</Val> (free express)</div>
                <div>• Return label sent to your email</div>
                <div>• No need to wait — keep using the right earbud!</div>
              </div>
              <div className="text-[#4B5563] text-[10px] pt-2 border-t border-white/[0.04]">
                Would you also like a <Val>20% discount code</Val> for your next purchase as an apology?
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'healthcare',
    icon: Stethoscope,
    label: 'Healthcare Agent',
    badge: 'Appointments + Triage',
    heading: 'Patient support that never sleeps',
    description:
      'HIPAA-aware AI that handles appointment scheduling, symptom pre-screening, insurance verification, and prescription refill requests — reducing front-desk workload by 60%.',
    features: [
      'Smart appointment scheduling with provider matching',
      'Symptom pre-screening and urgency triage',
      'Insurance verification and copay estimation',
      'Prescription refill requests with pharmacy routing',
    ],
    cta: 'Build your healthcare agent',
    tabs: [
      {
        label: 'Conversation',
        content: (
          <div className="font-mono text-xs leading-relaxed space-y-3 text-[#CBD5E1]">
            <Cmt>{'// Patient interaction'}</Cmt>
            <br />
            <div>
              <Col>Patient:</Col> <span className="text-[#E2E8F0]">&quot;I need to see a cardiologist. I&apos;ve been having chest tightness after exercise.&quot;</span>
            </div>
            <br />
            <div><Cmt>{'// Agent triage assessment'}</Cmt></div>
            <div className="space-y-1">
              <div><Kw>[Triage]</Kw> <span className="text-[#FCD34D]">Priority: Elevated</span></div>
              <div><Kw>[Check]</Kw> <span className="text-[#64748B]">Insurance: BlueCross PPO ✓</span></div>
              <div><Kw>[Match]</Kw> <span className="text-[#64748B]">Dr. Sarah Chen — Cardiology</span></div>
              <div><Kw>[Book]</Kw> <span className="text-[#64748B]">Next available: Tomorrow 2:30 PM</span></div>
            </div>
          </div>
        ),
      },
      {
        label: 'Scheduling',
        content: (
          <div className="font-mono text-xs leading-relaxed text-[#CBD5E1]">
            <Cmt>{'// Available slots — Dr. Sarah Chen, Cardiology'}</Cmt>
            <br /><br />
            <div className="border border-white/[0.08] rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-white/[0.04] border-b border-white/[0.08]">
                <div className="px-3 py-2 text-[#94A3B8] font-medium">Date</div>
                <div className="px-3 py-2 text-[#94A3B8] font-medium">Time</div>
                <div className="px-3 py-2 text-[#94A3B8] font-medium">Status</div>
              </div>
              <div className="grid grid-cols-3 border-b border-white/[0.08] bg-[#34D399]/[0.04]">
                <div className="px-3 py-2 text-[#E2E8F0]">Tomorrow</div>
                <div className="px-3 py-2"><Grn>2:30 PM</Grn></div>
                <div className="px-3 py-2"><Grn>● Booked</Grn></div>
              </div>
              <div className="grid grid-cols-3 border-b border-white/[0.08]">
                <div className="px-3 py-2 text-[#64748B]">Thu, Feb 27</div>
                <div className="px-3 py-2 text-[#64748B]">10:00 AM</div>
                <div className="px-3 py-2 text-[#4B5563]">Available</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="px-3 py-2 text-[#64748B]">Fri, Feb 28</div>
                <div className="px-3 py-2 text-[#64748B]">11:30 AM</div>
                <div className="px-3 py-2 text-[#4B5563]">Available</div>
              </div>
            </div>
            <br />
            <Cmt>{'// Copay estimate: $35 (BlueCross PPO)'}</Cmt>
          </div>
        ),
      },
      {
        label: 'Confirmation',
        content: (
          <div className="font-mono text-xs leading-relaxed text-[#CBD5E1]">
            <Cmt>{'// Appointment confirmed'}</Cmt>
            <br /><br />
            <div className="bg-white/[0.04] border border-white/[0.08] p-4 rounded-xl space-y-3">
              <div className="text-[#E2E8F0] leading-relaxed">
                &quot;Your appointment is all set! Here&apos;s a summary:&quot;
              </div>
              <div className="space-y-2 text-[#94A3B8]">
                <div>• <span className="text-[#E2E8F0]">Dr. Sarah Chen</span> — Cardiology</div>
                <div>• <Grn>Tomorrow at 2:30 PM</Grn></div>
                <div>• Location: <Val>City Medical Center, Suite 401</Val></div>
                <div>• Estimated copay: <Val>$35</Val></div>
              </div>
              <div className="border-t border-white/[0.04] pt-3 space-y-1.5 text-[#64748B]">
                <div>✓ Confirmation email sent</div>
                <div>✓ Calendar invite added</div>
                <div>✓ Pre-visit forms sent to your patient portal</div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
];

// ─── Interactive Tab Widget (dark code panel) ─────────────────────────────────

function TabWidget({ tabs, autoRotate }: { tabs: TabContent[]; autoRotate: boolean }) {
  const [activeTab, setActiveTab] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoRotate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!autoRotate) return;
    intervalRef.current = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 3000);
  }, [autoRotate, tabs.length]);

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoRotate]);

  const handleTabClick = (i: number) => {
    setActiveTab(i);
    startAutoRotate();
  };

  useEffect(() => {
    setActiveTab(0);
  }, [tabs]);

  return (
    <div className="bg-[#0F0F14] rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.08] bg-white/[0.02]">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => handleTabClick(i)}
            className={`px-4 py-3 text-xs font-medium transition-colors relative cursor-pointer ${
              i === activeTab ? 'text-white' : 'text-[#4B5563] hover:text-[#6B7280]'
            }`}
          >
            {tab.label}
            {i === activeTab && (
              <motion.div
                layoutId="dbTab"
                className="absolute bottom-0 left-0 right-0 h-px bg-white"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
        {autoRotate && (
          <div className="ml-auto flex items-center pr-4">
            <div className="w-16 h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/30 rounded-full"
                key={`${activeTab}-progress`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="p-6 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${tabs[activeTab]?.label}-${activeTab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tabs[activeTab]?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function DatabaseSection() {
  const [activeExample, setActiveExample] = useState(0);
  const example = agentExamples[activeExample];
  const Icon = example.icon;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % agentExamples.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-28 px-6 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E8E8E8] text-sm text-[#737373] shadow-sm mb-6">
            Agent Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-medium text-[#171717] tracking-[-0.02em]">
            See what your agent can do
          </h2>
          <p className="text-lg font-normal text-[#737373] mt-4 max-w-2xl mx-auto">
            From database queries to appointment booking — Corpus AI agents handle complex workflows across every industry.
          </p>
        </div>

        {/* Carousel Selector */}
        <div className="flex justify-center gap-3 mb-12">
          {agentExamples.map((ex, i) => {
            const ExIcon = ex.icon;
            return (
              <button
                key={ex.id}
                onClick={() => setActiveExample(i)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  i === activeExample
                    ? 'bg-[#171717] text-white'
                    : 'bg-white border border-[#E8E8E8] text-[#737373] hover:text-[#171717] hover:border-[#D1D5DB]'
                }`}
              >
                <ExIcon className="w-4 h-4" />
                {ex.label}
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={example.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start"
          >
            {/* Left Side: Text Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] border border-[#E8E8E8] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#171717]" />
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white border border-[#E8E8E8] text-[#737373] shadow-sm">
                  {example.badge}
                </span>
              </div>

              <h3 className="text-3xl md:text-4xl font-medium text-[#171717] tracking-[-0.02em] leading-tight">
                {example.heading}
              </h3>
              <p className="text-base font-normal text-[#737373] mt-4 leading-relaxed max-w-lg">
                {example.description}
              </p>

              <div className="space-y-3 mt-8">
                {example.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#171717] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#737373]">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/Sign-In"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#171717] hover:text-[#737373] transition-colors"
                >
                  {example.cta}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Side: Dark Code Panel */}
            <TabWidget tabs={example.tabs} autoRotate={true} />
          </motion.div>
        </AnimatePresence>

        {/* Carousel dots */}
        <div className="flex justify-center gap-2 mt-12">
          {agentExamples.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveExample(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === activeExample
                  ? 'bg-[#171717] w-6'
                  : 'bg-[#D1D5DB] hover:bg-[#737373] w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
