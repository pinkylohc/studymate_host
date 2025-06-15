import SideBar from "@/components/side_bar/sidebar";
import { auth } from "@/auth";
import { getMaterialById } from '@/db/study_material';
import SummaryCard from "@/components/generator/summary_card";
import FollowupChatbot from "@/components/chatbot/followup_chatbot";

export default async function SummaryDetailPage({ params }: { params: { id: string } }){
  const session = await auth();
  let error = null;
  let createTime = new Date();

  //check if the user have access to page || not exist in db
  const userid = session?.user?.id;
  const res = await getMaterialById((params.id as unknown) as number, 'summary')
  
  if(!res){
    error = "Record Not Exist"  // record not exist
    
  } else if(!(res?.userId == userid)){
    error = "Access Denied"  // not the user record
  } 
  
  return (
    <div className="w-screen h-screen">
        <SideBar>
          {error ? 
            <div className="flex h-full w-full text-center items-center justify-center">
              <div className="bg-red-200 p-4 rounded-md">
                <h1 className="md:text-2xl text-red-500">{error}</h1>
              </div>   
            </div>
          :
            <div className="w-full min-h-screen bg-gray-50">
              <div className="container mx-auto px-4 py-6 space-y-6">
                <div className="w-full">             
                  <SummaryCard summaryprop={{content: res.content, input: res.input, createTime}}/> 
                </div>
                <div className="w-full">
                  <FollowupChatbot />
                </div>
              </div>
            </div>
          }
        </SideBar>
    </div>   
  );
}
