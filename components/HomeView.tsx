import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvoiceFile, InvoiceData, ManualData, ProcessingStatus } from '../types';
import { IconDocument, IconTrash, IconSettings, IconBolt } from './common/Icons';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const statusMap: Record<ProcessingStatus, { text: string; color: string; icon: string; }> = {
    pending: { text: 'Pendiente', color: 'text-gray-500', icon: '🕒' },
    reading: { text: 'Leyendo...', color: 'text-blue-500', icon: '📖' },
    analyzing: { text: 'Analizando...', color: 'text-purple-500', icon: '🧠' },
    done: { text: 'OK', color: 'text-green-600', icon: '✅' },
    error: { text: 'Error', color: 'text-red-500', icon: '❌' },
    duplicate: { text: 'Duplicado', color: 'text-yellow-600', icon: '⚠️' }
};

const FileItem: React.FC<{ item: InvoiceFile; onDelete: (id: string) => void }> = ({ item, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100"
    >
        <div className="text-gray-400"><IconDocument className="w-6 h-6" /></div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.file.name}</p>
            <p className="text-xs text-gray-500">{formatBytes(item.file.size)}</p>
        </div>
        <div className={`text-xs font-semibold ${statusMap[item.status].color} flex items-center gap-1`}>
            <span>{statusMap[item.status].icon}</span> {statusMap[item.status].text}
        </div>
        <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50/50 transition-colors">
            <IconTrash className="w-4 h-4" />
        </button>
    </motion.div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ReactNode; }> = ({ label, name, icon, className, ...props }) => {
    const inputId = name ? `form-input-${name}` : undefined;
    const hasIcon = !!icon;

    return (
        <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-[#6E6E73] mb-1.5">{label}</label>
            <div className="relative">
                {hasIcon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    name={name}
                    {...props}
                    className={`w-full bg-white border border-[#E5E5EA] rounded-lg py-2.5 text-sm placeholder:text-[#AEAEB2] focus:ring-2 focus:ring-offset-1 focus:ring-[#FFC700] focus:outline-none transition-shadow ${hasIcon ? 'pl-10 pr-3' : 'px-3'} ${className || ''}`}
                />
            </div>
        </div>
    );
};

const ManualEntryForm: React.FC<{ onManualAnalysis: (data: ManualData) => void; }> = ({ onManualAnalysis }) => {
    const [data, setData] = useState<Partial<ManualData>>({
        provider: '',
        tariff: '',
        avgConsumptionKwh: 250,
        peakPowerKw: 4.6,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors(prev => ({...prev, [e.target.name]: ''}));
        }
    };

    const handleNumericBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value) {
            const numericValue = value.replace(',', '.');
            const parsed = parseFloat(numericValue);
            if (!isNaN(parsed)) {
                setData(prev => ({ ...prev, [name]: Number(parsed.toFixed(2)) }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onManualAnalysis(data as ManualData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <FormInput 
                label="Comercializadora"
                type="text"
                name="provider"
                value={data.provider || ''}
                onChange={handleChange}
                placeholder="Ej: Endesa, Iberdrola…"
                autoComplete="organization"
                icon={<IconBolt className="w-4 h-4 text-[#FFC700]" />}
                list="providers-list"
                className="focus:scroll-mb-[120px]"
            />
            <datalist id="providers-list">
                <option value="Endesa" />
                <option value="Iberdrola" />
                <option value="Naturgy" />
                <option value="Repsol" />
                <option value="Holaluz" />
                <option value="TotalEnergies" />
            </datalist>

            <FormInput 
                label="Tarifa" 
                type="text" 
                name="tariff" 
                value={data.tariff || ''} 
                onChange={handleChange} 
                placeholder="Ej: 2.0TD, One Luz…" 
                autoComplete="off"
                list="tariffs-list"
                className="focus:scroll-mb-[120px]"
            />
             <datalist id="tariffs-list">
                <option value="2.0TD" />
                <option value="PVPC" />
                <option value="Plan Estable" />
                <option value="One Luz" />
                <option value="Tarifa Plana" />
            </datalist>

            <FormInput 
                label="Consumo mensual medio (kWh)" 
                type="text" 
                name="avgConsumptionKwh" 
                value={data.avgConsumptionKwh || ''} 
                onChange={handleChange}
                onBlur={handleNumericBlur} 
                placeholder="Ej: 250" 
                inputMode="decimal" 
                pattern="[0-9]*[.,]?[0-9]*" 
                autoComplete="off"
                className="focus:scroll-mb-[120px]"
            />
            <div className="grid grid-cols-2 gap-3">
                <FormInput 
                    label="Potencia Punta (kW)" 
                    type="text" 
                    name="peakPowerKw" 
                    step="0.1" 
                    value={data.peakPowerKw || ''} 
                    onChange={handleChange}
                    onBlur={handleNumericBlur} 
                    placeholder="Ej: 4.6" 
                    inputMode="decimal" 
                    pattern="[0-9]*[.,]?[0-9]*" 
                    autoComplete="off"
                    className="focus:scroll-mb-[120px]"
                />
                <FormInput 
                    label="Potencia Valle (kW)" 
                    type="text" 
                    name="offPeakPowerKw" 
                    step="0.1" 
                    value={data.offPeakPowerKw || ''} 
                    onChange={handleChange}
                    onBlur={handleNumericBlur} 
                    placeholder="(opcional)" 
                    inputMode="decimal" 
                    pattern="[0-9]*[.,]?[0-9]*" 
                    autoComplete="off"
                    className="focus:scroll-mb-[120px]"
                />
            </div>
            <p className="text-center text-xs text-[#AEAEB2] pt-2">También puedes subir las facturas cuando las tengas.</p>
        </form>
    );
};

const FileUploadView: React.FC<{
    invoiceFiles: InvoiceFile[];
    doneFilesCount: number;
    onFiles: (files: FileList) => void;
    onDelete: (id: string) => void;
    isDragging: boolean;
    dragHandlers: {
        onDragEnter: (e: React.DragEvent) => void;
        onDragLeave: (e: React.DragEvent) => void;
        onDragOver: (e: React.DragEvent) => void;
        onDrop: (e: React.DragEvent) => void;
    };
    fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ invoiceFiles, doneFilesCount, onFiles, onDelete, isDragging, dragHandlers, fileInputRef }) => {
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) onFiles(e.target.files);
    };
    
    const getHelperText = () => {
        if (doneFilesCount < 3) {
            const needed = 3 - doneFilesCount;
            return `Sube ${needed} factura${needed > 1 ? 's' : ''} más para analizar (mín. 3).`;
        }
        if (doneFilesCount > 12) {
            const extra = doneFilesCount - 12;
            return `Has subido ${extra} de más. Elimina alguna para continuar (máx. 12).`;
        }
        return `¡Perfecto! Con ${doneFilesCount} facturas podemos hacer un análisis detallado.`;
    };

    return (
        <div className="flex flex-col h-full p-1">
            <div
                {...dragHandlers}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center min-h-[180px] p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragging ? 'border-[#FFC700] bg-[#FFC700]/10' : 'border-[#E5E5EA] bg-white'}`}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept=".pdf,application/pdf" className="hidden" />
                <div className="w-12 h-12 grid place-items-center bg-white rounded-full shadow-sm mb-3 border border-black/5">
                    <IconDocument className="w-6 h-6 text-[#AEAEB2]" />
                </div>
                <p className="font-semibold text-sm text-[#1D1D1F]">Arrastra tus facturas PDF aquí</p>
                <p className="text-xs text-[#6E6E73]">o haz clic para seleccionarlas</p>
            </div>

            <div className="mt-4 flex-1 space-y-2 min-h-[120px]">
                <AnimatePresence>
                    {invoiceFiles.map(f => <FileItem key={f.id} item={f} onDelete={onDelete} />)}
                </AnimatePresence>
                {invoiceFiles.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-[#AEAEB2]">Sube entre 3 y 12 facturas para empezar.</p>
                    </div>
                )}
            </div>

            {doneFilesCount > 0 && (
                 <div className="text-center text-xs text-gray-500 py-2 border-t border-[#E4E4E7] mt-2">
                    {getHelperText()}
                </div>
            )}
        </div>
    );
};

const ContextCard: React.FC = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-start sm:items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-[#E5E5EA] grid place-items-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="var(--accent-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <div>
            <h2 className="font-semibold text-[#1D1D1F]">¿Cómo quieres que te ayude?</h2>
            <p className="text-xs text-[#6E6E73] leading-tight mt-0.5">Puedes subir tus facturas o escribir los datos básicos. Si los escribes a mano, Thiago te sugerirá subir una factura para afinar.</p>
        </div>
    </div>
);

interface AnalizarViewProps {
    invoiceFiles: InvoiceFile[];
    invoices: InvoiceData[];
    onFiles: (files: FileList) => void;
    onDelete: (id: string) => void;
    onStartAnalysis: () => void;
    onManualAnalysis: (data: ManualData) => void;
    onOpenSettings: () => void;
    onRetryManualAnalysis: () => void;
    manualAnalysisError: string | null;
    progress: number;
}

export const AnalizarView: React.FC<AnalizarViewProps> = ({ invoiceFiles, invoices, onFiles, onDelete, onStartAnalysis, onManualAnalysis, onOpenSettings, manualAnalysisError, onRetryManualAnalysis, progress }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const dragHandlers = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFiles(e.dataTransfer.files);
                setActiveTab('upload');
            }
        },
    };

    const doneFilesCount = useMemo(() => invoices.length, [invoices]);
    const canStartAnalysis = useMemo(() => doneFilesCount >= 3 && doneFilesCount <= 12, [doneFilesCount]);

    const buttonText = useMemo(() => {
        if (activeTab === 'manual') return 'Analizar mis datos';
        
        if (doneFilesCount === 0) {
            return 'Sube entre 3 y 12 facturas';
        }
        if (doneFilesCount < 3) {
            const needed = 3 - doneFilesCount;
            return `Sube ${needed} más para analizar`;
        }
        if (doneFilesCount > 12) {
            const extra = doneFilesCount - 12;
            return `Elimina ${extra} para continuar`;
        }
        // This is for 3 <= doneFilesCount <= 12
        return `Analizar ${doneFilesCount} factura${doneFilesCount > 1 ? 's' : ''}`;
    }, [activeTab, doneFilesCount]);

    return (
        <div className="flex flex-col h-full">
            <header className="shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Tu Espacio de Análisis</h1>
                        <p className="text-sm text-[#6E6E73]">Genera tu panel de ahorro personalizado.</p>
                    </div>
                    <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <IconSettings className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
                <ContextCard />

                <div className="relative flex items-center bg-[#E5E5EA] p-1 rounded-full m-1 shrink-0">
                    <motion.div
                        className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm"
                        animate={{ left: activeTab === 'upload' ? '4px' : '50%', right: activeTab === 'manual' ? '4px' : '50%' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                    <button type="button" onClick={() => setActiveTab('upload')} className={`relative flex-1 py-2 text-sm font-semibold rounded-full z-10 transition-colors duration-200 h-9 ${activeTab === 'upload' ? 'text-[#1D1D1F]' : 'text-[#6E6E73]'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A3B70]/50`}>Subir facturas</button>
                    <button type="button" onClick={() => setActiveTab('manual')} className={`relative flex-1 py-2 text-sm font-semibold rounded-full z-10 transition-colors duration-200 h-9 ${activeTab === 'manual' ? 'text-[#1D1D1F]' : 'text-[#6E6E73]'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A3B70]/50`}>Introducir datos</button>
                </div>

                <div className="mt-3">
                    <div className={`${activeTab === 'upload' ? 'block' : 'hidden'}`}>
                        <FileUploadView 
                            invoiceFiles={invoiceFiles}
                            doneFilesCount={doneFilesCount}
                            onFiles={onFiles}
                            onDelete={onDelete}
                            isDragging={isDragging}
                            dragHandlers={dragHandlers}
                            fileInputRef={fileInputRef}
                        />
                    </div>
                    <div className={`${activeTab === 'manual' ? 'block' : 'hidden'}`}>
                        {manualAnalysisError ? (
                            <motion.div 
                                className="p-4 bg-red-50 text-red-800 rounded-xl text-center flex flex-col justify-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <p className="font-semibold">Error en el análisis</p>
                                <p className="text-sm mt-1">{manualAnalysisError}</p>
                                <button
                                    onClick={onRetryManualAnalysis}
                                    className="mt-4 mx-auto text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                                >
                                    Reintentar
                                </button>
                            </motion.div>
                        ) : (
                            // FIX: Pass the 'onManualAnalysis' prop from AnalizarView's props instead of the undefined 'handleManualSubmit'.
                            <ManualEntryForm onManualAnalysis={onManualAnalysis} />
                        )}
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0 bg-[#F7F7F7]/95 backdrop-blur-sm pt-3 px-4 sm:px-6 lg:px-8 border-t border-gray-200/80"
                 style={{paddingBottom: `calc(env(safe-area-inset-bottom, 12px) + 12px)`}}
            >
                <motion.button
                    onClick={activeTab === 'upload' ? onStartAnalysis : () => {
                        const form = document.querySelector('form');
                        form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }}
                    disabled={(activeTab === 'upload' && !canStartAnalysis)}
                    className="w-full min-h-[52px] bg-[var(--accent-main)] text-[var(--text-main)] rounded-xl text-base font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A3B70]/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {buttonText}
                </motion.button>
            </div>
        </div>
    );
};