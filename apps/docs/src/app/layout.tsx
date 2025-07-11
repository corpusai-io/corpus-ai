import { Metadata } from "next";
import Sidebar from "./Components/Sidebar/page";
import './globals.css';

export const metadata: Metadata = {
  title: 'Corpus Ai',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<html lang="en" className="h-full">
      <body className="m-0 p-0 overflow-y-auto overflow-x-hidden h-full">
        <div className="flex min-h-screen">
          {/* Fixed Left Sidebar */}
          <aside className="w-64 fixed top-0 left-0 h-full z-10 bg-white border-r border-gray-200 overflow-y-auto">
            <Sidebar />
          </aside>

          {/* Main Content + Right Sidebar Container */}
          <div className="flex flex-1 ml-64 mr-64 z-11">
            <main className="flex-1 px-4 sm:px-6 py-6 ">
              <div className="max-w-[1200px] mx-auto w-full">
                {children}
              </div>
            </main>
          </div>

         
        </div>
      </body>
    </html>
  );
}
