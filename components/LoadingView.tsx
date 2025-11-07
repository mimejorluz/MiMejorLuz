import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingMessages = [
    { text: "Preparando tus datos...", duration: 5000 },
    { text: "Consultando a la IA...", duration: 10000 },
    { text: "Calculando recomendaciones...", duration: 15000 }
];

export const LoadingView: React.FC = () => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const scheduleNextMessage = (index: number) => {
            if (index >= loadingMessages.length) return; // Stop when out of messages
            
            const { duration } = loadingMessages[index];
            const timer = setTimeout(() => {
                setCurrentMessageIndex(prev => prev + 1);
            }, duration);

            return () => clearTimeout(timer);
        };
        
        scheduleNextMessage(currentMessageIndex);

    }, [currentMessageIndex]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-[#F4F5F7] to-white p-4"
            style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)',
            }}
        >
            <img 
                src="https://storage.googleapis.com/mejorluz-assets-public-2025/logo.png" 
                alt="Generando análisis..." 
                className="w-24 h-auto"
            />
            
            <h3 className="text-xl font-semibold text-[#0F172A] mt-6">Generando tu Panel de Ahorro…</h3>
            
            <div className="h-10 mt-1">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentMessageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="text-sm text-[#6E6E73] max-w-xs text-center"
                    >
                        {loadingMessages[currentMessageIndex]?.text || "Finalizando..."}
                    </motion.p>
                </AnimatePresence>
            </div>

            <div className="loader-track mt-8">
                <div className="loader-progress"></div>
            </div>

            <style>{`
                .loader-track {
                    width: 180px;
                    height: 8px;
                    background: linear-gradient(180deg, #F4F6F9 0%, #E9EDF3 100%);
                    border-radius: 9999px;
                    overflow: hidden;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05) inset, 0 1px 0 rgba(255,255,255,0.5);
                    border: 1px solid #D1D9E6;
                }

                .loader-progress {
                    width: 45%;
                    height: 100%;
                    background: linear-gradient(90deg, #EAEFF5 0%, #FFFFFF 50%, #EAEFF5 100%);
                    border-radius: inherit;
                    position: relative;
                    animation: mml-loading-progress 1.4s ease-in-out infinite;
                }
                
                .loader-progress::after {
                    content: "";
                    position: absolute;
                    inset: -4px -40px;
                    background: linear-gradient(120deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 40%);
                    transform: rotate(-12deg);
                    animation: mml-loading-shine 1.6s linear infinite;
                    opacity: 0.9;
                }

                @keyframes mml-loading-progress {
                    0% { transform: translateX(-70%); }
                    50% { transform: translateX(-10%); }
                    100% { transform: translateX(110%); }
                }

                @keyframes mml-loading-shine {
                    0% { transform: translateX(-40%) rotate(-12deg); }
                    100% { transform: translateX(120%) rotate(-12deg); }
                }
            `}</style>
        </motion.div>
    );
};