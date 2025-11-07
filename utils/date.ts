function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

// FIX: Create a helper function to avoid code repetition and handle timezone conversion reliably.
function formatDateToMadridISO(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = Number(parts.find(p => p.type === "year")?.value);
  const m = Number(parts.find(p => p.type === "month")?.value);
  const d = Number(parts.find(p => p.type === "day")?.value);
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** YYYY-MM-DD de hoy en Europe/Madrid */
export function todayMadridISO(): string {
  return formatDateToMadridISO(new Date());
}

// FIX: Export getTodayDateMadrid, getYesterdayDateMadrid, and getTomorrowDateMadrid
export const getTodayDateMadrid = todayMadridISO;

export function getYesterdayDateMadrid(): string {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  return formatDateToMadridISO(yesterday);
}

export function getTomorrowDateMadrid(): string {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  return formatDateToMadridISO(tomorrow);
}

/** HH:MM en Europe/Madrid a partir de un ISO */
export function hourES(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
