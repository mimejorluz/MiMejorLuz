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
        }, 2800); // Artificial loading time

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#EDEEEF] via-[#F7F7F7] to-white relative p-4">
            
            <div className="flex flex-col items-center text-center w-full max-w-xs">
                {/* Logo y textos de marca */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src="https://storage.googleapis.com/mejorluz-assets-public-2025/logo.png"
                            alt="MiMejorLuz"
                            className="w-36 h-auto"
                        />
                        <div className="text-center mt-2">
                             <h1 className="text-[26px] font-semibold text-[#1D1D1F] tracking-tight">
                                MiMejorLuz
                            </h1>
                            <p className="text-sm text-[#6E6E73]">
                                Asesor energético con IA
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Loader o Botón de inicio */}
                <div className="mt-8 flex flex-col items-center w-full min-h-[60px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center"
                            >
                                <div className="loader-track">
                                    <div className="loader-progress"></div>
                                </div>
                                <p className="text-xs text-[#AEAEB2] mt-3">Analizando el mercado...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <motion.button
                                    onClick={onStart}
                                    className="w-[220px] h-[46px] bg-[#1D1D1F] text-white font-semibold text-sm rounded-full shadow-lg shadow-gray-400/20"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
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