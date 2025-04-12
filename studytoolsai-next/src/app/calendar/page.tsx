'use client';

import { useState } from 'react';
import Header from '@/components/Header';
export default function Calendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529]">

            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-[#8B7FFF]/20 p-8">
                    <h1 className="text-4xl font-bold text-white mb-8 font-['Poppins']">
                        Calendar
                    </h1>
                    
                    {/* Calendar Grid Container */}
                    <div className="grid grid-cols-7 gap-4">
                        {/* Calendar header - days of week */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center text-[#B39DDB]/70 font-semibold py-2">
                                {day}
                            </div>
                        ))}
                        
                        {/* Calendar grid placeholder */}
                        <div className="col-span-7">
                            <p className="text-[#B39DDB]/70 text-center py-8">
                                Calendar implementation coming soon...
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
