'use client';

import { useState } from 'react';
import Header from '@/components/Header';
export default function Flashcards() {
    const [currentDeck, setCurrentDeck] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529]">

            <Header />

        </div>
    );
}
