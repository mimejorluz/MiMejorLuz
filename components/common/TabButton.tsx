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
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={"flex flex-col items-center justify-center py-2 text-xs transition-colors w-full " + (active ? "text-[#1D1D1F]" : "text-gray-500 hover:text-[#2A2A2D]")}
        >
            <motion.div 
                className={"mb-0.5 grid place-items-center"}
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
                {icon}
            </motion.div>
            {label}
        </motion.button>
    );
};
