import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Types
import type { InvoiceData, InvoiceFile, ComparativeAnalysis, ManualData, DayPriceAnalysis } from '../types';

// Services
import { extractTextFromPDF } from '../services/pdfParser';
import { parseInvoiceText } from '../services/regexParser';
import { parseInvoiceWithAI, fetchComparativeAnalysisWithAI, fetchContextualExplanation, fetchOptimalUsagePlan } from '../services/geminiService';
import { askThiago } from '../services/thiagoService';
import { getPricesForDay, getTodayDateMadrid } from '../services/esiosService';

// Components
import Splash from './Splash';
import { AnalizarView } from './HomeView';
import { LoadingView } from './LoadingView';
import { MiPanelView } from './DashboardView';
import { RecsView } from './RecsView';
import ThiagoChat from './ThiagoChat';
import { TabButton } from './common/TabButton';
import { IconHome, IconDashboard, IconSparkles } from './common/Icons';
import { SettingsModal } from './SettingsModal';
import { ExplanationModal } from './ExplanationModal';
import { InicioView } from './InicioView';
import { Header } from './common/Header'; // Importar el nuevo Header

type ViewState = 'splash' | 'app';
export type TabId = 'inicio' | 'panel' | 'optimizar' | 'thiago'; // Exportar TabId

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function App() {
  const [viewState, setViewState] = useState<ViewState>('splash');
  const [activeTab, setActiveTab] = useState<TabId>('inicio');

  // Data state
  const [invoiceFiles, setInvoiceFiles] = useState<InvoiceFile[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [analysis, setAnalysis] = useState<ComparativeAnalysis | null>(null);
  const [lastAnalysisSource, setLastAnalysisSource] = useState<'invoices' | 'manual' | null>(null);
  const [todayPrices, setTodayPrices] = useState<DayPriceAnalysis | null>(null);

  // UI states
  const [progress, setProgress] = useState(0);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [manualAnalysisError, setManualAnalysisError] = useState<string | null>(null);

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [explanationTopic, setExplanationTopic] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTodayPrices = async () => {
        try {
            const { data } = await getPricesForDay(getTodayDateMadrid());
            setTodayPrices(data);
        } catch (error) {
            console.error("Failed to fetch today's prices for Home view:", error);
        }
    };
    fetchTodayPrices();
  }, []);

  const processFile = async (file: File) => {
    const id = crypto.randomUUID();
    const newFile: InvoiceFile = { file, id, status: 'pending' };
    setInvoiceFiles(prev => [...prev, newFile]);

    try {
      setInvoiceFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'reading' } : f));
      const text = await extractTextFromPDF(file);
      if (!text || text.trim().length < 150) {
        throw new Error("PDF con poco texto o ilegible.");
      }

      setInvoiceFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'analyzing' } : f));
      
      const regexData = parseInvoiceText(text);
      let finalData = { ...regexData, rawText: text, id };

      if (!finalData.cups || !finalData.billingPeriod.from || !finalData.billingPeriod.to || !finalData.energySummary.totalKwh) {
          const aiData = await parseInvoiceWithAI(text);
          finalData = { ...finalData, ...aiData };
      }

      if (!finalData.cups || !finalData.billingPeriod.from || !finalData.billingPeriod.to) {
        throw new Error("Datos clave no encontrados.");
      }
      
      const isDuplicate = invoices.some(inv => inv.cups === finalData.cups && inv.billingPeriod.from === finalData.billingPeriod.from);
      if (isDuplicate) {
          setInvoiceFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'duplicate' } : f));
          return;
      }
      
      setInvoices(prev => [...prev, finalData]);
      setInvoiceFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'done' } : f));

    } catch (e: any) {
        console.error("Error processing file:", e);
        setInvoiceFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error' } : f));
    }
  };

  const handleAddFiles = useCallback(async (files: FileList) => {
    const totalFiles = files.length;
    setProgress(0);
    for (let i = 0; i < totalFiles; i++) {
        await processFile(files[i]);
        setProgress(((i + 1) / totalFiles) * 100);
    }
    await sleep(500);
    setProgress(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices]);

  const handleDeleteFile = useCallback((id: string) => {
    setInvoiceFiles(prev => prev.filter(f => f.id !== id));
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    if (invoices.length === 0) return;
    setIsLoadingAnalysis(true);
    try {
      const result = await fetchComparativeAnalysisWithAI(invoices);
      setAnalysis(result);
      setLastAnalysisSource('invoices');
      setActiveTab('panel');
    } catch (e) {
      console.error("Analysis failed:", e);
      setManualAnalysisError("La IA no pudo completar el análisis. Inténtalo de nuevo.");
      setActiveTab('panel');
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [invoices]);
  
  const handleManualAnalysis = useCallback(async (data: ManualData) => {
    setIsLoadingAnalysis(true);
    setManualAnalysisError(null);
    try {
        const fakeInvoice: InvoiceData = {
            id: 'manual-entry',
            provider: data.provider,
            tariff: data.tariff,
            cups: `ES00XXMANUAL${Math.floor(Math.random() * 10000)}`,
            billingPeriod: { from: 'N/A', to: 'N/A' },
            contractedPower: { p1: data.peakPowerKw, p2: data.offPeakPowerKw },
            consumptionByPeriodKwh: {},
            energySummary: { totalKwh: data.avgConsumptionKwh },
            rawText: `Manual entry: ${JSON.stringify(data)}`
        };
        const result = await fetchComparativeAnalysisWithAI([fakeInvoice]);
        if (result.estimatedAnnualSavingEur === 0 && result.costSimulations.length === 0) {
            throw new Error("La IA no pudo generar un análisis con los datos proporcionados.");
        }
        setAnalysis(result);
        setInvoices([fakeInvoice]);
        setLastAnalysisSource('manual');
        setActiveTab('panel');
    } catch (e: any) {
        console.error("Manual analysis failed:", e);
        setManualAnalysisError(e.message || "No se pudo generar el análisis. Revisa los datos e inténtalo de nuevo.");
    } finally {
        setIsLoadingAnalysis(false);
    }
  }, []);
  
  const handleRetryManualAnalysis = useCallback(() => {
    setManualAnalysisError(null);
  }, []);
  
  const handleNavigateHome = useCallback(() => {
    setAnalysis(null);
    setInvoices([]);
    setInvoiceFiles([]);
    setLastAnalysisSource(null);
    setManualAnalysisError(null);
    setActiveTab('panel');
  }, []);

  const handleExplain = useCallback((topic: string) => {
    setExplanationTopic(topic);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <InicioView invoiceCount={invoices.length} onStart={() => setActiveTab('panel')} onOpenSettings={() => setIsSettingsOpen(true)} onOpenThiago={() => setActiveTab('thiago')} todayPrices={todayPrices} />;
      case 'panel':
        return analysis ? (
          <MiPanelView
            analysis={analysis}
            invoices={invoices}
            onNavigateHome={handleNavigateHome}
            onExplain={handleExplain}
            lastAnalysisSource={lastAnalysisSource}
            onOpenThiago={() => setActiveTab('thiago')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            fetchHiringGuide={async () => ({ documentChecklist: [], talkingPoints: [], watchOutFor: []})}
            fetchConsumptionTrendAnalysis={async () => "Análisis de consumo en desarrollo."}
          />
        ) : (
          <AnalizarView
            invoiceFiles={invoiceFiles}
            invoices={invoices}
            onFiles={handleAddFiles}
            onDelete={handleDeleteFile}
            onStartAnalysis={handleStartAnalysis}
            onManualAnalysis={handleManualAnalysis}
            onRetryManualAnalysis={handleRetryManualAnalysis}
            onOpenSettings={() => setIsSettingsOpen(true)}
            progress={progress}
            manualAnalysisError={manualAnalysisError}
          />
        );
      case 'optimizar':
        return <RecsView onExplain={handleExplain} fetchOptimalUsagePlan={fetchOptimalUsagePlan} />;
      case 'thiago':
        return <ThiagoChat onClose={() => setActiveTab(analysis ? 'panel' : 'inicio')} lastAnalysisSource={lastAnalysisSource} />;
      default:
        return <InicioView invoiceCount={invoices.length} onStart={() => setActiveTab('panel')} onOpenSettings={() => setIsSettingsOpen(true)} onOpenThiago={() => setActiveTab('thiago')} todayPrices={todayPrices} />;
    }
  };

  if (viewState === 'splash') {
    return <Splash onStart={() => setViewState('app')} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col bg-[#F7F7F7]">
      {isLoadingAnalysis ? (
        <LoadingView />
      ) : (
        <>
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 w-full flex flex-col px-4 sm:px-6 lg:px-8 pt-4 pb-24 lg:pb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Bottom navigation for mobile/tablet */}
          <nav className="sticky bottom-0 left-0 right-0 mt-auto bg-[#FCFCFD]/80 backdrop-blur-sm z-30 border-t border-gray-100 lg:hidden">
            <div style={{ paddingBottom: `calc(env(safe-area-inset-bottom, 0px))` }} className="w-full flex justify-around">
              <TabButton label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} icon={<IconHome className="w-6 h-6" />} />
              <TabButton label="Panel" active={activeTab === 'panel'} onClick={() => setActiveTab('panel')} icon={<IconDashboard className="w-6 h-6" />} />
              <TabButton label="Optimizar" active={activeTab === 'optimizar'} onClick={() => setActiveTab('optimizar')} icon={<IconSparkles className="w-6 h-6" />} />
              <TabButton
                label="Thiago"
                active={activeTab === 'thiago'}
                onClick={() => setActiveTab('thiago')}
                icon={
                  <img
                    src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
                    alt="Thiago"
                    className={`w-9 h-9 rounded-full object-cover transition-all ${activeTab === 'thiago' ? "ring-2 ring-[#0F172A]/10" : "opacity-70"}`}
                  />
                }
              />
            </div>
          </nav>
        </>
      )}

      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        {explanationTopic && <ExplanationModal topic={explanationTopic} onClose={() => setExplanationTopic(null)} fetchExplanation={fetchContextualExplanation} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
