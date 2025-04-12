'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#141529] flex flex-col">
            <Header />
            
            {/* Main Content */}
            <div className="container mx-auto px-4 pt-36 flex-1">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto mt-10">
                    <div className="flex items-center justify-between w-full gap-2 mb-20">
                        <div className="flex-1 max-w-2xl pr-4">
                            <h1 className="text-7xl font-bold text-left bg-gradient-to-r from-[#86efac] via-[#8B7FFF] to-[#B39DDB] text-transparent bg-clip-text font-['Poppins'] drop-shadow-lg animate-gradient pb-2 leading-[1.2]">
                                StudyToolsAI
                            </h1>
                            <p className="text-xl text-left text-[#B39DDB]/70 font-['Inter'] leading-relaxed tracking-wide mt-6 max-w-xl">
                                Revise faster, smarter. Powered by AI.
                            </p>
                        </div>
                        
                        {/* Sign in Button */}
                        <div className="w-[360px] transform hover:scale-[1.02] transition-all duration-300">
                            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40 transition-all duration-400">
                                <button
                                    type="button"
                                    className="w-full bg-gradient-to-r from-white to-gray-50 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-400 flex items-center justify-center space-x-3 text-gray-700"
                                >
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                                    </svg>
                                    <span className="text-lg">Sign in with Google</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="" id="features">
                        <h2 className="text-4xl font-bold text-center mb-16 text-white font-['Playfair_Display'] bg-gradient-to-r from-[#86efac] via-[#8B7FFF] to-[#B39DDB] text-transparent bg-clip-text relative">
                            Your All-in-One Student Hub
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#86efac] to-[#8B7FFF] rounded-full"></div>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Feature 1 */}
                            <div className="group bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40 transition-all duration-300 hover:transform hover:scale-[1.02]">
                                <h3 className="text-2xl font-bold text-white mb-3 font-['Poppins']">Past Paper Generator</h3>
                                <p className="text-[#B39DDB]/70 leading-relaxed">
                                    Create mock exams in seconds using AI to match your course content and exam board.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40 transition-all duration-300 hover:transform hover:scale-[1.02]">
                                <h3 className="text-2xl font-bold text-white mb-3 font-['Poppins']">Flashcard Generator</h3>
                                <p className="text-[#B39DDB]/70 leading-relaxed">
                                    Turn notes into smart flashcards with auto-generated questions and explanations.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-[#8B7FFF]/20 hover:border-[#8B7FFF]/40 transition-all duration-300 hover:transform hover:scale-[1.02]">
                                <h3 className="text-2xl font-bold text-white mb-3 font-['Poppins']">Calendar Integration</h3>
                                <p className="text-[#B39DDB]/70 leading-relaxed">
                                    Sync your study schedule with your calendar to stay on top of your work.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}