"use client";
import React from 'react';

type B2BReasonCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function B2BReasonCard({ icon, title, description }: B2BReasonCardProps) {
  return (
   <div
  className="
    relative bg-white group rounded-2xl border-2 border-zinc-100 p-6 flex flex-col
    min-w-[220px] min-h-[160px] transition shadow-sm hover:shadow-md
    hover:ring-purple-200 hover:border-purple-300
    before:content-[''] before:absolute before:inset-0 before:rounded-2xl
    before:opacity-0 before:transition-all before:duration-300
    before:z-[-1]
    hover:before:bg-[#F0D7FF] hover:before:blur-[25px] hover:before:opacity-100
  "
>
      
      <div className="mb-4 flex items-center ">
        
        <span className="bg-purple-100 rounded-lg border border-purple-200 p-2 text-purple-500 text-xl shadow-[0_0_16px_2px_rgba(168,85,247,0.15)] mr-2 ">
          {icon}
        </span>
      </div>
      <div className="font-semibold text-lg text-zinc-900 mb-1 duration-200 group-hover:text-purple-400">
        {title}
      </div>
      <div className="text-zinc-500 text-sm">{description}</div>
    </div>
  );
}



