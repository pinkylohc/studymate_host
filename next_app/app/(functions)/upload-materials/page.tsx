import { auth } from "@/auth";
import MaterialUploadForm from "@/components/upload/material_upload_form";
import SideBar from "@/components/side_bar/sidebar";
import { HiOutlineUpload } from "react-icons/hi";

export default async function UploadMaterials() {
  const session = await auth();

  return (
    <div className="w-screen h-screen">
      <SideBar>
        <div className="flex-1 h-full wbg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <HiOutlineUpload className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Upload Materials</h1>
            </div>
            <p className="text-gray-600 text-lg">Share your learning resources with others by uploading files or text content.</p>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden p-6">
              <MaterialUploadForm userEmail={session?.user?.email} />
            </div>
          </div>
        </div>
      </SideBar>
    </div>
  );
}