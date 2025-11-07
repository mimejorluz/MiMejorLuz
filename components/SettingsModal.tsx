import React from 'react';
import { motion } from 'framer-motion';
import { ProfileView } from './ProfileView';
import { IconX } from './common/Icons';

export const SettingsModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
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
                className="relative bg-[#F0F0F2] w-full max-w-md max-h-[90vh] rounded-2xl shadow-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-[#F0F0F2]/80 backdrop-blur-sm z-10 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 tracking-tight">Ajustes y Perfil</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    <ProfileView />
                </div>
            </motion.div>
        </motion.div>
    );
};