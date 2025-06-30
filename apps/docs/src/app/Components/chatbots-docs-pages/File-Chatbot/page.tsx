'use client'; 
import Link from 'next/link';

export default function WebsiteChatbot(){
    return(
        <>
         
            <main className="flex-1 flex">
            <div className="flex-1 mt-14 ml-11 mr-5">
             <p>Website Chatbot</p>
                        
            {/* Website Chatbot Content */}

              <h2>Website Chatbot Content Area</h2>
                        

                 </div>
            </main>
     
     
        
    <div className="w-64 pt-13">
  <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">

    <span>On this page</span>
  </div>

  <ul className="ml-1 border-l-4 mt-2 border-purple-500 pl-4 text-purple-500">
    <li>
      <Link href="/">
        Welcome to Corpus AI's Documentation
      </Link>
    </li>
  </ul>
</div>
        
        </>
    );
}