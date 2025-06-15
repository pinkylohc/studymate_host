
import SideBar from "@/components/side_bar/sidebar";
import { auth } from "@/auth";
import { getMaterialById } from '@/db/study_material';
import QuizCard from "@/components/generator/quiz_card";
import { Suspense } from "react";

export default async function QuizDetailPage({ params }: { params: { id: string } }){
  const session = await auth();
  let error = null;

  //check if the user have access to page || not exist in db
  const userid = session?.user?.id;
  const res = await getMaterialById((params.id as unknown) as number, 'quiz')
  
  if(!res){
    error = "Record Not Exist"  // record not exist
    
  } else if(!(res?.userId == userid)){
    error = "Access Denied"  // not the user record
  } 
  

  return (  // page for summary display
    <div className = "w-screen h-screen">
        <SideBar>
          {error? 

            /* for access denied or non exist record */
            <div className ="flex h-full w-full text-center items-center justify-center">
            <div className ="bg-red-200 p-4 rounded-md">
              <h1 className = "md:text-2xl text-red-500">{error}</h1>
            </div>   
          </div>
          :

          /* interactive quiz */
          <div className="w-full h-[calc(100vh-50px)]">
            <QuizCard quizprop={{content: res.content, input: res.input, createTime: new Date(res.createTime), dbid: params.id}}/> 
          </div>
        }
            
        </ SideBar>
      </div>   
  );
}
