import React from 'react';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#151B2B] border-b border-[#8B7FFF]/20">
            
            <div className="backdrop-blur-sm">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold bg-gradient-to-r from-[#86efac] via-[#8B7FFF] to-[#B39DDB] text-transparent bg-clip-text font-['Poppins']">
                            StudyToolsAI
                        </div>
                        <nav className="flex items-center space-x-8">
                            <a href="#pastpapers" className="flex flex-col items-center group">
                                <span className="text-[#B39DDB] group-hover:text-white transition-colors duration-300 text-lg font-medium">Past Papers</span>
                                <span className="h-[2px] w-0 group-hover:w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF] transition-all duration-300"></span>
                            </a>
                            <a href="#flashcards" className="flex flex-col items-center group">
                                <span className="text-[#B39DDB] group-hover:text-white transition-colors duration-300 text-lg font-medium">Flashcards</span>
                                <span className="h-[2px] w-0 group-hover:w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF] transition-all duration-300"></span>
                            </a>
                            <a href="#calendar" className="flex flex-col items-center group">
                                <span className="text-[#B39DDB] group-hover:text-white transition-colors duration-300 text-lg font-medium">Calendar</span>
                                <span className="h-[2px] w-0 group-hover:w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF] transition-all duration-300"></span>
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 