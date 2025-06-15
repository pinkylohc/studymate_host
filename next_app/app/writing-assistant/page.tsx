"use client"

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SideBar from "@/components/side_bar/sidebar";
import { motion } from 'framer-motion';
import { HiOutlinePencilAlt } from "react-icons/hi";

const AIEditor = dynamic(() => import('./AIEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-white/50 backdrop-blur-sm rounded-2xl">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-gray-900/10 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Preparing your canvas...</p>
      </div>
    </div>
  ),
});

const WritingAssistantPage = () => {
  const [content, setContent] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#F5F5F7] via-white to-[#F5F5F7]">
      <SideBar>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col w-full max-w-[1440px] mx-auto px-4 py-6"
        >
          <div className="flex justify-between items-end mb-4 pr-2">
            <div className="space-y-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center space-x-3 mb-3"
              >
                <HiOutlinePencilAlt className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Writing Assistant</h1>
              </motion.div>
              <p className="text-gray-600 text-lg">Craft your thoughts with AI-powered intelligence</p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center"
            >
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-full border border-gray-100">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-600">AI Ready</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.98 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full rounded-2xl bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03] overflow-hidden"
          >
            <AIEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing here..."
              style={{ 
                height: 'calc(100vh - 220px)',
                padding: '36px 44px',
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#1F2937'
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </motion.div>
        </motion.div>
      </SideBar>
    </div>
  );
};

export default WritingAssistantPage;