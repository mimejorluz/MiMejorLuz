import React from 'react';
import { motion } from 'framer-motion';
import { IconBolt, IconChart, IconSparkles, IconSettings } from './common/Icons';
import { HourlyPriceChart } from './HourlyPriceChart';
import type { DayPriceAnalysis } from '../types';

interface InicioViewProps {
    invoiceCount: number;
    onStart: () => void;
    onOpenSettings: () => void;
    onOpenThiago: () => void;
    todayPrices: DayPriceAnalysis | null;
}

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19.5) return "Buenas tardes";
    return "Buenas noches";
};

const FeatureItem: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({ icon, title, description }) => (
    <div className="flex items-center gap-4">
        <div 
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#F4F5F7]"
        >
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-[#1D1D1F] text-sm">{title}</h3>
            <p className="text-xs text-[#6E6E73] leading-snug">{description}</p>
        </div>
    </div>
);

const PriceChartSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-24 bg-gray-100 rounded-lg"></div>
    </div>
);


export const InicioView: React.FC<InicioViewProps> = ({ invoiceCount, onStart, onOpenSettings, onOpenThiago, todayPrices }) => {
    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <header className="shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">{getGreeting()}</h1>
                        <p className="text-sm text-[#6E6E73]">Aquí tienes tu asistencia energética con IA.</p>
                    </div>
                    <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <IconSettings className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </header>

            {/* Content area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Price Chart Card */}
                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    {todayPrices && todayPrices.points.length > 0 ? (
                        <>
                            <h3 className="font-semibold text-[#1D1D1F]">Precios de la luz (hoy)</h3>
                            <p className="text-xs text-[#6E6E73] leading-snug mb-2">Datos de ESIOS actualizados</p>
                            <div className="flex-1 flex flex-col justify-center">
                                <HourlyPriceChart priceData={todayPrices} isCompact />
                            </div>
                        </>
                    ) : (
                        <PriceChartSkeleton />
                    )}
                </motion.div>

                {/* Features Card */}
                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-black/5 p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                >
                    <div className="flex flex-col justify-center h-full gap-3">
                        <FeatureItem
                            icon={<IconChart className="w-5 h-5 text-[var(--accent-main)]" />}
                            title="Análisis Inteligente"
                            description="Sube tus facturas en PDF y nuestra IA extraerá los datos clave para ti."
                        />
                        <div className="h-px bg-[#E5E5EA] my-1"></div>
                        <FeatureItem
                            icon={<IconBolt className="w-5 h-5 text-[var(--accent-main)]" />}
                            title="Recomendaciones a Medida"
                            description="Comparamos tu consumo con las mejores tarifas del mercado para encontrar tu plan ideal."
                        />
                        <div className="h-px bg-[#E5E5EA] my-1"></div>
                        <FeatureItem
                            icon={<IconSparkles className="w-5 h-5 text-[var(--accent-main)]" />}
                            title="Optimización Diaria"
                            description="Te decimos cuáles son las horas más baratas del día para que uses tus electrodomésticos."
                        />
                    </div>
                </motion.div>

                {/* Thiago Card */}
                <motion.button
                    onClick={onOpenThiago}
                    className="lg:col-span-2 w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-black/5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="w-11 h-11 rounded-full grid place-items-center flex-shrink-0 border border-black/5 bg-white">
                        <img
                            src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
                            alt="Thiago, tu asesor energético"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1D1D1F] leading-tight text-sm">¿Necesitas que te lo explique Thiago?</p>
                        <p className="text-xs text-[#6E6E73] truncate">Tu asistente energético IA.</p>
                    </div>
                    <div className="bg-[#1D1D1F] text-white rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap">
                        Abrir chat
                    </div>
                </motion.button>
            </div>
            
            {/* CTA Button */}
            <motion.div
                className="mt-auto pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <button
                    onClick={onStart}
                    className="w-full bg-[#1D1D1F] text-white py-3.5 rounded-xl font-semibold transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
                >
                    Empezar análisis
                </button>
                <p className="text-center text-xs text-[#AEAEB2] mt-2">
                    Usamos datos oficiales de ESIOS + IA para el cálculo.
                </p>
            </motion.div>
        </div>
    );
};