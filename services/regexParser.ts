import type { InvoiceData } from '../types';

const providerList = ["Repsol","Endesa","Iberdrola","Naturgy","TotalEnergies","Holaluz","Acciona","EDP","Octopus","Baser","CHC","Factorenergia","Lucera"];
const RX = (flags: string) => (s: TemplateStringsArray, ...args: any[]) => new RegExp(String.raw(s, ...args), flags);
const rxi = RX('i');
const periodoRegex = rxi`(?:Periodo(?:\s+de\s+Facturaci[óo]n)?|Periodo)[:\s]*(?:del\s*)?([0-3]?\d[\/.\-][01]?\d[\/.\-](?:\d{2}|\d{4}))\s*(?:a|al|–|-)\s*([0-3]?\d[\/.\-][01]?\d[\/.\-](?:\d{2}|\d{4}))`;
const totalImporteRegex = rxi`(IMPORTE\s+A\s+PAGAR|Importe\s+a\s+pagar|Total\s+(?:importe\s+)?a\s+pagar)[^\d]*(\d+[\.,]?\d*)\s*€?`;
const totalFacturaRegex = rxi`(Total\s+factura|Total\s+importe\s+factura)[^\d]*(\d+[\.,]?\d*)\s*€`;
const totalEnergiaRegex = new RegExp("(Total\\s+energ[ií]a|Energ[ií]a\\s+total)[^\\d]*(\\d+[\\.,]?\\d*)\\s*€", "i");
const totalKwhRegex = rxi`(Consumo\s+(?:total|en\s+este\s+periodo|del\s+periodo)|Energ[ií]a\s+(?:consumida|facturada))[^\d]*(\d+[\.,]?\d*)\s*kWh`;

const normalizeNumber = (s?: string) => (s ? Number(s.replace(/\./g, "").replace(/\s/g, '').replace(",", ".")) : undefined);
const within = (text: string, anchor: number, radius = 240) => text.slice(Math.max(0, anchor - radius), Math.min(text.length, anchor + radius));

function parseProvider(text: string): string | undefined { return providerList.find((p) => new RegExp(p, 'i').test(text)); }
function parseCUPS(text: string): string | undefined {
    const idx = text.toLowerCase().indexOf("cups");
    if (idx >= 0) { const win = within(text, idx, 160); const m = win.match(new RegExp("ES[0-9]{2}[0-9A-Z]{16,22}", "i"))?.[0]; if (m) return m.toUpperCase(); }
    const inUrl = text.match(new RegExp("cups=\\s*(ES[0-9]{2}[0-9A-Z]{16,22})", "i"))?.[1];
    if (inUrl) return inUrl.toUpperCase();
    const linear = text.replace(/[\s-]/g, "");
    const g = linear.match(new RegExp("ES[0-9]{2}[0-9A-Z]{16,22}", "i"))?.[0];
    return g ? g.toUpperCase() : undefined;
}
function parseBillingPeriod(text: string): InvoiceData['billingPeriod'] {
    let m = text.match(periodoRegex);
    if (m) { const [, from, to] = m; return { from, to }; }
    return {};
}
function parseConsumptionByPeriod(text: string): InvoiceData["consumptionByPeriodKwh"] {
    const out: InvoiceData["consumptionByPeriodKwh"] = {};
    const puntaK = text.match(/P1[^\d]{0,60}(\d+[\.,]?\d*)\s*kWh|Punta[^\d]{0,60}(\d+[\.,]?\d*)\s*kWh/i)?.[1];
    const llanoK = text.match(/P2[^\d]{0,60}(\d+[\.,]?\d*)\s*kWh|Llano[^\d]{0,60}(\d+[\.,]?\d*)\s*kWh/i)?.[1];
    const valleK = text.match(/P3[^\d]{0,60}(\d+[\.,]?\d*)\s*kWh|Valle[^\d]{0,60}(\d+[\.,]?\d*)\s*kWh/i)?.[1];
    if (puntaK) out.p1 = normalizeNumber(puntaK);
    if (llanoK) out.p2 = normalizeNumber(llanoK);
    if (valleK) out.p3 = normalizeNumber(valleK);
    return out;
}
function parseTotals(text: string): InvoiceData['energySummary'] {
    const energySubtotal = normalizeNumber(text.match(totalEnergiaRegex)?.[2]);
    const gross = energySubtotal ?? normalizeNumber(text.match(totalFacturaRegex)?.[2]);
    const due = normalizeNumber(text.match(totalImporteRegex)?.[2]);
    let totalKwh = normalizeNumber(text.match(totalKwhRegex)?.[2]);
    if (totalKwh == null) {
        const byP = parseConsumptionByPeriod(text);
        const nums = [byP.p1, byP.p2, byP.p3].filter((n): n is number => typeof n === 'number' && !Number.isNaN(n));
        const sum = nums.reduce((a,b)=>a+b, 0);
        if (sum > 0) totalKwh = Number(sum.toFixed(3));
    }
    return { totalAmountEur: due, grossAmountEur: gross, amountDueEur: due, totalKwh };
}
function parseServicesFallback(text: string): number | undefined {
    const servicesRegex = rxi`(Servicios|Alquiler de Equipos|Endesa X)[^\n]{0,140}?(\d+[\.,]?\d*)\s*€`;
    const m = text.match(servicesRegex);
    if (m?.[2]) return normalizeNumber(m[2]);
    return undefined;
}
function parseBonusSocial(text: string): number | undefined {
    const m = text.match(/Bono\s+Social[^-\d\n]*(-?\d+[\.,]\d*)/i);
    // The amount is a discount, so it appears negative. We return it as a positive saving.
    return m?.[1] ? Math.abs(normalizeNumber(m[1]) ?? 0) : undefined;
}
function parseCompensation(text: string): number | undefined {
    const m = text.match(/(?:Compensaci[oó]n\s+simplificada\s+de\s+excedentes|Compensaci[oó]n\s+excedentes)[^-\d\n]*(-?\d+[\.,]\d*)/i);
    // This is a discount, so we return the absolute value.
    return m?.[1] ? Math.abs(normalizeNumber(m[1]) ?? 0) : undefined;
}
function parseVirtualBattery(text: string): number | undefined {
    const m = text.match(/Bater[ií]a\s+Virtual[^-\d\n]*(-?\d+[\.,]\d*)/i);
    // This is a saving, so we return the absolute value.
    return m?.[1] ? Math.abs(normalizeNumber(m[1]) ?? 0) : undefined;
}
function parseTariff(text: string): string | undefined {
    if (/pvpc/i.test(text)) return 'PVPC';
    const m = text.match(/(?:Tarifa|Peaje\s+de\s+acceso|Contrato\s+de\s+acceso)\s*:\s*([^\n\r]+)/i);
    if (m?.[1]) {
        const tariffName = m[1].trim();
        if (/2\.0\s?TD/i.test(tariffName)) return '2.0TD';
        if (/(fija|plana|estable|única)/i.test(tariffName)) return 'Tarifa Fija';
        if (tariffName.length > 2) return tariffName.substring(0, 30); // Return a snippet
    }
    // Fallback to original logic if the more specific one fails
    if (/Única|Fija|Estable/i.test(text)) return 'Fija/Estable';
    const tdMatch = text.match(/2\.0\s?TD|3\.0\s?TD/i);
    return tdMatch?.[0]?.toUpperCase();
}

export function parseInvoiceText(text: string): InvoiceData {
  return {
    id: crypto.randomUUID(),
    provider: parseProvider(text),
    tariff: parseTariff(text),
    cups: parseCUPS(text),
    billingPeriod: parseBillingPeriod(text),
    servicesAmountEur: parseServicesFallback(text),
    bonusSocialEur: parseBonusSocial(text),
    compensationTotalEur: parseCompensation(text),
    virtualBatterySavingEur: parseVirtualBattery(text),
    invoiceNumber: 'N/A',
    contractedPower: {},
    consumptionByPeriodKwh: parseConsumptionByPeriod(text),
    energySummary: parseTotals(text),
    rawText: text
  };
}