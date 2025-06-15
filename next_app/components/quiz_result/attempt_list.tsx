"use client"

import { getAllResultbyId } from "@/db/quiz_result";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineClock, HiChevronDown } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function AttemptList({ }) {
    const params = useSearchParams();
    const quizid = params.get('quizid');
    const attempt = params.get('attempt');
    const pathname = usePathname();

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (quizid) {
                try {
                    const data = await getAllResultbyId(Number(quizid));
                    setResult(data);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [attempt]);

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <HiOutlineClock className="w-5 h-5" />
                        <h2 className="font-medium">Previous Attempts</h2>
                    </div>
                </div>
                <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 bg-gray-100 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return(
        <div className="p-6 space-y-4">
            <button 
                onClick={() => setIsVisible(!isVisible)}
                className="w-full flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <HiOutlineClock className="w-5 h-5" />
                    <h2 className="font-medium">Previous Attempts</h2>
                </div>
                <HiChevronDown className={`w-5 h-5 transition-transform ${isVisible ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {result && result.length > 0 ? (
                            <div className="space-y-2 pt-2">   
                                {result.map((item: any, index: number) => (
                                    <div key={index}>
                                        {attempt === String(item.id) ? (
                                            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
                                                {new Date(item.createTime).toLocaleString()}
                                            </div>
                                        ) : (
                                            <Link 
                                                href={`${pathname}?quizid=${quizid}&attempt=${item.id}`}
                                                className="block p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                                            >
                                                {new Date(item.createTime).toLocaleString()}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm py-2">
                                No previous attempts found.
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}