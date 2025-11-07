import React from 'react';

interface LogoProps {
    variant?: 'inline' | 'stacked';
    size?: number;
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'stacked', size = 48, className }) => {
    const textStyle: React.CSSProperties = {
        fontSize: Math.max(12, size / 2.2),
    };

    return (
        <div className={`flex items-center gap-2 ${variant === 'stacked' ? 'flex-col' : 'flex-row'} ${className}`}>
            <img 
                src="https://storage.googleapis.com/mejorluz-assets-public-2025/logo.png" 
                alt="Logo MiMejorLuz" 
                style={{ height: size, width: 'auto' }}
            />
        </div>
    );
};