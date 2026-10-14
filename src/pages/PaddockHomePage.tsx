import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import LogoLoop from '../components/common/LogoLoop';
import { Footer } from '../components/layout/Footer';
import { Radio, Zap, Target, MapPin, Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const PaddockHomePage: React.FC = () => {
  const modes = [
    {
      to: '/f1-real',
      tag: 'LIVE FIA TELEMETRY',
      title: 'F1 REAL HUB',
      desc: 'Mundial de Pilotos, Constructores y Resultados oficiales de carrera en tiempo real alimentados por la API oficial de OpenF1.',
      icon: Radio,
      accent: '#e10600',
      badge: 'LIVE FEED',
      pulse: true,
    },
    {
      to: '/quiz',
      tag: 'TECHNICAL KNOWLEDGE',
      title: 'QUIZ MASTER',
      desc: 'Batería técnica de preguntas sobre aerodinámica, motores híbridos, DRS y estrategia de carrera con puntuación procedural.',
      icon: Zap,
      accent: '#ffffff',
      badge: '300 PTS / WIN',
    },
    {
      to: '/driverle',
      tag: 'PILOT DETECTIVE',
      title: 'DRIVERLE',
      desc: 'Adivina el piloto misterioso de la parrilla mediante pistas de telemetría: edad, dorsal, podios y año de debut.',
      icon: Target,
      accent: '#00d2be',
      badge: 'DAILY MYSTERY',
    },
    {
      to: '/circuits',
      tag: 'APEX RECOGNITION',
      title: 'CIRCUIT APEX',
      desc: 'Modo GeoGuessr de Fórmula 1. Identifica las curvas más icónicas del calendario mundial mediante imágenes y datos de sector.',
      icon: MapPin,
      accent: '#fed100',
      badge: 'GEOGUESSR F1',
    },
    {
      to: '/standings',
      tag: 'WORLD PADDOCK',
      title: 'GLOBAL STANDINGS',
      desc: 'Clasificación mundial de operadores y pilotos de la comunidad de Lights Out con récords de vuelta y porcentajes de acierto.',
      icon: Trophy,
      accent: '#e10600',
      badge: 'HALL OF FAME',
    },
  ];

  return (
    <main className="bg-black min-h-screen text-white">
      {/* 1. Hero with Starting Gantry */}
      <Hero />

      {/* 2. Official Constructors Loop */}
      <LogoLoop />

      {/* 3. Tactical Mode Selection Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <span className="text-[9px] font-mono tracking-[0.4em] text-[#e10600] uppercase block mb-2 font-bold">
              [ PADDOCK TERMINAL // CHOOSE INTERACTIVE MODE ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-syne uppercase tracking-tight">
              MODOS DE <span className="text-white/40">COMPETICIÓN</span>
            </h2>
          </div>
          <span className="text-[9px] font-mono text-white/40 uppercase">
            ACCESO DIRECTO POR PESTAÑAS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modes.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Link
                  to={m.to}
                  className="group block p-7 bg-[#0a0a0a] hover:bg-[#111111] border border-white/10 hover:border-white/30 transition-all h-full flex flex-col justify-between relative overflow-hidden shadow-2xl"
                  style={{ borderTopColor: m.accent, borderTopWidth: '3px' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none" />

                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="p-3 bg-white/5 border border-white/10 text-white group-hover:scale-110 transition-transform">
                        <Icon
                          size={20}
                          className={m.pulse ? 'text-[#e10600] animate-pulse' : 'text-white'}
                        />
                      </div>
                      <span className="text-[8px] font-mono font-bold tracking-widest px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 uppercase">
                        {m.badge}
                      </span>
                    </div>

                    <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 uppercase block mb-1">
                      {m.tag}
                    </span>
                    <h3 className="text-xl font-black font-syne uppercase text-white tracking-tight mb-3 group-hover:text-[#e10600] transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-white/50 text-xs font-normal leading-relaxed mb-6 font-mono">
                      {m.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono font-bold tracking-widest uppercase text-white/60 group-hover:text-white transition-colors">
                    <span>ACCEDER A PESTAÑA</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Philosophy Section */}
      <section className="py-24 bg-[#050505] border-t border-white/5">
        <div className="w-full max-w-3xl mx-auto px-6 text-center">
          <span className="text-[9px] font-mono tracking-[0.4em] text-[#e10600] uppercase block mb-4">
            [ MOTORSPORT HERITAGE // 2026 ]
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-syne uppercase tracking-tight mb-8">
            "ENGINEERED AT THE APEX, ARCHIVED FOR MOTORSPORT PURISTS."
          </h2>
          <p className="text-white/50 text-xs sm:text-sm font-normal leading-relaxed tracking-wide">
            LIGHTS OUT es una plataforma técnica de alta precisión para entusiastas de la Fórmula 1 que fusiona telemetría procedural, análisis de trazados en tiempo real y datos en vivo de OpenF1 con estética brutalista y oscura.
          </p>
        </div>
      </section>

      {/* 5. Footer */}
      <Footer />
    </main>
  );
};
