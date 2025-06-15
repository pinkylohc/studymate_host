/**
 * summary page header 
 *
 */
"use client"

interface summaryheaderprop {
    input: any;
    type: string;
    createTime: Date;
}

import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";

export default function SummaryCardHeader({ info }: { info: summaryheaderprop }) {
    const [Open, setOpen] = useState(false);
    const localDateString = info.createTime.toLocaleString();

    // Safely handle the input files
    const inputlist = Array.isArray(info.input?.fileName) ? info.input.fileName : [];

    return (
        <div className="flex flex-col space-x-2">
            <div className="flex flex-row space-x-2 items-center">
                <h1 className="text-sm md:text-lg">{info.type}</h1>
                <button
                    onClick={() => setOpen(!Open)}
                    className="hover:bg-gray-100 rounded-full p-1"
                >
                    <FiAlertCircle className="w-4 h-4 text-gray-600" />
                </button>
            </div>

            {Open && (
                <div className="flex flex-col border border-gray-200 p-3 mt-2 rounded-lg bg-white shadow-sm">
                    <p className="text-sm text-gray-600">Created at: {localDateString}</p>

                    {info.type === "Quiz:" && (
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">Difficulty: {info.input.difficulty}</p>
                            <p className="text-sm text-gray-600">No. of Question: {info.input.noQuestion}</p>
                            <p className="text-sm text-gray-600">Language: {info.input.language}</p>
                            <p className="text-sm text-gray-600">Prompt: {info.input.prompt}</p>
                        </div>
                    )}

                    {info.type === "Tutorial:" && (
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">Difficulty: {info.input.difficulty}</p>
                            <p className="text-sm text-gray-600">No. of Question: {info.input.noQuestion}</p>
                            <p className="text-sm text-gray-600">Language: {info.input.language}</p>
                            <p className="text-sm text-gray-600">Prompt: {info.input.prompt}</p>
                        </div>
                    )}

                    {inputlist.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Input sources:</p>
                            <ul className="space-y-1">
                                {inputlist.map((item: string, index: number) => (
                                    <li key={index} className="text-sm text-gray-600 pl-4">
                                        • {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}