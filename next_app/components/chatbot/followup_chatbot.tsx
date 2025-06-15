// a simple template chatbot with user and ai response
// alternatively, can use existing library to build it

"use client"

import { getQuizbyId, getQuizResultbyId } from '@/db/chatbot_getquiz';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { IoChatboxEllipses } from 'react-icons/io5';
import { IoIosSend, IoIosResize } from "react-icons/io";
import axios from 'axios';
import { ThreeDot } from "react-loading-indicators";

interface Message {
    sender: 'user' | 'ai';
    text: string;
  }

  const UserMessage = ({ text }: { text: string }) => (
    <div className="float-left p-2 m-1 ml-auto rounded-tl-3xl rounded-tr-3xl rounded-br-md rounded-bl-3xl bg-teal-500 text-white break-words inline-block max-w-max">
    <div className="rounded-lg p-2 bg-teal-500 text-white">
      You: {text}
    </div>
  </div>
  );
  
  const AIMessage = ({ text }: { text: string }) => (
    <div className="float-right p-2 m-2 rounded-tl-3xl rounded-tr-3xl rounded-bl-md rounded-br-3xl bg-gray-300 text-black break-words inline-block max-w-max">
      <div className="rounded-lg p-2 bg-gray-300 text-black">
        AI: {text}
      </div>
    </div>
  );

const FollowupChatbot = () => {
  const params = useSearchParams();
  const quizid = params.get('quizid');
  const attempt = params.get('attempt');

  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [quiz, setQuiz] = useState<any>();
  const [answer, setAnswer] = useState<any>();
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [summary, setSummary] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // loading indicator
  const [isLoading, setIsLoading] = useState(false);
  // resize
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleSzie = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
      // Add an initial message from the AI
      setChatHistory([{ sender: 'ai', text: 'Hello! How can I assit your with the quiz?' }]);
      // get quiz
      async function fetchData() {
          try{
              const qz = await getQuizbyId(quizid as unknown as number);
              setQuiz(qz);
              console.log("quiz", qz); // Log the quiz data after fetching

              const result = await getQuizResultbyId(attempt as unknown as number);
              setAnswer(result);
              console.log("answer", result); // Log the answer data after fetching

          } catch (err) {
              // handle error
          } 
      }
      fetchData();
      // get answer
    }, [attempt]);

    useEffect(() => {
      // Scroll to the bottom of the chat history whenever it changes
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    }, [chatHistory]);
  

  const handleSendMessage = async (message: string) => {
    try{
      const newMessage: Message = { sender: 'user', text: message }; // add current message to history
      setChatHistory([...chatHistory, newMessage]);
      setIsLoading(true);

      const response = await axios.post("http://localhost:8000/followup-chatbot", {
          quiz: JSON.stringify(quiz),
          result: JSON.stringify(answer),
          message: message,
          chatHistory: JSON.stringify(chatHistory),
          // userId: userid,
      });

      const data = response.data;
      // console.log(data);
      setIsLoading(false);
      setChatHistory((prevChatHistory) => [...prevChatHistory, { sender: 'ai', text: data }]);

      } catch (err) {
          // handle error
          console.error('Error sending message:', err);
      }
    };

    const componentStyle = {
      width: isFullScreen ? '78%' : '24rem',
      height: isFullScreen ? '80%' : '50%',
      transition: 'width 0.3s, height 0.3s', 
    };

    return (
        <div>
        <button
          onClick={() => setIsChatbotVisible(!isChatbotVisible)}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full z-20"
        >
          <IoChatboxEllipses className="w-6 h-6" />
        </button>
        {isChatbotVisible && (
          <div style={componentStyle} className="fixed bottom-16 right-4 border-gray-700 border-4 rounded-md bg-blue-200 z-10 mb-1 flex flex-col">
            <div className="bg-gray-100 p-2 flex items-center justify-between">
              <span className='h-8 p-2'></span>
              <span className="text-center">Quiz Assistant</span>
              <button 
                onClick={toggleSzie}
                className="h-8 p-2 bg-blue-500 text-white rounded flex items-center whitespace-nowrap"
              >
                <IoIosResize />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4" ref={chatHistoryRef}>
              <div className="flex flex-col space-y-2">
                {chatHistory.map((msg, index) => (
                  msg.sender === 'user' ? (
                    <UserMessage key={index} text={msg.text} />
                  ) : (
                    <AIMessage key={index} text={msg.text} />
                  )
                ))}
                {isLoading && (
                  <div className="pl-6 pt-4">
                    <div className='loading-indicator'>
                      <ThreeDot color="#4299e1" size="medium" text="" textColor="" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-2 bg-gray-100 flex flex-row space-x-1">
            <input
                type="text"
                placeholder="Type a message"
                ref={inputRef}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="w-full p-1 border rounded"
              />
              <button
                onClick={() => {
                  const message = inputRef.current?.value;
                  if (message) {
                    handleSendMessage(message);
                    inputRef.current.value = '';
                  }
                }}
                className="w-8 h-8 p-2 bg-green-500 text-white rounded"
              >
                <IoIosSend />
              </button>
            </div>
          </div>
        )}
      </div>
    );
}

export default FollowupChatbot;