import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ComparativeAnalysis, InvoiceData, CostSimulation, PowerAnalysis } from '../types';
import { IconSparkles, IconSettings, IconLeaf, IconLock } from './common/Icons';
import { AnimatedNumber } from './common/AnimatedNumber';
import { EmptyState } from './common/EmptyState';
import { Info } from './common/Info';
import { fmtNum } from '../utils/formatters';

interface MiPanelViewProps {
    analysis: ComparativeAnalysis;
    invoices: InvoiceData[];
    onNavigateHome: () => void;
    onExplain: (topic: string) => void;
    lastAnalysisSource: 'invoices' | 'manual' | null;
    onOpenThiago: () => void;
    onOpenSettings: () => void;
    fetchHiringGuide: (tariff: string, provider: string, cups: string) => Promise<any>;
    fetchConsumptionTrendAnalysis: (invoices: InvoiceData[]) => Promise<string>;
}

const SavingsCard: React.FC<{ analysis: ComparativeAnalysis }> = ({ analysis }) => {
    const analysisDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return (
        <div className="bg-white rounded-2xl p-5 text-center flex flex-col justify-center shadow-sm border border-black/5">
            <p className="font-semibold text-sm text-[#6E6E73]">Ahorro anual estimado</p>
            <div className="flex items-center justify-center gap-2 text-[#1D1D1F]">
                <AnimatedNumber value={analysis.estimatedAnnualSavingEur} className="text-4xl lg:text-5xl font-bold tracking-tighter" />
                <span className="text-3xl lg:text-4xl font-bold mt-1">€</span>
            </div>
            <p className="mt-1 text-sm text-[#6E6E73]">Recomendado: <span className="font-semibold text-[#1D1D1F]">{analysis.bestTariffRecommendation}</span></p>
            <p className="text-xs text-gray-400 mt-2">Último análisis: {analysisDate}</p>
        </div>
    );
};

const PowerAnalysisCard: React.FC<{ powerAnalysis: PowerAnalysis; onExplain: (topic: string) => void }> = ({ powerAnalysis, onExplain }) => (
    <div className="bg-white rounded-2xl p-4 flex flex-col justify-center shadow-sm border border-black/5">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-[#1D1D1F]">Análisis de Potencia</h3>
            <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">IA</span>
                <button onClick={() => onExplain('Análisis de Potencia')} className="text-[var(--accent-main)] p-1 rounded-full hover:bg-amber-100/50 transition-colors">
                    <IconSparkles className="w-4 h-4" />
                </button>
            </div>
        </div>
        <p className="text-sm text-[#6E6E73] mb-3">{powerAnalysis.analysisSummary}</p>
        <div className="grid grid-cols-3 gap-3 text-center">
            <Info label="Actual" value={fmtNum(powerAnalysis.currentPowerKw, 'kW', 2)} />
            <Info label="Recomendada" value={fmtNum(powerAnalysis.recommendedPowerKw, 'kW', 2)} />
            <Info label="Ahorro Potencial" value={fmtNum(powerAnalysis.annualSavingsEur, '€/año', 0)} />
        </div>
    </div>
);

const TariffSimulationCard: React.FC<{ simulation: CostSimulation, isRecommended: boolean, onExplain: (topic: string) => void }> = ({ simulation, isRecommended, onExplain }) => (
    <div className={`p-4 rounded-xl flex items-center gap-3 transition-colors duration-200 ${isRecommended ? 'bg-[#FFF3D1] border border-[#FFD28A]' : 'bg-white border-b border-black/5 hover:bg-gray-50'}`}>
        <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{simulation.tariffName}</p>
            <p className="text-xs text-[#6E6E73]">{simulation.providerName}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
                {simulation.isGreen && <span className="flex items-center gap-1.5 text-xs text-green-800 bg-[#DFF7E7] px-2.5 py-0.5 rounded-full font-medium"><IconLeaf className="w-3.5 h-3.5" /> Verde</span>}
                {simulation.hasPermanence && <span className="flex items-center gap-1.5 text-xs text-red-800 bg-[#FDE7E9] px-2.5 py-0.5 rounded-full font-medium"><IconLock className="w-3.5 h-3.5" /> Permanencia</span>}
                <button onClick={() => onExplain(`Tarifa: ${simulation.tariffName}`)} className="text-xs text-gray-500 hover:underline">Ver detalle</button>
            </div>
        </div>
        <div className="text-right shrink-0">
            <p className="text-lg font-semibold tracking-tight text-gray-900">{fmtNum(simulation.averageMonthlyCostEur, '€', 2)}</p>
            <p className="text-xs text-gray-500 -mt-1">/mes</p>
        </div>
    </div>
);

const SpinnerIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const MiPanelView: React.FC<MiPanelViewProps> = ({ analysis, invoices, onNavigateHome, onExplain, lastAnalysisSource, onOpenThiago, onOpenSettings }) => {
    const [isResetting, setIsResetting] = useState(false);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleReset = async () => {
        setIsResetting(true);
        await sleep(500); // Visual feedback
        onNavigateHome();
    };

    if (!analysis) {
        return (
            <div className="p-4">
                <EmptyState
                    title="Análisis no disponible"
                    message="No se pudieron cargar los resultados del análisis. Por favor, vuelve a empezar."
                    ctaText="Volver al inicio"
                    onCtaClick={onNavigateHome}
                />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pb-24 space-y-4">
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Tu Panel de Ahorro</h1>
                        <p className="text-sm text-[#6E6E73]">Este es el resultado de tu análisis personalizado.</p>
                    </div>
                    <div className="flex items-center flex-shrink-0 gap-2">
                        <button
                            onClick={() => onExplain('Resumen del Panel de Ahorro')}
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                        >
                            <IconSparkles className="w-3.5 h-3.5" />
                            Explicar
                        </button>
                        <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <IconSettings className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SavingsCard analysis={analysis} />
                    {analysis.powerAnalysis && analysis.powerAnalysis.annualSavingsEur > 0 && (
                        <PowerAnalysisCard powerAnalysis={analysis.powerAnalysis} onExplain={onExplain} />
                    )}
                </div>
                
                <motion.button
                    onClick={onOpenThiago}
                    className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm border border-black/5"
                    whileTap={{ scale: 0.99 }}
                >
                    <img
                        src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
                        alt="Thiago"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1D1D1F]">¿Quieres que te lo explique <strong>Thiago</strong>?</p>
                        <p className="text-xs text-[#6E6E73] leading-tight">Te lo adapta a tus datos y te genera el mensaje.</p>
                    </div>
                    <div className="bg-[#1D1D1F] text-white rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap">
                        Abrir chat →
                    </div>
                </motion.button>

                {lastAnalysisSource === 'manual' && (
                    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-black/5">
                        <img src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png" alt="Thiago" className="w-10 h-10 rounded-full flex-shrink-0"/>
                        <div className="flex-1">
                            <p className="font-semibold text-sm text-[#1D1D1F]">¿Probamos con una factura real?</p>
                            <p className="text-xs text-[#6E6E73]">Con el PDF te puedo ajustar horarios, peajes y potencias.</p>
                        </div>
                        <button onClick={onNavigateHome} className="text-sm font-semibold text-[#1D1D1F] whitespace-nowrap">Subir factura</button>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
                    <div className="mb-3">
                        <h3 className="font-semibold text-gray-900">Recomendación de Tarifas</h3>
                        <p className="text-sm text-[#6E6E73]">Comparamos tu consumo con las mejores opciones para ti.</p>
                    </div>
                    <div className="space-y-2">
                        {analysis.costSimulations.map((sim, i) => <TariffSimulationCard key={i} simulation={sim} isRecommended={sim.tariffName === analysis.bestTariffRecommendation} onExplain={onExplain} />)}
                    </div>
                </div>
                
                <p className="text-center text-xs text-[#AEAEB2] pt-2">Análisis generado con tus datos. Si subes una factura real, lo afinamos.</p>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-[#F7F7F7] pt-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200/80">
                <div style={{paddingBottom: `calc(env(safe-area-inset-bottom, 12px) + 12px)`}}>
                     <button
                        onClick={handleReset}
                        disabled={isResetting}
                        aria-busy={isResetting}
                        className="w-full min-h-[52px] bg-[#1D1D1F] text-white font-semibold py-3.5 rounded-xl transition-colors hover:bg-black shadow-lg shadow-black/10 disabled:bg-gray-400 flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A3B70]/50"
                    >
                        {isResetting ? (
                            <>
                                <SpinnerIcon className="text-white" />
                                <span>Volviendo...</span>
                            </>
                        ) : (
                            'Analizar de nuevo'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};