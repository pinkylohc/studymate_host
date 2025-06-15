"use client";

/*
  This is the starting page of the app. 
  It will be the first page that will be loaded when the app starts.
*/

import StartHeader from "@/components/start_header";
import { GettingStartButton } from "@/components/start_buttons";
import { FaChalkboardTeacher, FaChartLine, FaClipboardList, FaPenFancy, FaQuestionCircle, FaRobot } from "react-icons/fa";
import { useEffect } from "react";
import { useAnimate, stagger } from "framer-motion";

export default function Home() {
  const [welcomeScope, animateWelcome] = useAnimate();
  const [featuresScope, animateFeatures] = useAnimate();
  const [stepsScope, animateSteps] = useAnimate();

  useEffect(() => {
    // Animate welcome section
    animateWelcome(
      "h1",
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.5 }
    );
    animateWelcome(
      "p",
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.5, delay: 0.1 }
    );

    // Animate features
    animateFeatures(
      "h2",
      { opacity: [0, 1] },
      { duration: 0.5 }
    );
    animateFeatures(
      ".feature-card",
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.3, delay: stagger(0.1) }
    );

    // Animate steps
    animateSteps(
      "h2",
      { opacity: [0, 1] },
      { duration: 0.5 }
    );
    animateSteps(
      ".step-card",
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.3, delay: stagger(0.1) }
    );
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <StartHeader />

      {/* Welcome Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div ref={welcomeScope} className="relative px-6 py-16 sm:py-20 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white max-w-4xl mx-auto tracking-tight">
            Welcome to StudyMateHub!
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-blue-50 max-w-2xl mx-auto">
            Your one-stop solution for personalized study material, career advice, and writing assistance with AI!
          </p>
          <GettingStartButton />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20">
        <div ref={featuresScope} className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">
            Features
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FaQuestionCircle,
                title: "Create and Take Quizzes",
                description: "Easily create and take quizzes to test your knowledge."
              },
              {
                icon: FaClipboardList,
                title: "Generate Summaries",
                description: "Generate summaries of your study material with AI assistance."
              },
              {
                icon: FaChalkboardTeacher,
                title: "Create Tutorials",
                description: "Easily create tutorials to help others learn."
              },
              {
                icon: FaRobot,
                title: "Career Advising Chatbot",
                description: "Get personalized career advice from our AI-powered chatbot."
              },
              {
                icon: FaPenFancy,
                title: "Writing Assistant",
                description: "Improve your writing with our AI-powered writing assistant."
              },
              {
                icon: FaChartLine,
                title: "Track Your Progress",
                description: "Keep track of your learning progress and achievements."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-gray-200/75 shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div ref={stepsScope} className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-6">
            How to Use Our Site
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 text-center mb-8">Follow these simple steps to get started:</p>
            <div className="space-y-4">
              {[
                "Sign up or log in to your account.",
                "Create study material such as quizzes, summaries, and tutorials.",
                "Get personalized career advice from our chatbot.",
                "Use our writing assistant to improve your writing.",
                "Track your progress and earn badges."
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="step-card flex items-center space-x-4 p-3 rounded-xl bg-white border border-gray-200/75 shadow-sm"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
