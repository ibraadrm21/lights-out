/**
 * LIGHTS OUT - Local Storage, Auth, Economy, Inventory & Leaderboard Store
 * Provides persistent user profile, JWT mock simulation, coin economy, cosmetics catalog and scores.
 */

import { RANKS, COSMETICS_CATALOG } from './data.js';

const STORAGE_KEY = "lights_out_state_v1";

const DEFAULT_STATE = {
  user: {
    id: "user_f1_01",
    username: "ChecoSpeed",
    displayName: "Sergio Speedster",
    email: "checo@lightsout.f1",
    country: "México",
    bio: "Obsesionado con las paradas en boxes sub-2.0s y adelantamientos en la curva 1. 🇲🇽🏁",
    avatarUrl: null, // Custom uploaded base64 data URL
    activeAvatarIcon: "🐂",
    activeBadge: "🚦",
    activeFrame: "border_carbon_fiber",
    coins: 750,
    score: 1850,
    inventory: ["avatar_red_bull", "badge_lights_out", "border_carbon_fiber"],
    servedQuestionHashes: [],
    isAdmin: true
  },
  leaderboard: [
    { rank: 1, name: "MaxApex99", points: 8420, country: "NL", badge: "👑", avatar: "🦁" },
    { rank: 2, name: "MonacoPrince", points: 6210, country: "MC", badge: "⏱️", avatar: "🐎" },
    { rank: 3, name: "SmoothOp_Carlos", points: 5100, country: "ES", badge: "💨", avatar: "🌶️" },
    { rank: 4, name: "Sergio Speedster (Tú)", points: 1850, country: "MX", badge: "🚦", avatar: "🐂", isSelf: true },
    { rank: 5, name: "PapayaRocket", points: 1640, country: "GB", badge: "🌱", avatar: "🏎️" },
    { rank: 6, name: "SilverstoneAce", points: 1200, country: "GB", badge: "🌱", avatar: "⚡" },
    { rank: 7, name: "TifosiHeart", points: 940, country: "IT", badge: "🌱", avatar: "🐎" }
  ],
  transactions: [
    { id: "tx_01", desc: "Bienvenida Lights Out Paddock", amount: +500, time: "Ayer" },
    { id: "tx_02", desc: "F1 Quiz Streak x5", amount: +250, time: "Hoy" }
  ],
  chatChannels: [
    { id: "general", name: "# 🏁 general-paddock", desc: "Charla global del fin de semana de Gran Premio" },
    { id: "telemetry", name: "# ⏱️ telemetría-setup", desc: "Ajustes de ala, presiones de neumáticos y frenadas" },
    { id: "driver-market", name: "# 🏎️ mercado-fichajes", desc: "Contratos de pilotos, rumores y fichajes bomba" },
    { id: "memes", name: "# 🍿 team-radios-memes", desc: "S-B-I-N-A-L-A, Smooth Operator y bromas de boxes" }
  ],
  chatMessages: [
    {
      id: "msg_1",
      channel: "general",
      author: { name: "MaxApex99", avatar: "🦁", badge: "👑", role: "Champion", isSelf: false },
      text: "Simply lovely, ritmo impecable en los sectores 1 y 2 hoy.",
      time: "10:14",
      reactions: { "🔥": 6, "🏎️": 4 }
    },
    {
      id: "msg_2",
      channel: "general",
      author: { name: "MonacoPrince", avatar: "🐎", badge: "⏱️", role: "Ferrari Driver", isSelf: false },
      text: "La degradación del compuesto blando en la curva 3 es brutal, ¿alguien va a una sola parada?",
      time: "10:18",
      reactions: { "👀": 5 }
    },
    {
      id: "msg_3",
      channel: "general",
      author: { name: "PapayaRocket", avatar: "🏎️", badge: "🌱", role: "McLaren Fan", isSelf: false },
      text: "Papaya rules activadas! El ritmo de carrera con el nuevo paquete aerodinámico es tremendo.",
      time: "10:25",
      reactions: { "🧡": 8, "🚀": 3 }
    },
    {
      id: "msg_4",
      channel: "telemetry",
      author: { name: "SmoothOp_Carlos", avatar: "🌶️", badge: "💨", role: "Williams Driver", isSelf: false },
      text: "Para Spa, conviene bajar 2 grados el ala trasera para ganar 7 km/h en la recta Kemmel sin perder demasiado en Pouhon.",
      time: "09:40",
      reactions: { "⚡": 12, "🎯": 7 }
    },
    {
      id: "msg_5",
      channel: "telemetry",
      author: { name: "SilverstoneAce", avatar: "⚡", badge: "🌱", role: "Telemetry Engineer", isSelf: false },
      text: "Confirmado: en telemetría el delta en curva rápida es de -0.150s con esa configuración.",
      time: "09:55",
      reactions: { "📊": 4 }
    },
    {
      id: "msg_6",
      channel: "driver-market",
      author: { name: "TifosiHeart", avatar: "🐎", badge: "🌱", role: "Tifosi", isSelf: false },
      text: "¿Hamilton vestido de rosso en Maranello todavía parece un sueño o ya os habéis acostumbrado?",
      time: "Ayer",
      reactions: { "🇮🇹": 15, "❤️": 9 }
    },
    {
      id: "msg_7",
      channel: "memes",
      author: { name: "MaxApex99", avatar: "🦁", badge: "👑", role: "Champion", isSelf: false },
      text: "'Box box, no stay out!' - El clásico poema de radio.",
      time: "11:02",
      reactions: { "😂": 19, "📻": 8 }
    }
  ]
};

export class LightsOutStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Could not save to localStorage:", e);
    }
  }

  getUser() {
    return this.state.user;
  }

  getLeaderboard() {
    // Sort and update self rank
    const sorted = [...this.state.leaderboard].sort((a, b) => b.points - a.points);
    sorted.forEach((item, idx) => {
      item.rank = idx + 1;
      if (item.isSelf) {
        item.points = this.state.user.score;
        item.avatar = this.state.user.activeAvatarIcon;
        item.badge = this.state.user.activeBadge;
      }
    });
    return sorted;
  }

  getUserRank() {
    const score = this.state.user.score;
    let currentRank = RANKS[0];
    for (const r of RANKS) {
      if (score >= r.minPoints) currentRank = r;
    }
    return currentRank;
  }

  getNextRank() {
    const score = this.state.user.score;
    for (let i = 0; i < RANKS.length; i++) {
      if (RANKS[i].minPoints > score) {
        return RANKS[i];
      }
    }
    return null;
  }

  addPointsAndCoins(points, coins, reason = "Juego completado") {
    this.state.user.score += points;
    this.state.user.coins += coins;
    this.state.transactions.unshift({
      id: "tx_" + Date.now(),
      desc: reason,
      amount: +coins,
      time: "Ahora"
    });

    // Update self in leaderboard
    const selfItem = this.state.leaderboard.find(l => l.isSelf);
    if (selfItem) {
      selfItem.points = this.state.user.score;
    }

    this.saveState();
  }

  deductCoins(coins, reason = "Pista comprada") {
    this.state.user.coins = Math.max(0, this.state.user.coins - coins);
    this.state.transactions.unshift({
      id: "tx_" + Date.now(),
      desc: reason,
      amount: -coins,
      time: "Ahora"
    });
    this.saveState();
  }

  recordServedHash(hash) {
    if (!this.state.user.servedQuestionHashes.includes(hash)) {
      this.state.user.servedQuestionHashes.push(hash);
      this.saveState();
    }
  }

  getServedHashes() {
    return this.state.user.servedQuestionHashes || [];
  }

  buyCosmetic(cosmeticId) {
    const item = COSMETICS_CATALOG.find(c => c.id === cosmeticId);
    if (!item) return { success: false, message: "Artículo inexistente." };

    if (this.state.user.inventory.includes(cosmeticId)) {
      return { success: false, message: "Ya posees este cosmético." };
    }

    if (this.state.user.coins < item.price) {
      return { success: false, message: "Saldo de PitCoins insuficiente." };
    }

    this.state.user.coins -= item.price;
    this.state.user.inventory.push(cosmeticId);
    this.state.transactions.unshift({
      id: "tx_" + Date.now(),
      desc: `Compra: ${item.name}`,
      amount: -item.price,
      time: "Ahora"
    });

    this.saveState();
    return { success: true, item };
  }

  equipCosmetic(cosmeticId) {
    const item = COSMETICS_CATALOG.find(c => c.id === cosmeticId);
    if (!item) return false;

    if (item.category === "avatar") {
      this.state.user.activeAvatarIcon = item.icon;
    } else if (item.category === "badge") {
      this.state.user.activeBadge = item.icon;
    } else if (item.category === "frame") {
      this.state.user.activeFrame = item.id;
    }

    this.saveState();
    return true;
  }

  updateProfile(profileData) {
    if (profileData.displayName) this.state.user.displayName = profileData.displayName;
    if (profileData.bio) this.state.user.bio = profileData.bio;
    if (profileData.country) this.state.user.country = profileData.country;
    if (profileData.avatarUrl !== undefined) this.state.user.avatarUrl = profileData.avatarUrl;
    this.saveState();
  }

  resetAllProgress() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }

  // Chat Methods (Paddock Live Radio Chat)
  getChatChannels() {
    if (!this.state.chatChannels) {
      this.state.chatChannels = JSON.parse(JSON.stringify(DEFAULT_STATE.chatChannels));
      this.saveState();
    }
    return this.state.chatChannels;
  }

  getChatMessages(channelId = "general") {
    if (!this.state.chatMessages) {
      this.state.chatMessages = JSON.parse(JSON.stringify(DEFAULT_STATE.chatMessages));
      this.saveState();
    }
    return this.state.chatMessages.filter(m => m.channel === channelId);
  }

  sendChatMessage(channelId, text) {
    const user = this.getUser();
    const rank = this.getUserRank();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg = {
      id: "msg_" + Date.now(),
      channel: channelId || "general",
      author: {
        name: user.displayName || user.username,
        avatar: user.activeAvatarIcon || "🏎️",
        badge: user.activeBadge || "🚦",
        role: `${rank.name}`,
        isSelf: true
      },
      text: text.trim(),
      time: timeStr,
      reactions: {}
    };

    if (!this.state.chatMessages) this.state.chatMessages = [];
    this.state.chatMessages.push(newMsg);
    this.saveState();
    return newMsg;
  }

  reactToMessage(messageId, emoji) {
    const msg = (this.state.chatMessages || []).find(m => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (msg.reactions[emoji]) {
      msg.reactions[emoji] += 1;
    } else {
      msg.reactions[emoji] = 1;
    }
    this.saveState();
    return msg;
  }

  // Backward compatibility alias for forum methods
  getForumThreads() {
    return [];
  }
}
