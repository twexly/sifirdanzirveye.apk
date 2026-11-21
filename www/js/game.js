// Canvas roundRect uyumluluk desteği
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

// =========================================================================
// SIFIRDAN ZİRVEYE 2D — HİKAYELİ TİCARET, HARAÇ, BASKIN VE ŞEHİR KONTROLÜ
// =========================================================================

const DISTRICTS_DATA = [
  {
    id: 'liman',
    name: 'Liman Mahallesi',
    unlockCost: 0,
    demand: 1.0,
    plots: [
      { id: 'p1', name: 'Köşe Başı Büfe', icon: '🏪', x: 0.26, y: 0.27, baseIncome: 150, baseCost: 10000, owner: 'player', level: 1, strategy: 'balanced', damaged: false },
      { id: 'p2', name: 'Liman Fırını', icon: '🥖', x: 0.74, y: 0.27, baseIncome: 260, baseCost: 20000, owner: 'neutral', level: 1, strategy: 'balanced', damaged: false },
      { id: 'p3', name: 'Sahil Market', icon: '🛒', x: 0.26, y: 0.73, baseIncome: 440, baseCost: 42000, owner: 'rival1', level: 1, strategy: 'balanced', damaged: false },
      { id: 'p4', name: 'İskele Deposu', icon: '📦', x: 0.74, y: 0.73, baseIncome: 750, baseCost: 78000, owner: 'rival2', level: 1, strategy: 'balanced', damaged: false }
    ]
  },
  {
    id: 'carsi',
    name: 'Merkez Çarşı',
    unlockCost: 90000,
    demand: 1.45,
    plots: [
      { id: 'p5', name: 'Cadde Butik', icon: '👕', x: 0.26, y: 0.27, baseIncome: 1200, baseCost: 120000, owner: 'rival1', level: 1, strategy: 'balanced', damaged: false },
      { id: 'p6', name: 'Teknoloji Pasajı', icon: '📱', x: 0.74, y: 0.27, baseIncome: 1850, baseCost: 185000, owner: 'neutral', level: 1, strategy: 'balanced', damaged: false },
      { id: 'p7', name: 'Gurme Kasap', icon: '🥩', x: 0.26, y: 0.73, baseIncome: 2700, baseCost: 280000, owner: 'rival2', level: 2, strategy: 'balanced', damaged: false },
      { id: 'p8', name: 'Merkez AVM', icon: '🏬', x: 0.74, y: 0.73, baseIncome: 4200, baseCost: 450000, owner: 'rival1', level: 2, strategy: 'balanced', damaged: false }
    ]
  },
  {
    id: 'finans',
    name: 'Finans Kulesi',
    unlockCost: 450000,
    demand: 2.2,
    plots: [
      { id: 'p9', name: 'Lojistik Üssü', icon: '🚛', x: 0.26, y: 0.27, baseIncome: 6800, baseCost: 650000, owner: 'rival2', level: 2, strategy: 'balanced', damaged: false },
      { id: 'p10', name: 'Borsa Ofisi', icon: '📈', x: 0.74, y: 0.27, baseIncome: 10500, baseCost: 1050000, owner: 'rival1', level: 2, strategy: 'balanced', damaged: false },
      { id: 'p11', name: 'Elmas Plaza', icon: '💎', x: 0.26, y: 0.73, baseIncome: 16500, baseCost: 1700000, owner: 'neutral', level: 2, strategy: 'balanced', damaged: false },
      { id: 'p12', name: 'Zirve Holding', icon: '🏙️', x: 0.74, y: 0.73, baseIncome: 28000, baseCost: 3000000, owner: 'rival1', level: 3, strategy: 'balanced', damaged: false }
    ]
  }
];

const SECURITY_UPGRADES = [
  { id: 'sec_guard', name: 'Gece Bekçisi & Kamera', desc: 'Baskın savunma gücüne +15 Koruma ekler.', baseCost: 12000, secBonus: 15, max: 10 },
  { id: 'sec_team', name: 'Özel Koruma Ekibi', desc: 'Haraççılara ve rakip baskınlarına karşı +35 Koruma.', baseCost: 45000, secBonus: 35, max: 10 },
  { id: 'sec_armored', name: 'Zırhlı Nakliye & İstihbarat', desc: 'Baskın riskini düşürür, +70 Koruma sağlar.', baseCost: 160000, secBonus: 70, max: 10 }
];

const LOGISTICS_UPGRADES = [
  { id: 'log_van', name: 'Mahalle Kargo Aracı', desc: '2D haritada teslimat aracı çıkarır (+%25 gelir).', baseCost: 15000, mult: 0.25, max: 10 },
  { id: 'log_depot', name: 'Toptan Mal Deposu', desc: 'Tedarik maliyetini azaltır (+%45 gelir).', baseCost: 55000, mult: 0.45, max: 10 },
  { id: 'log_tir', name: 'Şehirlerarası TIR Filosu', desc: 'Tüm bölgelerde devasa kâr artışı (+%80 gelir).', baseCost: 200000, mult: 0.80, max: 10 }
];

const MANAGERS = [
  { id: 'mgr_selin', name: 'Selin (Finans Müdürü)', desc: 'Gün sonu kapanış bonusunu %50 artırır.', cost: 35000 },
  { id: 'mgr_auto', name: 'Gece Vardiyası Botu', desc: 'Uygulama kapalıyken bile 4 saat boyunca %100 gelir toplar.', cost: 85000 }
];

const QUESTS = [
  { id: 'q1', text: "Köşe Başı Büfe'yi Seviye 2 yap.", reward: 12000, check: s => s.districts[0].plots[0].level >= 2 },
  { id: 'q2', text: "Liman Fırını'nı satın alarak 2 dükkâna ulaş.", reward: 22000, check: s => countPlayerShops(s) >= 2 },
  { id: 'q3', text: 'Ekip & Filo sekmesinden Gece Bekçisi al (Koruma 25+).', reward: 30000, check: s => getSecurityPower(s) >= 25 },
  { id: 'q4', text: "Yeni Güne Başla butonuyla Gün 3'e ulaş.", reward: 45000, check: s => s.day >= 3 },
  { id: 'q5', text: "Rakip elindeki Sahil Market'i satın al.", reward: 75000, check: s => s.districts[0].plots[2].owner === 'player' },
  { id: 'q6', text: 'Merkez Çarşı mahallesinin kilidini aç.', reward: 140000, check: s => s.unlockedDistricts.includes('carsi') },
  { id: 'q7', text: 'Şehir hakimiyetini %50 üzerine çıkar.', reward: 350000, check: s => getControlPct(s) >= 50 }
];

const CHARACTERS = [
  { id: 'kemal', name: 'Kemal Abi', role: 'Mahalle Ağası (Haraç & Koruma)', desc: 'Her 3 günde bir mahalleden haraç toplar. Güçlenirsen sana saygı duyar!' },
  { id: 'selin', name: 'Selin', role: 'Ticaret & Finans Danışmanın', desc: 'Piyasa fırsatlarını, baskın istihbaratını ve gün sonu hesaplarını yönetir.' },
  { id: 'kuzey', name: 'Kuzey Bey', role: 'Kuzey Holding Patronu (Rakip)', desc: 'Fiyat kırdığında dükkânlarına baskın düzenleyebilecek en sert rakibin.' }
];

let state = {
  day: 1,
  hour: 9,
  cash: 25000,
  respect: 5,
  soundOn: true,
  selectedDistrict: 'liman',
  unlockedDistricts: ['liman'],
  districts: JSON.parse(JSON.stringify(DISTRICTS_DATA)),
  secLevels: { sec_guard: 0, sec_team: 0, sec_armored: 0 },
  logLevels: { log_van: 0, log_depot: 0, log_tir: 0 },
  ownedManagers: [],
  questIndex: 0,
  kemalTruceDays: 0,
  kemalDefeated: false,
  dailyEarned: 0,
  dailySpent: 0,
  storyLogs: ["Gün 1: Liman Mahallesi'nde küçük bir büfe ile ticaret hayatına atıldın."],
  lastSaved: Date.now()
};

// 2D Canvas Animasyon Varlıkları
let vehicles = [];
let floatingTexts = [];
let activeRaidPlotId = null;
let blackCarActive = false;

function loadState() {
  try {
    const raw = localStorage.getItem('sifirdan_zirveye_2d_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
      const elapsedSec = Math.floor((Date.now() - (state.lastSaved || Date.now())) / 1000);
      if (elapsedSec > 20) {
        const hasBot = state.ownedManagers.includes('mgr_auto');
        const cap = hasBot ? 4 * 3600 : 1200;
        const rate = hasBot ? 1.0 : 0.35;
        const offlineGain = Math.floor(getTotalIncome() * Math.min(elapsedSec, cap) * rate);
        if (offlineGain > 0) {
          state.cash += offlineGain;
          setTimeout(() => showToast(`🤖 Yokluğunda +${formatMoney(offlineGain)} kazandın!`), 600);
        }
      }
    }
  } catch {}
}

function saveState() {
  state.lastSaved = Date.now();
  localStorage.setItem('sifirdan_zirveye_2d_v1', JSON.stringify(state));
}

function playBeep(freq = 520, dur = 0.08, type = 'sine') {
  if (!state.soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {}
}

function formatMoney(n) {
  if (n >= 1e6) return '₺' + (n / 1e6).toFixed(2) + ' Mn';
  if (n >= 1e3) return '₺' + Math.floor(n).toLocaleString('tr-TR');
  return '₺' + Math.floor(n);
}

function countPlayerShops(s = state) {
  let c = 0;
  s.districts.forEach(d => d.plots.forEach(p => { if (p.owner === 'player') c++; }));
  return c;
}

function getControlPct(s = state) {
  let total = 0, owned = 0;
  s.districts.forEach(d => d.plots.forEach(p => {
    total++;
    if (p.owner === 'player') owned++;
  }));
  return Math.round((owned / total) * 100);
}

function getSecurityPower(s = state) {
  let sec = 10;
  SECURITY_UPGRADES.forEach(u => {
    sec += (s.secLevels[u.id] || 0) * u.secBonus;
  });
  return sec;
}

function getLogisticsMult(s = state) {
  let m = 1.0;
  LOGISTICS_UPGRADES.forEach(u => {
    m += (s.logLevels[u.id] || 0) * u.mult;
  });
  return m;
}

function getPlotIncome(plot, dist) {
  if (plot.damaged) return 0;
  let inc = plot.baseIncome * Math.pow(1.4, plot.level - 1) * dist.demand;
  if (plot.strategy === 'undercut') inc *= 0.90; // Fiyat kırma: biraz düşük marj ama yüksek baskı
  if (plot.strategy === 'premium') inc *= 1.25;
  return inc * getLogisticsMult();
}

function getTotalIncome() {
  let sum = 0;
  state.districts.forEach(d => {
    if (!state.unlockedDistricts.includes(d.id)) return;
    d.plots.forEach(p => {
      if (p.owner === 'player') sum += getPlotIncome(p, d);
    });
  });
  return sum;
}

function getNextHaracCost() {
  if (state.kemalDefeated) return 0;
  return Math.floor(6000 + state.day * 2200 + countPlayerShops() * 2500);
}

function showToast(msg) {
  const box = document.getElementById('toastBox');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function addStoryLog(text) {
  state.storyLogs.unshift(`<span class="log-day">[Gün ${state.day}]</span> ${text}`);
  if (state.storyLogs.length > 25) state.storyLogs.pop();
}

// =========================================================================
// 2D CANLI ŞEHİR HARİTASI ÇİZİM MOTORU (HTML5 CANVAS)
// =========================================================================
const canvas = document.getElementById('cityCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);

function spawnFloatingMoney(x, y, text, color = '#34d399') {
  floatingTexts.push({ x, y, text, color, alpha: 1, vy: -0.65 });
}

function initVehicles() {
  vehicles = [
    { axis: 'h', pos: 0.1, speed: 0.0028, color: '#10b981', label: '🚚' },
    { axis: 'v', pos: 0.8, speed: -0.0024, color: '#f59e0b', label: '🚐' }
  ];
}

function drawCityScene() {
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  if (!w || !h) {
    requestAnimationFrame(drawCityScene);
    return;
  }

  // Zemin (Gece/Gündüz tonu)
  const isEvening = state.hour >= 18;
  ctx.fillStyle = isEvening ? '#091122' : '#0f1b33';
  ctx.fillRect(0, 0, w, h);

  // Yeşil park / çim blokları
  ctx.fillStyle = isEvening ? '#0d2229' : '#132e35';
  ctx.beginPath();
  ctx.roundRect(14, 14, w - 28, h - 28, 16);
  ctx.fill();

  // Ana 2D Kavşak Yolları (Artı şeklinde cadde)
  const roadW = 46;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, h / 2 - roadW / 2, w, roadW);
  ctx.fillRect(w / 2 - roadW / 2, 0, roadW, h);

  // Yol şerit çizgileri
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.setLineDash([]);

  // Dekoratif 2D ağaçlar
  const trees = [
    [0.08, 0.15], [0.92, 0.15], [0.08, 0.85], [0.92, 0.85],
    [0.42, 0.14], [0.58, 0.86]
  ];
  trees.forEach(([tx, ty]) => {
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.arc(tx * w, ty * h, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(tx * w - 2, ty * h - 2, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Lojistik Bağlantı Hatları (Oyuncunun binaları arasında parlayan hat)
  const dist = state.districts.find(d => d.id === state.selectedDistrict);
  const ownedPlots = dist.plots.filter(p => p.owner === 'player');
  if (ownedPlots.length >= 2) {
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ownedPlots.forEach((p, idx) => {
      const px = p.x * w;
      const py = p.y * h;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Hareketli 2D Araçlar (Kargo kamyonları + Kemal Abi'nin Siyah Makam Arabası)
  vehicles.forEach(v => {
    v.pos += v.speed;
    if (v.pos > 1.05) v.pos = -0.05;
    if (v.pos < -0.05) v.pos = 1.05;

    const vx = v.axis === 'h' ? v.pos * w : w / 2 + (v.speed > 0 ? -10 : 10);
    const vy = v.axis === 'v' ? v.pos * h : h / 2 + (v.speed > 0 ? 10 : -10);

    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.roundRect(vx - 11, vy - 7, 22, 14, 4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(v.label, vx, vy + 4);
  });

  if (blackCarActive) {
    // Kemal Abi'nin siyah arabası kavşakta bekler
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 22, h / 2 - 12, 44, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎩 ABİ', w / 2, h / 2 + 4);
  }

  // 2D BİNALAR (4 Parsel)
  const bw = Math.min(132, w * 0.37);
  const bh = 86;

  dist.plots.forEach(plot => {
    const cx = plot.x * w;
    const cy = plot.y * h;
    const x = cx - bw / 2;
    const y = cy - bh / 2;

    // Bina gölgesi
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 6, bw, bh, 14);
    ctx.fill();

    // Bina gövdesi (Sahibine göre renk)
    let borderCol = '#475569';
    let roofCol = '#1e293b';
    let badgeText = 'SATILIK';
    let badgeBg = '#334155';

    if (plot.owner === 'player') {
      borderCol = '#10b981';
      roofCol = '#064e3b';
      badgeText = `SENİN • Lv.${plot.level}`;
      badgeBg = '#10b981';
    } else if (plot.owner === 'rival1') {
      borderCol = '#ef4444';
      roofCol = '#450a0a';
      badgeText = 'KUZEY';
      badgeBg = '#ef4444';
    } else if (plot.owner === 'rival2') {
      borderCol = '#8b5cf6';
      roofCol = '#2e1065';
      badgeText = 'ATLAS';
      badgeBg = '#8b5cf6';
    }

    if (plot.damaged || activeRaidPlotId === plot.id) {
      borderCol = '#f59e0b';
      roofCol = '#451a03';
      badgeText = '🚨 HASARLI';
      badgeBg = '#f59e0b';
    }

    ctx.fillStyle = roofCol;
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    // Üst Sahiplik Etiketi
    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    ctx.roundRect(cx - 38, y - 9, 76, 18, 6);
    ctx.fill();

    ctx.fillStyle = plot.owner === 'player' ? '#022c22' : '#ffffff';
    ctx.font = 'bold 9px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, cx, y + 3);

    // Bina İkonu
    ctx.font = '24px sans-serif';
    ctx.fillText(plot.icon, cx, cy + 4);

    // Bina Adı
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText(plot.name, cx, cy + 22);

    // Gelir veya Fiyat Alt Yazısı
    const subTxt = plot.owner === 'player'
      ? (plot.damaged ? 'Tamir Gerekli!' : `+${formatMoney(getPlotIncome(plot, dist))}/sn`)
      : formatMoney(getBuyPrice(plot));
    ctx.fillStyle = plot.owner === 'player' ? '#6ee7b7' : '#cbd5e1';
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.fillText(subTxt, cx, cy + 35);

    // Fiyat kırma rozeti
    if (plot.owner === 'player' && plot.strategy === 'undercut') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + bw - 8, y + 10, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('⚔', x + bw - 8, y + 13);
    }
  });

  // Yüzen Para Efektleri (+₺150)
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= 0.016;
    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = ft.alpha;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(drawCityScene);
}

// 2D Canvas Tıklama Algılama
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const w = rect.width;
  const h = rect.height;
  const bw = Math.min(132, w * 0.37);
  const bh = 86;

  const dist = state.districts.find(d => d.id === state.selectedDistrict);
  for (const plot of dist.plots) {
    const cx = plot.x * w;
    const cy = plot.y * h;
    if (
      clickX >= cx - bw / 2 &&
      clickX <= cx + bw / 2 &&
      clickY >= cy - bh / 2 &&
      clickY <= cy + bh / 2
    ) {
      playBeep(540, 0.06);
      openBuildingModal(dist, plot);
      return;
    }
  }
});

// =========================================================================
// BİNA DETAY MODALI
// =========================================================================
function getBuyPrice(plot) {
  let c = plot.baseCost * Math.pow(1.4, plot.level - 1);
  if (plot.owner !== 'neutral' && plot.owner !== 'player') c *= 1.3;
  return Math.floor(c);
}

function getUpgradePrice(plot) {
  return Math.floor(plot.baseCost * 0.75 * Math.pow(1.55, plot.level));
}

function openBuildingModal(dist, plot) {
  const modal = document.getElementById('buildingModal');
  const tag = document.getElementById('bModalTag');
  const name = document.getElementById('bModalName');
  const content = document.getElementById('bModalContent');

  name.textContent = `${plot.icon} ${plot.name}`;

  if (plot.owner === 'player') {
    tag.textContent = `SENİN İŞLETMEN • SEVİYE ${plot.level}`;
    const upgCost = getUpgradePrice(plot);
    const inc = getPlotIncome(plot, dist);

    if (plot.damaged) {
      const repairCost = Math.floor(plot.baseCost * 0.25);
      content.innerHTML = `
        <p style="font-size:0.82rem;color:#fca5a5;margin-bottom:12px;">🚨 Baskında zarar gördü! Gelir üretebilmesi için tamir etmelisin.</p>
        <button class="big-action-btn danger full-width" ${state.cash < repairCost ? 'disabled' : ''} onclick="repairShop('${dist.id}','${plot.id}',${repairCost})">
          🔧 Tamir Et (${formatMoney(repairCost)})
        </button>
      `;
    } else {
      content.innerHTML = `
        <div class="info-grid">
          <div class="info-cell"><span>Saniyelik Gelir</span><strong class="pos">+${formatMoney(inc)}/sn</strong></div>
          <div class="info-cell"><span>Bölge Talebi</span><strong>x${dist.demand}</strong></div>
        </div>
        <div style="font-size:0.74rem;color:#94a3b8;margin-bottom:6px;font-weight:700;">Fiyat Politikası Seç:</div>
        <div class="strat-row">
          <button class="strat-chip cut ${plot.strategy === 'undercut' ? 'active' : ''}" onclick="changeStrat('${dist.id}','${plot.id}','undercut')">⚔️ Fiyat Kır</button>
          <button class="strat-chip ${plot.strategy === 'balanced' ? 'active' : ''}" onclick="changeStrat('${dist.id}','${plot.id}','balanced')">⚖️ Normal</button>
          <button class="strat-chip ${plot.strategy === 'premium' ? 'active' : ''}" onclick="changeStrat('${dist.id}','${plot.id}','premium')">💎 Lüks (+%25)</button>
        </div>
        <button class="big-action-btn primary full-width" ${state.cash < upgCost ? 'disabled' : ''} onclick="upgradeShop('${dist.id}','${plot.id}')">
          ⬆️ Seviye Yükselt (${formatMoney(upgCost)})
        </button>
      `;
    }
  } else {
    const buyCost = getBuyPrice(plot);
    const estInc = getPlotIncome({ ...plot, owner: 'player' }, dist);
    tag.textContent = plot.owner === 'neutral' ? 'SATILIK DÜKKÂN' : 'RAKİP İŞLETMESİ';
    content.innerHTML = `
      <div class="info-grid">
        <div class="info-cell"><span>Alırsan Gelirin</span><strong class="pos">+${formatMoney(estInc)}/sn</strong></div>
        <div class="info-cell"><span>Satın Alma Bedeli</span><strong>${formatMoney(buyCost)}</strong></div>
      </div>
      <button class="big-action-btn ${plot.owner === 'neutral' ? 'primary' : 'danger'} full-width" ${state.cash < buyCost ? 'disabled' : ''} onclick="purchaseShop('${dist.id}','${plot.id}')">
        ${plot.owner === 'neutral' ? '🏢 Dükkânı Satın Al' : '⚔️ Rakibi Satın Al'} (${formatMoney(buyCost)})
      </button>
    `;
  }

  modal.classList.remove('hidden');
}

window.repairShop = function(distId, plotId, cost) {
  if (state.cash < cost) return;
  const dist = state.districts.find(d => d.id === distId);
  const plot = dist.plots.find(p => p.id === plotId);
  state.cash -= cost;
  state.dailySpent += cost;
  plot.damaged = false;
  activeRaidPlotId = null;
  playBeep(660, 0.12, 'triangle');
  showToast(`🔧 ${plot.name} tamir edildi ve üretime döndü!`);
  saveState();
  openBuildingModal(dist, plot);
  refreshUI();
};

window.changeStrat = function(distId, plotId, strat) {
  const dist = state.districts.find(d => d.id === distId);
  const plot = dist.plots.find(p => p.id === plotId);
  plot.strategy = strat;
  playBeep(500, 0.05);
  if (strat === 'undercut') {
    showToast('⚔️ Fiyat kırıldı! Rakipler baskı altında ama baskın riski arttı.');
  }
  saveState();
  openBuildingModal(dist, plot);
  refreshUI();
};

window.upgradeShop = function(distId, plotId) {
  const dist = state.districts.find(d => d.id === distId);
  const plot = dist.plots.find(p => p.id === plotId);
  const cost = getUpgradePrice(plot);
  if (state.cash < cost) return;
  state.cash -= cost;
  state.dailySpent += cost;
  plot.level++;
  state.respect += 2;
  playBeep(700, 0.1, 'triangle');
  showToast(`⬆️ ${plot.name} Seviye ${plot.level} oldu!`);
  saveState();
  openBuildingModal(dist, plot);
  refreshUI();
};

window.purchaseShop = function(distId, plotId) {
  const dist = state.districts.find(d => d.id === distId);
  const plot = dist.plots.find(p => p.id === plotId);
  const cost = getBuyPrice(plot);
  if (state.cash < cost) return;
  const wasRival = plot.owner !== 'neutral';
  state.cash -= cost;
  state.dailySpent += cost;
  plot.owner = 'player';
  state.respect += wasRival ? 10 : 5;
  playBeep(780, 0.14, 'triangle');
  const msg = wasRival ? `🔥 Rakip dükkân ${plot.name} devralındı!` : `✅ ${plot.name} satın alındı!`;
  showToast(msg);
  addStoryLog(msg);
  document.getElementById('buildingModal').classList.add('hidden');
  saveState();
  refreshUI();
};

document.getElementById('closeBuildingModal').onclick = () => {
  document.getElementById('buildingModal').classList.add('hidden');
};

// =========================================================================
// HİKAYE, PORTRE ÇİZİMİ, KEMAL ABİ HARAÇ & BASKIN OLAYLARI
// =========================================================================
function drawCharacterPortrait(who) {
  const pCanvas = document.getElementById('portraitCanvas');
  const pctx = pCanvas.getContext('2d');
  pctx.clearRect(0, 0, 76, 76);

  // Arka plan
  pctx.fillStyle = who === 'kemal' ? '#1e1b4b' : who === 'kuzey' ? '#450a0a' : '#064e3b';
  pctx.fillRect(0, 0, 76, 76);

  // Omuz / Takım elbise
  pctx.fillStyle = who === 'kemal' ? '#0f172a' : who === 'kuzey' ? '#1e293b' : '#047857';
  pctx.beginPath();
  pctx.arc(38, 78, 28, Math.PI, 0);
  pctx.fill();

  // Kafa
  pctx.fillStyle = '#f1c27d';
  pctx.beginPath();
  pctx.arc(38, 36, 17, 0, Math.PI * 2);
  pctx.fill();

  if (who === 'kemal') {
    // Siyah güneş gözlüğü & bıyık (Mahalle Abisi)
    pctx.fillStyle = '#090d16';
    pctx.fillRect(24, 30, 12, 6);
    pctx.fillRect(40, 30, 12, 6);
    pctx.fillRect(36, 32, 4, 2);
    // Bıyık
    pctx.fillRect(30, 43, 16, 3);
    // Altın zincir
    pctx.strokeStyle = '#fbbf24';
    pctx.lineWidth = 2;
    pctx.beginPath();
    pctx.arc(38, 56, 9, 0.2, Math.PI - 0.2);
    pctx.stroke();
  } else if (who === 'selin') {
    // Saç & gülümseme
    pctx.fillStyle = '#312e81';
    pctx.beginPath();
    pctx.arc(38, 32, 18, Math.PI, 0);
    pctx.fill();
    pctx.fillStyle = '#0f172a';
    pctx.beginPath();
    pctx.arc(32, 34, 2, 0, Math.PI * 2);
    pctx.arc(44, 34, 2, 0, Math.PI * 2);
    pctx.fill();
  } else {
    // Kuzey (Rakip)
    pctx.fillStyle = '#7f1d1d';
    pctx.beginPath();
    pctx.arc(38, 28, 16, Math.PI, 0);
    pctx.fill();
    pctx.strokeStyle = '#000';
    pctx.lineWidth = 2;
    pctx.beginPath();
    pctx.moveTo(27, 30); pctx.lineTo(35, 33);
    pctx.moveTo(49, 30); pctx.lineTo(41, 33);
    pctx.stroke();
  }
}

function triggerEventModal({ who, badge, speaker, role, dialogue, choices }) {
  drawCharacterPortrait(who);
  document.getElementById('eventBadge').textContent = badge;
  document.getElementById('eventSpeaker').textContent = speaker;
  document.getElementById('eventRole').textContent = role;
  document.getElementById('eventDialogue').textContent = dialogue;

  const choicesBox = document.getElementById('eventChoices');
  choicesBox.innerHTML = '';
  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = `big-action-btn ${ch.style || 'primary'} full-width`;
    btn.textContent = ch.label;
    btn.disabled = !!ch.disabled;
    btn.onclick = () => {
      document.getElementById('eventModal').classList.add('hidden');
      blackCarActive = false;
      ch.action();
      saveState();
      refreshUI();
    };
    choicesBox.appendChild(btn);
  });

  document.getElementById('eventModal').classList.remove('hidden');
}

function triggerKemalHaracEvent() {
  blackCarActive = true;
  const harac = getNextHaracCost();
  const sec = getSecurityPower();
  const requiredSec = 20 + state.day * 8;

  triggerEventModal({
    who: 'kemal',
    badge: '🎩 HARAÇ GÜNÜ',
    speaker: 'Kemal Abi',
    role: 'Mahalle Ağası',
    dialogue: `"Selam yeğenim, işlerin açılmış maşallah. Bu mahallede dükkânların camı kırılmasın istiyorsan ${formatMoney(harac)} koruma payını alalım. Ne diyorsun?"`,
    choices: [
      {
        label: `💸 Haracı Öde (${formatMoney(harac)}) — Sorun Çıkmasın`,
        style: 'gold',
        disabled: state.cash < harac,
        action: () => {
          state.cash -= harac;
          state.dailySpent += harac;
          state.kemalTruceDays = 3;
          addStoryLog(`Kemal Abi'ye ${formatMoney(harac)} haraç ödendi. Mahallede sükûnet sağlandı.`);
          showToast('🤝 Haraç ödendi, dükkânların güvende.');
        }
      },
      {
        label: `🗣️ Pazarlık Yap (%50 İndirim Şansı: ${formatMoney(Math.floor(harac / 2))})`,
        style: 'primary',
        disabled: state.cash < Math.floor(harac / 2),
        action: () => {
          if (Math.random() < 0.65) {
            const half = Math.floor(harac / 2);
            state.cash -= half;
            state.respect += 5;
            addStoryLog(`Kemal Abi ile masaya oturdun ve haracı yarıya (${formatMoney(half)}) indirdin!`);
            showToast('😎 Pazarlık tuttu! Yarı haraç ödedin +5 Saygınlık.');
          } else {
            const penalty = Math.min(state.cash, Math.floor(harac * 1.2));
            state.cash -= penalty;
            addStoryLog(`Pazarlık ters tepti! Kemal Abi sinirlenip ${formatMoney(penalty)} aldı.`);
            showToast('😠 Pazarlık ters tepti!');
          }
        }
      },
      {
        label: `🛡️ Haracı Reddet! (Senin Koruman: ${sec} vs Gereken: ${requiredSec})`,
        style: 'danger',
        action: () => {
          if (sec >= requiredSec) {
            state.respect += 20;
            if (state.day >= 9) state.kemalDefeated = true;
            addStoryLog(`Kemal Abi'ye posta koydun! Korumaların sokağı tuttu (+20 Saygınlık).`);
            showToast('🔥 Kemal Abi geri adım attı! +20 Saygınlık!');
          } else {
            damageRandomPlayerShop();
            const stolen = Math.min(state.cash, Math.floor(harac * 0.7));
            state.cash -= stolen;
            addStoryLog(`Koruman yetersiz kaldı! Kemal Abi'nin adamları bir dükkânına zarar verdi.`);
            showToast('🚨 Koruma yetersiz! Bir dükkânın hasar aldı.');
          }
        }
      }
    ]
  });
}

function triggerRivalRaidEvent() {
  const sec = getSecurityPower();
  const raidPower = 15 + state.day * 6;
  const bribeCost = Math.floor(4000 + state.day * 1500);

  triggerEventModal({
    who: 'kuzey',
    badge: '🚨 GECE BASKINI!',
    speaker: "Kuzey Bey'in Adamları",
    role: 'Rakip Sabotaj Ekibi',
    dialogue: `"Mahallede fiyat kırıp bizim müşterileri çalarsan bedelini ödersin! Adamlarımız şu an dükkânlarının kapısında!"`,
    choices: [
      {
        label: `🛡️ Korumalarla Savun (Koruman: ${sec} vs Baskın: ${raidPower})`,
        style: 'primary',
        action: () => {
          if (sec >= raidPower) {
            const reward = 5000 + state.day * 1000;
            state.cash += reward;
            state.respect += 10;
            addStoryLog(`Rakip baskını püskürtüldü! Tazminat olarak +${formatMoney(reward)} aldın.`);
            showToast(`🛡️ Baskın püskürtüldü! +${formatMoney(reward)}`);
          } else {
            damageRandomPlayerShop();
            addStoryLog(`Gece baskınında bir dükkânın hasar gördü!`);
            showToast('🚨 Baskında bir dükkânın hasar aldı!');
          }
        }
      },
      {
        label: `💰 Nakit Ödeyip Uzlaş (${formatMoney(bribeCost)})`,
        style: 'gold',
        disabled: state.cash < bribeCost,
        action: () => {
          state.cash -= bribeCost;
          addStoryLog(`Baskını durdurmak için ${formatMoney(bribeCost)} ödeme yapıldı.`);
          showToast('🤝 Baskın hasarsız atlatıldı.');
        }
      }
    ]
  });
}

function damageRandomPlayerShop() {
  const owned = [];
  state.districts.forEach(d => d.plots.forEach(p => { if (p.owner === 'player' && !p.damaged) owned.push(p); }));
  if (owned.length > 0) {
    const target = owned[Math.floor(Math.random() * owned.length)];
    target.damaged = true;
    activeRaidPlotId = target.id;
  }
}

// =========================================================================
// YENİ GÜNE BAŞLA SİSTEMİ
// =========================================================================
document.getElementById('newDayBtn').onclick = () => {
  const dayRev = Math.floor(state.dailyEarned + getTotalIncome() * 12);
  const exp = Math.floor(state.dailySpent);
  const hasSelin = state.ownedManagers.includes('mgr_selin');
  const bonus = Math.floor((2500 + countPlayerShops() * 1800) * (hasSelin ? 1.5 : 1.0));

  document.getElementById('summaryTitle').textContent = `Gün ${state.day} Özeti`;
  document.getElementById('sumRev').textContent = '+' + formatMoney(dayRev);
  document.getElementById('sumExp').textContent = '-' + formatMoney(exp);
  document.getElementById('sumBonus').textContent = '+' + formatMoney(bonus);

  document.getElementById('confirmNewDayBtn').onclick = () => {
    document.getElementById('daySummaryModal').classList.add('hidden');
    state.day++;
    state.hour = 9;
    state.cash += bonus;
    state.dailyEarned = 0;
    state.dailySpent = 0;
    playBeep(740, 0.14, 'triangle');
    addStoryLog(`☀️ Yeni gün başladı! Günlük kapanış bonusu +${formatMoney(bonus)} kasaya eklendi.`);
    showToast(`☀️ Gün ${state.day} Başladı! (+${formatMoney(bonus)})`);

    // Hikaye / Haraç / Baskın tetikleyicileri
    if (state.day === 2) {
      triggerEventModal({
        who: 'selin',
        badge: '💡 DANIŞMAN NOTU',
        speaker: 'Selin',
        role: 'Ticaret Danışmanın',
        dialogue: `"Günaydın patron! Yarın (Gün 3) mahallenin ağası Kemal Abi haraç toplamaya gelecek. İstersen parasını ödersin, istersen Ekip & Filo sekmesinden koruma tutup ona kafa tutarsın!"`,
        choices: [{ label: 'Anlaşıldı, Hazırlanıyorum!', style: 'primary', action: () => {} }]
      });
    } else if (!state.kemalDefeated && state.day % 3 === 0) {
      triggerKemalHaracEvent();
    } else if (state.day >= 4 && Math.random() < 0.45) {
      triggerRivalRaidEvent();
    }

    saveState();
    refreshUI();
  };

  document.getElementById('daySummaryModal').classList.remove('hidden');
};

// =========================================================================
// DİĞER SEKMELER & ARAYÜZ GÜNCELLEME
// =========================================================================
function refreshUI() {
  document.getElementById('dayDisplay').textContent = `GÜN ${state.day}`;
  document.getElementById('clockDisplay').textContent = `${String(state.hour).padStart(2, '0')}:00`;
  document.getElementById('cashDisplay').textContent = formatMoney(state.cash);
  document.getElementById('incomeDisplay').textContent = '+' + formatMoney(getTotalIncome()) + '/sn';
  document.getElementById('securityDisplay').textContent = `🛡️ ${getSecurityPower()}`;
  document.getElementById('respectDisplay').textContent = `⭐ ${state.respect}`;

  const pct = getControlPct();
  document.getElementById('cityControlPct').textContent = `%${pct}`;
  document.getElementById('playerRank').textContent =
    pct >= 75 ? '👑 Şehrin Tek Hakimi' : pct >= 40 ? '🏢 Holding Patronu' : pct >= 20 ? '🚚 Mahalle Lideri' : '🏪 Sokak Girişimcisi';

  const daysToHarac = state.kemalDefeated ? 'Bitti' : `${3 - (state.day % 3)} gün sonra`;
  document.getElementById('haracCountdownBadge').textContent = state.kemalDefeated
    ? '👑 Haraç Dönemi Kapandı'
    : `🎩 Kemal Abi: ${daysToHarac}`;
  document.getElementById('nextHaracAmount').textContent = state.kemalDefeated ? '₺0' : formatMoney(getNextHaracCost());

  // Baskın riski hesapla
  let undercutCount = 0;
  state.districts.forEach(d => d.plots.forEach(p => { if (p.owner === 'player' && p.strategy === 'undercut') undercutCount++; }));
  const riskEl = document.getElementById('raidRiskText');
  if (undercutCount >= 2 && getSecurityPower() < 30) {
    riskEl.textContent = 'Yüksek';
    riskEl.className = 'risk-high';
  } else if (undercutCount >= 1) {
    riskEl.textContent = 'Orta';
    riskEl.className = 'risk-med';
  } else {
    riskEl.textContent = 'Düşük';
    riskEl.className = 'risk-low';
  }

  // Aktif Görev Kontrolü
  const q = QUESTS[state.questIndex];
  const claimBtn = document.getElementById('claimQuestBtn');
  if (q) {
    document.getElementById('questText').textContent = `${q.text} (+${formatMoney(q.reward)})`;
    if (q.check(state)) {
      claimBtn.classList.remove('hidden');
      claimBtn.onclick = () => {
        state.cash += q.reward;
        state.questIndex++;
        playBeep(820, 0.14, 'triangle');
        showToast(`🎉 Görev Tamamlandı! +${formatMoney(q.reward)}`);
        saveState();
        refreshUI();
      };
    } else {
      claimBtn.classList.add('hidden');
    }
  } else {
    document.getElementById('questText').textContent = 'Tüm ana görevler tamamlandı! Şehri ele geçir.';
    claimBtn.classList.add('hidden');
  }

  renderDistrictBar();
  renderShopsTab();
  renderUpgradesTab();
  renderStoryTab();
}

function renderDistrictBar() {
  const bar = document.getElementById('districtBar');
  bar.innerHTML = '';
  state.districts.forEach(d => {
    const unlocked = state.unlockedDistricts.includes(d.id);
    const btn = document.createElement('button');
    btn.className = 'dist-tab' + (state.selectedDistrict === d.id ? ' active' : '');
    btn.textContent = unlocked ? `📍 ${d.name}` : `🔒 ${d.name} (${formatMoney(d.unlockCost)})`;
    btn.onclick = () => {
      if (unlocked) {
        state.selectedDistrict = d.id;
        document.getElementById('currentDistrictTitle').textContent = `📍 ${d.name}`;
        refreshUI();
      } else {
        if (state.cash < d.unlockCost) {
          showToast(`${d.name} için ${formatMoney(d.unlockCost)} gerekli!`);
          return;
        }
        state.cash -= d.unlockCost;
        state.unlockedDistricts.push(d.id);
        state.selectedDistrict = d.id;
        document.getElementById('currentDistrictTitle').textContent = `📍 ${d.name}`;
        addStoryLog(`🚀 ${d.name} bölgesi ticaret ağına açıldı!`);
        showToast(`🎉 ${d.name} açıldı!`);
        saveState();
        refreshUI();
      }
    };
    bar.appendChild(btn);
  });
}

function renderShopsTab() {
  const box = document.getElementById('shopsListContainer');
  box.innerHTML = '';
  state.districts.forEach(d => {
    d.plots.filter(p => p.owner === 'player').forEach(p => {
      const upg = getUpgradePrice(p);
      const inc = getPlotIncome(p, d);
      const card = document.createElement('div');
      card.className = 'ui-card';
      card.innerHTML = `
        <div class="ui-card-row">
          <div>
            <h4>${p.icon} ${p.name} (Lv.${p.level})</h4>
            <p>${d.name} • ${p.damaged ? '🚨 Hasarlı (2D haritadan tamir et)' : `+${formatMoney(inc)}/sn`}</p>
          </div>
          <button class="big-action-btn primary" ${state.cash < upg || p.damaged ? 'disabled' : ''} onclick="upgradeShop('${d.id}','${p.id}')">
            ⬆️ ${formatMoney(upg)}
          </button>
        </div>
        <div class="strat-row">
          <button class="strat-chip cut ${p.strategy === 'undercut' ? 'active' : ''}" onclick="changeStrat('${d.id}','${p.id}','undercut')">⚔️ Fiyat Kır</button>
          <button class="strat-chip ${p.strategy === 'balanced' ? 'active' : ''}" onclick="changeStrat('${d.id}','${p.id}','balanced')">⚖️ Normal</button>
          <button class="strat-chip ${p.strategy === 'premium' ? 'active' : ''}" onclick="changeStrat('${d.id}','${p.id}','premium')">💎 Lüks</button>
        </div>
      `;
      box.appendChild(card);
    });
  });
}

function renderUpgradesTab() {
  const secBox = document.getElementById('securityListContainer');
  secBox.innerHTML = '';
  SECURITY_UPGRADES.forEach(u => {
    const lvl = state.secLevels[u.id] || 0;
    const cost = Math.floor(u.baseCost * Math.pow(1.6, lvl));
    const card = document.createElement('div');
    card.className = 'ui-card';
    card.innerHTML = `
      <div class="ui-card-row">
        <div>
          <h4>🛡️ ${u.name} (Lv.${lvl}/${u.max})</h4>
          <p>${u.desc}</p>
        </div>
        <button class="big-action-btn primary" ${lvl >= u.max || state.cash < cost ? 'disabled' : ''} onclick="buySec('${u.id}')">
          ${lvl >= u.max ? 'MAKS' : formatMoney(cost)}
        </button>
      </div>
    `;
    secBox.appendChild(card);
  });

  const logBox = document.getElementById('logisticsListContainer');
  logBox.innerHTML = '';
  LOGISTICS_UPGRADES.forEach(u => {
    const lvl = state.logLevels[u.id] || 0;
    const cost = Math.floor(u.baseCost * Math.pow(1.6, lvl));
    const card = document.createElement('div');
    card.className = 'ui-card';
    card.innerHTML = `
      <div class="ui-card-row">
        <div>
          <h4>🚚 ${u.name} (Lv.${lvl}/${u.max})</h4>
          <p>${u.desc}</p>
        </div>
        <button class="big-action-btn primary" ${lvl >= u.max || state.cash < cost ? 'disabled' : ''} onclick="buyLog('${u.id}')">
          ${lvl >= u.max ? 'MAKS' : formatMoney(cost)}
        </button>
      </div>
    `;
    logBox.appendChild(card);
  });

  const mgrBox = document.getElementById('managersListContainer');
  mgrBox.innerHTML = '';
  MANAGERS.forEach(m => {
    const owned = state.ownedManagers.includes(m.id);
    const card = document.createElement('div');
    card.className = 'ui-card';
    card.innerHTML = `
      <div class="ui-card-row">
        <div>
          <h4>🤖 ${m.name}</h4>
          <p>${m.desc}</p>
        </div>
        <button class="big-action-btn gold" ${owned || state.cash < m.cost ? 'disabled' : ''} onclick="buyMgr('${m.id}')">
          ${owned ? 'AKTİF ✓' : formatMoney(m.cost)}
        </button>
      </div>
    `;
    mgrBox.appendChild(card);
  });
}

window.buySec = function(id) {
  const u = SECURITY_UPGRADES.find(x => x.id === id);
  const lvl = state.secLevels[id] || 0;
  const cost = Math.floor(u.baseCost * Math.pow(1.6, lvl));
  if (lvl >= u.max || state.cash < cost) return;
  state.cash -= cost;
  state.dailySpent += cost;
  state.secLevels[id] = lvl + 1;
  playBeep(660, 0.1, 'triangle');
  showToast(`🛡️ ${u.name} güçlendirildi!`);
  saveState();
  refreshUI();
};

window.buyLog = function(id) {
  const u = LOGISTICS_UPGRADES.find(x => x.id === id);
  const lvl = state.logLevels[id] || 0;
  const cost = Math.floor(u.baseCost * Math.pow(1.6, lvl));
  if (lvl >= u.max || state.cash < cost) return;
  state.cash -= cost;
  state.dailySpent += cost;
  state.logLevels[id] = lvl + 1;
  vehicles.push({ axis: Math.random() > 0.5 ? 'h' : 'v', pos: 0.2, speed: 0.0032, color: '#3b82f6', label: '🚛' });
  playBeep(680, 0.1, 'triangle');
  showToast(`🚚 ${u.name} filoya katıldı!`);
  saveState();
  refreshUI();
};

window.buyMgr = function(id) {
  const m = MANAGERS.find(x => x.id === id);
  if (state.ownedManagers.includes(id) || state.cash < m.cost) return;
  state.cash -= m.cost;
  state.ownedManagers.push(id);
  playBeep(760, 0.14, 'triangle');
  showToast(`🤖 ${m.name} işe başladı!`);
  saveState();
  refreshUI();
};

function renderStoryTab() {
  const cBox = document.getElementById('charactersContainer');
  cBox.innerHTML = '';
  CHARACTERS.forEach(c => {
    const card = document.createElement('div');
    card.className = 'ui-card';
    card.innerHTML = `
      <h4>${c.id === 'kemal' ? '🎩' : c.id === 'selin' ? '💼' : '🕶️'} ${c.name} <span style="font-size:0.72rem;color:#fbbf24;">(${c.role})</span></h4>
      <p>${c.desc}</p>
    `;
    cBox.appendChild(card);
  });

  const logBox = document.getElementById('storyLogContainer');
  logBox.innerHTML = state.storyLogs.map(l => `<div class="log-entry">${l}</div>`).join('');
}

// Alt Menü Geçişleri
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
    playBeep(460, 0.04);
    if (btn.dataset.target === 'tab-city') resizeCanvas();
    refreshUI();
  };
});

document.getElementById('soundBtn').onclick = (e) => {
  state.soundOn = !state.soundOn;
  e.target.textContent = state.soundOn ? '🔊' : '🔇';
  saveState();
};

// Ana Pasif Gelir + 2D Yüzen Kazanç Efekti Döngüsü
setInterval(() => {
  const inc = getTotalIncome();
  state.cash += inc;
  state.dailyEarned += inc;
  document.getElementById('cashDisplay').textContent = formatMoney(state.cash);

  // 2D haritada binalardan yükselen para animasyonu
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  const dist = state.districts.find(d => d.id === state.selectedDistrict);
  dist.plots.forEach(p => {
    if (p.owner === 'player' && !p.damaged) {
      const val = getPlotIncome(p, dist);
      spawnFloatingMoney(p.x * w, p.y * h - 38, `+${formatMoney(val)}`);
    }
  });
}, 1000);

// Saat ilerlemesi (Her 8 saniyede +1 saat)
setInterval(() => {
  state.hour++;
  if (state.hour > 23) state.hour = 8;
  document.getElementById('clockDisplay').textContent = `${String(state.hour).padStart(2, '0')}:00`;
  saveState();
}, 8000);

// Başlat
loadState();
initVehicles();
resizeCanvas();
refreshUI();
drawCityScene();
