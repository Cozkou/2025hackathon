'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PastPapers() {
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        if (!file.type.includes('pdf')) {
            setErrorMessage('Only PDF files are accepted');
            return false;
        }
        setErrorMessage('');
        return true;
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleGenerate = () => {
        if (!selectedFile) {
            setErrorMessage('Please upload a PDF file first');
            return;
        }
        // Handle file generation here
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529] flex flex-col">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 pt-32">
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="mb-8">
                        <h1 className="text-6xl font-bold text-white mb-6 font-['Poppins']">
                            Past Paper Generator
                        </h1>
                        <p className="text-xl text-[#B39DDB]/70 leading-relaxed">
                            Running out of past papers to revise with? Pass in your old papers below and generate 
                            all new exam papers to maximise your practice!
                        </p>
                    </div>

                    {/* File Drop Zone */}
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            mt-12 p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                            flex flex-col items-center justify-center
                            ${isDragging 
                                ? 'border-[#86efac] bg-[#86efac]/5' 
                                : 'border-[#8B7FFF]/40 bg-black/20'
                            }
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
                        <div className={`w-24 h-24 mb-6 border-2 border-dashed rounded-lg flex items-center justify-center
                            ${errorMessage ? 'border-red-500' : 'border-[#8B7FFF]/40'}`}>
                            {selectedFile ? (
                                <svg 
                                    className="w-12 h-12 text-[#86efac]" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M5 13l4 4L19 7" 
                                    />
                                </svg>
                            ) : (
                                <svg 
                                    className={`w-12 h-12 ${errorMessage ? 'text-red-500' : 'text-[#8B7FFF]/40'}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 4v16m8-8H4" 
                                    />
                                </svg>
                            )}
                        </div>
                        {errorMessage ? (
                            <p className="text-xl text-red-500 text-center mb-2">
                                {errorMessage}
                            </p>
                        ) : selectedFile ? (
                            <p className="text-xl text-[#86efac] text-center mb-2">
                                {selectedFile.name}
                            </p>
                        ) : (
                            <>
                                <p className="text-xl text-[#B39DDB]/70 text-center mb-2">
                                    Drop PDF File Here
                                </p>
                                <p className="text-sm text-[#B39DDB]/50 text-center">
                                    or click to browse
                                </p>
                            </>
                        )}
                    </div>

                    {/* Generate Button */}
                    <button 
                        onClick={handleGenerate}
                        className={`
                            w-full mt-8 py-4 rounded-xl font-semibold transition-all duration-300
                            ${selectedFile 
                                ? 'bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white hover:opacity-90'
                                : 'bg-[#8B7FFF]/20 text-[#B39DDB]/50 cursor-not-allowed'
                            }
                        `}
                    >
                        Generate New Papers
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
} 