'use client';

import Header from '@/components/Header';
import { useState } from 'react';

export default function PastPapers() {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    return (

        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529]">

            <Header />
            
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-[#8B7FFF]/20 p-8">
                    <h1 className="text-4xl font-bold text-white mb-8 font-['Poppins']">
                        Past Paper Generator
                    </h1>

                    {/* Subject Selection */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4 font-['Poppins']">Select Subject</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Mathematics', 'Physics', 'Chemistry'].map((subject) => (
                                <button
                                    key={subject}
                                    className={`p-4 rounded-xl border transition-all duration-300 ${
                                        selectedSubject === subject
                                            ? 'border-[#86efac] bg-[#86efac]/10 text-white'
                                            : 'border-[#8B7FFF]/20 bg-white/5 text-[#B39DDB]/70 hover:border-[#8B7FFF]/40'
                                    }`}
                                    onClick={() => setSelectedSubject(subject)}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button className="w-full bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity mb-8">
                        Generate Past Paper
                    </button>

                    {/* Previous Papers */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4 font-['Poppins']">Previous Papers</h2>
                        <div className="space-y-4">
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-[#8B7FFF]/20 p-6 hover:border-[#8B7FFF]/40 transition-all duration-300">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">Mathematics Paper 1</h3>
                                        <p className="text-[#B39DDB]/70 text-sm">Generated on: Not yet generated</p>
                                    </div>
                                    <button className="text-[#86efac] hover:text-[#86efac]/80 transition-colors">
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 