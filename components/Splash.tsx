
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
        }, 2800); // Simula una carga de 2.8 segundos

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

                {/* Contenedor para la barra de carga y el botón */}
                <div className="mt-8 h-24 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center w-full"
                            >
                                <div className="loader-track">
                                    <div className="loader-progress"></div>
                                </div>
                                <p className="text-[12px] text-[#A2A8AF] mt-3">
                                    Cargando tus datos de energía…
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex flex-col items-center w-full"
                            >
                                {/* La barra estática se elimina para que no aparezca junto al botón */}
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
                    width: 150px;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.35);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    border-radius: 9999px;
                    overflow: hidden;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.03);
                }

                .loader-progress {
                    width: 45%;
                    height: 100%;
                    background: linear-gradient(90deg, #D4D7DB 0%, #FFFFFF 45%, #D4D7DB 100%);
                    border-radius: inherit;
                    position: relative;
                    animation: mlz-progress 1.4s ease-in-out infinite;
                }

                .loader-progress::after {
                    content: "";
                    position: absolute;
                    inset: -4px -40px;
                    background: linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 40%);
                    transform: rotate(-12deg);
                    animation: mlz-shine 1.6s linear infinite;
                }

                @keyframes mlz-progress {
                    0% { transform: translateX(-70%); }
                    50% { transform: translateX(-10%); }
                    100% { transform: translateX(110%); }
                }

                @keyframes mlz-shine {
                    0% { transform: translateX(-40%) rotate(-12deg); }
                    100% { transform: translateX(120%) rotate(-12deg); }
                }
            `}</style>
        </div>
    );
};

export default Splash;