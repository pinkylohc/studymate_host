import { auth } from "@/auth";
import SideBar from "@/components/side_bar/sidebar";
import CareerAdvisingChatbot from "@/components/chatbot/career_advising_chatbot";
import { HiOutlineChatAlt2 } from "react-icons/hi";

const AdvisingChatPage = async () => {
  const session = await auth();
  const userid = session?.user?.id;

  // call http to python server
  // get data from database?


  return (
    <div className="w-screen h-screen">
      <SideBar>
        <div className="flex flex-col w-full p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <HiOutlineChatAlt2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Career Advising Chatbot</h1>
            </div>
            <p className="text-gray-600 text-lg">Get personalized career advice and guidance from our AI-powered chatbot.</p>
          </div>

          <CareerAdvisingChatbot userid={userid} />
        </div>
      </SideBar>
    </div>
  );
}

export default AdvisingChatPage;