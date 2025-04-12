'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Flashcard = {
    id: string;
    question: string;
    answer: string;
};

type CardState = {
    isFlipped: boolean;
};

export default function Flashcards() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [topicName, setTopicName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(true);
    const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.includes('pdf')) {
            setSelectedFile(file);
            setErrorMessage('');
        } else {
            setSelectedFile(null);
            setErrorMessage('Please upload a valid PDF slide file');
        }
    };

    const handleCardFlip = (cardId: string) => {
        setCardStates(prev => ({
            ...prev,
            [cardId]: {
                isFlipped: !prev[cardId]?.isFlipped
            }
        }));
    };

    const handleGenerate = () => {
        if (!topicName || !selectedFile) {
            setErrorMessage('Please enter a topic and upload a slide file');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        // Simulate API call delay
        setTimeout(() => {
            // Mock response data
            const mockFlashcards: Flashcard[] = [
                {
                    id: '1',
                    question: 'What is the capital of France?',
                    answer: 'Paris'
                },
                {
                    id: '2',
                    question: 'What is the largest planet in our solar system?',
                    answer: 'Jupiter'
                },
                {
                    id: '3',
                    question: 'What is the chemical symbol for gold?',
                    answer: 'Au'
                }
            ];

            setFlashcards(mockFlashcards);
            // Initialize card states
            const initialCardStates = mockFlashcards.reduce((acc, card) => {
                acc[card.id] = { isFlipped: false };
                return acc;
            }, {} as Record<string, CardState>);
            setCardStates(initialCardStates);
            setIsLoading(false);
            setShowForm(false);
        }, 1500);
    };

    const handleBack = () => {
        setShowForm(true);
        setFlashcards([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529] flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 pt-32">
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="mb-8">
                        <h1 className="text-6xl font-bold text-white mb-6 font-['Poppins']">
                            Flashcard Generator
                        </h1>
                        <p className="text-xl text-[#B39DDB]/70 leading-relaxed">
                            {showForm 
                                ? "Upload your lecture slides and we'll turn them into quick revision flashcards."
                                : "Here are your generated flashcards. Click on a card to flip it."}
                        </p>
                    </div>

                    {/* Loading Animation */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <div className="relative w-16 h-16">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#8B7FFF] rounded-full animate-spin border-t-transparent"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#86efac] rounded-full animate-spin border-t-transparent" style={{ animationDelay: '-0.5s' }}></div>
                            </div>
                            <p className="mt-4 text-xl text-[#B39DDB]/70">Generating your flashcards...</p>
                        </div>
                    )}

                    {/* Input Form */}
                    {showForm && !isLoading && (
                        <div className="transition-opacity duration-300">
                            <input
                                type="text"
                                placeholder="Enter Topic Name"
                                value={topicName}
                                onChange={(e) => setTopicName(e.target.value)}
                                className="w-full px-6 py-4 mb-6 rounded-xl bg-black/20 border border-[#8B7FFF]/40 text-white placeholder-[#B39DDB]/40 focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]"
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-12 rounded-2xl border-2 border-dashed cursor-pointer text-center
                                    ${selectedFile ? 'border-[#86efac]' : 'border-[#8B7FFF]/40 bg-black/20'}
                                    ${errorMessage ? 'border-red-500' : ''}
                                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {selectedFile ? (
                                    <p className="text-xl text-[#86efac]">{selectedFile.name}</p>
                                ) : (
                                    <p className="text-xl text-[#B39DDB]/70">Click to upload your slide deck (PDF)</p>
                                )}
                            </div>

                            {errorMessage && (
                                <p className="text-red-500 mt-4 text-center">{errorMessage}</p>
                            )}

                            <button
                                onClick={handleGenerate}
                                className={`w-full mt-8 py-4 rounded-xl font-semibold transition-all duration-300
                                    ${selectedFile && topicName
                                        ? 'bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white hover:opacity-90'
                                        : 'bg-[#8B7FFF]/20 text-[#B39DDB]/50 cursor-not-allowed'
                                    }
                                `}
                            >
                                Generate Flashcards
                            </button>
                        </div>
                    )}

                    {/* Flashcards Display */}
                    {!showForm && !isLoading && (
                        <div className="transition-opacity duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-white">Your Flashcards</h2>
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 rounded-lg bg-[#8B7FFF]/20 text-[#B39DDB] hover:bg-[#8B7FFF]/30 transition-colors"
                                >
                                    Generate New
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {flashcards.map((card) => (
                                    <div 
                                        key={card.id} 
                                        onClick={() => handleCardFlip(card.id)}
                                        className="relative h-[200px] cursor-pointer perspective-1000"
                                    >
                                        <div 
                                            className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                                                cardStates[card.id]?.isFlipped ? 'rotate-y-180' : ''
                                            }`}
                                        >
                                            {/* Front of card (Question) */}
                                            <div className="absolute inset-0 w-full h-full backface-hidden">
                                                <div className="w-full h-full bg-black/20 p-6 rounded-xl border border-[#8B7FFF]/40 hover:border-[#86efac] transition-colors">
                                                    <h3 className="text-xl font-semibold text-white mb-2">Question</h3>
                                                    <p className="text-[#B39DDB]/70">{card.question}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Back of card (Answer) */}
                                            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                                                <div className="w-full h-full bg-black/20 p-6 rounded-xl border border-[#8B7FFF]/40 hover:border-[#86efac] transition-colors">
                                                    <h3 className="text-xl font-semibold text-white mb-2">Answer</h3>
                                                    <p className="text-[#B39DDB]/70">{card.answer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
