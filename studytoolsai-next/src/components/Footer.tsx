import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="border-t border-[#8B7FFF]/10 mt-auto">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-center space-x-8">
                    <Link href="/terms" className="text-sm text-[#B39DDB]/50 hover:text-[#B39DDB] transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="/cookies" className="text-sm text-[#B39DDB]/50 hover:text-[#B39DDB] transition-colors">
                        Cookies Policy
                    </Link>
                    <Link href="/privacy" className="text-sm text-[#B39DDB]/50 hover:text-[#B39DDB] transition-colors">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 