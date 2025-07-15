import ChatBotBlog from "../../components/ChatBotBlog"

const blogData = [
    {
        title: "20 B2B Chatbot Benefits For Business Efficiency And Buyer Trust",
        date: "June 14, 2025",
        description: "B2B chatbots help businesses manage complex customer behavior by enabling real-time engagement, guiding conversations across apps, and simplifying support. They keep leads engaged 24/7, collect valuable data, and improve decision-making...",
        downTagText: "B2B Chatbot Solutions"
    },

    {
        title: "How Is AI Used in Fintech For Smarter Investment Decisions",
        date: "June 14, 2025",
        description: "AI is transforming fintech by speeding up decisions and reducing manual work—like automating loan reviews and fraud detection in seconds. While it brings clear benefits, it also raises concerns around bias, accuracy, and accountability. This article explores how... ",
        downTagText: "How is AI Used in French"
    },

    {
        title: "10 B2B Chatbot Examples Built for Complex Sales Journeys",
        date: "June 13, 2025",
        description: "B2B chatbots streamline sales, handle inquiries, and offer 24/7 support, managing complex workflows to reduce workload and scale efficiently. See real-world examples to optimize your strategy.",
        downTagText: "B2B Chatbot Examples"
    },
    {
        title: "Best Chatbot for Shopify in 2025 (6-Step Installation)",
        date: "June 13, 2025",
        description: "Running a Shopify store can be overwhelming with growing customer demands and repetitive tasks. The right chatbot can automate inquiries, track orders, and provide personalized support, but not all are suited for Shopify. This blog explores the key...",
        downTagText: "Best Chatbot for Shopify"
    },
    {
        title: "Chatbot Integration with CRM: Building Smarter Workflows",
        date: "June 13, 2025",
        description: "Integrating your chatbot with a CRM gives your team full customer context, enabling personalized replies, smarter lead capture, and smoother handoffs. This guide explains why integration matters and how to build a high-performing chatbot system.",
        downTagText: "Chatbot"
    },
    {
        title: "How to Offer 24/7 Customer Service Using a Retail AI Chatbot",
        date: "June 13, 2025",
        description: "Retail chatbots offer 24/7 support, handle repetitive questions, and reduce team workload—helping businesses meet rising customer expectations while managing costs. This guide explains how they work, their benefits, and tips for choosing the right...",
        downTagText: "Chatbot"
    },

]
export default function Blog(){
    return(
        <div className="blogPage flex flex-col gap-4 mt-20 mb-20">
            <div className="top flex flex-col gap-3 items-center">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Blog</h1>
                <p className="text-[#7F7A7A]">Learn more about CorpusAI.</p>
                <div className="choice flex gap-3 justify-between">
                    <button className="px-8 text-white py-2 rounded-full bg-[#BF56FF]">All</button>
                    <button className="text-[#7F7A7A]">Chatbot</button>
                    <button className="text-[#7F7A7A]">Agent</button>
                </div>
            </div>
        <div className="containerr flex flex-col gap-6 px-4 items-center mt-20">
            {
                blogData.map((cur, ind)=>(
                    <ChatBotBlog key = {ind} title={cur.title} date = {cur.date} description={cur.description} downTagText={cur.downTagText}/>
                ))
            }
        </div>
        </div>
    )
}