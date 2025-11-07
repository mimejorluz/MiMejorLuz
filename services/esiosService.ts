// services/esiosService.ts
import type { DayPriceAnalysis, DailyPricesResponse, Provider } from "../types";
import { getTodayDateMadrid, getTomorrowDateMadrid, getYesterdayDateMadrid } from "../utils/date";

const API_BASE: string = (typeof window !== "undefined" && (window as any).MML_API_BASE) || "https://europe-west1-mimejorluz-v1.cloudfunctions.net";

/**
 * CACHE CONFIGURATION
 * ======================
 * - MML_CACHE_PREFIX: Prevents conflicts in localStorage.
 * - MEMORY_TTL_MS: How long data stays fresh in memory (5 mins).
 * - LOCAL_TTL_MS: How long data stays fresh in localStorage (2 hours).
 */
const MML_CACHE_PREFIX = "mml:prices:";
const MEMORY_TTL_MS = 5 * 60 * 1000;
const LOCAL_TTL_MS = 2 * 60 * 60 * 1000;

type CacheSource = 'memory' | 'localstorage' | 'network';
type CacheEntry = { data: DayPriceAnalysis; ts: number };
const memoryCache = new Map<string, CacheEntry>();
let hasPrefetched = false;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url: string, init?: RequestInit, tries = 3): Promise<Response> {
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const res = await fetch(url, { method: "GET", ...init });
      if (!res.ok && res.status >= 500 && attempt < tries - 1) {
        await sleep(250 * (attempt + 1));
        continue;
      }
      return res;
    } catch (e) {
      if (attempt >= tries - 1) throw e;
      await sleep(250 * (attempt + 1));
    }
  }
  throw new Error("Failed to fetch after multiple retries");
}

function normalizeDaily(data: DailyPricesResponse): DayPriceAnalysis {
    // This ensures that any unexpected API response format is corrected before use.
    return {
        date: String(data.date),
        points: (data.points || []).map(p => ({ time: String(p.time), priceEurKWh: Number(p.priceEurKWh) })),
        averagePriceEurKWh: Number(data.averagePriceEurKWh),
        bestHour: { time: String(data.bestHour?.time), priceEurKWh: Number(data.bestHour?.priceEurKWh) },
        worstHour: { time: String(data.worstHour?.time), priceEurKWh: Number(data.worstHour?.priceEurKWh) },
        bestWindow: { startTime: String(data.bestWindow?.startTime), endTime: String(data.bestWindow?.endTime), averagePriceEurKWh: Number(data.bestWindow?.averagePriceEurKWh), explanation: String(data.bestWindow?.explanation || "") },
        co2Analysis: String(data.co2Analysis || ""),
        actionableTips: Array.isArray(data.actionableTips) ? data.actionableTips.map(String) : [],
    };
}

/**
 * Retrieves daily price analysis from the most efficient source available (Memory -> LocalStorage -> Network).
 */
export async function getPricesForDay(dateISO: string): Promise<{ data: DayPriceAnalysis, source: CacheSource }> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
        throw new Error(`Invalid date format: ${dateISO} (use YYYY-MM-DD)`);
    }

    const now = Date.now();

    // 1. Memory Cache (Fastest)
    const memHit = memoryCache.get(dateISO);
    if (memHit && (now - memHit.ts < MEMORY_TTL_MS)) {
        return { data: memHit.data, source: 'memory' };
    }

    // 2. LocalStorage Cache (Fast UI paint on revisit)
    try {
        const localKey = MML_CACHE_PREFIX + dateISO;
        const localItem = localStorage.getItem(localKey);
        if (localItem) {
            const parsed: CacheEntry = JSON.parse(localItem);
            if (now - parsed.ts < LOCAL_TTL_MS) {
                memoryCache.set(dateISO, parsed); // Hydrate memory cache
                return { data: parsed.data, source: 'localstorage' };
            }
        }
    } catch (e) {
        console.warn("Failed to read from localStorage", e);
    }

    // 3. Network Fetch (Source of truth)
    const url = `${API_BASE}/prices?date=${encodeURIComponent(dateISO)}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        
        // Gracefully handle "no data" error from the backend
        try {
            const errJson = JSON.parse(txt);
            if (errJson.error && errJson.error.includes("ESIOS devolvió 0 puntos")) {
                console.warn(`No price data available for ${dateISO}. Returning empty analysis.`);
                const emptyResponse = normalizeDaily({
                    date: dateISO,
                    points: [],
                    averagePriceEurKWh: 0,
                    bestHour: { time: '', priceEurKWh: 0 },
                    worstHour: { time: '', priceEurKWh: 0 },
                    bestWindow: { startTime: '', endTime: '', averagePriceEurKWh: 0, explanation: '' },
                    co2Analysis: 'No hay datos de precios disponibles para esta fecha. Generalmente, los precios para mañana se publican sobre las 20:30h.',
                    actionableTips: [],
                    createdAt: Date.now()
                });

                // Cache the empty response to avoid repeated failing calls
                const newEntry: CacheEntry = { data: emptyResponse, ts: now };
                memoryCache.set(dateISO, newEntry);
                try {
                    localStorage.setItem(MML_CACHE_PREFIX + dateISO, JSON.stringify(newEntry));
                } catch (e) {
                    console.warn("Failed to write empty response to localStorage", e);
                }

                return { data: emptyResponse, source: 'network' };
            }
        } catch (e) {
            // Not a parsable JSON error, throw the original text
        }

        throw new Error(txt || `HTTP ${res.status}`);
    }
    const json = await res.json() as DailyPricesResponse;
    const normalized = normalizeDaily(json);

    // 4. Update caches
    const newEntry: CacheEntry = { data: normalized, ts: now };
    memoryCache.set(dateISO, newEntry);
    try {
        localStorage.setItem(MML_CACHE_PREFIX + dateISO, JSON.stringify(newEntry));
    } catch (e) {
        console.warn("Failed to write to localStorage", e);
    }
    
    return { data: normalized, source: 'network' };
}


/**
 * Proactively fetches price data for yesterday, today, and tomorrow to populate caches.
 * Designed to be called once when the main app component mounts.
 */
export async function prefetchInitialPrices(): Promise<void> {
    if (hasPrefetched) return;
    hasPrefetched = true;

    const datesToPrefetch = [
        getYesterdayDateMadrid(),
        getTodayDateMadrid(),
        getTomorrowDateMadrid()
    ];

    await Promise.allSettled(
        datesToPrefetch.map(date => getPricesForDay(date).catch(e => {
            // Silently fail prefetch for dates that might not be available yet (e.g., tomorrow)
            console.log(`Prefetch failed for ${date}, this can be normal.`);
        }))
    );
}

// FIX: Add getTariffs function to be used by TariffsCard components
export async function getTariffs(): Promise<Provider[]> {
    const url = `${API_BASE}/tariffs`;
    const res = await fetchWithRetry(url);
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
    }
    return res.json() as Promise<Provider[]>;
}

// Export date helpers for use in components
export { getTodayDateMadrid, getTomorrowDateMadrid, getYesterdayDateMadrid };