'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Flashcards() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [topicName, setTopicName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
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

    const handleGenerate = () => {
        if (!topicName || !selectedFile) {
            setErrorMessage('Please enter a topic and upload a slide file');
            return;
        }

        // TEMP: simulate generation
        alert(`Generating flashcards for "${topicName}"...`);
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
                            Upload your lecture slides and we'll turn them into quick revision flashcards.
                        </p>
                    </div>

                    {/* Topic Input */}
                    <input
                        type="text"
                        placeholder="Enter Topic Name"
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
                        className="w-full px-6 py-4 mb-6 rounded-xl bg-black/20 border border-[#8B7FFF]/40 text-white placeholder-[#B39DDB]/40 focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]"
                    />

                    {/* File Upload */}
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

                    {/* Error Message */}
                    {errorMessage && (
                        <p className="text-red-500 mt-4 text-center">{errorMessage}</p>
                    )}

                    {/* Generate Button */}
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
            </main>

            <Footer />
        </div>
    );
}
