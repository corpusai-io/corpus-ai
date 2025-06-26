export default function Home(){
    return(
       <main className="min-h-screen bg-gradient-to-b from-[#D0A8E9] to-white">
  
  <div className="flex justify-center bg-white-800 pt-10 ">
    <div className="inline-flex items-center text-sm font-medium rounded-full px-2 py-1 space-x-2 shadow-sm bg-gradient-to-b from-white to-white">
      <span className="bg-[#C458FF] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
        NEW
      </span>
      <span className="text-gray-700">
        Introducing PDF Highlights
      </span>
      <span className="text-gray-500 text-sm font-bold">→</span>
    </div>
  </div>

  
  <section className="text-center px-4 pt-8 pb-16">
    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
      AI powered Chatbot <span className="inline-block align-middle text-2xl">💬</span> Built<br />
      for your <span className="bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#CD7BFF] bg-clip-text text-transparent">Website</span>
    </h1>
    <p className="mt-4 text-[#7F7A7A] max-w-xl mx-auto">
      Empower your website with AI conversations. Get instant answers and<br />
      24/7 support - trusted by thousands.
    </p>

    
    <div className="mt-8 flex justify-center gap-4">
      <a href="#" className="bg-[#BF56FF] hover:bg-[#a843e6] text-white font-medium px-6 py-2 rounded-full">Get Started</a>
      <a href="#" className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-6 py-2 rounded-full">Book a Meeting</a>
    </div>
  </section>
</main>


    )
}
