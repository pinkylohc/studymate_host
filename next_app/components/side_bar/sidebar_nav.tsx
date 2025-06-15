'use client';

import { FaHome, FaHistory } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { PiNotebook } from "react-icons/pi";
import { TfiWrite } from "react-icons/tfi";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { CiSettings } from "react-icons/ci";
import { IoCloudUpload } from "react-icons/io5";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import TourButton from "../tourbutton";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Dashboard', href: '/dashboard', icon: FaHome, className: 'dashboard-link' },
  { name: 'Upload Materials', href: '/upload-materials', icon: IoCloudUpload, className: 'upload-materials-link' },
  { name: 'Quiz Generator', href: '/quiz-generator', icon: MdQuiz, className: 'quiz-generator-link' },
  { name: 'Summary Generator', href: '/summary-generator', icon: PiNotebook, className: 'summary-generator-link' },
  { name: 'Tutorial Generator', href: '/tutorial-generator', icon: LiaChalkboardTeacherSolid, className: 'tutorial-generator-link' },
  { name: 'Writing Assistant', href: '/writing-assistant', icon: TfiWrite, className: 'writing-assistant-link' },
  { name: 'Advising Chatbot', href: '/advising-chatbot', icon: IoChatbubbleEllipsesOutline, className: 'advising-chatbot-link' },
  { name: 'My Record', href: '/materials/my-record', icon: FaHistory, className: 'my-record-link' },
  { name: 'My Account', href: '/auth/my-account', icon: CiSettings, className: 'my-account-link' },
];

export default function NavLinks() {
  const pathname = usePathname();
  
  return (
    <div className="space-y-2 px-2">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'group flex h-12 items-center space-x-3 rounded-xl px-4 text-sm transition-all duration-200',
              {
                'bg-blue-50 text-blue-600 shadow-sm': isActive,
                'hover:bg-gray-100': !isActive,
              },
              link.className
            )}
          >
            <div className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
              {
                'bg-blue-100 text-blue-600': isActive,
                'bg-gray-100 text-gray-500 group-hover:text-gray-600 group-hover:bg-gray-200': !isActive,
              }
            )}>
              <LinkIcon className="h-[20px] w-[20px]" />
            </div>
            <span className={clsx(
              'font-medium tracking-tight',
              {
                'text-blue-600': isActive,
                'text-gray-600 group-hover:text-gray-900': !isActive,
              }
            )}>
              {link.name}
            </span>
          </Link>
        );
      })}

      {pathname === '/dashboard' && (
        <div className="mt-6">
          <TourButton />
        </div>
      )}
    </div>
  );
}