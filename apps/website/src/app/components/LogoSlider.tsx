
'use client';
export default function LogoSlider() {
  const logos = [
    '/koinclub.png',
    '/evolve-skateboard.png',
    '/the bradery.png',
    '/fohelli.png',
    '/urth.png',
    '/cabaia.png',
    '/avalon king.png',
  ];

  return (
    <div className="relative w- overflow-hidden bg-transparent py-6">
      
      <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
      <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

      
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          animation: 'scrollLeft 20s linear infinite',
          display: 'inline-flex',
        }}
      >
        
        {[...logos, ...logos].map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`logo-${i}`}
            className="h-6 w-[1216px] grayscale opacity-20 hover:opacity-100 transition-opacity"
          />
        ))}
      </div>

      
      <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
