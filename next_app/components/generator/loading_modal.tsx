"use client";

import { motion } from 'framer-motion';
import { FadeLoader } from 'react-spinners';

interface ProcessingModalProps {
    isVisible: boolean;
    message: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isVisible, message }) => {
    if (!isVisible) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
        >
            <div className="absolute inset-0 bg-gray-900/50" />
            
            <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-200/50"
            >
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse" />
                        <FadeLoader color="#2563eb" />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <p className="text-gray-900 font-medium">{message}</p>
                        <p className="text-sm text-gray-500">This may take a few moments...</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};