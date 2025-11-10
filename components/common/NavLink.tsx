import React from 'react';
import { motion } from 'framer-motion';

interface NavLinkProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ label, isActive, onClick }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        className={`relative px-4 py-2 text-sm font-medium transition-all rounded-lg ${
            isActive
                ? 'text-[#1D1D1F] bg-white/60 shadow-sm'
                : 'text-[#5E5E63] hover:text-[#1D1D1F] hover:bg-gray-100/50'
        }`}
    >
        {label}
        {isActive && (
            <motion.div
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFC700] rounded-full"
                layoutId="nav-indicator"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
        )}
    </motion.button>
);
