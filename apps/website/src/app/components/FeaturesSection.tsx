'use client';
import styles from './FeaturesSection.module.css'
export default function FeaturesSection() {
  return (
    <div className="bg-transparent text-gray-800">
      
      <section className="text-center py-16 px-4 max-w-7xl mx-auto">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase">Deployment</h4>
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">Easy to Deploy Your Chatbot</h2>
        <p className="mb-12 text-[#8D8D8D] max-w-2xl mx-auto">Create a powerful AI chatbot with Corpus AI in minutes – no technical expertise required.</p>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-20 sm:gap-10 mb-[109px] mx-10">
      {[
        {
          title: 'Import your data',
          desc: 'Import your content from websites, documents, or Google Drive. Our system processes and organizes your data for optimal chatbot performance.',
          logo: '/Import.svg', 
        },
        {
          title: 'Customize your chatbot',
          desc: 'Personalize your chatbot using our intuitive builder. Customize the appearance with your logo and brand colors to create a seamless user experience.',
          logo: '/Customize.svg',
        },
        {
          title: 'Deployment',
          desc: 'Deploy your chatbot across multiple platforms including your website and other platforms. Choose from various integration options for maximum flexibility.',
          logo: '/checkbox-circle-line 1 (1).svg',
        },
      ].map((item, i) => (
        <div key={i} className="text-left">
          
          <div className="mb-4 flex items-center justify-start gap-2">
            <img src={item.logo} alt={`${item.title} logo`} width={30} height={30} className='pb-3 sm:pb-2'/>
            <h3 className="text-lg font-semibold text-black mb-2">{item.title}</h3>
             </div>
          
          <p className="text-sm text-[#8D8D8D]">{item.desc}</p>
          <a href="#" className="text-black font-semibold mt-2 inline-block text-sm">Read More →</a>
        </div>
      ))}
    </div>

 <div className="flex flex-wrap justify-center gap-10 text-sm text-gray-500">
          <img src="/Achievements/Acievement(1).svg" alt="" className=""/>
          <img src="/Achievements/Acievement(2).svg" alt="" className=""/>
          <img src="/Achievements/Acievement(3).svg" alt="" className=""/>
          <img src="/Achievements/Acievement(4).svg" alt="" className=""/>
        </div>
      </section>
    </div>

    
);
}
