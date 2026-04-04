import { Metadata } from "next";
import './../../../globals.css';

export const metadata: Metadata = {
  title: 'CORPUS-AI | ACCESS SETTING',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<div className="h-full">
      <div className="m-0 p-0 overflow-y-auto overflow-x-hidden h-full">
        <div className="flex min-h-screen">

        <div className="flex flex-1 z-11">
            <main className="flex-1 px-4 sm:px-2 py-2 ">
              <div className="max-w-[1200px] mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
