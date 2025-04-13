'use client';

import { useState, ChangeEvent } from 'react';

export default function TeachBack() {
    const [topic, setTopic] = useState<string>('');
    const [grade, setGrade] = useState<number>(1);
    const [difficulty, setDifficulty] = useState<string>('normal');

    const grades = Array.from({ length: 13 }, (_, i) => i + 1);
    const difficulties = ['easy', 'normal', 'difficult'] as const;

    const handleTopicChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
    };

    const handleGradeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setGrade(Number(e.target.value));
    };

    const handleDifficultyChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDifficulty(difficulties[Number(e.target.value)]);
    };

    return (
        <div className="group bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40 transition-all duration-300 hover:transform hover:scale-[1.02]">
            <h3 className="text-2xl font-bold text-white mb-6 font-['Poppins']">TeachBack</h3>
            
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
                    <div className="flex items-center space-x-4">
                        <input
                            type="range"
                            min="1"
                            max="13"
                            value={grade}
                            onChange={handleGradeChange}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8B7FFF]"
                        />
                        <span className="text-white min-w-[3rem]">{grade === 13 ? 'University' : `Grade ${grade}`}</span>
                    </div>
                </div>

                {/* Difficulty Slider */}
                <div>
                    <label className="block text-[#B39DDB]/70 mb-2 font-['Inter']">Difficulty</label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="range"
                            min="0"
                            max="2"
                            value={difficulties.indexOf(difficulty)}
                            onChange={handleDifficultyChange}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8B7FFF]"
                        />
                        <span className="text-white capitalize min-w-[5rem]">{difficulty}</span>
                    </div>
                </div>

                {/* Start Revision Button */}
                <button
                    disabled={!topic}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-400 flex items-center justify-center space-x-3
                        ${topic 
                            ? 'bg-gradient-to-r from-[#86efac] to-[#8B7FFF] text-white hover:shadow-lg hover:scale-[1.02]' 
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                >
                    Start Revision
                </button>
            </div>
        </div>
    );
} 