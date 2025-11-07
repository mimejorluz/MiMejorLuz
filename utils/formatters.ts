import type { BillingPeriod } from '../types';

export function fmtNum(n?: number, unit?: string, fractionDigits = 3): string {
    if (typeof n !== 'number' || Number.isNaN(n)) return '—';
    const s = n.toLocaleString('es-ES', { 
        maximumFractionDigits: fractionDigits 
    });
    return unit ? `${s} ${unit}` : s;
}

export function periodoToText(p?: BillingPeriod): string {
    if (!p?.from && !p?.to) return '—';
    return [p?.from, p?.to].filter(Boolean).join(' → ');
}

export const hh = (n: number): string => String(n).padStart(2, '0');

export const formatHour = (iso: string): string => {
    if (!iso || typeof iso !== 'string') return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return hh(d.getHours()) + ':' + hh(d.getMinutes());
};