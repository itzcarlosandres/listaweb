"use client";

import { useState, useTransition } from "react";
import { updateRankingSettings, type RankingSettingsInput } from "@/server/actions/admin";
import { Zap, Save, RotateCcw, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface RankingSettingsFormProps {
  initialSettings: RankingSettingsInput;
}

export function RankingSettingsForm({ initialSettings }: RankingSettingsFormProps) {
  const [settings, setSettings] = useState<RankingSettingsInput>(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleResetDefaults = () => {
    setSettings({
      voteWeight: 4.0,
      commentWeight: 5.0,
      boostBonus: 100.0,
      decayExponent: 0.4,
      viewDivisor: 10.0,
    });
    toast.info("Valores por defecto cargados en el formulario");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateRankingSettings(settings);
      if (res.success) {
        toast.success("Parámetros del algoritmo de ranking actualizados con éxito");
      } else {
        toast.error(res.error || "Error al actualizar parámetros");
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Parámetros de Algoritmo de Ranking
            </h2>
            <p className="text-xs text-neutral-500 font-mono">
              Score = (V*{settings.voteWeight} + C*{settings.commentWeight} + B*{settings.boostBonus} + Vistas/{settings.viewDivisor}) / (T + 2)^{settings.decayExponent}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-[#E7E4DB] dark:border-[#2E2B23] transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Por Defecto
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          >
            {isPending ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Peso Voto */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex justify-between">
            <span>Multiplicador por Voto</span>
            <span className="font-mono text-primary font-bold">x{settings.voteWeight}</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="50"
            value={settings.voteWeight}
            onChange={(e) => setSettings({ ...settings, voteWeight: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
          />
          <span className="text-[11px] text-neutral-500 block">Puntos otorgados por cada voto de usuario.</span>
        </div>

        {/* Peso Comentario */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex justify-between">
            <span>Multiplicador por Comentario</span>
            <span className="font-mono text-primary font-bold">x{settings.commentWeight}</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="50"
            value={settings.commentWeight}
            onChange={(e) => setSettings({ ...settings, commentWeight: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
          />
          <span className="text-[11px] text-neutral-500 block">Mayor peso premia la conversación activa.</span>
        </div>

        {/* Bonus Boost */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex justify-between">
            <span>Bonus Boost Monetizado</span>
            <span className="font-mono text-primary font-bold">+{settings.boostBonus}</span>
          </label>
          <input
            type="number"
            step="1"
            min="0"
            max="1000"
            value={settings.boostBonus}
            onChange={(e) => setSettings({ ...settings, boostBonus: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
          />
          <span className="text-[11px] text-neutral-500 block">Puntos extra mientras el proyecto tenga Boost activo.</span>
        </div>

        {/* Exponente de Decaimiento */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex justify-between">
            <span>Exponente de Gravedad (Decay)</span>
            <span className="font-mono text-primary font-bold">^{settings.decayExponent}</span>
          </label>
          <input
            type="number"
            step="0.05"
            min="0.1"
            max="3"
            value={settings.decayExponent}
            onChange={(e) => setSettings({ ...settings, decayExponent: parseFloat(e.target.value) || 0.1 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
          />
          <span className="text-[11px] text-neutral-500 block">Mayor valor = proyectos antiguos bajan más rápido.</span>
        </div>

        {/* Divisor de Vistas */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex justify-between">
            <span>Divisor de Vistas</span>
            <span className="font-mono text-primary font-bold">/{settings.viewDivisor}</span>
          </label>
          <input
            type="number"
            step="1"
            min="1"
            max="100"
            value={settings.viewDivisor}
            onChange={(e) => setSettings({ ...settings, viewDivisor: parseFloat(e.target.value) || 1 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
          />
          <span className="text-[11px] text-neutral-500 block">Controla el impacto de visualizaciones en el ranking.</span>
        </div>
      </div>
    </form>
  );
}
