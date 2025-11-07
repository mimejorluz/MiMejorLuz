import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Appliance, DayPriceAnalysis, OptimalUsagePlan, PricePoint } from '../types';
import { IconSparkles } from './common/Icons';
import { fmtNum } from '../utils/formatters';
import { fetchSimulatorExplanation } from '../services/geminiService';


interface ConsumptionSimulatorProps {
  onExplain: (topic: string) => void;
  priceData: DayPriceAnalysis | null;
  fetchOptimalUsagePlan: (appliances: Appliance[], prices: PricePoint[]) => Promise<OptimalUsagePlan>;
  preselectedAppliances: Appliance[] | null;
  onPreselectionsConsumed: () => void;
}

const APPLIANCES: Appliance[] = [
    'Lavadora', 'Lavavajillas', 'Horno', 'Coche eléctrico', 'Secadora', 'Termo eléctrico', 'Vitrocerámica', 'Radiador eléctrico', 'Otros consumos altos'
];

const APPLIANCE_CONSUMPTION: Record<Appliance, string> = {
    'Lavadora': '1,2 kWh',
    'Lavavajillas': '1,5 kWh',
    'Horno': '2,0 kWh',
    'Coche eléctrico': '7,4 kWh',
    'Secadora': '2,5 kWh',
    'Termo eléctrico': '1,8 kWh',
    'Vitrocerámica': '1,5 kWh',
    'Radiador eléctrico': '1,0 kWh',
    'Otros consumos altos': 'Variable'
};


const ApplianceIcon: React.FC<{appliance: Appliance}> = ({ appliance }) => {
    const iconMap: Record<Appliance, string> = {
        'Lavadora': '🧺', 'Lavavajillas': '🍽️', 'Horno': '🔥', 'Coche eléctrico': '🚗', 'Secadora': '💨', 'Termo eléctrico': '🌡️', 'Vitrocerámica': '🍳', 'Radiador eléctrico': '♨️', 'Otros consumos altos': '🔌'
    };
    return <span className="text-2xl">{iconMap[appliance]}</span>;
}

const PlanResultView: React.FC<{
    plan: OptimalUsagePlan;
    onReset: () => void;
    onExplain: () => void;
    isExplanationLoading: boolean;
    explanationText: string | null;
}> = ({ plan, onReset, onExplain, isExplanationLoading, explanationText }) => {
    const hasCostData = typeof plan.estimatedCostEur === 'number' && plan.estimatedCostEur > 0;
    const hasSavingsData = typeof plan.savingsPercentage === 'number' && plan.savingsPercentage > 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="font-bold tracking-tight text-left">Tu Plan de Consumo Óptimo</h3>
                 <button
                    onClick={onExplain}
                    disabled={isExplanationLoading}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                 >
                    <IconSparkles className="w-3.5 h-3.5" />
                    Explicar con IA
                 </button>
            </div>
             {isExplanationLoading && (
                <p className="text-xs text-gray-500 text-right mt-1 animate-pulse">Generando explicación...</p>
            )}

            <p className="text-sm text-gray-600 text-center mt-1">{plan.summary}</p>
            
            <AnimatePresence>
                {explanationText && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 overflow-hidden"
                    >
                         <p dangerouslySetInnerHTML={{ __html: explanationText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </motion.div>
                )}
            </AnimatePresence>


            <div className="my-4 space-y-2">
                {plan.optimalSchedule.map(({ appliance, recommendedTime }) => (
                    <div key={appliance} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <ApplianceIcon appliance={appliance as Appliance} />
                            <span className="font-semibold text-sm">{appliance}</span>
                        </div>
                        <span className="font-bold text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-md">{recommendedTime}</span>
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-400 mb-2 text-left">
                Cálculo basado SOLO en los electrodomésticos que has seleccionado para HOY.
            </p>

            <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-green-50 rounded-lg flex flex-col justify-center items-center min-h-[76px]">
                    <p className="text-xs text-green-800 font-medium">Coste Estimado</p>
                    {hasCostData ? (
                        <p className="text-lg font-bold text-green-900">{fmtNum(plan.estimatedCostEur, '€', 2)}</p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1 px-2">Se necesita volver a calcular</p>
                    )}
                </div>
                <div className="p-3 bg-red-50 rounded-lg flex flex-col justify-center items-center min-h-[76px]">
                    <p className="text-xs text-red-800 font-medium">vs. Horas Caras</p>
                    {hasCostData ? (
                        <p className="text-lg font-bold text-red-900">{fmtNum(plan.peakCostComparisonEur, '€', 2)}</p>
                    ) : (
                         <p className="text-xs text-gray-500 mt-1 px-2">Se necesita volver a calcular</p>
                    )}
                </div>
            </div>
            
            <p className="text-center text-sm font-semibold text-gray-700 mt-3 flex items-center justify-center h-5">
                {hasSavingsData 
                    ? `¡Ahorras un ${fmtNum(plan.savingsPercentage, '%', 0)}!`
                    : "Hemos encontrado horas más baratas para hoy."
                }
            </p>

            <button onClick={onReset} className="w-full mt-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors">
                Simular de nuevo
            </button>
        </motion.div>
    );
};


const ConsumptionSimulator: React.FC<ConsumptionSimulatorProps> = ({ onExplain, priceData, fetchOptimalUsagePlan, preselectedAppliances, onPreselectionsConsumed }) => {
    const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
    const [planResult, setPlanResult] = useState<OptimalUsagePlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInitialMessage, setShowInitialMessage] = useState(false);

    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [explanationText, setExplanationText] = useState<string | null>(null);

    useEffect(() => {
        if (preselectedAppliances !== null) {
            setSelectedAppliances(preselectedAppliances);
            setShowInitialMessage(preselectedAppliances.length === 0);
            onPreselectionsConsumed();
        }
    }, [preselectedAppliances, onPreselectionsConsumed]);


    const handleToggleAppliance = useCallback((appliance: Appliance) => {
        setSelectedAppliances(prev => 
            prev.includes(appliance) ? prev.filter(a => a !== appliance) : [...prev, appliance]
        );
    }, []);

    const handleCreatePlan = useCallback(async () => {
        if (!priceData?.points || selectedAppliances.length === 0) return;

        setIsLoading(true);
        setError(null);
        setPlanResult(null);

        try {
            const result = await fetchOptimalUsagePlan(selectedAppliances, priceData.points);
            setPlanResult(result);
        } catch (e) {
            console.error("Failed to create optimal usage plan:", e);
            setError("No se pudo generar el plan. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedAppliances, priceData, fetchOptimalUsagePlan]);

    const handleExplainPlan = useCallback(async () => {
        if (!planResult) return;
        setIsExplanationLoading(true);
        setExplanationText(null);
        try {
            const explanation = await fetchSimulatorExplanation(planResult);
            setExplanationText(explanation);
        } catch (e) {
            console.error("Failed to fetch explanation:", e);
            setExplanationText("No se pudo generar la explicación en este momento.");
        } finally {
            setIsExplanationLoading(false);
        }
    }, [planResult]);

    const handleReset = () => {
        setPlanResult(null);
        setSelectedAppliances([]);
        setError(null);
        setExplanationText(null);
        setIsExplanationLoading(false);
        setShowInitialMessage(false);
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
             <AnimatePresence mode="wait">
                {planResult ? (
                    <motion.div key="result">
                        <PlanResultView
                            plan={planResult}
                            onReset={handleReset}
                            onExplain={handleExplainPlan}
                            isExplanationLoading={isExplanationLoading}
                            explanationText={explanationText}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-bold tracking-tight">Simulador de Consumo</h2>
                            <button onClick={() => onExplain('Simulador de Consumo')} className="text-amber-600 p-1 rounded-full hover:bg-amber-100 transition-colors">
                                <IconSparkles className="w-4 h-4" />
                            </button>
                        </div>
                        {showInitialMessage ? (
                             <p className="mt-2 text-sm text-center text-amber-800 bg-amber-50 p-2 rounded-lg">
                                Selecciona qué aparatos quieres usar y te digo la hora más barata.
                            </p>
                        ) : (
                            <p className="mt-1 text-sm text-gray-500">
                                Selecciona los electrodomésticos que quieres usar y te diremos cuándo es más barato.
                            </p>
                        )}
                       
                        <div className="mt-4">
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                {APPLIANCES.map(appliance => {
                                    const isSelected = selectedAppliances.includes(appliance);
                                    return (
                                        <motion.div 
                                            key={appliance} 
                                            className={`flex flex-col items-center justify-between p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out min-h-[6rem] ${isSelected ? 'border-amber-400 bg-amber-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                                            onClick={() => handleToggleAppliance(appliance)}
                                            whileTap={{ scale: 0.95 }}
                                            animate={{ scale: isSelected ? 1.05 : 1 }}
                                        >
                                            <ApplianceIcon appliance={appliance} />
                                            <div className="text-center">
                                                <p className="text-[11px] font-semibold text-gray-800 leading-tight">{appliance}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{APPLIANCE_CONSUMPTION[appliance]}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <button 
                                onClick={handleCreatePlan}
                                disabled={selectedAppliances.length === 0 || isLoading}
                                className="bg-[var(--accent-main)] text-black w-full mt-4 py-2.5 rounded-lg font-semibold disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Calculando...' : 'Calcular mejor hora con los precios de hoy'}
                            </button>
                             {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConsumptionSimulator;
