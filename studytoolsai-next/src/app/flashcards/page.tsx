'use client';

import { useState } from 'react';
import Header from '@/components/Header';
export default function Flashcards() {
    const [currentDeck, setCurrentDeck] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529]">

            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-[#8B7FFF]/20 p-8">
                    <h1 className="text-4xl font-bold text-white mb-8 font-['Poppins']">
                        Flashcards
                    </h1>

                    {/* Create New Deck Button */}
                    <button className="mb-8 bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                        Create New Deck
                    </button>

                    {/* Decks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Example Deck Card */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-[#8B7FFF]/20 p-6 hover:border-[#8B7FFF]/40 transition-all duration-300">
                            <h3 className="text-xl font-bold text-white mb-2 font-['Poppins']">Example Deck</h3>
                            <p className="text-[#B39DDB]/70 text-sm mb-4">
                                0 cards • Last studied: Never
                            </p>
                            <div className="flex space-x-2">
                                <button className="text-sm text-[#86efac] hover:text-[#86efac]/80 transition-colors">
                                    Study
                                </button>
                                <button className="text-sm text-[#B39DDB]/70 hover:text-[#B39DDB] transition-colors">
                                    Edit
                                </button>
                            </div>
                        </div>

                        {/* Placeholder Card */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-[#8B7FFF]/20 p-6 flex items-center justify-center">
                            <p className="text-[#B39DDB]/70 text-center">
                                Create your first flashcard deck
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
