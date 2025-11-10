import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { DayPriceAnalysis, PricePoint } from '../types';
import { hourES } from '../utils/date';
import { fmtNum } from '../utils/formatters';

interface HourlyPriceChartProps {
    priceData: DayPriceAnalysis | null;
    isCompact?: boolean;
}

const KPI: React.FC<{ label: string; value: string; subvalue: string; className?: string; isCompact?: boolean; }> = ({ label, value, subvalue, className = '', isCompact = false }) => (
    <div className={`text-center p-2 rounded-lg ${className}`}>
        <p className={`font-medium ${isCompact ? 'text-[10px] text-gray-600' : 'text-[11px] text-gray-500'}`}>{label}</p>
        <p className={`font-semibold text-gray-800 tracking-tight ${isCompact ? 'text-xs' : 'text-sm'}`}>{value}</p>
        <p className={`text-gray-600 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>{subvalue}</p>
    </div>
);

const getBarColor = (price: number, min: number, range: number): string => {
    if (range <= 0) return 'linear-gradient(180deg, #10B981 0%, #059669 100%)';
    const normalized = (price - min) / range;

    if (normalized < 0.33) {
        return 'linear-gradient(180deg, #10B981 0%, #059669 100%)';
    } else if (normalized < 0.66) {
        return 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)';
    } else {
        return 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)';
    }
};

const Bar: React.FC<{ point: PricePoint; minPrice: number; priceRange: number; onHover: (p: PricePoint | null) => void }> = ({ point, minPrice, priceRange, onHover }) => {
    const heightPercent = priceRange > 0 ? ((point.priceEurKWh - minPrice) / priceRange) * 100 : 1;
    const color = getBarColor(point.priceEurKWh, minPrice, priceRange);

    return (
        <div
            className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
            onMouseEnter={() => onHover(point)}
            onMouseLeave={() => onHover(null)}
        >
            <motion.div
                initial={{ height: '0%' }}
                animate={{ height: `${Math.max(2, heightPercent)}%` }}
                whileHover={{ scaleY: 1.05, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: color }}
                className="w-full rounded-t-md shadow-sm group-hover:shadow-md transition-all"
            />
        </div>
    );
};


export const HourlyPriceChart: React.FC<HourlyPriceChartProps> = ({ priceData: data, isCompact = false }) => {
    const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

    const priceStats = useMemo(() => {
        if (!data?.points || data.points.length === 0) return { minPrice: 0, maxPrice: 0, priceRange: 0 };
        const prices = data.points.map(p => p.priceEurKWh);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return {
            minPrice,
            maxPrice,
            priceRange: maxPrice - minPrice
        };
    }, [data]);

    if (!data) return <div className="h-72 bg-gray-100 rounded-lg animate-pulse" />;
    
    return (
        <div className="space-y-3">
            <div className="relative">
                <div className={`${isCompact ? 'h-20' : 'h-48'} flex items-stretch gap-px relative`}>
                    {data.points.map((p) => (
                        <Bar key={p.time} point={p} onHover={setHoveredPoint} {...priceStats} />
                    ))}
                </div>
                 {hoveredPoint && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-[#1D1D1F]/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap border border-white/10 mb-2"
                    >
                        <div className="flex flex-col items-center gap-0.5">
                            <span>{hourES(hoveredPoint.time)}</span>
                            <span className="text-[#FFC700] font-bold">{fmtNum(hoveredPoint.priceEurKWh, '€/kWh', 4)}</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-[#1D1D1F]/95 transform rotate-45" />
                    </motion.div>
                )}
            </div>
            <div className={`flex justify-between text-gray-400 px-1 ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
                <span>00h</span>
                <span>06h</span>
                <span>12h</span>
                <span>18h</span>
                <span>23h</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <KPI label="Más Barato" value={hourES(data.bestHour.time)} subvalue={fmtNum(data.bestHour.priceEurKWh, '€/kWh', 4)} className="bg-green-50/80 border border-green-100 rounded-lg p-3" isCompact={isCompact} />
                </motion.div>
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <KPI label="Precio Medio" value={fmtNum(data.averagePriceEurKWh, '€/kWh', 4)} subvalue="Hoy" className="bg-gray-50/80 border border-gray-100 rounded-lg p-3" isCompact={isCompact} />
                </motion.div>
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <KPI label="Más Caro" value={hourES(data.worstHour.time)} subvalue={fmtNum(data.worstHour.priceEurKWh, '€/kWh', 4)} className="bg-red-50/80 border border-red-100 rounded-lg p-3" isCompact={isCompact} />
                </motion.div>
            </div>
        </div>
    );
};