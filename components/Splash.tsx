import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashProps {
    onStart: () => void;
}

const Splash: React.FC<SplashProps> = ({ onStart }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2800);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F7F7F7] via-[#FCFCFD] to-[#F5F5F7] relative p-4 overflow-hidden">
            <div className="absolute inset-0 opacity-30">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    className="absolute top-10 left-10 w-72 h-72 bg-yellow-100/20 rounded-full blur-3xl"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.4, delay: 0.2 }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"
                />
            </div>

            <div className="flex flex-col items-center text-center w-full max-w-xs relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex flex-col items-center justify-center">
                        <motion.img
                            src="https://storage.googleapis.com/mejorluz-assets-public-2025/logo.png"
                            alt="MiMejorLuz"
                            className="w-36 h-auto"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
                        <motion.div
                            className="text-center mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <h1 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight">
                                MiMejorLuz
                            </h1>
                            <p className="text-sm text-[#5E5E63] mt-1 font-medium">
                                Asesor energético con IA
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="mt-12 flex flex-col items-center w-full min-h-[80px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center w-full"
                            >
                                <div className="loader-track">
                                    <div className="loader-progress"></div>
                                </div>
                                <motion.p
                                    className="text-xs text-[#5E5E63] mt-4 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Analizando el mercado...
                                </motion.p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="button"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <motion.button
                                    onClick={onStart}
                                    className="px-8 py-3 bg-[#1D1D1F] text-white font-semibold text-sm rounded-full shadow-lg shadow-black/15 border border-black/10 hover:shadow-xl"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98, y: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    Comenzar análisis
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
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
        </div>
    );
};

export default Splash;