/**
 * display the summary content
 * 
 * a sample return is in python_server/main.py, modify this code as needed
 */
"use client"
import QuizSide from "./quiz_side";
import QuizArea from "./quiz_area";
import { useEffect, useState } from "react";
import { ProcessingModal } from "./loading_modal";
import axios from "axios";
import { useRouter } from "next/navigation";
import { uploadQuizResult } from "@/db/quiz_result";

interface quizprop {
    content: any;
    input: any;
    createTime: Date;
    dbid: string;
}

export default function QuizCard ({ quizprop }: { quizprop: quizprop }){
    const content = quizprop.content;
    const router = useRouter();

    const [answers, setAnswers] = useState<string[][]>(content.quiz.map((section: any) => section.type === 'Ordering' ? (section.choices as string[]) || [] : ['']));
    const [interacted, setInteracted] = useState<boolean[]>(content.quiz.map((section: any) => section.type === 'Ordering' ? false : true));
    const [quizStatus, setQuizStatus] = useState<'notStarted' | 'started' | 'submitted' | 'timeOut'>('notStarted');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    async function handleSubmit (e?: React.FormEvent) {
        e?.preventDefault();
        setQuizStatus('submitted');
        setIsModalVisible(true);

        try {
            const updatedContent = {
                ...content,
                quiz: content.quiz.map((question: any, index: number) => ({
                    ...question,
                    user_answer: answers[index]
                }))
            };

            const response = await axios.post("http://localhost:8000/quiz/grade", updatedContent, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            const resultWithUserAnswer = {
                ...response.data,
                result: response.data.result.map((result: any, index: number) => ({
                    user_answer: answers[index],
                    ...result,
                }))
            };
            const attemptid = await uploadQuizResult((quizprop.dbid as unknown) as number, resultWithUserAnswer);

            const params = new URLSearchParams({
                quizid: quizprop.dbid,
                attempt: attemptid as string
            });
            router.push(`/materials/quiz/${quizprop.dbid}/result?${params.toString()}`);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setQuizStatus('notStarted');
            setIsModalVisible(false);
        }
    };

    useEffect(() => {
        if(quizStatus === 'notStarted'){
            setAnswers(content.quiz.map((section: any) => section.type === 'Ordering' ? (section.choices as string[]) || [] : ['']));
            setInteracted(content.quiz.map((section: any) => section.type === 'Ordering' ? false : true));
        }
        if (quizStatus === 'timeOut') {
            handleSubmit();
        }
    }, [quizStatus]);

    const calculateProgress = () => {
        const totalQuestions = content.quiz.length;
        const answeredQuestions = answers.filter((answer, index) => interacted[index] && answer[0] !== '').length;
        return (answeredQuestions / totalQuestions) * 100;
    };
    const progress = calculateProgress();
    const answeredArray = answers.map((answer, index) => interacted[index] && answer[0] !== '');

    return(
        <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="flex flex-col lg:flex-row w-full gap-6">
                <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                    <QuizArea 
                        sections={content.quiz} 
                        quizStatus={quizStatus} 
                        setQuizStatus={setQuizStatus} 
                        answers={answers} 
                        setAnswers={setAnswers}
                        setInteracted={setInteracted} 
                        handleSubmit={handleSubmit}
                    />
                </div>

                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="lg:sticky lg:top-6">
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
                            <QuizSide 
                                quizsideprop={{
                                    contentstr: content, 
                                    input: quizprop.input, 
                                    createTime: quizprop.createTime, 
                                    quizStatus, 
                                    setQuizStatus, 
                                    progress, 
                                    answeredArray
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ProcessingModal isVisible={isModalVisible} message="Your quiz is grading, please wait..." />
        </div>
    );
}