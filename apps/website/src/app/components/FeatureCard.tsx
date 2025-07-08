"use client";
import React from 'react';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 flex flex-col items-start min-w-[260px] min-h-[180px] transition hover:shadow-[0px_0_100px_rgba(168,85,247,0.5)] hover:ring-2 hover:ring-purple-300 duration-200">
      <div className="bg-purple-100 rounded-xl p-2 mb-4 flex items-center justify-center text-purple-500 text-2xl">
        {icon}
      </div>
      <div className="font-semibold text-lg text-zinc-900 mb-1">{title}</div>
      <div className="text-zinc-500 text-sm">{description}</div>
    </div>
  );
};

export default FeatureCard;
