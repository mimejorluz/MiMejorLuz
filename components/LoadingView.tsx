import React from 'react';
import { motion } from 'framer-motion';

export const LoadingView: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#F7F7F7] via-[#FCFCFD] to-[#F5F5F7] p-4 relative overflow-hidden"
        >
            <div className="absolute inset-0 opacity-20">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute top-20 left-10 w-80 h-80 bg-yellow-100/30 rounded-full blur-3xl"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"
                />
            </div>

            <div className="flex flex-col items-center text-center w-full max-w-xs relative z-10">
                <motion.img
                    src="https://storage.googleapis.com/mejorluz-assets-public-2025/logo.png"
                    alt="Logo MiMejorLuz"
                    className="w-28 h-auto"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                />

                <motion.h3
                    className="text-2xl font-bold text-[#1D1D1F] mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    Generando tu Panel de Ahorro…
                </motion.h3>

                <motion.p
                    className="text-sm text-[#5E5E63] mt-3 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Consultando a la IA y analizando tu consumo
                </motion.p>

                <motion.div
                    className="mt-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="loader-track">
                        <div className="loader-progress"></div>
                    </div>
                </motion.div>

                <motion.div
                    className="mt-8 flex items-center justify-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        className="w-2 h-2 bg-[#FFC700] rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div
                        className="w-2 h-2 bg-[#FFC700] rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                        className="w-2 h-2 bg-[#FFC700] rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                </motion.div>
            </div>

            {/* Estilos copiados de Splash.tsx para la barra de carga */}
            <style>{`
                .loader-track {
                    width: 180px;
                    height: 6px; /* Ajustado para ser más delgado como en la imagen */
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