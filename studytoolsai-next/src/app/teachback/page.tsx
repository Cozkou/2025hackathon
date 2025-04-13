'use client';

import { useState, ChangeEvent, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function TeachBackPage() {
    const [topic, setTopic] = useState<string>('');
    const [grade, setGrade] = useState<number>(1);
    const [difficulty, setDifficulty] = useState<string>('normal');
    const [showChat, setShowChat] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    const [conversationEnded, setConversationEnded] = useState<boolean>(false);
    const [questionCount, setQuestionCount] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const difficulties = ['easy', 'normal', 'difficult'] as const;

    const handleTopicChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
    };

    const handleGradeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setGrade(Number(e.target.value));
    };

    const handleDifficultyChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDifficulty(difficulties[Number(e.target.value)]);
    };

    const handleStartRevision = async () => {
        if (!topic) return;
        
        setShowChat(true);
        setMessages([]);
        setFeedback('');
        setConversationEnded(false);
        setQuestionCount(0);
        setErrorMessage('');
        
        // Initial AI message with updated prompt
        const initialPrompt = `You are a cheerful and enthusiastic question-asker for a student in ${grade === 13 ? 'university' : `grade ${grade}`} studying ${topic}. 
        The difficulty level is ${difficulty}. 
        Your role is to ask questions about ${topic} in an indirect, conversational way.
        Be happy, encouraging, and positive throughout the conversation.
        Instead of asking direct questions like "What is X?", use indirect phrasing like "I'm curious about X" or "I'd love to know more about X".
        Do not provide explanations, commentary, or feedback during the conversation.
        Do not acknowledge if answers are correct or incorrect.
        Simply ask one question at a time and wait for the answer.
        Start with a cheerful introduction: "Hi there! I'm excited to chat with you about ${topic}. Let's begin!"
        Then immediately ask your first question in an indirect, friendly way without any additional commentary.`;
        
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: initialPrompt }],
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setMessages([{ role: 'assistant', content: data.content }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage(`Error connecting to AI: ${errorMsg}`);
            setMessages([{ role: 'assistant', content: 'Sorry, there was an error connecting to the AI. Please try again or contact support.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (userMessage: string) => {
        if (userMessage.toLowerCase() === 'end') {
            handleEndConversation();
            return;
        }
        
        // Add user message to chat
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setErrorMessage('');
        
        // Increment question count if this is a response to an AI question
        if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
            setQuestionCount(prev => prev + 1);
        }
        
        setIsLoading(true);
        
        try {
            // Add a system message to instruct the AI to just ask the next question
            const systemMessage = { role: 'user', content: 'Just ask the next question about the topic in an indirect, cheerful way. Do not provide any commentary, feedback, or acknowledgment of the previous answer. Keep your response friendly and positive, but focused on asking the next question.' };
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...newMessages, systemMessage],
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setMessages([...newMessages, { role: 'assistant', content: data.content }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage(`Error connecting to AI: ${errorMsg}`);
            setMessages([...newMessages, { role: 'assistant', content: 'Sorry, there was an error connecting to the AI. Please try again or contact support.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndConversation = async () => {
        if (questionCount === 0) {
            setMessages([...messages, { role: 'assistant', content: 'You need to answer at least one question to receive feedback.' }]);
            return;
        }
        
        setConversationEnded(true);
        setErrorMessage('');
        
        // Don't add the "END" message to the chat
        // Just show a message that the conversation is ending
        setMessages([...messages, { role: 'assistant', content: 'Ending conversation and generating feedback...' }]);
        
        const feedbackPrompt = `You are providing feedback to a student who has been answering questions about ${topic}. 
        Address the student directly using "you" and "your" (not "the student" or "they").
        Provide constructive feedback on their answers, summarizing their strengths and areas for improvement.
        Keep your feedback concise, encouraging, and specific.
        Start with "Here's your feedback:" and then provide the feedback in a conversational tone.`;
        
        const newMessages = [...messages, { role: 'user', content: feedbackPrompt }];
        
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: newMessages,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Replace the "Ending conversation" message with the feedback
            setMessages([...messages, { role: 'assistant', content: data.content }]);
            setFeedback(data.content);
        } catch (error) {
            console.error('Error getting AI feedback:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage(`Error getting feedback: ${errorMsg}`);
            setMessages([...messages, { role: 'assistant', content: 'Sorry, there was an error getting feedback. Please try again or contact support.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const input = e.currentTarget;
            const message = input.value.trim();
            
            if (message) {
                handleSendMessage(message);
                input.value = '';
            }
        }
    };

    // Auto-scroll to bottom of chat when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529] flex flex-col">
            <Header />
            
            {/* Main Content */}
            <div className="container mx-auto px-4 pt-36 flex-1">
                <div className="flex flex-col items-center max-w-4xl mx-auto mt-10">
                    <h1 className="text-7xl font-bold text-center bg-gradient-to-r from-[#86efac] via-[#8B7FFF] to-[#B39DDB] text-transparent bg-clip-text font-['Poppins'] drop-shadow-lg animate-gradient pb-2 leading-[1.2] mb-8">
                        TeachBack
                    </h1>
                    <p className="text-xl text-center text-[#B39DDB]/70 font-['Inter'] leading-relaxed tracking-wide mb-12 max-w-2xl">
                        Test your knowledge by teaching back what you've learned. Enter a topic, select your grade level and difficulty, and start revising!
                    </p>
                    
                    {!showChat ? (
                        <div className="w-full bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40 transition-all duration-300">
                            <div className="space-y-6">
                                {/* Topic Input */}
                                <div>
                                    <label htmlFor="topic" className="block text-[#B39DDB]/70 mb-2 font-['Inter']">Enter Topic</label>
                                    <input
                                        type="text"
                                        id="topic"
                                        value={topic}
                                        onChange={handleTopicChange}
                                        className="w-full bg-white/10 border border-[#8B7FFF]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B7FFF]/40 transition-all duration-300"
                                        placeholder="Enter your topic here..."
                                    />
                                </div>

                                {/* Grade Slider */}
                                <div>
                                    <label className="block text-[#B39DDB]/70 mb-2 font-['Inter']">Grade Level</label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max="13"
                                            value={grade}
                                            onChange={handleGradeChange}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8B7FFF]"
                                        />
                                        <span className="text-white min-w-[3rem]">{grade === 13 ? 'University' : `Grade ${grade}`}</span>
                                    </div>
                                </div>

                                {/* Difficulty Slider */}
                                <div>
                                    <label className="block text-[#B39DDB]/70 mb-2 font-['Inter']">Difficulty</label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            value={difficulties.indexOf(difficulty)}
                                            onChange={handleDifficultyChange}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8B7FFF]"
                                        />
                                        <span className="text-white capitalize min-w-[5rem]">{difficulty}</span>
                                    </div>
                                </div>

                                {/* Start Revision Button */}
                                <button
                                    disabled={!topic}
                                    onClick={handleStartRevision}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-400 flex items-center justify-center space-x-3
                                        ${topic 
                                            ? 'bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white hover:shadow-lg hover:scale-[1.02]' 
                                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                                >
                                    Start Revision
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-[#8B7FFF]/20 transition-all duration-300">
                            <div className="flex flex-col h-[500px]">
                                {/* Chat Header */}
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#8B7FFF]/20">
                                    <h2 className="text-xl font-bold text-white">TeachBack: {topic}</h2>
                                    <button 
                                        onClick={() => setShowChat(false)}
                                        className="text-[#B39DDB]/70 hover:text-white transition-colors"
                                    >
                                        Exit
                                    </button>
                                </div>
                                
                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                        {errorMessage}
                                    </div>
                                )}
                                
                                {/* Chat Messages */}
                                <div 
                                    ref={chatContainerRef}
                                    className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2"
                                >
                                    {messages.map((message, index) => (
                                        <div 
                                            key={index} 
                                            className={`p-4 rounded-xl ${
                                                message.role === 'user' 
                                                    ? 'bg-[#8B7FFF]/20 ml-auto max-w-[80%]' 
                                                    : 'bg-white/10 mr-auto max-w-[80%]'
                                            }`}
                                        >
                                            <p className="text-white whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    ))}
                                    
                                    {isLoading && (
                                        <div className="bg-white/10 p-4 rounded-xl mr-auto max-w-[80%]">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-[#8B7FFF] rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-[#8B7FFF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-2 h-2 bg-[#8B7FFF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Chat Input */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        placeholder={conversationEnded ? "Type 'end' to exit" : "Type your answer or 'end' to finish..."}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading || conversationEnded}
                                        className="flex-1 bg-white/10 border border-[#8B7FFF]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B7FFF]/40 transition-all duration-300 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                            if (input && input.value.trim()) {
                                                handleSendMessage(input.value.trim());
                                                input.value = '';
                                            }
                                        }}
                                        disabled={isLoading || conversationEnded}
                                        className="bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                </div>
                                
                                {/* Feedback Section */}
                                {feedback && (
                                    <div className="mt-6 p-4 bg-[#8B7FFF]/10 rounded-xl border border-[#8B7FFF]/20">
                                        <h3 className="text-lg font-bold text-white mb-2">Feedback</h3>
                                        <p className="text-[#B39DDB]/90 whitespace-pre-wrap">{feedback}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
} 