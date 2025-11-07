import React from 'react';

interface InfoProps {
    label: string;
    value?: string | number | null;
}

export const Info: React.FC<InfoProps> = ({ label, value }) => {
    return (
        <div className="rounded-lg p-3 bg-[#F0F0F2] h-full">
            <div className="text-[11px] text-gray-500">{label}</div>
            <div className={`text-sm text-[#2A2A2D]`}>{value ?? "—"}</div>
        </div>
    );
};
