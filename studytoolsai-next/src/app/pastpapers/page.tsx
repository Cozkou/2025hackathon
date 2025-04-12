'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function PastPapers() {
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const [difficulty, setDifficulty] = useState(2); // 1: Easier, 2: Same, 3: Harder
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getDifficultyLabel = (value: number) => {
        switch(value) {
            case 1: return 'Easier';
            case 2: return 'Default';
            case 3: return 'Harder';
            default: return 'Default';
        }
    };

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
        setIsGenerating(true);
        // Simulate generation process
        setTimeout(() => {
            setIsGenerating(false);
            setIsGenerated(true);
        }, 5000);
    };

    const handleDelete = () => {
        setSelectedFile(null);
        setIsGenerated(false);
        setErrorMessage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529] flex flex-col overflow-hidden">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 pt-24">
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="mb-5 mt-10">
                        <h1 className="text-4xl font-bold text-white mb-3 font-['Poppins']">
                            Past Paper Generator
                        </h1>
                        <p className="text-base text-[#B39DDB]/70 leading-relaxed">
                            Running out of past papers to revise with? Pass in your old papers below and generate 
                            all new exam papers to maximise your practice!
                        </p>
                    </div>

                    {/* File Drop Zone or Download Area */}
                    {isGenerating ? (
                        <div className="mt-6 p-6 rounded-2xl bg-black/20 flex flex-col items-center justify-center">
                            <div className="w-14 h-14 border-4 border-[#8B7FFF] border-t-[#86efac] rounded-full animate-spin mb-4"></div>
                            <p className="text-lg text-[#B39DDB]/70 text-center">
                                Generating your paper...
                            </p>
                        </div>
                    ) : isGenerated ? (
                        <div className="mt-6 p-5 rounded-2xl bg-black/20 border border-[#8B7FFF]/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <svg 
                                        className="w-8 h-8 text-[#86efac]" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                        />
                                    </svg>
                                    <span className="text-xl text-white">Generated_Paper.pdf</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button 
                                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Download
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={handleClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                mt-6 p-6 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
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
                            <div className={`w-20 h-20 mb-4 border-2 border-dashed rounded-lg flex items-center justify-center
                                ${errorMessage ? 'border-red-500' : 'border-[#8B7FFF]/40'}`}>
                                {selectedFile ? (
                                    <svg 
                                        className="w-10 h-10 text-[#86efac]" 
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
                                        className={`w-10 h-10 ${errorMessage ? 'text-red-500' : 'text-[#8B7FFF]/40'}`}
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
                                <p className="text-lg text-red-500 text-center mb-2">
                                    {errorMessage}
                                </p>
                            ) : selectedFile ? (
                                <p className="text-lg text-[#86efac] text-center mb-2">
                                    {selectedFile.name}
                                </p>
                            ) : (
                                <>
                                    <p className="text-lg text-[#B39DDB]/70 text-center mb-2">
                                        Drop PDF File Here
                                    </p>
                                    <p className="text-sm text-[#B39DDB]/50 text-center">
                                        or click to browse
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Difficulty Selection */}
                    {!isGenerated && !isGenerating && (
                        <div className="mt-5 p-5 rounded-2xl bg-black/20 border border-[#8B7FFF]/20">
                            <div className="flex items-center justify-center mb-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-xl font-bold text-white bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-transparent bg-clip-text font-['Poppins'] tracking-wide">Difficulty Level</label>
                                    {difficulty === 1 && (
                                        <Image
                                            src="/easiericon.png"
                                            alt="Easy Difficulty"
                                            width={28}
                                            height={28}
                                            className="object-contain"
                                        />
                                    )}
                                    {difficulty === 2 && (
                                        <Image
                                            src="/defaulticon.png"
                                            alt="Default Difficulty"
                                            width={28}
                                            height={28}
                                            className="object-contain"
                                        />
                                    )}
                                    {difficulty === 3 && (
                                        <Image
                                            src="/hardicon.png"
                                            alt="Hard Difficulty"
                                            width={28}
                                            height={28}
                                            className="object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => setDifficulty(value)}
                                        className={`
                                            py-3 px-4 rounded-xl font-medium transition-all duration-200
                                            ${value === 1 && difficulty === value
                                                ? 'bg-[#86efac]/20 text-[#86efac] border-2 border-[#86efac]'
                                                : value === 2 && difficulty === value
                                                ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-400'
                                                : value === 3 && difficulty === value
                                                ? 'bg-red-500/20 text-red-500 border-2 border-red-500'
                                                : 'bg-black/20 text-[#B39DDB]/70 border-2 border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40'
                                            }
                                        `}
                                    >
                                        {getDifficultyLabel(value)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Generate Button */}
                    {!isGenerated && (
                        <button 
                            onClick={handleGenerate}
                            className={`
                                w-full mt-5 py-2.5 rounded-xl font-semibold transition-all duration-300
                                ${selectedFile 
                                    ? 'bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white hover:opacity-90'
                                    : 'bg-[#8B7FFF]/20 text-[#B39DDB]/50 cursor-not-allowed'
                                }
                            `}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'Generate New Papers'}
                        </button>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
} 