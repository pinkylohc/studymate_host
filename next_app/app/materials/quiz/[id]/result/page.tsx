import { auth } from "@/auth";
import QuizDisplay from "@/components/quiz_result/quiz_display";
import QuizResultCard from '@/components/quiz_result/quiz_result_card';
import SideBar from '@/components/side_bar/sidebar';
import { getLatestQuizAttemptByQuizId, getQuizResultbyId } from "@/db/quiz_result";
import { getMaterialById } from "@/db/study_material";

export default async function QuizResultPage({searchParams,}:{searchParams?: { quizid: string, attempt:string }}){
    const session = await auth();
    let error = null;
    const userid = session?.user?.id; // for check user right to access this page
    const dbid = searchParams?.quizid;
    console.log(dbid)
    console.log(searchParams?.attempt)

    let attemptId = searchParams?.attempt;  // for record page, direct to newest attempt
    if (!searchParams?.attempt) {
      const latestAttempt = await getLatestQuizAttemptByQuizId((dbid as unknown) as number);
      if (latestAttempt) {
          attemptId = latestAttempt.id.toString();
      } else {
        error = "No Result Found" 
        return(
        <div className = "w-screen h-screen">
        <SideBar>
            <div className ="flex h-full w-full text-center items-center justify-center">
            <div className ="bg-red-200 p-4 rounded-md">
              <h1 className = "md:text-2xl text-red-500">{error}</h1>
            </div>   
          </div>
          </ SideBar>
          </div> 
        )
      }
  }
    const dbmaterial = await getMaterialById((dbid as unknown) as number, 'quiz')  // get quiz content by quiz id in study material table
    const dbresult = await getQuizResultbyId((attemptId as unknown) as number)  // get quiz result by attempt id in quiz result table
    if(!dbresult || dbresult.quizid != dbid){
        error = "Record Not Exist"  // record not exist
        
        
    } else if(!(dbmaterial?.userId == userid)){
        error = "Access Denied"  // not the user record
       
    }
    // get data for display
    const quizContent = dbmaterial.content;
    const quizinput = dbmaterial.input;
    const quizcreate = dbmaterial.createTime;
    const quizResult = dbresult.result;   

    return(
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
          <div className="w-full h-full">
            <QuizResultCard carddisplay={{quizContent, quizResult, quizinput, quizcreate}}/>
          </div>
        }
            
        </ SideBar>
      </div>   
    );
}