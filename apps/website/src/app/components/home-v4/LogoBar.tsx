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
    <section className="py-16 px-6 bg-[#F7F7F7] border-t border-[#E8E8E8]">
      <p className="text-center text-xs font-medium text-[#737373] uppercase tracking-[0.2em] mb-8">
        Powering AI agents at forward-thinking teams
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
              className="text-xl font-semibold text-[#171717]/60 hover:text-[#171717]/80 transition-colors duration-500 mx-10 whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
