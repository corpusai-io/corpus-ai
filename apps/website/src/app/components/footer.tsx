// apps/website/src/app/components/footer.tsx - Updated version
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="text-gray-600 body-font ">
      <div className="w-full h-[2px] bg-gradient-to-r from-[#C297FF]/0 via-[#C297FF]/100 to-[#C297FF]/0" />
      <div className="container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
        
        {/* Logo + Social Icons */}
        <div className="w-64 flex-shrink-0 mx-auto text-left">
          <div className="flex flex-col items-start">
            <Link href="#" className="flex title-font font-medium items-center text-gray-900 mb-1">
              <img src="/logo.svg" alt="Corpus AI Logo" className="h-10 w-auto" />
            </Link>

            <div className="grid grid-cols-4 gap-3 mt-2">
              <Link className="w-[34px] h-[34px] border border-[#EAEAEA] bg-[#F3F3F5] rounded-lg flex justify-center items-center text-gray-500 hover:text-[#BF56FF] transition" href="#">
                <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </Link>
              <Link className="w-[34px] h-[34px] border border-[#EAEAEA] bg-[#F3F3F5] rounded-lg flex justify-center items-center text-gray-500 hover:text-[#BF56FF] transition" href="#">
                <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </Link>
              <Link className="w-[34px] h-[34px] border border-[#EAEAEA] bg-[#F3F3F5] rounded-lg flex justify-center items-center text-gray-500 hover:text-[#BF56FF] transition" href="#">
                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
                </svg>
              </Link>
              <Link href = "https://www.linkedin.com/company/corpusai-official/posts/?feedView=all" className="w-[34px] h-[34px] border border-[#EAEAEA] bg-[#F3F3F5] rounded-lg flex justify-center items-center text-gray-500 hover:text-[#BF56FF] transition">
                <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0" className="w-5 h-5" viewBox="0 0 24 24">
                  <path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" stroke="none" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex-grow flex flex-wrap justify-end md:pl-20 -mb-10 md:mt-0 mt-10 md:text-left text-center">
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-[#A0A0A0] tracking-widest text-lg mb-3">Products</h2>
            <nav className="list-none mb-10 space-y-6">
              <li>
                <Link href="#" className="font-medium text-[20px] leading-[100%] tracking-[-0.32px] font-helvetica text-[#1E1E1E]">Corpus Chat</Link>
              </li>
            </nav>
          </div>
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-[#A0A0A0] tracking-widest text-lg mb-3">Company</h2>
            <nav className="list-none mb-10 space-y-6">
              <li>
                <Link href="#" className="font-medium text-[20px] leading-[100%] tracking-[-0.32px] font-helvetica text-[#1E1E1E]">Blog</Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-[20px] leading-[100%] tracking-[-0.32px] font-helvetica text-[#1E1E1E]">Documentation</Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-[20px] leading-[100%] tracking-[-0.32px] font-helvetica text-[#1E1E1E]">Posts</Link>
              </li>
            </nav>
          </div>
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-[#A0A0A0] tracking-widest text-lg mb-3">Contact</h2>
            <nav className="list-none mb-10 space-y-6">
              <li>
                <Link href="#" className="font-medium text-[20px] leading-[100%] tracking-[-0.32px] font-helvetica text-[#1E1E1E]">About</Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-[20px] leading-[100%] tracking-[-0.32px] font-helvetica text-[#1E1E1E]">Contact</Link>
              </li>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="bg-white">
        <div className="container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row">
          <p className="text-gray-500 text-sm text-center sm:text-left">© 2025. Corpus AI. All Rights Reserved</p>
          <span className="inline-flex sm:ml-auto sm:mt-0 mt-2 justify-center sm:justify-start">
            <Link href="/legal/terms" className="text-gray-500 hover:text-[#BF56FF] transition-colors duration-200">
              Terms
            </Link>
            <Link href="/legal/privacy" className="ml-3 text-gray-500 hover:text-[#BF56FF] transition-colors duration-200">
              Privacy Policy
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}