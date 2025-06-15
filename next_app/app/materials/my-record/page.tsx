import { auth } from "@/auth";
import SideBar from "@/components/side_bar/sidebar";
import { getAllRecordbyUserid } from "@/db/user_record";
import Table from "./table";
import { HiOutlineClipboardList } from "react-icons/hi";

export default async function RecordPage() {
    const session = await auth();
    const data = await getAllRecordbyUserid(session?.user?.id as unknown as number);

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <SideBar>
                <div className="flex flex-col w-full p-6 md:p-8">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-3">
                            <HiOutlineClipboardList className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">My Records</h1>
                        </div>
                        <p className="text-gray-600 text-lg">View and manage your generated study materials and quiz history.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/75 overflow-hidden">
                        <Table data={data || []} />
                    </div>
                </div>
            </SideBar>
        </div>
    );
}

// page -> call component
// search -> client -> handle params
// table -> server -> display data