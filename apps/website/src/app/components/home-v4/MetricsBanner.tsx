'use client';

import { useRef, useEffect, useState } from 'react';

interface Metric {
  value: number;
  prefix?: string;
  suffix: string;
  decimals: number;
  label: string;
}

const metrics: Metric[] = [
  { value: 2.4, suffix: 'M+', decimals: 1, label: 'Messages processed' },
  { value: 500, suffix: '+', decimals: 0, label: 'Active businesses' },
  { value: 99.9, suffix: '%', decimals: 1, label: 'Uptime SLA' },
  { value: 1.2, prefix: '<', suffix: 's', decimals: 1, label: 'Avg response time' },
];

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function AnimatedNumber({ metric }: { metric: Metric }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();

          function animate(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const current = eased * metric.value;
            setDisplay(
              metric.decimals > 0
                ? current.toFixed(metric.decimals)
                : Math.round(current).toString()
            );
            if (progress < 1) requestAnimationFrame(animate);
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [metric]);

  return (
    <div ref={ref} className="bg-white/90 backdrop-blur-sm p-8 text-center v4-metric-glow">
      <div className="text-4xl lg:text-5xl font-bold v4-gradient-text">
        {metric.prefix ?? ''}
        {display}
        {metric.suffix}
      </div>
      <div className="text-sm text-[#6B7280] mt-2">{metric.label}</div>
    </div>
  );
}

export default function MetricsBanner() {
  return (
    <section className="py-28 px-6 bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E9D5FF]/40 rounded-2xl overflow-hidden shadow-lg shadow-[#C084F5]/5">
          {metrics.map((metric) => (
            <AnimatedNumber key={metric.label} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
