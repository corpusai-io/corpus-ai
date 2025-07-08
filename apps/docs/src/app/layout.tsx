import { Metadata } from "next";
import Sidebar from "./Components/Sidebar/page";
import './globals.css';

export const metadata = {
  title: 'Corpus Ai',
};

export default function RootLayout({ children }) {
  return (
    <>
    
    <html lang="en">
      <body>
            <div className="flex h-full">
              <aside className="fixed top-0 left-0 overflow-y-auto">
              <Sidebar />
              </aside>
              <main className="flex-1 flex ml-[270px] overflow-y-auto ">
              {children}
              
              </main>
        </div>
       
      </body>
    </html>
    </>
  );
}
