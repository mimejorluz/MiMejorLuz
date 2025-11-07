import React from 'react';
import { motion } from 'framer-motion';
import { IconUser, IconLogOut, IconChevronRight, IconSettings, IconHome } from './common/Icons';
import { Logo } from './common/Logo';

const ProfileItem: React.FC<{ icon: React.ReactNode; label: string; value?: string; onClick?: () => void }> = ({ icon, label, value, onClick }) => (
    <motion.div
        whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)'}}
        className="flex items-center gap-4 p-4 rounded-lg cursor-pointer bg-white transition-colors"
        onClick={onClick}
    >
        <div className="text-gray-500">{icon}</div>
        <div className="flex-1">
            <p className="font-semibold text-gray-800">{label}</p>
        </div>
        {value && <p className="text-sm text-gray-500">{value}</p>}
        <IconChevronRight className="w-5 h-5 text-gray-400" />
    </motion.div>
);


export const ProfileView: React.FC = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="bg-white p-5 flex flex-col items-center text-center rounded-xl">
                <div className="w-20 h-20 rounded-full bg-gray-200 grid place-items-center mb-3">
                    <IconUser className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">Usuario Anónimo</h3>
                <p className="text-sm text-gray-500">Miembro desde {new Date().getFullYear()}</p>
            </div>

            <div className="space-y-2">
                 <ProfileItem icon={<IconHome className="w-5 h-5" />} label="Mi CUPS" value="ES00...1A2B" />
                 <ProfileItem icon={<IconSettings className="w-5 h-5" />} label="Ajustes de la cuenta" />
            </div>

            <div className="space-y-2">
                 <ProfileItem icon={<IconLogOut className="w-5 h-5" />} label="Cerrar Sesión" />
            </div>

            <div className="text-center text-xs text-gray-400 pt-4 flex flex-col items-center">
                <Logo variant="inline" size={24} />
                <p className="mt-1">Versión 1.0.0-beta</p>
            </div>
        </motion.div>
    );
};