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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-10 text-center flex flex-col items-center border border-gray-100 shadow-sm"
        >
            <motion.div
                className="text-gray-300 mb-4 p-4 rounded-full bg-gray-100/50"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                {icon || <IconChart className="w-8 h-8" />}
            </motion.div>
            <h4 className="font-bold text-lg text-[#1D1D1F]">{title}</h4>
            <p className="text-sm text-[#5E5E63] mt-2 max-w-sm leading-relaxed">{message}</p>
            {ctaText && onCtaClick && (
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCtaClick}
                    className="mt-6 text-sm font-semibold text-white bg-[#1D1D1F] px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                    {ctaText}
                </motion.button>
            )}
        </motion.div>
    );
};