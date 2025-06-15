"use client"

import { useEffect, useState } from 'react';
import { getMaterialById } from '@/db/study_material';
import QuizCard from '@/components/generator/quiz_card';
import { HiOutlineDocumentText, HiOutlineAcademicCap, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { FiAlertCircle } from "react-icons/fi";
import SideBar from '@/components/side_bar/sidebar';
import { ProcessingModal } from '@/components/generator/loading_modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TutorialViewProps {
    params: {
        id: string;
    };
}

export default function TutorialView({ params }: TutorialViewProps) {
    const [tutorial, setTutorial] = useState<any>(null);
    const [input, setInput] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    useEffect(() => {
        const fetchTutorial = async () => {
            try {
                const data = await getMaterialById(parseInt(params.id), 'tutorial');
                if (!data) throw new Error('Tutorial not found');
                setTutorial(data.content);
                setInput(data.input);
            } catch (e) {
                setError('Failed to load tutorial');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchTutorial();
    }, [params.id]);

    if (loading) {
        return <ProcessingModal isVisible={true} message="Loading tutorial content..." />;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!tutorial) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <SideBar>
            <div className="w-full min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-6 space-y-6">
                    {/* Summary Section */}
                    <div className="w-full bg-white rounded-2xl border border-gray-200/75 shadow-sm overflow-hidden">
                        <div className="relative">
                            <div 
                                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                            >
                                <div className="flex items-center space-x-3">
                                    <HiOutlineDocumentText className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-medium text-gray-900">Summary</h2>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsInfoOpen(!isInfoOpen);
                                        }}
                                        className="hover:bg-gray-100 rounded-full p-1"
                                    >
                                        <FiAlertCircle className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                                {isSummaryExpanded ? (
                                    <HiChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <HiChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </div>

                            {/* Info Popup */}
                            {isInfoOpen && (
                                <div className="absolute top-full left-6 z-10 mt-1">
                                    <div className="flex flex-col border border-gray-200 p-3 rounded-lg bg-white shadow-lg">
                                        <p className="text-sm text-gray-600">Created at: {new Date().toLocaleString()}</p>
                                        {tutorial.summary.sources && tutorial.summary.sources.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Input sources:</p>
                                                <ul className="space-y-1">
                                                    {tutorial.summary.sources.map((source: any, index: number) => (
                                                        <li key={index} className="text-sm text-gray-600 pl-4 flex items-center gap-2">
                                                            • {source.filename}
                                                            {source.course_code && (
                                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                                    {source.course_code}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {tutorial.text && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                Custom text input: {tutorial.text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {isSummaryExpanded && (
                            <div className="px-6 py-4 border-t border-gray-100">
                                <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {tutorial.summary.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quiz Section */}
                    <div className="w-full bg-white rounded-2xl border border-gray-200/75 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <HiOutlineAcademicCap className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-medium text-gray-900">Practice Quiz</h2>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                <div>Difficulty: <span className="font-medium">{tutorial.difficulty}</span></div>
                                <div>Language: <span className="font-medium">{tutorial.language}</span></div>
                                <div>Questions: <span className="font-medium">{tutorial.noQuestion}</span></div>
                            </div>
                        </div>
                        <div className="p-6">
                            <QuizCard quizprop={{
                                content: tutorial.quiz,
                                input: input,
                                createTime: new Date(),
                                dbid: params.id
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </SideBar>
    );
}