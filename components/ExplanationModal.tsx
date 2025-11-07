import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconX } from './common/Icons';

interface ExplanationModalProps {
    topic: string;
    onClose: () => void;
    fetchExplanation: (topic: string) => Promise<string>;
}

// Simple parser to convert **bold** markdown to <strong> html tags
const parseSimpleMarkdown = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    return text.replace(boldRegex, '<strong>$1</strong>');
};

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ topic, onClose, fetchExplanation }) => {
    const [explanation, setExplanation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const getExplanation = async () => {
            setIsLoading(true);
            try {
                const result = await fetchExplanation(topic);
                if (isMounted) setExplanation(result);
            } catch (error) {
                if (isMounted) setExplanation('No se pudo cargar la explicación.');
                console.error('Failed to fetch explanation:', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        getExplanation();
        return () => { isMounted = false; };
    }, [topic, fetchExplanation]);

    const formattedExplanation = useMemo(() => parseSimpleMarkdown(explanation), [explanation]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start gap-3">
                    <h3 className="font-bold text-lg text-gray-800 tracking-tight">{topic}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-4 text-sm text-gray-600 min-h-[80px]">
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </div>
                    ) : (
                        <p dangerouslySetInnerHTML={{ __html: formattedExplanation }} />
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};