"use client"
import Link from 'next/link';
import { IoIosLogOut } from "react-icons/io";
import { HiAcademicCap } from "react-icons/hi";
import { IoChevronBackOutline } from "react-icons/io5";
import NavLinks from './sidebar_nav';
import { useState, ReactNode, useEffect } from 'react';
import signOutUser from "@/action/signout";
import { usePathname } from 'next/navigation';

interface LayoutProps {
    children?: ReactNode
}

export default function SideBar({ children }: LayoutProps) {
    const path = usePathname();
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebarState');
            if (window.innerWidth < 1024) return false;
            return savedState ? JSON.parse(savedState) : true;
        }
        return true;
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && isOpen) {
                setIsOpen(false);
            } else if (window.innerWidth >= 1024 && !isOpen) {
                setIsOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    const toggleSidebar = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarState', JSON.stringify(newState));
        }
    };

    return (
        <div className="w-full flex sm:h-full flex-col">
            <div className="w-full flex bg-gradient-to-r from-blue-500/90 via-blue-600/90 to-blue-500/90 backdrop-blur-xl h-14 items-center justify-between px-4 fixed top-0 z-50 shadow-sm">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <IoChevronBackOutline className={`h-5 w-5 text-white transition-transform duration-200 ${isOpen ? '' : 'rotate-180'}`} />
                    </button>
                    <Link
                        className="flex items-center space-x-2.5 text-white"
                        href="/"
                    >
                        <HiAcademicCap className="h-7 w-7" />
                        <h1 className="font-medium text-lg tracking-tight">StudyMateHub</h1>
                    </Link>
                </div>
            </div>
            
            <div 
                className={`fixed top-[56px] bottom-0 lg:w-72 w-64 transition-all duration-300 ease-in-out 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-[#F5F5F7] border-r border-black/[0.06] z-40`}
            >
                <div className="flex flex-col h-full overflow-y-auto">
                    <div className="flex-1 py-4">
                        <NavLinks />
                    </div>

                    <div className="p-4">
                        <form action={signOutUser}>
                            <button 
                                type="submit"
                                className="w-full px-4 py-3 rounded-xl flex items-center justify-center space-x-2.5 
                                bg-white/50 hover:bg-gray-100/80 border border-gray-200/60 
                                transition-all duration-200 group"
                            >
                                <IoIosLogOut className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">Sign Out</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="flex flex-row w-full mt-14">
                <div 
                    className={`flex overflow-y-auto min-h-[calc(100vh-56px)] w-full
                    ${isOpen ? 'lg:ml-72' : 'ml-0'} transition-all duration-300`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}