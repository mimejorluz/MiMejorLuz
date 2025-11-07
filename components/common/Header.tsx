import React from 'react';
import { Logo } from './Logo';
import { NavLink } from './NavLink';
import type { TabId } from '../App'; // Asumiendo que TabId está exportado desde App.tsx

interface HeaderProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
    return (
        <header className="hidden lg:flex sticky top-0 z-40 items-center justify-between w-full h-16 bg-[#F7F7F7]/80 backdrop-blur-sm border-b border-gray-200/80 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
                <div onClick={() => setActiveTab('inicio')} className="cursor-pointer">
                    <Logo size={32} />
                </div>
                <div className="flex items-center gap-2">
                    <NavLink label="Inicio" isActive={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
                    <NavLink label="Panel de Análisis" isActive={activeTab === 'panel'} onClick={() => setActiveTab('panel')} />
                    <NavLink label="Optimizar Consumo" isActive={activeTab === 'optimizar'} onClick={() => setActiveTab('optimizar')} />
                </div>
            </div>
            <div className="flex items-center">
                <button 
                    onClick={() => setActiveTab('thiago')}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full hover:bg-gray-200/70 transition-colors"
                >
                    <span className="text-sm font-medium text-gray-700">Thiago</span>
                     <img
                        src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
                        alt="Thiago"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                </button>
            </div>
        </header>
    );
};
