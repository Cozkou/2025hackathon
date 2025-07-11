import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaRegFileAlt } from 'react-icons/fa';
import { BsCardText } from 'react-icons/bs';
import { BsCalendar3 } from 'react-icons/bs';
import { BsLightbulb } from 'react-icons/bs';

const Header = () => {
    const pathname = usePathname();

    const isActivePath = (path: string) => {
        return pathname === path;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#151B2B] border-b border-[#8B7FFF]/20">
            
            <div className="backdrop-blur-sm">
                <div className="container mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/logo.png"
                                alt="StudyToolsAI Logo"
                                width={200}
                                height={60}
                                className="h-auto"
                                priority
                            />
                        </Link>
                        <nav className="flex items-center space-x-8">
                            <Link 
                                href="/pastpapers" 
                                className="flex flex-col items-center group"
                            >
                                <span className={`flex items-center space-x-2 text-lg font-medium transition-colors duration-300 ${
                                    isActivePath('/pastpapers') 
                                        ? 'text-white' 
                                        : 'text-[#B39DDB] group-hover:text-white'
                                }`}>
                                    <FaRegFileAlt className="w-4 h-4" />
                                    <span>Past Papers</span>
                                </span>
                                <span className={`h-[2px] ${
                                    isActivePath('/pastpapers')
                                        ? 'w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF]'
                                        : 'w-0 group-hover:w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF]'
                                } transition-all duration-300`}></span>
                            </Link>
                            <Link 
                                href="/flashcards" 
                                className="flex flex-col items-center group"
                            >
                                <span className={`flex items-center space-x-2 text-lg font-medium transition-colors duration-300 ${
                                    isActivePath('/flashcards') 
                                        ? 'text-white' 
                                        : 'text-[#B39DDB] group-hover:text-white'
                                }`}>
                                    <BsCardText className="w-4 h-4" />
                                    <span>Flashcards</span>
                                </span>
                                <span className={`h-[2px] ${
                                    isActivePath('/flashcards')
                                        ? 'w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF]'
                                        : 'w-0 group-hover:w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF]'
                                } transition-all duration-300`}></span>
                            </Link>
                            <Link 
                                href="/calendar" 
                                className="flex flex-col items-center group"
                            >
                                <span className={`flex items-center space-x-2 text-lg font-medium transition-colors duration-300 ${
                                    isActivePath('/calendar') 
                                        ? 'text-white' 
                                        : 'text-[#B39DDB] group-hover:text-white'
                                }`}>
                                    <BsCalendar3 className="w-4 h-4" />
                                    <span>Calendar</span>
                                </span>
                                <span className={`h-[2px] ${
                                    isActivePath('/calendar')
                                        ? 'w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF]'
                                        : 'w-0 group-hover:w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF]'
                                } transition-all duration-300`}></span>
                            </Link>
                            <Link 
                                href="/teachback" 
                                className="flex flex-col items-center group"
                            >
                                <span className={`flex items-center space-x-2 text-lg font-medium transition-colors duration-300 ${
                                    isActivePath('/teachback') 
                                        ? 'text-white' 
                                        : 'text-[#B39DDB] group-hover:text-white'
                                }`}>
                                    <BsLightbulb className="w-4 h-4" />
                                    <span>TeachBack</span>
                                </span>
                                <span className={`h-[2px] ${
                                    isActivePath('/teachback')
                                        ? 'w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF]'
                                        : 'w-0 group-hover:w-[80%] bg-gradient-to-r from-[#86efac] to-[#8B7FFF]'
                                } transition-all duration-300`}></span>
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 