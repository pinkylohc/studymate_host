import { auth } from "@/auth";
import SideBar from "@/components/side_bar/sidebar";
import TutorialGeneratorForm from "@/components/generator/turorial_generator_form";
import { HiOutlineAcademicCap } from "react-icons/hi";

export default async function TutorialGeneratorPage() {
  const session = await auth();
  const userEmail = session?.user?.email || null;

  return (
    <div className="w-screen h-screen">
      <SideBar>
        <div className="flex flex-col w-full p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <HiOutlineAcademicCap className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Tutorial Generator</h1>
            </div>
            <p className="text-gray-600 text-lg">Generate step-by-step tutorials from your study materials with AI assistance.</p>
          </div>

          <TutorialGeneratorForm userEmail={userEmail} />
        </div>
      </SideBar>
    </div>
  );
}