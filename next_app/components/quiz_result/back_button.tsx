"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineRefresh } from "react-icons/hi";
import { motion } from "framer-motion";

export default function BackButton(){
    const pathname = usePathname();
    const basePath = pathname.split('/').slice(0, 4).join('/');

    return(
        <Link href={basePath} className="block">
            <motion.button 
                className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                text-white font-medium shadow-sm hover:shadow-md transition-all duration-200
                flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <HiOutlineRefresh className="w-5 h-5" />
                <span>Restart Quiz</span>
            </motion.button>
        </Link>
    );
}