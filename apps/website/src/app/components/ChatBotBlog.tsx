import Link from "next/link";

interface ChatBotBlog {
    tag: string;
    title: string;
    date: string;
    description: string,
    downTagText: string;
  }
export default function ChatBotBlog({tag, title, date, description, downTagText}: ChatBotBlog){
    return(
       <div className="box w-full  max-w-6xl rounded-xl border shadow border-gray-100 p-4 flex flex-col gap-2 group bg-white">
        <div className="top flex justify-between gap-4">
            <p className="text-[#BF56FF] ml-2">{tag}</p>
            <p className="text-[#7F7A7A]">{date}</p>
        </div>
        <div className="bottom flex flex-col gap-2">
           <Link href=""><h3 className="text-black text-2xl group-hover:text-[#BF56FF] duration-200 ease-linear font-semibold">{title}</h3></Link>
            <p className="text-[#7F7A7A]">{description}</p>
            <p className="text-[#7F7A7A] ml-2">{downTagText}</p>
        </div>
       </div>
    )
}