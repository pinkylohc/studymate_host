import { auth } from "@/auth";
import Gamification from "@/components/Gamification";
import SideBar from "@/components/side_bar/sidebar";
import { getRecentThreeQuiz, getRecentThreeSummary } from "@/db/user_record";
import Link from "next/link";
import dynamic from 'next/dynamic';
import TourButton from "@/components/tourbutton";
const TourComponent = dynamic(() => import('@/components/tour'), { ssr: false });

const DashboardPage = async () => {
  const session = await auth();
  const threeQuiz = await getRecentThreeQuiz(session?.user?.id as unknown as number);
  const threeSummary = await getRecentThreeSummary(session?.user?.id as unknown as number);

  return (
    <div className="w-screen h-screen">
      <SideBar>
        <div className="flex flex-col w-full p-6 md:p-8 dashboard">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                Welcome back, {session?.user?.name}
              </h1>
              <p className="text-base text-gray-500">
                Here&apos;s what&apos;s happening with your study progress
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Summaries</h2>
                <div className="space-y-4">
                  {threeSummary?.map((summary, index) => (
                    <Link 
                      key={index} 
                      href={`/materials/summary/${summary.id}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            Summary #{summary.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(summary.createTime).toLocaleDateString()} at {new Date(summary.createTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Quizzes</h2>
                <div className="space-y-4">
                  {threeQuiz?.map((quiz, index) => (
                    <Link 
                      key={index} 
                      href={`/materials/quiz/${quiz.id}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            Quiz #{quiz.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(quiz.createTime).toLocaleDateString()} at {new Date(quiz.createTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
                <Gamification userId={Number(session?.user?.id)} />
              </div>
            </div>
          </div>
        </div>
      </SideBar>
    </div>
  );
}

export default DashboardPage;