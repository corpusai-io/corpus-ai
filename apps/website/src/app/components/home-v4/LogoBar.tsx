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
    <section className="py-16 px-6 bg-gradient-to-b from-[#F9FAFB] to-white">
      <p className="text-center text-xs font-semibold text-[#9CA3AF] uppercase tracking-[0.2em] mb-8">
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
              className="text-xl font-semibold text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors duration-500 mx-10 whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
