import React from 'react';
import { motion } from 'framer-motion';

interface NavLinkProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`relative px-3 py-2 text-sm font-medium transition-colors focus:outline-none ${
            isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
        }`}
    >
        {label}
        {isActive && (
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-main)]"
                layoutId="header-underline"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
        )}
    </button>
);
