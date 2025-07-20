import React from "react";
interface HeroLeftSide {
  tagText: string;
  title1: string;
  title2: string;
  paragraph: string;
}
const HeroLeftSide:React.FC<HeroLeftSide>=({tagText, title1, title2, paragraph}) =>{
    return(
        <div className="flex-1 flex flex-col items-start px-4 md:px-0  justify-center text-left max-w-lg">
              <span className="mb-4 px-4 py-1 rounded-full bg-[#F6EFFF] text-[#BF56FF] border border-[#D693FF] text-sm font-medium inline-block">{tagText}</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4 text-black">
                {title1}<br />
                <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#BF56FF] bg-clip-text text-transparent">
                {title2}
                </span>
              </h1>
              <p className="text-[#7F7A7A] mb-8 text-base sm:text-lg">
                {paragraph}
              </p>
              <button className="bg-[#BF56FF] text-white rounded-full px-7 py-3 text-base  shadow-md hover:bg-purple-600 transition">Get Started</button>
            </div>
    )
}

export default HeroLeftSide;