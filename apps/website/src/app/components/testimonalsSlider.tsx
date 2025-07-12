'use client';

import Image from "next/image";

export default function TestimonialsSlider() {
  return (
    <div className="relative overflow-hidden py-3 bg-gradient-to-r from-gray-50 to-transparent h-[320px]">
      
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
      
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />

      <div className="w-full">
        <div className="flex animate-slide gap-6">
          {Array.from({ length: 2 }).map((_, repeatIndex) => (
            <div key={repeatIndex} className="flex gap-6">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 shadow-lg rounded-lg p-6 w-80 flex-shrink-0"
                >
                  <Image
                    src="/profile.png"
                    alt="User"
                    width={48}
                    height={48}
                    className="rounded-full border border-gray-300 mb-4"
                  />
                  <p className="text-gray-800 font-medium text-base mb-3">
                    {testimonial.text}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.author}</p>
                  {testimonial.tag && (
                    <div className="mt-3 inline-block bg-green-50 border border-green-700/70 rounded-full px-4 py-1 text-green-700 text-xs font-medium">
                      {testimonial.tag}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-slide {
          animation: slide 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

const testimonials = [
  {
    img: "/user1.png",
    text: "Corpus AI handles support instantly, boosting lead generation with zero setup.",
    author: "Director of Clinical Operations, Kivo Health",
    tag: "Chronic Care Management",
  },
  {
    img: "/user2.png",
    text: "Fast, accurate, and great for lead generation—Corpus AI is a game-changer.",
    author: "VP of Patient Access, NovaCare Solutions",
  },
  {
    img: "/user3.png",
    text: "No setup, just instant, effective support and lead generation with Corpus AI.",
    author: "Director of Payer Strategy, Synergy Health Group",
  },
  {
    img: "/user4.png",
    text: "Health Harbor’s seamless eligibility verifications enable us to focus on patient care.",
    author: "Co-founder & CEO, Flair Health",
    tag: "Respiratory Therapy",
  },
];
