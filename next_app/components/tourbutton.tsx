'use client'

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const TourComponent = dynamic(() => import('./tour'), { ssr: false });
import { HiOutlineSparkles } from 'react-icons/hi';
import { motion } from 'framer-motion';

const TourButton = () => {
    const [isTourOpen, setIsTourOpen] = useState(false);

    // steps for product tour
    const steps = [
        {
          selector: '',
          content: 'Welcome to StudyMateHub! Let\'s take a quick tour to get you familiar with the portal.',
        },
        {
          selector: '.dashboard',
          content: 'This is your dashboard page where you can see your recent activities and achievements. It\'s your central hub for all your study-related tasks.',
        },
        {
          selector: '.upload-materials-link',
          content: 'Here you can upload your study materials to keep them organized and easily accessible.',
        },
        {
          selector: '.quiz-generator-link',
          content: 'Here is the Quiz Generator. You can create and take quizzes to test your knowledge and track your progress.',
        },
        {
          selector: '.summary-generator-link',
          content: 'This is the Summary Generator. You can create summaries of your study materials to help you review and retain information.',
        },
        {
          selector: '.tutorial-generator-link',
          content: 'This is the Tutorial Generator. You can create tutorials to help you and others understand complex topics.',
        },
        {
          selector: '.writing-assistant-link',
          content: 'This is the Writing Assistant. You can get help with your writing tasks, including grammar checks and style suggestions.',
        },
        {
          selector: '.advising-chatbot-link',
          content: 'This is the Career Advising Chatbot. You can get career advice and support from our virtual advisor.',
        },
        {
          selector: '.my-record-link',
          content: 'This is your record page where you can see all your created study materials.',
        },
        {
          selector: '',
          content: 'You are now ready to explore StudyMateHub, happy studying!',
        },
      ];
    
      return (
        <div className="relative">
            <motion.button
                onClick={() => setIsTourOpen(!isTourOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl 
                shadow-sm hover:shadow-md transition-all duration-200 group"
            >
                <HiOutlineSparkles className="w-5 h-5 text-blue-100 group-hover:animate-pulse" />
                <span className="font-medium">Take a Tour</span>
            </motion.button>
            <TourComponent 
                steps={steps} 
                isTourOpen={isTourOpen} 
                onRequestClose={() => setIsTourOpen(false)} 
            />
        </div>
      );
    };

export default TourButton;