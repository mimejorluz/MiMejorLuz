import React, { useState } from "react";
import type { Provider, Tariff } from "../types";
import { getTariffs } from "../services/esiosService";
import { motion } from "framer-motion";
import { fmtNum } from "../utils/formatters";
import { IconLeaf, IconLock, IconSparkles } from "./common/Icons";

interface TariffsCardProps {
  onExplain: (topic: string) => void;
}

const FilterPill: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
            isActive ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
    >
        {label}
    </button>
);


/** Devuelve una cadena legible a partir de priceDetails */
function summarizePrice(details: any): {price: string, unit: string} {
  if (!details || typeof details !== "object") return {price: "—", unit: ""};
  const energia = details.energia || {};
  
  if (typeof energia.fijo === "number") {
    return { price: fmtNum(energia.fijo, "", 4) , unit: "€/kWh" };
  }

  const partes: string[] = [];
  if (typeof energia.punta === "number") partes.push(`P1 ${fmtNum(energia.punta, "")}`);
  if (typeof energia.llano === "number") partes.push(`P2 ${fmtNum(energia.llano, "")}`);
  if (typeof energia.valle === "number") partes.push(`P3 ${fmtNum(energia.valle, "")}`);
  if (partes.length) return { price: partes.join(' | '), unit: "€/kWh" };
  
  return { price: "Consultar", unit: "" };
}

function pickFeaturedTariffs(providers: Provider[], max = 6) {
  const rows: Array<{
    provider: Provider;
    tariff: Tariff;
    summary: {price: string, unit: string};
  }> = [];

  for (const p of providers) {
    const active = (p.tariffs || []).filter(t => t.isActive !== false);
    if (!active.length) continue;
    const t = active[0]; // For beta, pick the first active one
    rows.push({
      provider: p,
      tariff: t,
      summary: summarizePrice(t.priceDetails),
    });
  }

  rows.sort((a, b) => a.provider.name.localeCompare(b.provider.name));
  return rows.slice(0, max);
}

const TariffRow: React.FC<{row: ReturnType<typeof pickFeaturedTariffs>[0]}> = ({ row }) => (
    <motion.a
      href={row.provider.websiteUrl || "#"}
      target="_blank"
      rel="noreferrer"
      className="p-4 rounded-xl bg-white hover:bg-gray-50 transition-all flex flex-col gap-3 border"
      whileHover={{ y: -3, boxShadow: '0 6px 15px rgba(0,0,0,0.06)' }}
    >
        <div className="flex items-center gap-3">
            <img
                src={row.provider.logoUrl || "https://storage.googleapis.com/mejorluz-assets-public-2025/logo.png"}
                alt={row.provider.name}
                className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate text-gray-800">{row.provider.name}</div>
                <div className="text-xs text-gray-500 truncate">{row.tariff.name}</div>
            </div>
            <div className="text-right">
                <p className="font-bold text-base text-gray-800">{row.summary.price}</p>
                {row.summary.unit && <p className="text-[11px] text-gray-500 -mt-1">{row.summary.unit}</p>}
            </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600 border-t pt-2">
            {row.tariff.conditions?.toLowerCase().includes('100% verde') && (
                <span className="flex items-center gap-1"><IconLeaf className="w-3.5 h-3.5 text-green-500" /> Energía Verde</span>
            )}
            {row.tariff.conditions?.toLowerCase().includes('permanencia') && (
                <span className="flex items-center gap-1"><IconLock className="w-3.5 h-3.5 text-red-500" /> Con Permanencia</span>
            )}
            <span className="flex-1 text-right text-xs font-bold text-amber-700 hover:underline">Ver Oferta</span>
        </div>
    </motion.a>
);

export default function TariffsCard({ onExplain }: TariffsCardProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<ReturnType<typeof pickFeaturedTariffs>>([]);
  const [activeFilter, setActiveFilter] = useState('Todas');


  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const providers = await getTariffs();
      const featured = pickFeaturedTariffs(providers, 6);
      setRows(featured);
    } catch (e: any) {
      setError(e?.message || "Error al cargar tarifas");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FilterPill label="Todas" isActive={activeFilter === 'Todas'} onClick={() => setActiveFilter('Todas')} />
        <FilterPill label="Con batería virtual" isActive={activeFilter === 'Con batería virtual'} onClick={() => setActiveFilter('Con batería virtual')} />
        <FilterPill label="Autoconsumo" isActive={activeFilter === 'Autoconsumo'} onClick={() => setActiveFilter('Autoconsumo')} />
      </div>

      <div className="flex items-center justify-between gap-3 mb-2">
        <h4 className="font-bold text-base tracking-tight flex items-center gap-2">
            Tarifas destacadas (beta)
        </h4>
        <button onClick={() => onExplain('Tarifas Destacadas')} className="text-amber-600 p-1 rounded-full hover:bg-amber-100 transition-colors">
            <IconSparkles className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Datos de tarifas en modo demo. Se actualizarán automáticamente cuando carguemos tu base real.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="p-3 rounded-xl bg-gray-100 animate-pulse h-24" />)}
        </div>
      ) : error ? (
        <div className="text-sm text-center text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-center text-gray-600 p-4 bg-gray-50 rounded-lg">No hay tarifas disponibles por el momento.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rows.map((r) => <TariffRow key={`${r.provider.id}-${r.tariff.id}`} row={r} />)}
        </div>
      )}

      <p className="mt-4 text-[11px] text-gray-500 text-center">
        Próximamente: comparativa personalizada con tu consumo real.
      </p>
    </div>
  );
}