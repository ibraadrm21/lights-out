import React from 'react';
import { motion } from 'motion/react';
import { COSMETICS_CATALOG } from '../data.js';
import { SpotlightCard } from './motion-primitives.jsx';

export function StoreView({ store, updateNavTelemetry, onReturnHome }) {
  const user = store.getUser();

  const handleBuy = (id) => {
    const res = store.buyCosmetic(id);
    if (res.success) {
      alert(`¡Compraste "${res.item.name}" con éxito!`);
      updateNavTelemetry();
    } else {
      alert(res.message);
    }
  };

  const handleEquip = (id) => {
    store.equipCosmetic(id);
    updateNavTelemetry();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="clean-card p-6 sm:p-10"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-8 border-b border-white/[0.06] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded uppercase">
              Official Paddock Store
            </span>
            <span className="text-white/20">&bull;</span>
            <span className="text-xs text-slate-400 font-mono">PitCoins Exchange</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight uppercase">
            Tienda del Paddock
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="coins-pill !text-sm !py-2 !px-4">
            <span>🪙</span>
            <span>{user.coins.toLocaleString()} PitCoins</span>
          </div>
          <button className="btn-clean-secondary !py-2 !px-3.5 text-xs font-semibold" onClick={onReturnHome}>
            &larr; Paddock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COSMETICS_CATALOG.map((item) => {
          const isOwned = user.inventory.includes(item.id);
          const isEquipped = user.activeAvatarIcon === item.icon || user.activeBadge === item.icon || user.activeFrame === item.id;

          const rarityColor = {
            comun: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
            raro: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
            epico: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
            legendario: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
          }[item.rarity.toLowerCase()] || 'text-white bg-white/10 border-white/20';

          return (
            <SpotlightCard
              key={item.id}
              className={`clean-card p-6 flex flex-col justify-between ${
                isEquipped ? 'border-[#ff1801]/60' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${rarityColor}`}>
                    {item.rarity}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400 text-sm">
                  🪙 {item.price}
                </span>

                {isEquipped ? (
                  <button className="btn-clean-secondary !py-1.5 !px-3 text-xs opacity-60 cursor-default" disabled>
                    Equipado ✓
                  </button>
                ) : isOwned ? (
                  <button className="btn-clean-primary !py-1.5 !px-3 text-xs" onClick={() => handleEquip(item.id)}>
                    Equipar
                  </button>
                ) : (
                  <button
                    className="btn-clean-primary !py-1.5 !px-3 text-xs"
                    disabled={user.coins < item.price}
                    onClick={() => handleBuy(item.id)}
                  >
                    Comprar
                  </button>
                )}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </motion.div>
  );
}

export function ProfileView({ store, updateNavTelemetry, onReturnHome }) {
  const user = store.getUser();
  const rank = store.getUserRank();
  const nextRank = store.getNextRank();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="clean-card p-6 sm:p-10 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center pb-6 mb-8 border-b border-white/[0.06]">
        <div>
          <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2.5 py-0.5 rounded uppercase">
            Superlicencia FIA
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight uppercase mt-2">
            Perfil de Piloto
          </h2>
        </div>
        <button className="btn-clean-secondary !py-2 !px-3.5 text-xs font-semibold" onClick={onReturnHome}>
          &larr; Paddock
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="clean-card p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-4xl mb-3">
            {user.activeAvatarIcon || '🏎️'}
          </div>
          <div className="text-lg font-bold text-white font-['Space_Grotesk']">{user.displayName}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{rank.name}</div>
        </div>

        <div className="clean-card p-6 flex flex-col justify-between">
          <div className="text-xs font-mono text-slate-400 uppercase">Superlicencia FIA</div>
          <div className="text-3xl font-bold font-mono text-white my-2">{user.score} <span className="text-sm font-normal text-slate-400">PTS</span></div>
          <div className="text-xs text-slate-400 font-mono">
            {nextRank ? `Meta siguiente rango: ${nextRank.minPoints} pts` : '¡Máximo rango alcanzado!'}
          </div>
        </div>

        <div className="clean-card p-6 flex flex-col justify-between">
          <div className="text-xs font-mono text-slate-400 uppercase">Billetera PitCoins</div>
          <div className="text-3xl font-bold font-mono text-amber-400 my-2">🪙 {user.coins}</div>
          <div className="text-xs text-slate-400 font-mono">Disponibles en el Paddock</div>
        </div>
      </div>

      <div className="clean-card p-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono mb-4">
          Inventario y Cosméticos ({user.inventory.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {user.inventory.map((itemId) => (
            <span
              key={itemId}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300"
            >
              {itemId}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
