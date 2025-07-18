import React from 'react';
import Link from 'next/link';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonLabel: string;
  highlight?: boolean;
  highlightLabel?: string;
  href?: string;
  subText?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  features,
  buttonLabel,
  highlight = false,
  highlightLabel,
  href,
  subText,
}) => {
  return (
    <div
      className={`flex flex-col border rounded-2xl p-6 bg-white shadow-sm relative transition-all duration-200 ${
        highlight ? 'border-[#BF56FF] border-2 shadow-lg scale-105 z-10' : 'border-gray-200'
      }`}
    >
      {highlight && highlightLabel && (
        <div className="box flex justify-center items-center bg-gradient-to-br from-white to-[#BF56FF] gap-2 absolute -top-4 left-1/2 -translate-x-1/2 w-full max-w-36 py-1 rounded-full shadow">
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 15.8333C5.23857 15.8333 3 13.5947 3 10.8333C3 9.39747 3.60524 8.103 4.57453 7.19107C5.46935 6.34917 7.66667 4.83301 7.33333 1.5C11.3333 4.16667 13.3333 6.83333 9.33333 10.8333C10 10.8333 11 10.8333 12.6667 9.1864C12.8465 9.70213 13 10.2563 13 10.8333C13 13.5947 10.7614 15.8333 8 15.8333Z" fill="white"/>
</svg>

          <span className="text-white font-medium md:text-[12px] lg:text-[15px]">
          {highlightLabel}
        </span>
        </div>
       
      )}
      <h3 className="text-[15px] font-semibold mb-1">{title}</h3>
      <div className="flex flex-col items-start mb-2">
        <div className="flex items-end">
          <span className="text-[40px] font-bold">{price}</span>
          <span className="text-base text-[#858585] ml-1">{(title == "Free"? "": "/mo")}</span>
        </div>
        {subText && (
          <span className="text-xs text-[#858585] mt-1">{subText}</span>
        )}
      </div>
      <p className="text-[#858585] mb-4 text-sm">{description}</p>
      {href ? (
        <Link href={href} 
        className={`w-full py-2 rounded-lg font-semibold mb-2   transition-colors duration-250 text-center block ${
          highlight
            ? 'bg-[#BF56FF] text-white  hover:bg-purple-600'
            : 'bg-white border hover:bg-[#BF56FF] hover:text-white border-gray-200 text-gray-800'
        }`}
        >
          
            
          
            {buttonLabel}
          
        </Link>
      ) : (
        <button
          className={`w-full py-2 rounded-lg font-medium mb-2 transition-colors duration-150 ${
            highlight
              ? 'bg-[#BF56FF] text-white hover:bg-purple-600'
              : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
          }`}
        >
          {buttonLabel}
        </button>
      )}
      <ul className="space-y-3 mt-4">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-[15px] text-[#858585]">
            <svg
              className="w-[24px] h-[24px] text-[#BF56FF] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>

            <p className='text-[15px]'>{feature}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard; 