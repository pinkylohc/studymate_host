import React from 'react';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';

interface AnsweredQuestionsListProps {
    answeredArray: boolean[];
}

const AnsweredQuestionsList: React.FC<AnsweredQuestionsListProps> = ({ answeredArray }) => {
    return (
        <div className="w-full flex flex-col overflow-y-auto max-h-full">
            <h3>Answered Questions</h3>
            <ul className="space-y-1">
                {answeredArray.map((answered, index) => (
                    <li key={index} className="flex items-center space-x-4">
                        {answered ? (
                            <FaRegCheckCircle className="text-green-500 w-4 h-4" />
                        ) : (
                            <FaRegCircle className="w-4 h-4" />
                        )}
                        <span>{`Question ${index + 1}`}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AnsweredQuestionsList;