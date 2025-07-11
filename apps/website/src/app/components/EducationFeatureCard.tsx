"use client";
import React from 'react';

type EducationFeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const EducationFeatureCard: React.FC<EducationFeatureCardProps> = ({ icon, title, description, }) => (
 <div
  className="
    relative bg-white group rounded-2xl border-2 border-[#EEEEEE] p-6 flex flex-col
    min-w-[220px] min-h-[160px] transition shadow-sm hover:shadow-md
    hover:ring-purple-200 hover:border-[#BF56FF]
    before:content-[''] before:absolute before:inset-0 before:rounded-xl
    before:opacity-0 before:transition-all before:duration-300
    before:z-[-5]
    hover:before:bg-[#F0D7FF] hover:before:blur-[25px] hover:before:opacity-100
  "
>
    <div className="absolute left-0 top-20 h-7 w-1 rounded bg-purple-300 transition-all duration-200 group-hover:bg-purple-500 group-hover:scale-y-125"  />
    <div className="relative z-10 flex items-center mb-4">
      <div className="bg-purple-100 hover:animate-pulse transition rounded-lg border border-purple-200 p-2 text-purple-500 text-xl flex items-center justify-center mr-2">
        {icon}
      </div>
    </div>
    <div className="font-semibold text-lg mb-1 text-zinc-900 group-hover:ml-4 duration-200 group-hover:text-purple-500">
      {title}
    </div>
    <div className="text-zinc-500 text-sm">{description}</div>
  </div>
);

export default EducationFeatureCard;
