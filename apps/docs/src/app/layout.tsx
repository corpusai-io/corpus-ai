import { Metadata } from "next";


export const metadata = {
  title: 'Corpus Ai',
};

export default function RootLayout({ children }) {
  return (
    <>
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
    </>
  );
}
