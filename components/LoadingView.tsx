import React from 'react';
import { motion } from 'framer-motion';

export const LoadingView: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Centrado en el centro y fondo a pantalla completa
            className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#EDEEEF] via-[#F7F7F7] to-white p-4"
        >
            <div className="flex flex-col items-center text-center w-full max-w-xs">
                {/* Logo oficial de la marca, según lo solicitado. */}
                <img
                    src="https://storage.googleapis.com/mejorluz-assets-public-2025/logo.png"
                    alt="Logo MiMejorLuz"
                    className="w-24 h-auto"
                />
                
                <h3 className="text-xl font-semibold text-[#0F172A] mt-6">
                    Generando tu Panel de Ahorro…
                </h3>

                <p className="text-sm text-[#6E6E73] mt-2">
                    Consultando a la IA...
                </p>
                
                {/* Barra de carga con efecto plateado */}
                <div className="mt-8">
                    <div className="loader-track">
                        <div className="loader-progress"></div>
                    </div>
                </div>
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