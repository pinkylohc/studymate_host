"use client"

import SummaryCardHeader from "../generator/card_header";
import FileExport from "../generator/file_export";
import AttemptList from "./attempt_list";
import BackButton from "./back_button";
import FollowupChatbot from "../chatbot/followup_chatbot";
import QuizDisplay from "./quiz_display";
import { HiOutlineDocumentText, HiOutlineAcademicCap, HiAcademicCap, HiChevronDown } from "react-icons/hi";
import { useState } from "react";

export default function QuizResultCard({carddisplay}: {carddisplay : {quizContent?: any, quizResult?: any, quizinput?:any, quizcreate?:Date}}) {
    const [isCommentVisible, setIsCommentVisible] = useState(false);
    const toggleCommentVisibility = () => {
        setIsCommentVisible(!isCommentVisible);
    };

    return(
        <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="flex flex-grow space-x-6">
                <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                    <QuizDisplay display={carddisplay}/>
                </div>

                <div className="w-[320px] flex-shrink-0">
                    <div className="sticky top-6 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                            <SummaryCardHeader info={{input: carddisplay.quizinput, type: "Quiz:", createTime: carddisplay.quizcreate || new Date()}}/>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <HiOutlineAcademicCap className="w-6 h-6 text-blue-500" />
                                    <h3 className="text-lg font-semibold text-gray-900">Total Score</h3>
                                </div>
                                <div className="text-3xl font-bold text-blue-600">
                                    {carddisplay.quizResult.total_score}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                                    <h3 className=" font-medium text-gray-700">Export Quiz</h3>
                                </div>
                                <FileExport exportcontent={{contentstr: carddisplay.quizContent, type: 'quiz'}}/> 
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                            <AttemptList />
                        </div>

                        {/* Performance Comment Block */}
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                            <div className="p-6 space-y-4">
                                <button 
                                    onClick={toggleCommentVisibility}
                                    className="w-full flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <div className="flex items-center space-x-2">
                                        <HiAcademicCap className="w-5 h-5 text-gray-400" />
                                        <h2 className="font-medium">Performance Comment</h2>
                                    </div>
                                    <HiChevronDown className={`w-5 h-5 transition-transform ${isCommentVisible ? 'rotate-180' : ''}`} />
                                </button>
                                {isCommentVisible && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                                        <p className="text-sm text-gray-700">
                                            {carddisplay.quizResult.performance_comment}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                            <div className="p-6">
                                <BackButton />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                            <FollowupChatbot />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}