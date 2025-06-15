"use client"

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizSection {
  type: string;
  question: string;
  point: number;
  choices?: string[] | { pair1: string[], pair2: string[] };
  code?: string;
  answer?: string[];
}

interface QuizAreaProps {
  sections: QuizSection[]; //quiz content
  quizStatus: 'notStarted' | 'started' | 'submitted' | 'timeOut';
  setQuizStatus: (status: 'notStarted' | 'started' | 'submitted' | 'timeOut') => void; // set quiz status 
  answers: string[][]; 
  setAnswers: React.Dispatch<React.SetStateAction<string[][]>>;
  setInteracted: React.Dispatch<React.SetStateAction<boolean[]>>; 
  handleSubmit: (e: React.FormEvent) => void;


}

const SortableItem: React.FC<{ id: string; isDragging?: boolean }> = ({ id, isDragging }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging: isSortableDragging 
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    cursor: 'move',
    position: 'relative' as const,
    zIndex: isSortableDragging ? 2 : 1,
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      layout
      className={`p-3 rounded-xl bg-white border border-gray-200/75
        ${isSortableDragging ? 'shadow-lg ring-2 ring-blue-500' : 'shadow-sm hover:shadow-md'}`}
    >
      {id}
    </motion.div>
  );
};

const renderQuizDisplay = (
  section: QuizSection,
  index: number,
  answers: string[][],
  handleChange: (index: number, value: string) => void,
  handleDragEnd: (event: DragEndEvent, index: number) => void,
  handleDragStart: (event: DragStartEvent) => void,
  sensors: any,
  isClient: boolean,
  activeId: string | null
) => {
  const commonQuestionClasses = "mb-6 p-6 rounded-2xl bg-white border border-gray-200/75 shadow-sm";
  const commonInputClasses = "w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";

  switch (section.type) {
    case 'T/F':
    case 'MC':
      return (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={commonQuestionClasses}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Question {index + 1}</h2>
                <p className="text-sm text-gray-500">{section.point} {section.point === 1 ? 'point' : 'points'}</p>
              </div>
            </div>
            
            <p className="text-gray-800">{section.question}</p>
            
            {section.code && (
              <pre className="p-4 bg-gray-50 rounded-xl overflow-x-auto font-mono text-sm text-gray-800">
                <code>{section.code}</code>
              </pre>
            )}

            <div className="grid gap-3">
              {(section.choices as string[])?.map((option, i) => (
                <label 
                  key={i} 
                  className="group flex items-center p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={answers[index] && answers[index][0] === option}
                      onChange={() => handleChange(index, option)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-blue-500 peer-checked:border-[6px] transition-all"></div>
                  </div>
                  <span className="ml-4 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      );

    case 'Fill_blank':
      return (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={commonQuestionClasses}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Question {index + 1}</h2>
                <p className="text-sm text-gray-500">{section.point} {section.point === 1 ? 'point' : 'points'}</p>
              </div>
            </div>
            
            <p className="text-gray-800">{section.question}</p>
            
            {section.code && (
              <pre className="p-4 bg-gray-50 rounded-xl overflow-x-auto font-mono text-sm text-gray-800">
                <code>{section.code}</code>
              </pre>
            )}

            <input
              type="text"
              name={`question-${index}`}
              value={answers[index] ? answers[index][0] : ''}
              onChange={(e) => handleChange(index, e.target.value)}
              className={commonInputClasses}
              placeholder="Type your answer here..."
            />
          </div>
        </motion.div>
      );

    case 'Ordering':
      return (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={commonQuestionClasses}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <h2 className="text-xl font-semibold text-gray-900">Question {index + 1}</h2>
              <span className="text-sm text-gray-500">({section.point} {section.point === 1 ? 'point' : 'points'})</span>
            </div>
            
            <p className="text-gray-800">{section.question}</p>
            
            {section.code && (
              <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto font-mono text-sm">
                <code>{section.code}</code>
              </pre>
            )}

            {isClient && (
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={(event) => handleDragEnd(event, index)}
                onDragStart={handleDragStart}
              >
                <div className="relative">
                  <SortableContext items={answers[index]} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 mt-4">
                      {answers[index].map((choice) => (
                        <SortableItem key={choice} id={choice} isDragging={activeId === choice} />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay adjustScale={true}>
                    {activeId ? (
                      <div className="p-3 rounded-xl bg-white border-2 border-blue-500 shadow-lg">
                        {activeId}
                      </div>
                    ) : null}
                  </DragOverlay>
                </div>
              </DndContext>
            )}
          </div>
        </motion.div>
      );

    case 'Short_qs':
    case 'Long_qs':
      return (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={commonQuestionClasses}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Question {index + 1}</h2>
                <p className="text-sm text-gray-500">{section.point} {section.point === 1 ? 'point' : 'points'}</p>
              </div>
            </div>
            
            <p className="text-gray-800">{section.question}</p>
            
            {section.code && (
              <pre className="p-4 bg-gray-50 rounded-xl overflow-x-auto font-mono text-sm text-gray-800">
                <code>{section.code}</code>
              </pre>
            )}

            {section.type === 'Long_qs' ? (
              <textarea
                name={`question-${index}`}
                value={answers[index] ? answers[index][0] : ''}
                onChange={(e) => handleChange(index, e.target.value)}
                className={`${commonInputClasses} min-h-[120px] resize-y`}
                placeholder="Type your answer here..."
              />
            ) : (
              <input
                type="text"
                name={`question-${index}`}
                value={answers[index] ? answers[index][0] : ''}
                onChange={(e) => handleChange(index, e.target.value)}
                className={commonInputClasses}
                placeholder="Type your answer here..."
              />
            )}
          </div>
        </motion.div>
      );

    default:
      return null;
  }
};

const QuizArea: React.FC<QuizAreaProps> = ({ sections, quizStatus, setQuizStatus, answers, setAnswers, setInteracted, handleSubmit }) => {
  const [isClient, setIsClient] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = [value];
    setAnswers(newAnswers);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent, index: number) => {
    setActiveId(null);
    const { active, over } = event;

    if (active.id !== over?.id) {
      setAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers];
        const oldIndex = newAnswers[index].indexOf(active.id as string);
        const newIndex = newAnswers[index].indexOf(over?.id as string);
        newAnswers[index] = arrayMove(newAnswers[index], oldIndex, newIndex);

        setInteracted(prevInteracted => {
          const newInteracted = [...prevInteracted];
          newInteracted[index] = true;
          return newInteracted;
        });
        return newAnswers;
      });
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <AnimatePresence>
        {quizStatus !== 'started' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-sm bg-white/50 flex items-start justify-center z-10 pt-20"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-sm mx-4"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Begin?</h3>
              <p className="text-gray-600 mb-4">Press the start button when you&apos;re ready to take the quiz.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {Array.isArray(sections) && sections.map((section, index) => (
            renderQuizDisplay(
              section, 
              index, 
              answers, 
              handleChange, 
              handleDragEnd, 
              handleDragStart,
              sensors, 
              isClient,
              activeId
            )
          ))}

          <motion.button
            type="submit"
            disabled={quizStatus !== 'started'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
            text-white font-medium shadow-sm hover:shadow-md transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Submit Quiz
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default QuizArea;
