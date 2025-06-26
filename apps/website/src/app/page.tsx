import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#D0A8E9] to-white">

      
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
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          AI powered Chatbot <span className="inline-block align-middle text-xl">💬</span> Built<br />
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
            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-6 py-2 rounded-full w-full sm:w-auto text-center transition duration-200"
          >
            Book a Meeting
          </a>
        </div>
      </section>

      
      <div className="relative w-full max-w-screen-xl mx-auto px-4">
        <Image
          src="/img(1).svg"
          alt="Demo Image"
          width={1200}
          height={386}
          className="w-full h-auto rounded-xl"
        />

        
        <div className="absolute inset-0 flex items-center justify-center pr-6 pb-6">
          <div className="w-[85px] h-[85px] rounded-full bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#D796FF_50%,_#BF56FF_100%)] shadow-inner border-[3px] border-white flex items-center justify-center ">
            <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-1" />
          </div>
        </div>
      </div>
      <div className="text-center pt-10 px-4 sm:px-6 md:px-8">
  <span className="text-base sm:text-lg md:text-xl font-medium text-[#8D8D8D]">
    Trusted By Industry Leaders
  </span>
</div>
    </main>
  );
}
