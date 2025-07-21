import Link from "next/link";
interface ChatBotBlog {
    tag: string;
    title: string;
    date: string;
    description: string,
    downTagText: string;
    href: string;
  }
export default function ChatBotBlog({tag, title, date, description, downTagText, href}: ChatBotBlog){
    return(
       <Link href = {href} className="box w-full  max-w-6xl rounded-xl border bg-white shadow border-gray-100 p-4 flex flex-col gap-2 group cursor-pointer">
        <div className="top flex justify-between gap-4">
            <p className="text-[#BF56FF] ml-2">{tag}</p>
            <p className="text-[#7F7A7A]">{date}</p>
        </div>
        <div className="bottom flex flex-col gap-2">
            <h3 className="text-black text-2xl group-hover:text-[#BF56FF] duration-200 ease-linear font-semibold">{title}</h3>
            <p className="text-[#7F7A7A]">{description}</p>
            <p className="text-[#7F7A7A] ml-2">{downTagText}</p>
        </div>
       </Link>
    )
}