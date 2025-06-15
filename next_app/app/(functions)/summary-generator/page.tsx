import { auth } from "@/auth";
import SideBar from "@/components/side_bar/sidebar";
import SummaryGeneratorForm from "@/components/generator/summary_generator_form";
import { HiOutlineDocumentText } from "react-icons/hi";

const SummaryGeneratorPage = async () => {
  const session = await auth();

  return (
    <div className="w-screen h-screen">
      <SideBar>
        <div className="flex flex-col w-full p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <HiOutlineDocumentText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Summary Generator</h1>
            </div>
            <p className="text-gray-600 text-lg">Generate concise summaries from your study materials with AI assistance.</p>
          </div>

          <SummaryGeneratorForm userEmail={session?.user?.email} />
        </div>
      </SideBar>
    </div>
  );
}

export default SummaryGeneratorPage;