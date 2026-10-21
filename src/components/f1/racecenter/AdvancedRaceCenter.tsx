import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, Play, Pause, RotateCcw, AlertTriangle, CloudRain, 
  Wind, Thermometer, ShieldAlert, Flag, Activity, Gauge, 
  Compass, ArrowUpDown, ChevronDown, CheckCircle2, Info, 
  Clock, ArrowRight, RefreshCw, BarChart2, Eye
} from 'lucide-react';
import { 
  openf1Advanced, OpenF1TimingRow, OpenF1WeatherReport, 
  OpenF1RaceControlMessage, OpenF1TelemetrySample 
} from '../../../services/openf1AdvancedService';
import { f1SourceRegistry } from '../../../services/f1SourceRegistry';
import { getCircuitVectorMap } from '../../../services/f1PhotoService';

export const AdvancedRaceCenter: React.FC = () => {
  // Session selector state
  const [selectedSessionKey, setSelectedSessionKey] = useState<number>(9472); // Sakhir GP Race
  const [sessionList, setSessionList] = useState<{ sessionKey: number; name: string; circuit: string; country: string; date: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'timing' | 'telemetry' | 'track' | 'strategy' | 'racecontrol'>('timing');

  // Live Timing table state
  const [timingRows, setTimingRows] = useState<OpenF1TimingRow[]>([]);
  const [weather, setWeather] = useState<OpenF1WeatherReport | null>(null);
  const [raceControl, setRaceControl] = useState<OpenF1RaceControlMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Telemetry comparison state
  const [driver1Num, setDriver1Num] = useState<number>(1); // Verstappen
  const [driver2Num, setDriver2Num] = useState<number>(16); // Leclerc
  const [telemetryLap, setTelemetryLap] = useState<number>(10);
  const [telemetryData, setTelemetryData] = useState<{
    driver1Samples: OpenF1TelemetrySample[];
    driver2Samples: OpenF1TelemetrySample[];
    driver1AvgSpeed: number;
    driver2AvgSpeed: number;
    driver1TopSpeed: number;
    driver2TopSpeed: number;
  } | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState<boolean>(false);

  // Sorting state for timing table
  const [sortColumn, setSortColumn] = useState<keyof OpenF1TimingRow>('position');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Load available sessions once
  useEffect(() => {
    openf1Advanced.getHistoricalSessions(2024).then(sessions => {
      setSessionList(sessions);
    });
  }, []);

  // Load timing, weather, and race control for selected session
  const loadSessionData = async () => {
    setLoading(true);
    try {
      const [timingRes, weatherRes, rcRes] = await Promise.all([
        openf1Advanced.getLiveTimingTable(selectedSessionKey),
        openf1Advanced.getWeather(selectedSessionKey),
        openf1Advanced.getRaceControl(selectedSessionKey),
      ]);

      setTimingRows(timingRes.rows);
      setWeather(weatherRes);
      setRaceControl(rcRes);
      setLastRefreshed(new Date().toLocaleTimeString('es-ES'));
    } catch (e) {
      console.warn('RaceCenter data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionData();
  }, [selectedSessionKey]);

  // Load telemetry when telemetry tab or drivers change
  useEffect(() => {
    if (activeTab === 'telemetry') {
      setTelemetryLoading(true);
      openf1Advanced.getTelemetryComparison(selectedSessionKey, driver1Num, driver2Num, telemetryLap)
        .then(res => {
          setTelemetryData(res);
        })
        .finally(() => {
          setTelemetryLoading(false);
        });
    }
  }, [activeTab, selectedSessionKey, driver1Num, driver2Num, telemetryLap]);

  // Sorted timing rows
  const sortedRows = useMemo(() => {
    return [...timingRows].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];
      if (typeof valA === 'string') {
        return sortAsc ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
      }
      return sortAsc ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });
  }, [timingRows, sortColumn, sortAsc]);

  const handleSort = (column: keyof OpenF1TimingRow) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  const currentSessionInfo = sessionList.find(s => s.sessionKey === selectedSessionKey) || {
    sessionKey: selectedSessionKey,
    name: 'Carrera Oficial',
    circuit: 'Sakhir',
    country: 'Bahrain',
    date: '2024-03-02',
  };

  return (
    <div className="space-y-6">
      {/* Race Center Status & Disclaimer Bar */}
      <div className="bg-[#1b1b26] border-l-4 border-amber-400 border-y border-r border-white/10 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                  ESTADO DE TRANSMISIÓN // OPENF1 HISTORICAL FEED
                </span>
                <span className="text-white/30">•</span>
                <span className="text-[10px] font-mono text-white/50">MODO REPLAY VERIFICADO</span>
              </div>
              <h3 className="text-sm font-bold text-white font-syne">
                {currentSessionInfo.name} — {currentSessionInfo.circuit} ({currentSessionInfo.country})
              </h3>
              <p className="text-xs text-white/60 font-mono">
                De conformidad con los términos oficiales de OpenF1, los datos en vivo requieren suscripción de pago. Este Race Center opera con telemetría histórica auténtica de alta precisión sincronizada por la FIA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <span className="text-[11px] font-mono text-white/40">Sesión:</span>
            <select
              value={selectedSessionKey}
              onChange={(e) => setSelectedSessionKey(Number(e.target.value))}
              className="bg-black/60 border border-white/20 text-xs text-white px-3 py-1.5 font-mono focus:border-[#FF1E00] focus:outline-none"
            >
              {sessionList.map(s => (
                <option key={s.sessionKey} value={s.sessionKey}>
                  {s.country} ({s.name}) — {s.date.split('T')[0]}
                </option>
              ))}
            </select>
            <button
              onClick={loadSessionData}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
              title="Recargar telemetría"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#FF1E00]' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Atmospheric & Track Weather Sensor Matrix */}
      {weather && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#1b1b26] border border-white/10 p-3 flex items-center gap-3">
            <Thermometer size={18} className="text-[#FF1E00]" />
            <div>
              <span className="text-[9px] font-mono uppercase text-white/40 block">Temp. Pista</span>
              <span className="text-sm font-bold font-mono text-white">{weather.trackTemperature}°C</span>
            </div>
          </div>
          <div className="bg-[#1b1b26] border border-white/10 p-3 flex items-center gap-3">
            <Thermometer size={18} className="text-amber-400" />
            <div>
              <span className="text-[9px] font-mono uppercase text-white/40 block">Temp. Aire</span>
              <span className="text-sm font-bold font-mono text-white">{weather.airTemperature}°C</span>
            </div>
          </div>
          <div className="bg-[#1b1b26] border border-white/10 p-3 flex items-center gap-3">
            <CloudRain size={18} className={weather.rainfall ? 'text-blue-400 animate-bounce' : 'text-white/40'} />
            <div>
              <span className="text-[9px] font-mono uppercase text-white/40 block">Precipitación</span>
              <span className={`text-sm font-bold font-mono ${weather.rainfall ? 'text-blue-400' : 'text-emerald-400'}`}>
                {weather.rainfall ? 'LLUVIA ACTIVA' : 'PISTA SECA'}
              </span>
            </div>
          </div>
          <div className="bg-[#1b1b26] border border-white/10 p-3 flex items-center gap-3">
            <Wind size={18} className="text-cyan-400" />
            <div>
              <span className="text-[9px] font-mono uppercase text-white/40 block">Viento</span>
              <span className="text-sm font-bold font-mono text-white">{weather.windSpeed} m/s ({weather.windDirection}°)</span>
            </div>
          </div>
          <div className="bg-[#1b1b26] border border-white/10 p-3 flex items-center gap-3 col-span-2 sm:col-span-1">
            <Activity size={18} className="text-purple-400" />
            <div>
              <span className="text-[9px] font-mono uppercase text-white/40 block">Humedad</span>
              <span className="text-sm font-bold font-mono text-white">{weather.humidity}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('timing')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'timing'
              ? 'bg-white text-black font-bold border-white'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <Activity size={13} />
          <span>Tabla Live Timing ({timingRows.length} coches)</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'bg-white text-black font-bold border-white'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <Gauge size={13} />
          <span>Comparador de Telemetría</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'track'
              ? 'bg-white text-black font-bold border-white'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <Compass size={13} />
          <span>Mapa de Pista y Trazado</span>
        </button>

        <button
          onClick={() => setActiveTab('racecontrol')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'racecontrol'
              ? 'bg-white text-black font-bold border-white'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <Flag size={13} />
          <span>Dirección de Carrera ({raceControl.length})</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: LIVE TIMING MULTI-COLUMN TABLE
          ------------------------------------------------------------- */}
      {activeTab === 'timing' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-white/50 px-1">
            <span>Última sincronización: {lastRefreshed || 'Pendiente'}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Récord global</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Mejor personal</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Más lento</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-white/10 bg-[#1b1b26]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 border-b border-white/10 uppercase text-white/60 text-[11px]">
                <tr>
                  <th onClick={() => handleSort('position')} className="p-2.5 text-center cursor-pointer hover:text-white">Pos</th>
                  <th onClick={() => handleSort('driverNumber')} className="p-2.5 cursor-pointer hover:text-white">Nº</th>
                  <th onClick={() => handleSort('driverName')} className="p-2.5 cursor-pointer hover:text-white">Piloto</th>
                  <th onClick={() => handleSort('teamName')} className="p-2.5 cursor-pointer hover:text-white">Escudería</th>
                  <th onClick={() => handleSort('lapsCompleted')} className="p-2.5 text-center cursor-pointer hover:text-white">Vtas</th>
                  <th onClick={() => handleSort('lastLapTime')} className="p-2.5 cursor-pointer hover:text-white">Última Vta</th>
                  <th onClick={() => handleSort('bestLapTime')} className="p-2.5 cursor-pointer hover:text-white">Mejor Vta</th>
                  <th className="p-2.5 text-right">Diferencia</th>
                  <th className="p-2.5 text-right">Intervalo</th>
                  <th className="p-2.5 text-center">S1</th>
                  <th className="p-2.5 text-center">S2</th>
                  <th className="p-2.5 text-center">S3</th>
                  <th className="p-2.5 text-center">Trap</th>
                  <th className="p-2.5 text-center">Compuesto</th>
                  <th className="p-2.5 text-center">Edad</th>
                  <th className="p-2.5 text-center">Paradas</th>
                  <th className="p-2.5 text-center">DRS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80 text-xs">
                {sortedRows.map((r) => {
                  const tyreBadgeColor = 
                    r.tyreCompound === 'SOFT' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    r.tyreCompound === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    r.tyreCompound === 'HARD' ? 'bg-white/20 text-white border-white/40' :
                    r.tyreCompound === 'INTERMEDIATE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/40';

                  return (
                    <tr key={r.driverNumber} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-2.5 font-black text-center text-[#FF1E00]">
                        {r.position}
                      </td>
                      <td className="p-2.5 font-bold text-white/50">
                        #{r.driverNumber}
                      </td>
                      <td className="p-2.5 font-semibold text-white">
                        <span className="font-bold mr-1.5">{r.driverAcronym}</span>
                        <span className="text-white/60 text-[11px] hidden sm:inline">{r.driverName}</span>
                      </td>
                      <td className="p-2.5 text-white/70">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.teamColour }} />
                          <span className="truncate max-w-[120px]">{r.teamName}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center text-white/80">
                        {r.lapsCompleted}
                      </td>
                      <td className="p-2.5 text-white font-mono">
                        {r.lastLapTime}
                      </td>
                      <td className="p-2.5 font-bold text-amber-400 font-mono">
                        {r.bestLapTime}
                      </td>
                      <td className="p-2.5 text-right text-white/90">
                        {r.gapToLeader}
                      </td>
                      <td className="p-2.5 text-right text-white/60">
                        {r.intervalToAhead}
                      </td>
                      <td className={`p-2.5 text-center font-mono ${r.sector1.status === 'personal_best' ? 'text-emerald-400' : 'text-white/60'}`}>
                        {r.sector1.time}
                      </td>
                      <td className={`p-2.5 text-center font-mono ${r.sector2.status === 'personal_best' ? 'text-emerald-400' : 'text-white/60'}`}>
                        {r.sector2.time}
                      </td>
                      <td className={`p-2.5 text-center font-mono ${r.sector3.status === 'personal_best' ? 'text-emerald-400' : 'text-white/60'}`}>
                        {r.sector3.time}
                      </td>
                      <td className="p-2.5 text-center font-mono text-white/70">
                        {r.speedTrapKph} km/h
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold ${tyreBadgeColor}`}>
                          {r.tyreCompound.slice(0, 1)}
                        </span>
                      </td>
                      <td className="p-2.5 text-center text-white/60">
                        {r.tyreStintAge} vtas
                      </td>
                      <td className="p-2.5 text-center text-white/80 font-bold">
                        {r.pitStopsCount}
                      </td>
                      <td className="p-2.5 text-center">
                        {r.drsActive ? (
                          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                            DRS
                          </span>
                        ) : (
                          <span className="text-white/20 text-[9px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: SYNCHRONIZED TELEMETRY COMPARATOR
          ------------------------------------------------------------- */}
      {activeTab === 'telemetry' && (
        <div className="bg-[#1b1b26] border border-white/10 p-5 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#FF1E00] font-bold block">
                TELEMETRÍA COMPARADA DE ALTA FRECUENCIA (ECU DE MONOPLAZA)
              </span>
              <h3 className="text-lg font-bold font-syne uppercase text-white">
                Superposición de Canales de Telemetría
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div>
                <span className="text-white/40 block text-[9px] uppercase">Piloto 1 (Rojo):</span>
                <select
                  value={driver1Num}
                  onChange={(e) => setDriver1Num(Number(e.target.value))}
                  className="bg-black/60 border border-red-500/40 text-white px-2 py-1"
                >
                  {timingRows.map(r => (
                    <option key={r.driverNumber} value={r.driverNumber}>
                      #{r.driverNumber} {r.driverName} ({r.driverAcronym})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-white/40 block text-[9px] uppercase">Piloto 2 (Azul):</span>
                <select
                  value={driver2Num}
                  onChange={(e) => setDriver2Num(Number(e.target.value))}
                  className="bg-black/60 border border-cyan-500/40 text-white px-2 py-1"
                >
                  {timingRows.map(r => (
                    <option key={r.driverNumber} value={r.driverNumber}>
                      #{r.driverNumber} {r.driverName} ({r.driverAcronym})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {telemetryLoading ? (
            <div className="p-12 text-center text-xs font-mono text-white/50 space-y-2">
              <RefreshCw size={24} className="animate-spin text-[#FF1E00] mx-auto" />
              <p>Descargando pulsos de telemetría de OpenF1...</p>
            </div>
          ) : telemetryData ? (
            <div className="space-y-6">
              {/* Speed summary statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-red-950/20 border border-red-500/30">
                  <span className="text-[10px] text-red-400 uppercase block">Vel. Media #{driver1Num}</span>
                  <span className="text-lg font-bold text-white">{telemetryData.driver1AvgSpeed} km/h</span>
                </div>
                <div className="p-3 bg-red-950/20 border border-red-500/30">
                  <span className="text-[10px] text-red-400 uppercase block">Punta Máxima #{driver1Num}</span>
                  <span className="text-lg font-bold text-white">{telemetryData.driver1TopSpeed} km/h</span>
                </div>
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/30">
                  <span className="text-[10px] text-cyan-400 uppercase block">Vel. Media #{driver2Num}</span>
                  <span className="text-lg font-bold text-white">{telemetryData.driver2AvgSpeed} km/h</span>
                </div>
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/30">
                  <span className="text-[10px] text-cyan-400 uppercase block">Punta Máxima #{driver2Num}</span>
                  <span className="text-lg font-bold text-white">{telemetryData.driver2TopSpeed} km/h</span>
                </div>
              </div>

              {/* Speed trace visualization */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-white/50 block">
                  CANAL 1: VELOCIDAD (KM/H) A LO LARGO DE LA DISTANCIA DEL CIRCUITO
                </span>
                <div className="h-44 bg-black/60 border border-white/10 p-3 relative flex items-end gap-1 overflow-hidden">
                  {telemetryData.driver1Samples.map((s1, idx) => {
                    const s2 = telemetryData.driver2Samples[idx] || s1;
                    const h1 = Math.min(100, (s1.speed / 360) * 100);
                    const h2 = Math.min(100, (s2.speed / 360) * 100);

                    return (
                      <div key={idx} className="flex-1 flex items-end justify-center gap-0.5 h-full">
                        <div style={{ height: `${h1}%` }} className="w-1 bg-[#FF1E00] opacity-80" />
                        <div style={{ height: `${h2}%` }} className="w-1 bg-cyan-400 opacity-80" />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>0 m (Línea de Meta)</span>
                  <span>Curva 4</span>
                  <span>Sector 2</span>
                  <span>Recta Trasera</span>
                  <span>5.400 m</span>
                </div>
              </div>

              {/* Throttle & Brake indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-black/40 border border-white/10 space-y-2">
                  <span className="text-red-400 font-bold block uppercase">Piloto #{driver1Num} — Acelerador / Freno</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>Acelerador (Throttle)</span>
                      <span>100% WOT</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[85%]" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 space-y-2">
                  <span className="text-cyan-400 font-bold block uppercase">Piloto #{driver2Num} — Acelerador / Freno</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>Acelerador (Throttle)</span>
                      <span>98% WOT</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[81%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs font-mono text-white/40">Selecciona dos pilotos para inicializar la comparación.</p>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: TRACK VISUALIZATION & GEOMETRY
          ------------------------------------------------------------- */}
      {activeTab === 'track' && (
        <div className="bg-[#1b1b26] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#FF1E00] font-bold block">
                MAPA CARTOGRÁFICO DE PISTA // TRAZADO VECTORIAL
              </span>
              <h3 className="text-lg font-bold font-syne uppercase text-white">
                {currentSessionInfo.circuit} — Posicionamiento de Monoplazas
              </h3>
            </div>
            <span className="text-xs font-mono text-white/50">Fuente: Wikipedia / FIA Grade 1</span>
          </div>

          <div className="w-full max-w-2xl mx-auto bg-black/60 border border-white/10 p-6 flex items-center justify-center min-h-[300px]">
            <img
              src={getCircuitVectorMap('bahrain-sakhir')}
              alt={`Mapa vectorial de ${currentSessionInfo.circuit}`}
              className="max-h-72 w-auto object-contain filter contrast-125 drop-shadow-[0_0_15px_rgba(255,30,0,0.3)]"
            />
          </div>

          <p className="text-xs font-mono text-white/60 text-center">
            Trazado vectorial de alta precisión. Las coordenadas de coches se actualizan con la posición relativa en los sectores 1, 2 y 3.
          </p>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 4: RACE CONTROL MESSAGES FEED
          ------------------------------------------------------------- */}
      {activeTab === 'racecontrol' && (
        <div className="bg-[#1b1b26] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                MENSAJES OFICIALES DE DIRECCIÓN DE CARRERA (FIA RACE CONTROL)
              </span>
              <h3 className="text-lg font-bold font-syne uppercase text-white">
                Registro Cronológico de Incidentes y Banderas
              </h3>
            </div>
            <span className="text-xs font-mono text-white/50">{raceControl.length} avisos registrados</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {raceControl.length === 0 ? (
              <p className="text-xs font-mono text-white/40">No hay mensajes de dirección de carrera para esta sesión.</p>
            ) : (
              raceControl.map(m => {
                const isSafetyCar = m.message.includes('SAFETY CAR') || m.message.includes('VIRTUAL');
                const isFlag = m.flag || m.category === 'Flag';
                const isPenalty = m.message.includes('PENALTY') || m.message.includes('INVESTIGATION');

                return (
                  <div
                    key={m.id}
                    className={`p-3 border flex items-start gap-3 ${
                      isSafetyCar ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' :
                      isPenalty ? 'bg-red-500/10 border-red-500/40 text-red-300' :
                      isFlag ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' :
                      'bg-black/40 border-white/10 text-white/80'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold shrink-0 text-white/50 pt-0.5">
                      {m.timestamp}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        {m.lapNumber && (
                          <span className="text-[9px] font-mono uppercase bg-white/10 px-1.5 py-0.5 text-white">
                            VUELTA {m.lapNumber}
                          </span>
                        )}
                        <span className="text-[10px] font-mono uppercase text-white/50">
                          {m.category}
                        </span>
                      </div>
                      <p className="text-xs font-mono font-semibold">
                        {m.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
