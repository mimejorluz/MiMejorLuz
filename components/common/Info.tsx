import React from 'react';

interface InfoProps {
    label: string;
    value?: string | number | null;
}

export const Info: React.FC<InfoProps> = ({ label, value }) => {
    return (
        <div className="rounded-lg p-4 bg-gray-50 border border-gray-100 h-full hover:border-gray-200 transition-all">
            <div className="text-[11px] font-semibold text-[#5E5E63] uppercase tracking-wide">{label}</div>
            <div className="text-sm font-semibold text-[#1D1D1F] mt-1">{value ?? "—"}</div>
        </div>
    );
};
