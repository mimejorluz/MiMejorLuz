import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
    width?: string;
    height?: string;
    className?: string;
    count?: number;
    circle?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    width = 'w-full',
    height = 'h-4',
    className = '',
    count = 1,
    circle = false,
}) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`${width} ${height} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 ${
                        circle ? 'rounded-full' : 'rounded-lg'
                    } animate-shimmer bg-[length:200%_100%]`}
                />
            ))}
        </div>
    );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-100 space-y-4"
                >
                    <div className="space-y-2">
                        <SkeletonLoader width="w-2/3" height="h-5" />
                        <SkeletonLoader width="w-full" height="h-4" count={2} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                        <SkeletonLoader width="w-full" height="h-12" />
                        <SkeletonLoader width="w-full" height="h-12" />
                        <SkeletonLoader width="w-full" height="h-12" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export const ChartSkeleton: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 bg-white rounded-xl p-6 border border-gray-100"
        >
            <SkeletonLoader width="w-1/3" height="h-5" />
            <SkeletonLoader width="w-full" height="h-48" className="rounded-lg" />
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                <SkeletonLoader width="w-full" height="h-12" />
                <SkeletonLoader width="w-full" height="h-12" />
                <SkeletonLoader width="w-full" height="h-12" />
            </div>
        </motion.div>
    );
};
