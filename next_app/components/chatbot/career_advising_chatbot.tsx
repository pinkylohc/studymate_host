// a simple template chatbot with user and ai response
// alternatively, can use existing library to build it

"use client"

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosSend, IoIosAdd, IoMdChatbubbles } from "react-icons/io";
import axios from 'axios';
import { ThreeDot } from "react-loading-indicators";

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface Content {
  type: string;
  content: string;
}

const UserMessage = ({ text }: { text: string }) => (
  <div className="float-left p-2 m-1 ml-auto rounded-tl-3xl rounded-tr-3xl rounded-br-md rounded-bl-3xl bg-teal-500 text-white max-w-full break-words">
  <div className="rounded-lg p-2 bg-teal-500 text-white whitespace-pre-line">
    You: {text}
  </div>
</div>
);
  
const AIMessage = ({ text } : { text: string }) => (
  <div className="float-right p-2 m-2 rounded-tl-3xl rounded-tr-3xl rounded-bl-md rounded-br-3xl bg-gray-200 text-black break-words inline-block max-w-max">
    <div className="rounded-lg p-2 bg-gray-200 text-black whitespace-pre-line">
      AI: {text}
    </div>
  </div>
);

const CareerAdvisingChatbot = ({ userid } : { userid:any }) => {
    // const params = useSearchParams();

    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // chats list
    const [showList, setShowList] = useState(false);
    const [sessionList, setSessionList] = useState<string[]>([]);
    const [sessionId, setSessionId] = useState<string>('');
    // loading indicator
    const [isLoading, setIsLoading] = useState(false);
    // guidance
    const [showGuidance, setShowGuidance] = useState(false);
    const [guidance, setGuidance] = useState<string[]>([]);

    const handleLastChat = async () => {
      // retrieve the last chat
      try{
        const response = await axios.get(`http://localhost:8000/careeradvising-chatbot/history/${userid}`);
        const data = response.data
        let history: Message[] = [];

        for (let i in data) {
          const arr = (Object.values(data[i])[2] as Content[]);
          for (let j in arr) {
            if (arr[j].type === 'ai'){
              history.push({ sender: 'ai', text: arr[j].content });
            }
            if (arr[j].type === 'human'){
              history.push({ sender: 'user', text: arr[j].content });
            }
          }
        }
        setChatHistory(history);
        if (!response.data) {
          // Add an initial message from the AI (e.g. new user)
          toggleGuidance();
          // setChatHistory([{ sender: 'ai', text: 'Hello! I am your career advisor. How may I assist you today?' }]);
        }
      } catch(error) {
        console.error('Error fetching last chat:', error);
      }
    };

    useEffect(() => {
        handleLastChat();
    }, []);

    useEffect(() => {
      // Scroll to the bottom of the chat history whenever it changes
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    }, [chatHistory]);

    // chat history list
    const toggleList = async () => {
      setShowList(!showList);
      // get recent 5 chats
      try{
        const response = await axios.get(`http://localhost:8000/careeradvising-chatbot/sessions/${userid}`);
        setSessionList(response.data);
      } catch(error) {
        console.error('Error fetching session ids:', error);
      }
    };
  
    const handleChatClick = async (sessionId: string) => {
      try {
        // once the chat is clicked, hide the list
        setShowList(!showList);
        // get chat history by session id
        const response = await axios.get(`http://localhost:8000/careeradvising-chatbot/${sessionId}`);
        setSessionId(sessionId);
        const data = response.data;
        let history: Message[] = [];
        for (let i in data) {
          const user_msg = (Object.values(data[i])[2] as Content[])[0].content;
          const ai_msg = (Object.values(data[i])[2] as Content[])[1].content;

          const user_history: Message = { sender: 'user', text: user_msg };
          const ai_history: Message = { sender: 'ai', text: ai_msg };

          history.push(user_history);
          history.push(ai_history);
        }
        setChatHistory(history);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
  
    const floatingListStyle = {
      position: 'absolute',
      bottom: '50px',
      left: '90px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    } as React.CSSProperties;
  
    const listItemStyle = {
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      color: '#2772db',
    };
    
    const toggleGuidance = async () => {
      setShowGuidance(!showGuidance);
      try{
        setGuidance([]);
        setChatHistory([]);
        // setIsLoading(true);
        const response = await axios.get("http://localhost:8000/careeradvising-chatbot/guidance");
        const data = response.data;
        setGuidance(data);
        // setIsLoading(false);
      } catch(error) {
        console.error('Error fetching guidance:', error);
      }
    };

    const handleGuidanceClick = async (guidance: string) => {
      try {
        // once the item is clicked, hide the list
        setShowGuidance(!showGuidance);
        // send the guidance and start a new session
        handleSendMessage(guidance, true);
      } catch (error) {
        console.error('Error fetching guidance:', error);
      }
    };

    const guidanceListStyle = {
      position: 'absolute',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)', // Center the block
      backgroundColor: 'white',
      textAlign: 'center', 
      width: '90%',
      marginRight: '10px',
    } as React.CSSProperties;
  
    const guidanceItemStyle = {
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      color: '#2772db',
      border: '1px dashed #4299e1',
      margin: '18px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
    };

    const handleSendMessage = async (message: string, is_new_session=false) => {
      try{
          if (message.trim().length > 0){
            setShowGuidance(false);
            const newMessage: Message = { sender: 'user', text: message }; // add current message to history
            setChatHistory([...chatHistory, newMessage]);

            setIsLoading(true);
            const response = await axios.post("http://localhost:8000/careeradvising-chatbot", {
              message: message,
              chatHistory: JSON.stringify(chatHistory),
              isNewSession: is_new_session,
              userId: userid,
              sessionId: sessionId,
            });
            const data = response.data;
            setIsLoading(false);
            setChatHistory((prevChatHistory) => [...prevChatHistory, { sender: 'ai', text: data }]);
          }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    };

    return (
        <div>
        {
          <div className="bg-white mb-1 flex flex-col fixed bottom-0 right-0 top-12 left-72">
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

              <button
                onClick={ toggleGuidance }
                className="h-8 p-2 bg-blue-500 text-white rounded flex items-center whitespace-nowrap"
                style={{ fontSize: '12px' }} 
              >
                <IoIosAdd className="mr-1" /> New chat
              </button>
              {showGuidance && (
                <ul style={guidanceListStyle}>
                  {guidance.map((guidance, index) => (
                    <li
                      key={index}
                      onClick={() => handleGuidanceClick(guidance.valueOf())}
                      style={guidanceItemStyle}
                    >
                      {guidance}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={ toggleList }
                style={{ fontSize: '12px' }}
                className="h-8 p-2 bg-blue-500 text-white rounded flex items-center whitespace-nowrap"
              >
                <IoMdChatbubbles className="mr-1" /> Chats
              </button>
              {showList && (
                <ul style={floatingListStyle}>
                  {sessionList.map((session_id, index) => (
                    <li
                      key={index}
                      onClick={() => handleChatClick(session_id.valueOf())}
                      style={listItemStyle}
                    >
                      Chat {index+1}
                    </li>
                  ))}
                </ul>
              )}
              
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
        }
      </div>
    );
}

export default CareerAdvisingChatbot;