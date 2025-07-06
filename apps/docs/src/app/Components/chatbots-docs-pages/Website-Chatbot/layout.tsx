// Website-Chatbot/layout.tsx  
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex-1 h-full">
      <main className="flex-1 flex">
        {children}
      </main>
    </div>
  );
}