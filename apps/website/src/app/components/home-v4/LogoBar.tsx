'use client';

export default function LogoBar() {
  const companies = [
    'Quantum',
    'Meridian',
    'Nexus AI',
    'TechFlow',
    'DataPulse',
    'SynapseHQ',
    'CloudBase',
    'Vertex',
  ];

  return (
    <section className="py-14 px-6 bg-[#F9FAFB]">
      <p className="text-center text-xs font-semibold text-[#9CA3AF] uppercase tracking-[0.2em] mb-8">
        Trusted by teams building the future
      </p>
      <div
        className="overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        }}
      >
        <div className="flex v4-logo-scroll">
          {[...companies, ...companies].map((name, i) => (
            <span
              key={i}
              className="text-xl font-semibold text-[#D1D5DB] mx-10 whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
