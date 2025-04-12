'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PastPapers() {
    const [isDragging, setIsDragging] = useState(false);

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
        // Handle file drop here
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
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            mt-12 p-12 rounded-2xl border-2 border-dashed transition-all duration-300
                            flex flex-col items-center justify-center
                            ${isDragging 
                                ? 'border-[#86efac] bg-[#86efac]/5' 
                                : 'border-[#8B7FFF]/40 bg-black/20'
                            }
                        `}
                    >
                        <div className="w-24 h-24 mb-6 border-2 border-dashed border-[#8B7FFF]/40 rounded-lg flex items-center justify-center">
                            <svg 
                                className="w-12 h-12 text-[#8B7FFF]/40" 
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
                        </div>
                        <p className="text-xl text-[#B39DDB]/70 text-center mb-2">
                            Drop Files Here
                        </p>
                        <p className="text-sm text-[#B39DDB]/50 text-center">
                            or click to browse
                        </p>
                    </div>

                    {/* Generate Button */}
                    <button className="w-full mt-8 bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                        Generate New Papers
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
} 