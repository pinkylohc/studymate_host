"use client"

import { HiAcademicCap, HiMenu } from "react-icons/hi";
import { LoginButton, RegisterButton } from "./start_buttons";
import { useState } from "react";
import Link from "next/link";
import { ProcessingModal } from "./generator/loading_modal";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

export default function StartHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    const handleButtonClick = (targetRoute: string) => {
        //console.log('targetRoute:', targetRoute);
        //console.log('pathname:', pathname);
        if (pathname !== targetRoute) {
            setLoading(true);
        }
    };

    return(
        <>
            {loading && <ProcessingModal isVisible={true} message="Loading..." />}
    
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="hidden relative md:flex flex-row justify-between items-center h-16 bg-gradient-to-r from-blue-500 to-blue-600 px-6 shadow-md"
            > 
                <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <HiAcademicCap className="h-8 w-8 text-white"/>
                    <h1 className="font-bold text-2xl text-white">StudyMateHub</h1>
                </Link>

                <div className="flex space-x-4 items-center">
                    <LoginButton device="desktop" onClick={() => handleButtonClick('/auth/login')} />
                    <RegisterButton device="desktop" onClick={() => handleButtonClick('/auth/register')} />
                </div>
            </motion.div>

            {/* Mobile header */}
            <div className="md:hidden relative">
                <div className="flex items-center justify-between h-14 bg-gradient-to-r from-blue-500 to-blue-600 px-4 shadow-md">
                    <Link href="/" className="flex items-center space-x-2">
                        <HiAcademicCap className="h-7 w-7 text-white"/>
                        <h1 className="font-bold text-xl text-white">StudyMateHub</h1>
                    </Link>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg hover:bg-blue-600/50 transition-colors"
                    >
                        <HiMenu className="h-6 w-6 text-white"/>
                    </button>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-xl overflow-hidden border-t border-blue-100"
                        >
                            <div className="p-3 space-y-2">
                                <LoginButton device="mobile" onClick={() => handleButtonClick('/auth/login')} />
                                <RegisterButton device="mobile" onClick={() => handleButtonClick('/auth/register')} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>       
    );
}