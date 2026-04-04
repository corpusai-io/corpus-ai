import React from 'react';

interface ToggleProps {
  value: 'Monthly' | 'Yearly';
  onChange: (value: 'Monthly' | 'Yearly') => void;
}

const Toggle: React.FC<ToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-center mb-10">
      <div className=" border border-gray-200 rounded-full p-2 flex shadow-inner">
        <button
          className={`px-6 py-2 rounded-full font-medium focus:outline-none transition-all duration-150 ${
            value === 'Monthly'
              ? 'bg-[#BF56FF] text-white shadow'
              : 'text-black'
          }`}
          onClick={() => onChange('Monthly')}
        >
          Monthly
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium focus:outline-none transition-all duration-150 ${
            value === 'Yearly'
              ? 'bg-[#BF56FF] text-white shadow'
              : 'text-black'
          }`}
          onClick={() => onChange('Yearly')}
        >
          Yearly
        </button>
      </div>
    </div>
  );
};

export default Toggle;
