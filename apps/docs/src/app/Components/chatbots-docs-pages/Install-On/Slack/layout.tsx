import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex-1 h-full">
          <main className="flex-1 flex">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
