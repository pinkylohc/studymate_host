"use client"

import React from "react";
import { motion } from "framer-motion";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";

export default function QuizDisplay({display}: {display : {quizContent?: any, quizResult?: any}}) {
    return(
        <div className="w-full p-6 space-y-6">
             {display.quizContent && display.quizResult &&
                display.quizContent.quiz.map((item: any, index: number) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="rounded-2xl bg-white border border-gray-200/75 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 space-y-4">
                            {quiz_result_template({ quizcontent: item, quizresult: display.quizResult.result[index], index })}
                        </div>
                        
                        <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-3">
                            <div className="flex items-center space-x-2">
                                {(() => {
                                    const [scored, total] = display.quizResult.result[index].correct.split('/').map(Number);
                                    return scored === total ? (
                                        <HiOutlineCheckCircle className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <HiOutlineXCircle className="w-6 h-6 text-red-500" />
                                    );
                                })()}
                                <p className="font-semibold text-gray-900">
                                    Score: {display.quizResult.result[index].correct}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Explanation:</span> {display.quizResult.result[index].explanation}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Correct Answer:</span> {item.answer}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))
            }
        </div>
    );
}

function quiz_result_template({quizcontent, quizresult, index}: {quizcontent: any, quizresult: any, index: number}) {
    const type = quizcontent.type;
    switch (type) {
        case 'T/F':
        case 'MC':
          return (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Question {index + 1}</h2>
                <p className="text-sm text-gray-500">{quizcontent.point} {quizcontent.point === 1 ? 'point' : 'points'}</p>
              </div>
              
              <p className="text-gray-800">{quizcontent.question}</p>
              
              {quizcontent.code && (
                <pre className="p-4 bg-gray-50 rounded-xl overflow-x-auto font-mono text-sm text-gray-800">
                  <code>{quizcontent.code}</code>
                </pre>
              )}

              <div className="grid gap-3">
                {(quizcontent.choices as string[])?.map((option, i) => {
                  const isSelected = quizresult?.user_answer?.includes(option) ?? false;
                  const isCorrect = quizcontent.answer.includes(option);
                  return (
                    <label key={i} className={`group flex items-center p-4 rounded-xl border ${
                      isSelected 
                        ? (isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
                        : isCorrect 
                          ? 'bg-gray-50 border-gray-200 border-dashed' 
                          : 'bg-gray-50 border-gray-200'
                    } cursor-default`}>
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          checked={isSelected}
                          readOnly
                          className="peer sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          isSelected 
                            ? (isCorrect ? 'border-green-500 border-[6px]' : 'border-red-500 border-[6px]')
                            : isCorrect 
                              ? 'border-green-500 border-dashed' 
                              : 'border-gray-300'
                        }`}></div>
                      </div>
                      <span className={`ml-4 ${
                        isSelected 
                          ? (isCorrect ? 'text-green-700' : 'text-red-700')
                          : isCorrect 
                            ? 'text-green-600' 
                            : 'text-gray-700'
                      }`}>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );

        case 'Fill_blank':
          return (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Question {index + 1}</h2>
                <p className="text-sm text-gray-500">{quizcontent.point} {quizcontent.point === 1 ? 'point' : 'points'}</p>
              </div>
              
              <p className="text-gray-800">{quizcontent.question}</p>
              
              {quizcontent.code && (
                <pre className="p-4 bg-gray-50 rounded-xl overflow-x-auto font-mono text-sm text-gray-800">
                  <code>{quizcontent.code}</code>
                </pre>
              )}

              <input
                type="text"
                value={quizresult?.user_answer?.[0] ?? ''} 
                readOnly
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700"
              />
            </div>
          );

        case 'Ordering':
          return (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Question {index + 1}</h2>
                <p className="text-sm text-gray-500">{quizcontent.point} {quizcontent.point === 1 ? 'point' : 'points'}</p>
              </div>
              
              <p className="text-gray-800">{quizcontent.question}</p>
              
              {quizcontent.code && (
                <pre className="p-4 bg-gray-50 rounded-xl overflow-x-auto font-mono text-sm text-gray-800">
                  <code>{quizcontent.code}</code>
                </pre>
              )}

              <div className="space-y-2">
                {quizresult.user_answer.map((choice:string, i:number) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
                    {choice}
                  </div>
                ))}
              </div>
            </div>
          );

        case 'Short_qs':
        case 'Long_qs':
          return (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Question {index + 1}</h2>
                <p className="text-sm text-gray-500">{quizcontent.point} {quizcontent.point === 1 ? 'point' : 'points'}</p>
              </div>
              
              <p className="text-gray-800">{quizcontent.question}</p>
              
              {quizcontent.code && (
                <pre className="p-4 bg-gray-50 rounded-xl overflow-x-auto font-mono text-sm text-gray-800">
                  <code>{quizcontent.code}</code>
                </pre>
              )}

              {type === 'Long_qs' ? (
                <textarea
                  value={quizresult?.user_answer?.[0] ?? ''} 
                  readOnly
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 min-h-[120px] resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={quizresult?.user_answer?.[0] ?? ''} 
                  readOnly
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700"
                />
              )}
            </div>
          );

        default:
          return null;
    }
}