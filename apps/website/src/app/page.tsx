import Image from 'next/image';
import LogoSlider from '@/app/components/LogoSlider';
import FeaturesSection from '@/app/components/FeaturesSection';
import TestimonialsSlider from '@/app/components/testimonalsSlider';
import TestimonialsSliders from '@/app/components/testimonalsSlider 2';
import FAQSection from '@/app/components/FAQsection'
import PricingSection from '@/app/components/Pricing';
import Navbar from './components/navbar';
export default function Home() {
   
  return (
     
    <main className="min-h-screen bg-transparent overflow-x-hidden">

       <Navbar/>
      <div className="flex justify-center pt-10">
        <div className="inline-flex items-center text-sm font-medium rounded-full px-3 py-1 gap-2 shadow-sm bg-white">
          <span className="bg-[#C458FF] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            NEW
          </span>
          <span className="text-gray-700">
            Introducing PDF Highlights
          </span>
          <span className="text-gray-500 font-bold text-sm">→</span>
        </div>
      </div>

      
      <section className="text-center px-4 pt-8 pb-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-inter text-gray-900 leading-tight">
          AI powered Chatbot <span className="inline-block align-middle text-xl"><div className='rounded-full  border-1 border-[#E0E0E0] bg-white w-[107px] h-[47px] flex justify-center items-center space-x-2 mb-2'>
            <div className="w-[13.67px] h-[13.67px] bg-[#9E9E9E] rounded-full"></div>
            <div className="w-[13.67px] h-[13.67px] bg-[#9E9E9E] rounded-full"></div>
            <div className="w-[13.67px] h-[13.67px] bg-[#9E9E9E] rounded-full"></div>
  </div>
  </span> Built<br />
          for your <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">Website</span>
        </h1>
        <p className="mt-4 text-[#7F7A7A] max-w-xl mx-auto text-base sm:text-lg">
          Empower your website with AI conversations. Get instant answers and
          24/7 support – trusted by thousands.
        </p>

        
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="#"
            className="bg-[#BF56FF] hover:bg-[#a843e6] text-white font-medium px-6 py-2 rounded-full w-full sm:w-auto text-center transition duration-200"
          >
            Get Started
          </a>
          <a
            href="#"
            className="bg-white border-[1.5px] border-gray-300 hover:bg-gray-100 text-[#1E1E1E] font-medium px-6 py-2 rounded-full w-full sm:w-auto text-center transition duration-200"
          >
            Book a Meeting
          </a>
        </div>
      </section>

      
      <div className="relative w-full max-w-screen-xl mx-auto px-4">
  <img
    src="/img(1).svg"
    alt="Demo Image"
    className="w-full h-auto rounded-xl"
  />

  <div className="absolute inset-0 flex items-center justify-center pr-4 sm:pr-6 pb-4 sm:pb-6">
    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[60px] md:h-[60px] lg:w-[85px] lg:h-[85px] rounded-full bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#D796FF_50%,_#BF56FF_100%)] shadow-inner border-[3px] border-white flex items-center justify-center">
      <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] md:border-l-[20px] border-l-white border-t-[10px] sm:border-t-[13px] md:border-t-[15px] border-t-transparent border-b-[10px] sm:border-b-[13px] md:border-b-[15px] border-b-transparent ml-1" />
    </div>
  </div>
</div>

      <div className="text-center mt-15 px-4 sm:px-6 md:px-8 ">
  <span className="text-base sm:text-lg md:text-xl font-medium text-[#8D8D8D]">
    Trusted By Industry Leaders
  </span>
</div>

    <section> <LogoSlider /> </section>
<section><FeaturesSection /></section>

<section className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-10 px-4 md:px-10 py-10">
  <div className="rounded-lg border border-[#EAEAEA] bg-white p-5">
    <div className="flex  justify-between items-center gap-2">
      <div>
        <img src="/Achievements/2.png" alt="image 01" className="mb-2" />
        <img src="/Achievements/1.png" alt="image 02" />
      </div>
      <div>
        <img src="/Achievements/3.png" alt="image 03" />
      </div>
    </div>
    <div className="mt-9">
      <h3 className="text-lg font-medium mb-1">PDF Highlighting</h3>
      <p className="text-[#8D8D8D]">Highlight sections in your PDF to clarify the chatbot&rsquo;s responses</p>
    </div>
  </div>

  <div className="rounded-lg border border-[#EAEAEA] bg-white p-5">
    <div>
      <img src="/Achievements/123.png" alt="image 04" className="w-full object-contain" />
    </div>
    <div>
      <h3 className="text-lg font-medium mb-1">Lead Generation</h3>
      <p className="text-[#8D8D8D]">Generate leads from your website with Corpus AI</p>
    </div>
  </div>
</section>


<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white px-4 sm:px-6 lg:px-10 py-10">
  <div className="border rounded-lg border-[#EAEAEA] p-4">
    <img src="/Achievements/4.svg" alt="" />
    <h3 className="pt-3 text-lg font-semibold">Customizable Chatbot</h3>
    <p className="pt-3 text-[#8D8D8D]">Customize your chatbot to your brand and business</p>
  </div>

  <div className="border rounded-lg border-[#EAEAEA] p-4">
    <img src="/Achievements/5.svg" alt="" />
    <h3 className="pt-3 text-lg font-semibold">Connect your favorite tools</h3>
    <p className="pt-3 text-[#8D8D8D]">Connect your favorite tools to Corpus AI to streamline your workflow</p>
  </div>

  <div className="border rounded-lg border-[#EAEAEA] p-4 relative">
    <img src="/Achievements/7.svg" alt="" className="float-right pb-3" />
    <img src="/Achievements/8.svg" alt="" />
    <h3 className="pt-5 text-lg font-semibold">24/7 Chat Support</h3>
    <p className="pt-3 text-[#8D8D8D]">With our AI chat support, your customers can get help 24/7</p>
  </div>
</section>

<section className='bg-[#FAF6FF]' >
  <div className="text-center py-5 px-4 max-w-7xl mx-auto">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase">Reviews</h4>
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">What Our Clients Says</h2>
        <p className="mb-12 text-[#8D8D8D]  mx-auto">Discover how Coprus AI is transforming businesses through intelligent automation and exceptional customer service</p>
        </div>
  <TestimonialsSlider/>
  </section>
<section className='bg-[#FAF6FF]'><TestimonialsSlider/></section>
<section className="bg-white w-full">
  <div className="relative w-full">
    <img
      src="/blogimages/Group 2366.png"
      alt="Demo Image"
      className='w-full'
    />

    <div className="absolute inset-0 flex items-center justify-center">
      <section className="text-center px-4 pt-4 sm:pt-6 md:pt-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-[#1E1E1E] leading-snug sm:leading-tight">
          With Corpus AI, Your business is <br />
          in the palm of
          <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">
            {" "}your hands
          </span>
        </h1>

       

        <div className="mt-5 sm:mt-6 md:mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
          <a
            href="#"
            className="bg-white text-[#BF56FF] shadow-[0_0_15px_rgba(191,86,255,0.4)] font-medium px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full w-full sm:w-auto text-sm sm:text-base md:text-lg"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  </div>
</section>


<section >
   <div className="text-center py-5 px-4 max-w-7xl mx-auto">
        <h4 className="text-sm text-[#BF56FF] font-semibold mb-5 uppercase">Pricing</h4>
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">Simple Pricing</h2>
        <p className="mb-12 text-[#8D8D8D] max-w-2xl mx-auto">Use Corpus Chat for free. Upgrade to enable custom domains and more advanced features.</p>
        </div>
  <PricingSection/>
  </section>
<section className="bg-white">
  <div className="max-w-6xl mx-auto px-4 py-12">
    
    <div className="mb-12 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Blog and articles</h1>
        <p className="text-gray-600 text-lg">
          Explore more information about cutting-edge chatbot solutions, AI, machine learning, and data science through our expert insights.
        </p>
      </div>
      <div className="text-left md:text-right text-[#BF56FF] mt-4 md:mt-0">
        View All
      </div>
    </div>

    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <div className="bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="h-60 sm:h-72 md:h-80 bg-gray-200 relative">
          <Image 
            src="/blogimages/image 1.png" 
            alt="Create a chatbot with your docs"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Create a chatbot with your docs</h2>
          <p className="text-gray-600 mb-4">
            Creating a chatbot based on your documents allows you to build on content you already have.
          </p>
          <a href="#" className="text-black font-medium inline-flex items-center">
            Read More
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>

      
      <div className="bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="h-60 sm:h-72 md:h-80 bg-gray-200 relative">
          <Image 
            src="/blogimages/image 2.png" 
            alt="What are chat boxes used for"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">What are chat boxes used for?</h2>
          <p className="text-gray-600 mb-4">
            Chatbots streamline business operations by automating customer service and complex processes.
          </p>
          <a href="#" className="text-black font-medium inline-flex items-center">
            Read More
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>

      
      <div className="bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="h-60 sm:h-72 md:h-80 bg-gray-200 relative">
          <Image 
            src="/blogimages/image 3.png" 
            alt="CorpusRetriever: AI retriever for RAG"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">CorpusRetriever: AI retriever for RAG</h2>
          <p className="text-gray-600 mb-4">
            Corpus Retriever benchmarks retrieval accuracy using the MTB dataset.
          </p>
          <a href="#" className="text-black font-medium inline-flex items-center">
            Read More
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<section >
  <FAQSection/>
</section>

 <section className="text-center px-4 pt-8 pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-6xl font-semibold text-gray-900 leading-tight">
          Create Your<br/>Corpus <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">Chatbot</span>
        </h1>
        <p className="mt-4 text-[#7F7A7A] mx-auto text-base sm:text-lg">
          Build an AI assistant that delivers concise, focused responses tailored to your customers
        </p>

        
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="#"
            className="hover:bg-gradient-to-r from-[#FC5990] to-[#AC5DE6]  text-black border-[#E0E0E0] shadow font-medium px-6 py-2 rounded-lg w-full sm:w-auto "
          >
            Get Started for Free
          </a>
        </div>
      </section>
     
    </main>
    
  );
}
