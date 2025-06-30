import { Metadata } from "next";

export default function RootLayout({ children }) {
  return (
    <>
    
    <html lang="en">
      <body>
            <div className="flex-1 h-full">
              <main className="flex-1 flex">
              {children}
              </main>
        </div>
       
      </body>
    </html>
    </>
  );
}
