'use client';

import { useState, ChangeEvent, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BsLightbulb, BsBarChartLine, BsStars } from 'react-icons/bs';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

type Difficulty = 'easy' | 'normal' | 'difficult';

export default function TeachBackPage() {
    const [topic, setTopic] = useState<string>('');
    const [grade, setGrade] = useState<number>(1);
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [showChat, setShowChat] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    const [conversationEnded, setConversationEnded] = useState<boolean>(false);
    const [questionCount, setQuestionCount] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const difficulties: Difficulty[] = ['easy', 'normal', 'difficult'] as const;

    const handleTopicChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
    };

    const handleGradeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setGrade(Number(e.target.value));
    };

    const handleDifficultyChange = (e: ChangeEvent<HTMLInputElement>) => {
        const index = parseInt(e.target.value);
        setDifficulty(difficulties[index] as Difficulty);
    };

    const handleStartRevision = async () => {
        if (!topic) return;
        
        setShowChat(true);
        setMessages([]);
        setFeedback('');
        setConversationEnded(false);
        setQuestionCount(0);
        setErrorMessage('');
        
        // Calculate cluelessness level based on grade (inverse relationship)
        const cluelessnessLevel = 14 - grade; // 13 (uni) = least clueless, 1 = most clueless
        
        // Calculate sophistication based on difficulty
        const sophisticationLevel = difficulties.indexOf(difficulty);
        
        // Initial AI message with updated prompt
        const initialPrompt = `You are an AI eager to learn about ${topic}. Your personality and behavior should follow these guidelines:

        CORE PERSONALITY:
        - You are genuinely excited to learn about ${topic}
        - You have basic knowledge but are intentionally playing clueless to encourage teaching
        - Your cluelessness level is ${cluelessnessLevel}/13 (higher means more clueless)
        - Your intellectual sophistication is ${sophisticationLevel}/2 (affects how you form questions/responses)
        
        INTERACTION STYLE:
        - Express curiosity through statements like "Oh, I've always wondered about..." or "Something that confuses me is..."
        - Show enthusiasm when the user explains things
        - For grade ${grade} ${grade === 13 ? '(university)' : ''} level:
          ${grade > 10 ? '- Use more sophisticated vocabulary and concepts' : '- Keep language simpler and more direct'}
          ${grade > 10 ? '- Ask about complex relationships between concepts' : '- Focus on fundamental understanding'}
        
        CORRECTION MECHANISM:
        - If the user says something incorrect, immediately respond with:
          "INTERRUPTING: [polite correction of the misconception]"
        - After any correction, smoothly continue the conversation with enthusiasm
        - Corrections should match the grade level in complexity
        
        CONVERSATION FLOW:
        - Start with: "Hi! I'm really excited to learn about ${topic}! I've heard some things about it but I'm a bit confused about [ask your first question]"
        - Let the user explain concepts to you
        - React with follow-up questions that show you're processing and learning
        - Match your confusion level to the cluelessness setting
        - ${difficulty === 'difficult' ? 'Ask challenging follow-up questions that require deep understanding' : 
           difficulty === 'normal' ? 'Balance between basic and complex questions' : 
           'Keep questions simple and straightforward'}

        Remember: Your goal is to make the user teach you, letting them reinforce their own learning through explanation.`;
        
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user' as const, content: initialPrompt }],
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
            
            setMessages([{ role: 'assistant' as const, content: data.content }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage(`Error connecting to AI: ${errorMsg}`);
            setMessages([{ role: 'assistant' as const, content: 'Sorry, there was an error connecting to the AI. Please try again or contact support.' }]);
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
        const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
        setMessages(newMessages);
        setErrorMessage('');
        
        // Increment question count if this is a response to an AI question
        if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
            setQuestionCount(prev => prev + 1);
        }
        
        setIsLoading(true);
        
        try {
            // Calculate current cluelessness and sophistication levels
            const cluelessnessLevel = 14 - grade;
            const sophisticationLevel = difficulties.indexOf(difficulty);
            
            // System message to maintain personality and handle responses
            const systemMessage = { role: 'user' as const, content: `Continue the conversation about ${topic} with these guidelines:

            - Maintain your excited, eager-to-learn personality
            - Your cluelessness level is ${cluelessnessLevel}/13
            - Your intellectual sophistication is ${sophisticationLevel}/2
            
            If the user's last explanation was incorrect:
            1. Start your response with "INTERRUPTING: " followed by a polite correction
            2. Then continue with your next curious question
            
            If the user's explanation was correct:
            1. Show enthusiasm for learning this new information
            2. Ask a follow-up question that builds on what they taught you
            3. Match the complexity to the grade level (${grade})
            
            Keep the conversation flowing naturally and stay in character as someone eager to learn more.` };
            
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
            
            setMessages([...newMessages, { role: 'assistant' as const, content: data.content }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage(`Error connecting to AI: ${errorMsg}`);
            setMessages([...newMessages, { role: 'assistant' as const, content: 'Sorry, there was an error connecting to the AI. Please try again or contact support.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndConversation = async () => {
        if (questionCount === 0) {
            setMessages([...messages, { role: 'assistant' as const, content: 'You need to answer at least one question to receive feedback.' }]);
            return;
        }
        
        setConversationEnded(true);
        setErrorMessage('');
        
        // Don't add the "END" message to the chat
        // Just show a message that the conversation is ending
        setMessages([...messages, { role: 'assistant' as const, content: 'Ending conversation and generating feedback...' }]);
        
        const feedbackPrompt = `You are providing feedback to a student who has been answering questions about ${topic}. 
        Address the student directly using "you" and "your" (not "the student" or "they").
        Provide constructive feedback on their answers, summarizing their strengths and areas for improvement.
        Keep your feedback concise, encouraging, and specific.
        Start with "Here's your feedback:" and then provide the feedback in a conversational tone.`;
        
        const newMessages = [...messages, { role: 'user' as const, content: feedbackPrompt }];
        
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
            setMessages([...messages, { role: 'assistant' as const, content: data.content }]);
            setFeedback(data.content);
        } catch (error) {
            console.error('Error getting AI feedback:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage(`Error getting feedback: ${errorMsg}`);
            setMessages([...messages, { role: 'assistant' as const, content: 'Sorry, there was an error getting feedback. Please try again or contact support.' }]);
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
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="1"
                                            max="13"
                                            value={grade}
                                            onChange={handleGradeChange}
                                            className="w-full h-2 bg-gradient-to-r from-[#86efac] via-[#8B7FFF] to-[#B39DDB] rounded-lg appearance-none cursor-pointer"
                                            style={{
                                                backgroundSize: `${((grade - 1) / 12) * 100}% 100%`
                                            }}
                                        />
                                        <div className="flex justify-between px-1 mt-4">
                                            <div 
                                                className={`flex flex-col items-center transition-all duration-300 ${
                                                    grade <= 6 ? 'transform scale-110 text-white' : 'text-[#B39DDB]/50'
                                                }`}
                                            >
                                                <span className="text-sm font-medium">Primary</span>
                                                <span className="text-xs">(1-6)</span>
                                            </div>
                                            <div 
                                                className={`flex flex-col items-center transition-all duration-300 ${
                                                    grade > 6 && grade <= 12 ? 'transform scale-110 text-white' : 'text-[#B39DDB]/50'
                                                }`}
                                            >
                                                <span className="text-sm font-medium">Secondary</span>
                                                <span className="text-xs">(7-12)</span>
                                            </div>
                                            <div 
                                                className={`flex flex-col items-center transition-all duration-300 ${
                                                    grade === 13 ? 'transform scale-110 text-white' : 'text-[#B39DDB]/50'
                                                }`}
                                            >
                                                <span className="text-sm font-medium">University</span>
                                                <span className="text-xs">(13)</span>
                                            </div>
                                        </div>
                                        <div className="absolute -top-8 left-0 w-full">
                                            <div 
                                                className="text-white bg-[#8B7FFF] px-2 py-1 rounded text-sm"
                                                style={{ 
                                                    position: 'absolute',
                                                    left: `calc(${((grade - 1) / 12) * 100}% - 1.5rem)`,
                                                    transform: 'translateX(-50%)',
                                                }}
                                            >
                                                {grade === 13 ? 'Uni' : `G${grade}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Difficulty Slider */}
                                <div>
                                    <label className="block text-[#B39DDB]/70 mb-2 font-['Inter']">Difficulty</label>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            value={difficulties.indexOf(difficulty)}
                                            onChange={handleDifficultyChange}
                                            className="w-full h-2 bg-gradient-to-r from-[#86efac] via-[#8B7FFF] to-[#B39DDB] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                        />
                                        <div className="flex justify-between px-1 mt-4">
                                            {difficulties.map((level) => (
                                                <div 
                                                    key={level}
                                                    className={`flex flex-col items-center transition-all duration-300 ${
                                                        difficulty === level 
                                                            ? 'transform scale-110 text-white' 
                                                            : 'text-[#B39DDB]/50 hover:text-[#B39DDB]/70'
                                                    }`}
                                                    onClick={() => setDifficulty(level)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className={`text-xl mb-1 transition-transform duration-300 ${
                                                        difficulty === level ? 'transform scale-110' : ''
                                                    }`}>
                                                        {level === 'easy' && <BsLightbulb className="w-5 h-5" />}
                                                        {level === 'normal' && <BsBarChartLine className="w-5 h-5" />}
                                                        {level === 'difficult' && <BsStars className="w-5 h-5" />}
                                                    </div>
                                                    <span className={`text-sm font-medium capitalize ${
                                                        difficulty === level 
                                                            ? 'text-white' 
                                                            : 'text-[#B39DDB]/50'
                                                    }`}>
                                                        {level}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
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
                                
                                {/* Main Content Area - Chat Messages and Feedback */}
                                <div className="flex-1 overflow-hidden">
                                    {/* Show either Chat Messages or Feedback */}
                                    {!feedback ? (
                                        <div 
                                            ref={chatContainerRef}
                                            className="h-full overflow-y-auto mb-4 space-y-4 pr-2"
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
                                    ) : (
                                        <div className="bg-[#8B7FFF]/10 rounded-xl border border-[#8B7FFF]/20 h-full flex flex-col">
                                            <div className="p-6 border-b border-[#8B7FFF]/20">
                                                <h3 className="text-2xl font-bold text-white">Feedback</h3>
                                            </div>
                                            <div className="p-6 flex-1 overflow-y-auto">
                                                <p className="text-[#B39DDB]/90 whitespace-pre-wrap text-lg">{feedback}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Chat Input */}
                                <div className="flex items-center space-x-2 mt-4">
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
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
} 