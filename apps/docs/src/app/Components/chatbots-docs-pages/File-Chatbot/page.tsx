'use client'; 
import Link from 'next/link';
import { useState } from 'react';

export default function WebsiteChatbot(){
  
    return(
        <>
            <main className="flex-1 flex">
            <div className="flex-1 mt-[30px] ml-15 mr-5">
                <h1>File chatbot</h1>
        </div>
  </main>
     
     
        
     <div className="w-64 pt-13 fixed top-0 right-0 overflow-y-auto ">
      <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
        <img src="/Website Assets/Sidebar-Alighment.svg" alt="" />
        
        <span>On this page</span>
      </div>
    
      <ul className="">
        <li className="bg-white p-1 pl-4 rounded mr-18 border-1 border-[#EAEAEA]">
          <p>No Heading</p>
        </li>
      </ul>
    </div>
        
        </>
    );
}