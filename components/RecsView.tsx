import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayPriceAnalysis, Appliance, OptimalUsagePlan, PricePoint } from '../types';
import { getPricesForDay, getTodayDateMadrid, getTomorrowDateMadrid, getYesterdayDateMadrid } from '../services/esiosService';
import { HourlyPriceChart } from './HourlyPriceChart';
import ConsumptionSimulator from './ConsumptionSimulator';
import TariffsCard from './TariffsCard';
import { AiTipsView } from './AiTipsView';
import { IconCalendar } from './common/Icons';

interface RecsViewProps {
    onExplain: (topic: string) => void;
    fetchOptimalUsagePlan: (appliances: Appliance[], prices: PricePoint[]) => Promise<OptimalUsagePlan>;
}

type SubTab = 'precios' | 'simulador' | 'consejos' | 'tarifas';
type DateSelection = 'yesterday' | 'today' | 'tomorrow' | 'custom';

const SubTabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative flex-1 py-2 text-sm font-semibold rounded-full z-10 transition-colors h-9 ${isActive ? 'text-gray-800' : 'text-gray-500'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A3B70]/50`}
    >
        {label}
    </button>
);

const subTabConfig: { id: SubTab, label: string }[] = [
    { id: 'precios', label: 'Precio Luz' },
    { id: 'simulador', label: 'Simulador' },
    { id: 'consejos', label: 'Consejos IA' },
    { id: 'tarifas', label: 'Tarifas' }
];

export const RecsView: React.FC<RecsViewProps> = ({ onExplain, fetchOptimalUsagePlan }) => {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('precios');
    const [activeDateSelection, setActiveDateSelection] = useState<DateSelection>('today');
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateMadrid());
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [priceData, setPriceData] = useState<DayPriceAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = useCallback(async (dateToFetch: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await getPricesForDay(dateToFetch);
            setPriceData(data);
        } catch (err: any) {
            setError(err.message || 'No se pudieron cargar los precios. Inténtalo de nuevo más tarde.');
            setPriceData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices(selectedDate);
    }, [selectedDate, fetchPrices]);

    const handleDateSelection = (selection: DateSelection) => {
        setActiveDateSelection(selection);
        let newDate;
        if (selection === 'today') newDate = getTodayDateMadrid();
        else if (selection === 'tomorrow') newDate = getTomorrowDateMadrid();
        else if (selection === 'yesterday') newDate = getYesterdayDateMadrid();
        if (newDate) setSelectedDate(newDate);
    };

    const handleDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
        setActiveDateSelection('custom');
    };
    
    const handleCalendarClick = () => {
        dateInputRef.current?.click();
    };

    const handlePreselectionsConsumed = useCallback(() => {}, []);
    
    const activeTabIndex = subTabConfig.findIndex(tab => tab.id === activeSubTab);

    return (
        <div className="flex flex-col h-full">
            <header>
                <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Optimiza tu Consumo</h1>
                <p className="text-sm text-[#6E6E73]">Encuentra las horas más baratas y planifica tu gasto energético.</p>
            </header>

            <div className="flex-1 overflow-y-auto mt-4 pb-24 space-y-4">
                {/* Sub-tab switcher */}
                <div className="relative flex items-center bg-gray-100 p-1 rounded-full m-1 shrink-0">
                    <motion.div
                        className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm"
                        animate={{ left: `${activeTabIndex * 25}%`, width: '25%' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                    {subTabConfig.map(tab => (
                        <SubTabButton key={tab.id} label={tab.label} isActive={activeSubTab === tab.id} onClick={() => setActiveSubTab(tab.id)} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSubTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeSubTab === 'precios' && (
                            <>
                                <div className="grid grid-cols-4 gap-1 text-center bg-gray-100 p-1 rounded-full m-1">
                                    <button onClick={() => handleDateSelection('yesterday')} className={`py-2 text-sm font-semibold rounded-full ${activeDateSelection === 'yesterday' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Ayer</button>
                                    <button onClick={() => handleDateSelection('today')} className={`py-2 text-sm font-semibold rounded-full ${activeDateSelection === 'today' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Hoy</button>
                                    <button onClick={() => handleDateSelection('tomorrow')} className={`py-2 text-sm font-semibold rounded-full ${activeDateSelection === 'tomorrow' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Mañana</button>
                                    <button onClick={handleCalendarClick} className={`relative flex items-center justify-center cursor-pointer py-2 rounded-full ${activeDateSelection === 'custom' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
                                        <IconCalendar className="w-4 h-4" />
                                        <input
                                            ref={dateInputRef}
                                            type="date"
                                            value={selectedDate}
                                            onChange={handleDateInputChange}
                                            className="hidden"
                                        />
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 mt-2">
                                    {isLoading ? (
                                        <div className="h-72 bg-gray-200/50 rounded-lg animate-pulse" />
                                    ) : error ? (
                                        <div className="h-72 flex flex-col items-center justify-center text-center text-red-500 p-4">
                                            <h4 className="font-semibold">Error de Carga</h4>
                                            <p className="text-sm mt-1">{error}</p>
                                        </div>
                                    ) : priceData && priceData.points.length > 0 ? (
                                        <HourlyPriceChart priceData={priceData} />
                                    ) : (
                                        <div className="h-72 flex flex-col items-center justify-center text-center text-gray-600 p-4">
                                            <h4 className="font-semibold">Datos no disponibles</h4>
                                            <p className="text-sm mt-1">{priceData?.co2Analysis || 'Los precios para esta fecha aún no están disponibles.'}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        {activeSubTab === 'simulador' && (
                            <ConsumptionSimulator
                                onExplain={onExplain}
                                priceData={priceData}
                                fetchOptimalUsagePlan={fetchOptimalUsagePlan}
                                preselectedAppliances={null}
                                onPreselectionsConsumed={handlePreselectionsConsumed}
                            />
                        )}
                        {activeSubTab === 'consejos' && <AiTipsView priceData={priceData} />}
                        {activeSubTab === 'tarifas' && <TariffsCard onExplain={onExplain} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};