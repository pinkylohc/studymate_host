import Link from 'next/link';
import { VscSignIn } from "react-icons/vsc";
import { FaUserPlus } from "react-icons/fa";
import { RxRocket } from "react-icons/rx";
import { motion } from 'framer-motion';

interface ButtonProps {
    device: string;
    onClick: () => void;
}

const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
};

export function LoginButton({ device, onClick }: ButtonProps) {
    const buttonClass = device === 'desktop' 
        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
        : 'w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100';

    return (
        <Link href="/auth/login" className="block">
            <motion.button 
                onClick={onClick} 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                    ${buttonClass}
                    flex items-center justify-center
                    px-4 py-2 rounded-xl
                    font-medium transition-colors duration-200
                    shadow-sm hover:shadow
                `}
            >
                <VscSignIn className="h-5 w-5 mr-2"/>
                <span>Login</span>
            </motion.button>
        </Link>
    );
}

export function RegisterButton({ device, onClick }: ButtonProps) {
    const buttonClass = device === 'desktop'
        ? 'bg-white text-blue-600 hover:bg-blue-50' 
        : 'w-full bg-blue-600 hover:bg-blue-700 text-white';

    return (
        <Link href="/auth/register" className="block">
            <motion.button 
                onClick={onClick}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                    ${buttonClass}
                    flex items-center justify-center
                    px-4 py-2 rounded-xl
                    font-medium transition-colors duration-200
                    shadow-sm hover:shadow
                `}
            >
                <FaUserPlus className="h-5 w-5 mr-2"/>
                <span>Sign Up</span>
            </motion.button>
        </Link>
    );
}

export function GettingStartButton() {
    return (
        <Link href="/auth/login" className="block">
            <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="
                    flex items-center justify-center
                    px-6 py-3 mt-8
                    bg-white text-blue-600 hover:bg-blue-50
                    rounded-xl font-semibold
                    shadow-md hover:shadow-lg
                    transition-all duration-200
                    text-lg
                "
            >
                <RxRocket className="h-6 w-6 mr-3"/>
                <span>Get Started</span>
            </motion.button>
        </Link>
    );
}