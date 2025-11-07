import React from 'react';
import { motion } from 'framer-motion';
import { IconChart } from './Icons';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    message: string;
    ctaText?: string;
    onCtaClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, ctaText, onCtaClick }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-8 text-center flex flex-col items-center"
        >
            <div className="text-gray-400 mb-3">{icon || <IconChart />}</div>
            <h4 className="font-semibold text-[#2A2A2D]">{title}</h4>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">{message}</p>
            {ctaText && onCtaClick && (
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onCtaClick}
                    className="mt-4 text-sm font-semibold text-white bg-[#1D1D1F] px-4 py-2 rounded-lg"
                >
                    {ctaText}
                </motion.button>
            )}
        </motion.div>
    );
};