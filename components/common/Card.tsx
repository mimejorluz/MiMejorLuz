import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
    onClick?: () => void;
    variant?: 'default' | 'highlighted' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    interactive = false,
    onClick,
    variant = 'default',
}) => {
    const baseClasses = 'bg-white rounded-2xl border transition-all duration-200';

    const variantClasses = {
        default: 'border-black/5 shadow-sm hover:shadow-md',
        highlighted: 'border-[#FFD28A] bg-[#FFF3D1]/50 shadow-sm hover:shadow-md',
        subtle: 'border-gray-100 shadow-xs',
    };

    const interactiveClasses = interactive
        ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
        : '';

    return (
        <motion.div
            className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
            onClick={onClick}
            whileHover={interactive ? { scale: 1.01 } : {}}
            whileTap={interactive ? { scale: 0.99 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {children}
        </motion.div>
    );
};
