'use client'; 
import './globals.css';
import Sidebar from "./Components/Sidebar/page";
import Welcome from "./Components/Welcome-page/page";


export default function Page() {
  return (
    <>
    <div className="flex h-full">
      <aside >

          <Sidebar />

      </aside>
      <main className="flex-1 flex">
      <Welcome />
      </main>
</div>

    </>
  );
}
