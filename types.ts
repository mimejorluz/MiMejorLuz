// types.ts

export type BillingPeriod = {
    from?: string;
    to?: string;
};

export type ContractedPower = {
    p1?: number; // Punta
    p2?: number; // Llano/Valle
};

export type ConsumptionByPeriod = {
    p1?: number; // Punta
    p2?: number; // Llano
    p3?: number; // Valle
};

export type EnergySummary = {
    amountDueEur?: number;
    grossAmountEur?: number; // Sometimes available, useful for calcs
    totalAmountEur?: number;
    totalKwh?: number;
};

export type InvoiceData = {
    id: string; // Internal UUID for the file
    provider?: string;
    tariff?: string;
    cups?: string;
    billingPeriod: BillingPeriod;
    invoiceNumber?: string;
    servicesAmountEur?: number;
    bonusSocialEur?: number;
    compensationTotalEur?: number; // Excedentes
    virtualBatterySavingEur?: number;
    contractedPower: ContractedPower;
    // FIX: Corrected undefined type 'ConsumptionByPeriodKwh' to the defined 'ConsumptionByPeriod'.
    consumptionByPeriodKwh: ConsumptionByPeriod;
    energySummary: EnergySummary;
    rawText: string;
};

export type ProcessingStatus = 'pending' | 'reading' | 'analyzing' | 'done' | 'error' | 'duplicate';

export type InvoiceFile = {
    file: File;
    id: string;
    status: ProcessingStatus;
};

export type PowerAnalysis = {
    currentPowerKw: number;
    recommendedPowerKw: number;
    annualSavingsEur: number;
    analysisSummary: string;
};

export type CostSimulation = {
    tariffName: string;
    providerName: string;
    averageMonthlyCostEur: number;
    isGreen: boolean;
    hasPermanence: boolean;
    priceType: 'Fijo' | 'Indexado';
};

export type ComparativeAnalysis = {
    estimatedAnnualSavingEur: number;
    bestTariffRecommendation: string;
    bestProviderRecommendation: string;
    averageCostEur: number;
    costSimulations: CostSimulation[];
    powerAnalysis?: PowerAnalysis;
};

export type HiringGuide = {
    documentChecklist: string[];
    talkingPoints: string[];
    watchOutFor: string[];
    hiringUrl?: string;
};

// For PVPC price analysis
export type PricePoint = {
    time: string; // ISO 8601
    priceEurKWh: number;
};

export type BestWindow = {
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    averagePriceEurKWh: number;
    explanation: string;
};

export type DayPriceAnalysis = {
    date: string; // YYYY-MM-DD
    points: PricePoint[];
    averagePriceEurKWh: number;
    bestHour: PricePoint;
    worstHour: PricePoint;
    bestWindow: BestWindow;
    co2Analysis: string;
    actionableTips: string[];
};

// For esiosService
export type DailyPricesResponse = Omit<DayPriceAnalysis, 'date' | 'bestHour' | 'worstHour' | 'bestWindow'> & {
    date: string | number;
    createdAt: number;
    bestHour: { time: string, priceEurKWh: number };
    worstHour: { time: string, priceEurKWh: number };
    bestWindow: { startTime: string, endTime: string, averagePriceEurKWh: number, explanation: string };
};

export type Tariff = {
    id: string;
    name: string;
    type: 'fijo' | 'indexado' | 'plana';
    isActive: boolean;
    priceDetails: any; // Can be complex
    conditions?: string;
};

export type Provider = {
    id: string;
    name: string;
    logoUrl?: string;
    websiteUrl?: string;
    tariffs: Tariff[];
};

export type Appliance = 'Lavadora' | 'Lavavajillas' | 'Horno' | 'Coche eléctrico' | 'Secadora' | 'Termo eléctrico' | 'Vitrocerámica' | 'Radiador eléctrico' | 'Otros consumos altos';

export type OptimalUsagePlan = {
    optimalSchedule: {
        appliance: string;
        recommendedTime: string;
    }[];
    estimatedCostEur: number;
    peakCostComparisonEur: number;
    savingsPercentage: number;
    summary: string;
};

export type ManualData = {
    provider: string;
    tariff: string;
    avgConsumptionKwh: number;
    peakPowerKw: number;
    offPeakPowerKw?: number;
    province?: string;
};