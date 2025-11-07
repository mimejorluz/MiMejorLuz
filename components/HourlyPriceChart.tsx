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
    if (range <= 0) return '#C7F2D0'; // Fallback to cheap color
    const normalized = (price - min) / range;

    if (normalized < 0.33) {
        return '#C7F2D0'; // Cheap (soft green)
    } else if (normalized < 0.66) {
        return '#FFDFA3'; // Medium (pastel gold)
    } else {
        return '#F9C3BF'; // Expensive (soft red/salmon)
    }
};

const Bar: React.FC<{ point: PricePoint; minPrice: number; priceRange: number; onHover: (p: PricePoint | null) => void }> = ({ point, minPrice, priceRange, onHover }) => {
    const heightPercent = priceRange > 0 ? ((point.priceEurKWh - minPrice) / priceRange) * 100 : 1;
    const color = getBarColor(point.priceEurKWh, minPrice, priceRange);

    return (
        <div 
            className="flex-1 h-full flex flex-col justify-end items-center"
            onMouseEnter={() => onHover(point)}
            onMouseLeave={() => onHover(null)}
        >
            <motion.div
                initial={{ height: '0%' }}
                animate={{ height: `${Math.max(1, heightPercent)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ backgroundColor: color }}
                className="w-full rounded-t-sm"
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
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap"
                    >
                        {hourES(hoveredPoint.time)} - {fmtNum(hoveredPoint.priceEurKWh, '€', 5)}
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

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                 <KPI label="Más Barato" value={hourES(data.bestHour.time)} subvalue={fmtNum(data.bestHour.priceEurKWh, '€/kWh', 4)} className="bg-green-50" isCompact={isCompact} />
                 <KPI label="Precio Medio" value={fmtNum(data.averagePriceEurKWh, '€/kWh', 4)} subvalue="Hoy" isCompact={isCompact} />
                 <KPI label="Más Caro" value={hourES(data.worstHour.time)} subvalue={fmtNum(data.worstHour.priceEurKWh, '€/kWh', 4)} className="bg-red-50" isCompact={isCompact} />
            </div>
        </div>
    );
};