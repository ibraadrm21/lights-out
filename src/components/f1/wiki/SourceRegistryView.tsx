import React, { useState, useEffect } from 'react';
import { 
  Database, ShieldCheck, Activity, ExternalLink, RefreshCw, 
  CheckCircle2, AlertTriangle, XCircle, Info, Lock, Server, Clock 
} from 'lucide-react';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { f1SourceRegistry } from '../../../services/f1SourceRegistry';
import { F1SourceDefinition } from '../../../types/f1Data';

export const SourceRegistryView: React.FC = () => {
  const [sources, setSources] = useState<F1SourceDefinition[]>([]);
  const [healthResults, setHealthResults] = useState<Record<string, { ok: boolean; pingMs: number }>>({});
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    setSources(f1SourceRegistry.getAllSources());
  }, []);

  const runDiagnostics = async () => {
    setChecking(true);
    const results: Record<string, { ok: boolean; pingMs: number }> = {};
    for (const src of sources) {
      try {
        const res = await f1SourceRegistry.checkHealth(src.id);
        results[src.id] = res;
      } catch {
        results[src.id] = { ok: false, pingMs: 0 };
      }
    }
    setHealthResults(results);
    setChecking(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <WikiBreadcrumbs 
        items={[
          { label: 'Portal Portada', to: '/f1-real' },
          { label: 'Registro Central de Fuentes y Metodología Legal' },
        ]} 
      />

      {/* Main Title & Legal Statement */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5">
            PROVENIENCIA Y CUMPLIMIENTO LEGAL DE DATOS
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] font-mono text-white/50 uppercase">
            ARQUITECTURA DE FUENTES ABIERTAS Y LIBRES
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-syne uppercase text-white tracking-tight">
          Registro Central de Fuentes de Datos F1 Real
        </h1>
        <p className="text-xs sm:text-sm text-white/70 font-sans mt-2 max-w-4xl leading-relaxed">
          En estricto cumplimiento con la legislación de propiedad intelectual y los términos de servicio de los proveedores, 
          Lights Out utiliza exclusivamente fuentes de datos libres, abiertas o bajo licencias de uso educativo y no comercial. 
          No se emplean APIs de pago, técnicas de raspado no autorizado (scraping) ni servicios de ingeniería inversa.
        </p>
      </div>

      {/* Health & Diagnostic Action Bar */}
      <div className="bg-[#1b1b26] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Server size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold font-syne uppercase text-white">Panel de Salud de Proveedores</h3>
            <p className="text-[11px] font-mono text-white/50">Comprobación de conectividad, latencia y respuesta HTTP en tiempo real.</p>
          </div>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={checking}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FF1E00] hover:bg-red-600 disabled:opacity-50 text-white text-xs font-mono uppercase font-bold transition-all shadow-md"
        >
          <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
          <span>{checking ? 'Comprobando...' : 'Ejecutar Diagnóstico de APIs'}</span>
        </button>
      </div>

      {/* Capability Matrix Summary Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold font-syne uppercase text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#FF1E00]" />
          <span>Matriz de Capacidades y Términos de Licencia</span>
        </h2>

        <div className="overflow-x-auto border border-white/10">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1b1b26] border-b border-white/10 text-white/60 uppercase">
              <tr>
                <th className="p-3">Proveedor / Fuente</th>
                <th className="p-3">Resultados Históricos</th>
                <th className="p-3">Telemetría</th>
                <th className="p-3">Live Timing</th>
                <th className="p-3">Redistribución Pública</th>
                <th className="p-3">Uso Comercial</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20 text-white/80">
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">Jolpica-F1 (Ergast Successor)</td>
                <td className="p-3 text-emerald-400 font-bold">1950–Presente</td>
                <td className="p-3 text-white/40">No soportado</td>
                <td className="p-3 text-white/40">No soportado</td>
                <td className="p-3 text-emerald-400">Permitido (CC-BY-NC)</td>
                <td className="p-3 text-amber-400">No comercial</td>
                <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px]">OPERATIVO</span></td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">OpenF1 Community</td>
                <td className="p-3 text-emerald-400 font-bold">2023–Presente</td>
                <td className="p-3 text-emerald-400 font-bold">Histórica gratuita</td>
                <td className="p-3 text-red-400 font-bold">Plan Pago (Bloqueado)</td>
                <td className="p-3 text-emerald-400">Permitido (Open Data)</td>
                <td className="p-3 text-emerald-400">Permitido</td>
                <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px]">OPERATIVO</span></td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">FIA Official Documentation</td>
                <td className="p-3 text-emerald-400">Clasificaciones PDF</td>
                <td className="p-3 text-white/40">No disponible</td>
                <td className="p-3 text-white/40">No disponible</td>
                <td className="p-3 text-cyan-400">Enlace oficial directo</td>
                <td className="p-3 text-amber-400">Restringido</td>
                <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px]">OPERATIVO</span></td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">Wikimedia Commons</td>
                <td className="p-3 text-white/40">No aplicable</td>
                <td className="p-3 text-white/40">No aplicable</td>
                <td className="p-3 text-white/40">No aplicable</td>
                <td className="p-3 text-emerald-400">CC-BY-SA / CC0</td>
                <td className="p-3 text-emerald-400">Permitido con cita</td>
                <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px]">OPERATIVO</span></td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">F1-Fansite Editorial Archive</td>
                <td className="p-3 text-white/40">No aplicable</td>
                <td className="p-3 text-white/40">No aplicable</td>
                <td className="p-3 text-white/40">No aplicable</td>
                <td className="p-3 text-cyan-400">Editorial no comercial</td>
                <td className="p-3 text-red-400">Restringido</td>
                <td className="p-3"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px]">OPERATIVO</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Sources Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-syne uppercase text-white">
          Fichas Técnicas de Proveedores Registrados
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => {
            const health = healthResults[src.id];
            return (
              <div key={src.id} className="bg-[#1b1b26] border border-white/10 p-5 space-y-3 font-sans">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-[#FF1E00] uppercase font-bold">
                        ID: {src.id}
                      </span>
                      <span className="text-white/30">•</span>
                      <span className="text-[10px] font-mono text-white/50">{src.accessMethod}</span>
                    </div>
                    <h3 className="text-base font-bold font-syne text-white">{src.name}</h3>
                  </div>

                  {health ? (
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 ${
                        health.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {health.ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        <span>{health.ok ? `${health.pingMs} ms` : 'Error'}</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 shrink-0">
                      {src.status}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-white/70">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-mono text-[11px]">URL Base:</span>
                    <a href={src.baseUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-cyan-400 hover:underline truncate max-w-[240px]">
                      {src.baseUrl}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-mono text-[11px]">Límites de Petición:</span>
                    <span className="font-mono text-white/80 text-[11px]">{src.rateLimits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-mono text-[11px]">Cobertura Histórica:</span>
                    <span className="font-mono text-white/80 text-[11px]">{src.historicalCoverage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-mono text-[11px]">Términos de Licencia:</span>
                    <a href={src.termsUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-white/60 hover:text-white flex items-center gap-1 text-[11px]">
                      <span>Consultar Términos</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-white/40 block mb-1">CATEGORÍAS DE DATOS:</span>
                  <div className="flex flex-wrap gap-1">
                    {src.dataCategories.map((cat, idx) => (
                      <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 bg-black/40 text-white/70 border border-white/5">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Negotiable Transparency Statement */}
      <div className="bg-[#1b1b26] border border-white/10 p-5 space-y-2">
        <h3 className="text-xs font-bold font-syne uppercase text-white flex items-center gap-2">
          <Info size={14} className="text-[#FF1E00]" />
          <span>Política de Transparencia de Datos en Directo</span>
        </h3>
        <p className="text-xs text-white/70 leading-relaxed font-sans">
          La plataforma distingue categóricamente entre:
          <strong> (1) Datos Oficiales Históricos</strong> suministrados por Jolpica-F1 y FIA; 
          <strong> (2) Telemetría Histórica de Sesión</strong> provista legalmente por OpenF1; 
          <strong> (3) Métricas Calculadas</strong> (deltas, gaps y promedios) formuladas internamente; y 
          <strong> (4) Modos de Demostración</strong> para verificación de interfaces en pretemporada. 
          Nunca se presentarán datos simulados o desfasados simulando ser transmisiones en vivo no autorizadas.
        </p>
      </div>
    </div>
  );
};
