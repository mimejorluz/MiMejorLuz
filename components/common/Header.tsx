import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { NavLink } from './NavLink';
import type { TabId } from '../App';

interface HeaderProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
    return (
        <header className="hidden lg:flex sticky top-0 z-40 items-center justify-between w-full h-16 bg-[#F7F7F7]/90 backdrop-blur-xl border-b border-gray-200/50 px-4 sm:px-6 lg:px-8 shadow-sm">
            <div className="flex items-center gap-8">
                <motion.div
                    onClick={() => setActiveTab('inicio')}
                    className="cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Logo size={32} />
                </motion.div>
                <nav className="flex items-center gap-1">
                    <NavLink label="Inicio" isActive={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
                    <NavLink label="Panel de Análisis" isActive={activeTab === 'panel'} onClick={() => setActiveTab('panel')} />
                    <NavLink label="Optimizar Consumo" isActive={activeTab === 'optimizar'} onClick={() => setActiveTab('optimizar')} />
                </nav>
            </div>
            <div className="flex items-center">
                <motion.button
                    onClick={() => setActiveTab('thiago')}
                    className="flex items-center gap-2 pl-4 pr-3 py-2 rounded-full bg-white/50 hover:bg-white/80 border border-gray-200/50 transition-all shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-sm font-semibold text-[#1D1D1F]">Thiago</span>
                    <motion.img
                        src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
                        alt="Thiago"
                        className="w-9 h-9 rounded-full object-cover border border-gray-100"
                        whileHover={{ scale: 1.1 }}
                    />
                </motion.button>
            </div>
        </header>
    );
};
