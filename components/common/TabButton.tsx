import React from 'react';
import { motion } from 'framer-motion';

interface TabButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, active, onClick, icon }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            onClick={onClick}
            className={`flex flex-col items-center justify-center py-3 px-2 text-xs transition-all w-full relative ${
                active
                    ? 'text-[#1D1D1F] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
        >
            <motion.div
                className="mb-1 grid place-items-center"
                animate={{ scale: active ? 1.2 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
                {icon}
            </motion.div>
            <span className="font-medium">{label}</span>

            {active && (
                <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FFC700] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
            )}
        </motion.button>
    );
};
