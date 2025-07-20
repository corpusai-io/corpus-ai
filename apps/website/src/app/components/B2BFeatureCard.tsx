"use client";
import React from 'react';

type B2BFeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const B2BFeatureCard: React.FC<B2BFeatureCardProps> = ({ icon, title, description, }) => (
 <div
  className="
    relative bg-white group  border-l border-zinc-100 p-6 flex flex-col
    w-[367px] min-h-[269px] transition
     hover:border-[#EEEEEE]
    before:content-[''] before:absolute before:inset-0 before:rounded-xl
    before:opacity-0 before:transition-all before:duration-300
    before:z-[-5]
    hover:bg-gradient-to-b hover:from-[#FFFFFF] hover:to-[#F9F5FE]
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

export default B2BFeatureCard;
