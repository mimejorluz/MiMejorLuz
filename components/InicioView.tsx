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
    <motion.div
        className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50/50 transition-colors duration-200"
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
        <motion.div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FFC700]/20 to-[#FFD28A]/10 border border-[#FFD28A]/30"
            whileHover={{ scale: 1.1 }}
        >
            {icon}
        </motion.div>
        <div className="flex-1">
            <h3 className="font-semibold text-[#1D1D1F] text-sm">{title}</h3>
            <p className="text-xs text-[#5E5E63] leading-snug mt-1">{description}</p>
        </div>
    </motion.div>
);

const PriceChartSkeleton: React.FC = () => (
    <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <motion.div className="space-y-3">
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-2/3 animate-shimmer bg-[length:200%_100%]" />
            <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded w-1/2 animate-shimmer bg-[length:200%_100%]" />
            <div className="h-40 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg mt-4 animate-shimmer bg-[length:200%_100%]" />
        </motion.div>
    </motion.div>
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
                    className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                >
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFC700]/5 rounded-full blur-3xl" />
                    <div className="flex flex-col justify-center h-full gap-1 relative z-10">
                        <FeatureItem
                            icon={<IconChart className="w-5 h-5 text-[#FFC700]" />}
                            title="Análisis Inteligente"
                            description="Sube tus facturas en PDF y nuestra IA extraerá los datos clave para ti."
                        />
                        <FeatureItem
                            icon={<IconBolt className="w-5 h-5 text-[#FFC700]" />}
                            title="Recomendaciones a Medida"
                            description="Comparamos tu consumo con las mejores tarifas del mercado para encontrar tu plan ideal."
                        />
                        <FeatureItem
                            icon={<IconSparkles className="w-5 h-5 text-[#FFC700]" />}
                            title="Optimización Diaria"
                            description="Te decimos cuáles son las horas más baratas del día para que uses tus electrodomésticos."
                        />
                    </div>
                </motion.div>

                {/* Thiago Card */}
                <motion.button
                    onClick={onOpenThiago}
                    className="lg:col-span-2 w-full bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <motion.div
                        className="w-12 h-12 rounded-full grid place-items-center flex-shrink-0 border border-[#FFD28A] bg-gradient-to-br from-[#FFC700]/20 to-[#FFD28A]/10"
                        whileHover={{ scale: 1.1 }}
                    >
                        <img
                            src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
                            alt="Thiago, tu asesor energético"
                            className="w-11 h-11 rounded-full object-cover"
                        />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1D1D1F] leading-tight text-sm">¿Necesitas que te lo explique Thiago?</p>
                        <p className="text-xs text-[#5E5E63] truncate">Tu asistente energético con IA</p>
                    </div>
                    <motion.div
                        className="bg-[#1D1D1F] text-white rounded-full px-5 py-2 text-xs font-semibold whitespace-nowrap shadow-sm"
                        whileHover={{ scale: 1.05 }}
                    >
                        Abrir
                    </motion.div>
                </motion.button>
            </div>
            
            {/* CTA Button */}
            <motion.div
                className="mt-auto pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <motion.button
                    onClick={onStart}
                    className="w-full bg-[#1D1D1F] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-black/20 border border-black/10 transition-all"
                    whileHover={{ scale: 1.02, y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    Empezar análisis
                </motion.button>
                <p className="text-center text-xs text-[#AEAEB2] mt-2">
                    Usamos datos oficiales de ESIOS + IA para el cálculo.
                </p>
            </motion.div>
        </div>
    );
};