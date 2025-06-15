"use client";

/**
 * display the summary content in markdown format
 */

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { FiAlertCircle } from "react-icons/fi";
import FileExport from "./file_export";
import mermaid from 'mermaid';
import markdownItMermaid from '@markslides/markdown-it-mermaid';

import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';
import markdownItHighlight from 'markdown-it-highlightjs';
import 'highlight.js/styles/atom-one-dark.css';
import 'katex/dist/katex.min.css';

interface SummaryProp {
    content: {
        content: string;  // The markdown content from the server response
    };
    input: any;
    createTime: Date;
}

export default function SummaryCard({ summaryprop }: { summaryprop: SummaryProp }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const markdownContent = summaryprop.content.content;
    const inputlist = Array.isArray(summaryprop.input?.fileName) ? summaryprop.input.fileName : [];

    // Initialize mermaid
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
        });
    }, []);

    // Initialize markdown-it instance with markdown-it-katex
    const md = useMemo(
        () => {
            const mdInstance = new MarkdownIt({
                html: true,
                linkify: true,
                typographer: true,
            });

            // Add language header before code blocks
            const defaultFence = mdInstance.renderer.rules.fence!;
            mdInstance.renderer.rules.fence = (tokens, idx, options, env, self) => {
                const token = tokens[idx];
                const lang = token.info.trim();
                
                if (lang) {
                    const langDisplay = lang.charAt(0).toUpperCase() + lang.slice(1);
                    const isGraph = lang === 'mermaid';
                    
                    if (isGraph) {
                        return `<div class="relative mermaid-wrapper">
                            <div class="absolute -top-3 left-3 px-2 py-0.5 bg-gray-700 text-white text-xs rounded">
                                ${langDisplay}
                            </div>
                            <div class="mermaid">
                                ${token.content}
                            </div>
                        </div>`;
                    }
                    
                    return `<div class="relative">
                        <div class="absolute -top-3 left-3 px-2 py-0.5 bg-gray-700 text-white text-xs rounded">
                            ${langDisplay}
                        </div>
                        ${defaultFence(tokens, idx, options, env, self)}
                    </div>`;
                }
                return defaultFence(tokens, idx, options, env, self);
            };

            return mdInstance
                .use(markdownItKatex, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false,
                    errorColor: '#cc0000'
                })
                .use(markdownItHighlight, {
                    inline: true,
                    auto: true,
                    code: true,
                    ignoreIllegals: true
                })
                .use(markdownItMermaid);
        },
        []
    );

    // Render markdown to HTML and initialize mermaid diagrams
    const htmlOutput = useMemo(() => md.render(markdownContent), [markdownContent, md]);

    useEffect(() => {
        if (isExpanded) {
            mermaid.contentLoaded();
        }
    }, [isExpanded, htmlOutput]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white rounded-2xl border border-gray-200/75 shadow-sm overflow-hidden"
        >
            <div className="relative">
                <div 
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setIsExpanded(!isExpanded)}
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
                    {isExpanded ? (
                        <HiChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <HiChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </div>

                {/* Info Popup */}
                {isInfoOpen && (
                    <div className="absolute top-full left-6 z-10 mt-1">
                        <div className="flex flex-col border border-gray-200 p-3 rounded-lg bg-white shadow-lg">
                            <p className="text-sm text-gray-600">Created at: {summaryprop.createTime.toLocaleString()}</p>
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
                    </div>
                )}
            </div>

            {isExpanded && (
                <>
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="flex items-center space-x-3">
                                <h2 className="text-sm font-medium text-gray-700">Export as:</h2>
                                <FileExport exportcontent={{contentstr: markdownContent, type: 'summary'}}/>
                            </div>
                        </div>

                        {/* markdown display region */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/10 to-purple-50/10 rounded-xl" />
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/75 p-6 shadow-sm">
                                <div className="prose prose-sm md:prose-base lg:prose-lg prose-slate max-w-none overflow-y-auto">
                                    <div 
                                        className="[&_pre]:!bg-[#282c34] [&_pre]:!p-4 [&_pre]:!rounded-lg [&_code]:!bg-[#282c34] [&_code.hljs]:!bg-[#282c34] [&_code.hljs]:!p-0 [&_code]:!text-sm [&_code]:!rounded-md [&_code]:!p-1" 
                                        dangerouslySetInnerHTML={{ __html: htmlOutput }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}