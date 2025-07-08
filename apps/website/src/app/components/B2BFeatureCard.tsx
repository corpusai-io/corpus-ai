"use client";
import React from 'react';

type B2BFeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const B2BFeatureCard: React.FC<B2BFeatureCardProps> = ({ icon, title, description, }) => (
  <div className="group relative bg-white rounded-xl shadow-sm border border-zinc-100 p-6 flex flex-col min-w-[220px] min-h-[180px] transition hover:shadow-lg">
    <div className="absolute left-0 top-20 h-7 w-1 rounded bg-purple-300 transition-colors duration-200 group-hover:bg-purple-500" />
    <div className="relative z-10 flex items-center mb-4">
      <div className="bg-purple-100 rounded-lg border border-purple-200 p-2 text-purple-500 text-xl flex items-center justify-center mr-2">
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
