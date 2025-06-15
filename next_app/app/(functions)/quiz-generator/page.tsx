import { auth } from "@/auth";
import QuizGeneratorForm from "@/components/generator/quiz_generator_form";
import SideBar from "@/components/side_bar/sidebar";
import { HiOutlinePuzzle } from "react-icons/hi";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="w-screen h-screen">
      <SideBar>
        <div className="flex flex-col w-full p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <HiOutlinePuzzle className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Quiz Generator</h1>
            </div>
            <p className="text-gray-600 text-lg">Create customized quizzes from your study materials with AI assistance.</p>
          </div>

          <QuizGeneratorForm userEmail={session?.user?.email}/>
        </div>
      </SideBar>
    </div>
  );
}

export default DashboardPage;