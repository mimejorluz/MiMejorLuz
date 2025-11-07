import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAITips, fetchGenericAITips } from '../services/geminiService';
import { IconSparkles, IconBolt } from './common/Icons';
import type { DayPriceAnalysis } from '../types';

interface AiTipsViewProps {
    priceData: DayPriceAnalysis | null;
}

// Simple parser to convert markdown to HTML
const parseTipsMarkdown = (text: string) => {
    let html = text;
    html = html.replace(/^### (.*$)/gim, '<h3 class="font-semibold text-gray-800 mt-4 mb-2 text-base">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-5 list-disc mb-1">$1</li>');
    const listItems = html.match(/<li.*?>/g);
    if (listItems) {
      html = `<ul>${html}</ul>`;
    }
    html = html.replace(/<\/li>(\s*<h3)/g, '</li></ul>$1');
    html = html.replace(/\n/g, '<br />');
    return html;
};

const SpinnerIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const AiTipsView: React.FC<AiTipsViewProps> = ({ priceData }) => {
    const [initialTips, setInitialTips] = useState<string | null>(null);
    const [additionalTips, setAdditionalTips] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingMore, setIsGeneratingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateInitialTips = useCallback(async (data: DayPriceAnalysis) => {
        if (!data || data.points.length === 0) {
            setError('No hay datos de precios disponibles para generar consejos.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchAITips(data);
            setInitialTips(result);
        } catch (e) {
            setError('No se pudieron generar los consejos para hoy.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateMoreTips = useCallback(async () => {
        setIsGeneratingMore(true);
        setError(null);
        try {
            const result = await fetchGenericAITips();
            setAdditionalTips(prev => (prev ? `${prev}\n\n${result}` : result));
        } catch (e) {
            setError('No se pudieron generar más consejos.');
            console.error(e);
        } finally {
            setIsGeneratingMore(false);
        }
    }, []);

    useEffect(() => {
        if (priceData) {
            generateInitialTips(priceData);
        }
    }, [priceData, generateInitialTips]);

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 min-h-[400px] flex flex-col">
            <h3 className="font-bold tracking-tight text-base">Consejos de Ahorro con IA</h3>
            <p className="text-sm text-gray-500 mt-1">Recomendaciones para reducir tu consumo basadas en los precios de hoy.</p>

            <div className="flex-1 mt-4 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center flex flex-col justify-center h-full">
                            <SpinnerIcon className="mx-auto text-amber-500 w-8 h-8" />
                            <p className="mt-3 text-sm text-gray-600">Analizando los precios de hoy para darte los mejores consejos...</p>
                        </motion.div>
                    ) : error && !initialTips ? (
                         <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-4 bg-red-50 text-red-700 rounded-lg">
                            <p className="font-semibold">¡Vaya!</p>
                            <p className="text-sm">{error}</p>
                        </motion.div>
                    ) : initialTips ? (
                        <motion.div
                            key="tips"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full text-sm text-gray-700 space-y-2 text-left"
                        >
                            <div dangerouslySetInnerHTML={{ __html: parseTipsMarkdown(initialTips) }} />
                            {additionalTips && <div className="mt-4 pt-4 border-t" dangerouslySetInnerHTML={{ __html: parseTipsMarkdown(additionalTips) }} />}
                        </motion.div>
                    ) : (
                        <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center flex flex-col justify-center h-full">
                           <div className="w-16 h-16 rounded-full bg-gray-100 grid place-items-center mx-auto">
                                <IconBolt className="w-8 h-8 text-amber-500" />
                           </div>
                           <p className="mt-3 text-sm text-gray-600">No se encontraron datos de precios para generar consejos automáticos.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
             <div className="mt-6 space-y-2">
                {error && <p className="text-xs text-center text-red-600">{error}</p>}
                <button
                    onClick={generateMoreTips}
                    disabled={isGeneratingMore || isLoading}
                    className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gray-800 text-white flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:bg-gray-400"
                >
                    {isGeneratingMore ? (
                        <>
                            <SpinnerIcon className="w-4 h-4" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <IconSparkles className="w-4 h-4" />
                            {initialTips ? 'Generar más consejos' : 'Generar consejos generales'}
                        </>
                    )}
                </button>
             </div>
        </div>
    );
};