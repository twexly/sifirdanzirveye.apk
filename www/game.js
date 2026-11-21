// ==========================================================
// SIFIRDAN ZİRVEYE — TİCARET & ŞEHİR KONTROL SİMÜLASYONU
// ==========================================================

const RIVALS = {
  rival1: { id: 'rival1', name: 'Kuzey Holding', color: '#ef4444', aggression: 0.65 },
  rival2: { id: 'rival2', name: 'Atlas Lojistik', color: '#8b5cf6', aggression: 0.50 },
  rival3: { id: 'rival3', name: 'Vektör Grup', color: '#3b82f6', aggression: 0.40 }
};

const DISTRICTS = [
  {
    id: 'liman',
    name: 'Liman Mahallesi',
    desc: 'Başlangıç sokağın. Düşük maliyet, hızlı nakit dönüşü.',
    demand: 1.0,
    unlockCost: 0,
    requiresLicense: false,
    plots: [
      { id: 'p1', name: 'Köşe Başı Büfe', icon: '🏪', baseIncome: 140, baseCost: 12000, owner: 'player', level: 1, strategy: 'balanced' },
      { id: 'p2', name: 'Liman Fırını', icon: '🥖', baseIncome: 220, baseCost: 22000, owner: 'neutral', level: 1, strategy: 'balanced' },
      { id: 'p3', name: 'Sahil Süpermarket', icon: '🛒', baseIncome: 380, baseCost: 42000, owner: 'rival1', level: 1, strategy: 'balanced' },
      { id: 'p4', name: 'İskele Toptancısı', icon: '📦', baseIncome: 620, baseCost: 75000, owner: 'rival2', level: 1, strategy: 'balanced' }
    ]
  },
  {
    id: 'carsi',
    name: 'Merkez Çarşı',
    desc: 'Yoğun yaya trafiği ve sert fiyat rekabeti.',
    demand: 1.35,
    unlockCost: 85000,
    requiresLicense: false,
    plots: [
      { id: 'p5', name: 'Cadde Giyim Mağazası', icon: '👕', baseIncome: 950, baseCost: 110000, owner: 'rival1', level: 1, strategy: 'balanced' },
      { id: 'p6', name: 'Elektronik Pasajı', icon: '📱', baseIncome: 1450, baseCost: 165000, owner: 'neutral', level: 1, strategy: 'balanced' },
      { id: 'p7', name: 'Merkez Gurme Market', icon: '🥩', baseIncome: 2100, baseCost: 240000, owner: 'rival3', level: 1, strategy: 'balanced' },
      { id: 'p8', name: 'Çarşı AVM', icon: '🏬', baseIncome: 3200, baseCost: 360000, owner: 'rival2', level: 2, strategy: 'balanced' }
    ]
  },
  {
    id: 'sanayi',
    name: 'Sanayi Bölgesi',
    desc: 'Üretim tesisleri ve büyük tedarik depoları.',
    demand: 1.75,
    unlockCost: 350000,
    requiresLicense: false,
    plots: [
      { id: 'p9', name: 'Gıda Paketleme Tesisi', icon: '🏭', baseIncome: 4800, baseCost: 520000, owner: 'rival2', level: 1, strategy: 'balanced' },
      { id: 'p10', name: 'Soğuk Hava Deposu', icon: '❄️', baseIncome: 6900, baseCost: 780000, owner: 'rival1', level: 2, strategy: 'balanced' },
      { id: 'p11', name: 'Otomotiv Yedek Parça', icon: '⚙️', baseIncome: 9500, baseCost: 1100000, owner: 'neutral', level: 1, strategy: 'balanced' },
      { id: 'p12', name: 'Bölge Dağıtım Üssü', icon: '🚛', baseIncome: 14000, baseCost: 1600000, owner: 'rival3', level: 2, strategy: 'balanced' }
    ]
  },
  {
    id: 'finans',
    name: 'Finans Kulesi (VIP)',
    desc: 'Özel şehir haritası imtiyazı gerektiren dev ticaret merkezi.',
    demand: 2.5,
    unlockCost: 1200000,
    requiresLicense: true,
    plots: [
      { id: 'p13', name: 'Borsa Ticaret Ofisi', icon: '📈', baseIncome: 24000, baseCost: 2600000, owner: 'rival1', level: 2, strategy: 'balanced' },
      { id: 'p14', name: 'Lüks Plaza Mağazaları', icon: '💎', baseIncome: 36000, baseCost: 4000000, owner: 'rival2', level: 2, strategy: 'balanced' },
      { id: 'p15', name: 'Uluslararası Lojistik Limanı', icon: '🚢', baseIncome: 55000, baseCost: 6200000, owner: 'rival3', level: 3, strategy: 'balanced' },
      { id: 'p16', name: 'Zirve Holding Genel Merkezi', icon: '🏙️', baseIncome: 90000, baseCost: 10000000, owner: 'rival1', level: 3, strategy: 'balanced' }
    ]
  }
];

const LOGISTICS_UPGRADES = [
  { id: 'van', name: 'Mahalle Kargo Filosu', desc: 'Tüm dükkân gelirlerine +%20 hız bonusu.', baseCost: 18000, multBonus: 0.20, maxLevel: 10 },
  { id: 'hub', name: 'Bölgesel Aktarma Deposu', desc: 'Tedarik maliyetini düşürür, gelir çarpanını +%35 artırır.', baseCost: 65000, multBonus: 0.35, maxLevel: 10 },
  { id: 'fleet', name: 'Ağır Nakliye TIR Ağı', desc: 'Mahalleler arası kesintisiz sevkiyat (+%60 gelir).', baseCost: 220000, multBonus: 0.60, maxLevel: 10 },
  { id: 'ai_supply', name: 'Otonom Drone & AI Lojistik', desc: 'Anlık stok yenileme ve +%100 süper çarpan.', baseCost: 900000, multBonus: 1.00, maxLevel: 10 }
];

const MANAGERS = [
  { id: 'mgr_offline', name: 'Asistan Bot: Gece Vardiyası', desc: 'Uygulama kapalıyken bile %100 verimle gelir toplar (4 saate kadar).', cost: 30000, icon: '🤖' },
  { id: 'mgr_price', name: 'Asistan Bot: Piyasa Avcısı', desc: 'Fiyat kıran işletmelerinin müşteri çalma gücünü +%30 artırır.', cost: 120000, icon: '⚔️' },
  { id: 'mgr_upgrade', name: 'Asistan Bot: Lojistik Direktörü', desc: 'Tüm dağıtım ağı çarpanına kalıcı +0.50x ekler.', cost: 450000, icon: '📊' }
];

const LICENSES = [
  { id: 'lic_vip_map', name: 'Finans Kulesi Özel Harita Hakkı', desc: 'Şehrin en kârlı VIP Finans Kulesi bölgesinin kilidini açar.', cost: 500000, icon: '🗺️' },
  { id: 'lic_monopoly', name: 'Ticaret Odası Tekel İmtiyazı', desc: 'Rakip işletmeleri satın alma maliyetinde %20 indirim sağlar.', cost: 850000, icon: '🏛️' }
];

const CAPITAL_PACKS = [
  { id: 'pack_starter', name: 'Melek Yatırımcı Fonu', desc: '+₺50.000 Anında Nakit', amount: 50000, cooldownSec: 90, icon: '💼' },
  { id: 'pack_growth', name: 'Banka Ticari Kredisi', desc: '+₺250.000 Büyüme Sermayesi', amount: 250000, cooldownSec: 240, icon: '🏦' }
];

// Varsayılan Oyun Durumu
let state = {
  cash: 25000,
  soundOn: true,
  selectedDistrict: 'liman',
  unlockedDistricts: ['liman'],
  districts: JSON.parse(JSON.stringify(DISTRICTS)),
  logisticsLevels: { van: 0, hub: 0, fleet: 0, ai_supply: 0 },
  ownedManagers: [],
  ownedLicenses: [],
  packCooldowns: {},
  lastSaveTime: Date.now()
};

// Kayıt Yükleme & Çevrimdışı Kazanç Hesaplama
function loadGame() {
  try {
    const raw = localStorage.getItem('sifirdan_zirveye_save_v1');
    if (raw) {
      const saved = JSON.parse(raw);
      state = { ...state, ...saved };
      const now = Date.now();
      const elapsedSec = Math.floor((now - (state.lastSaveTime || now)) / 1000);
      if (elapsedSec > 15) {
        const hasOfflineBot = state.ownedManagers.includes('mgr_offline');
        const maxSec = hasOfflineBot ? 4 * 3600 : 1800; // Botsuz 30 dk, botla 4 saat
        const efficiency = hasOfflineBot ? 1.0 : 0.4;
        const effectiveSec = Math.min(elapsedSec, maxSec);
        const earned = Math.floor(calculateTotalIncomePerSec() * effectiveSec * efficiency);
        if (earned > 0) {
          showOfflineModal(effectiveSec, earned);
        }
      }
    }
  } catch (e) {
    console.warn('Kayıt okunamadı:', e);
  }
}

function saveGame() {
  state.lastSaveTime = Date.now();
  localStorage.setItem('sifirdan_zirveye_save_v1', JSON.stringify(state));
}

// Web Audio API ile Hafif Ses Efektleri (Harici ses dosyası gerektirmez)
function playTone(freq = 520, duration = 0.08, type = 'sine') {
  if (!state.soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function formatMoney(num) {
  if (num >= 1e9) return '₺' + (num / 1e9).toFixed(2) + ' Mr';
  if (num >= 1e6) return '₺' + (num / 1e6).toFixed(2) + ' Mn';
  if (num >= 1e3) return '₺' + Math.floor(num).toLocaleString('tr-TR');
  return '₺' + Math.floor(num);
}

function getLogisticsMultiplier() {
  let mult = 1.0;
  LOGISTICS_UPGRADES.forEach(u => {
    const lvl = state.logisticsLevels[u.id] || 0;
    mult += lvl * u.multBonus;
  });
  if (state.ownedManagers.includes('mgr_upgrade')) mult += 0.5;
  return mult;
}

function getPlotIncomePerSec(plot, district) {
  let base = plot.baseIncome * Math.pow(1.42, plot.level - 1) * district.demand;
  if (plot.strategy === 'undercut') {
    // Fiyat kırma: kısa vadede birim kâr biraz düşer ama yüksek hacim & rakip zayıflatma sağlar
    const botBonus = state.ownedManagers.includes('mgr_price') ? 1.15 : 0.92;
    base *= botBonus;
  } else if (plot.strategy === 'premium') {
    // Tekel varsa yüksek kâr, yoksa müşteri kaybı
    const playerCount = district.plots.filter(p => p.owner === 'player').length;
    base *= playerCount >= 3 ? 1.35 : 0.75;
  }
  return base * getLogisticsMultiplier();
}

function calculateTotalIncomePerSec() {
  let total = 0;
  state.districts.forEach(d => {
    if (!state.unlockedDistricts.includes(d.id)) return;
    d.plots.forEach(p => {
      if (p.owner === 'player') {
        total += getPlotIncomePerSec(p, d);
      }
    });
  });
  return total;
}

function getOwnershipStats() {
  let total = 0, player = 0, r1 = 0, r2 = 0, r3 = 0, neutral = 0;
  state.districts.forEach(d => {
    d.plots.forEach(p => {
      total++;
      if (p.owner === 'player') player++;
      else if (p.owner === 'rival1') r1++;
      else if (p.owner === 'rival2') r2++;
      else if (p.owner === 'rival3') r3++;
      else neutral++;
    });
  });
  return {
    total,
    playerPct: Math.round((player / total) * 100),
    r1Pct: Math.round((r1 / total) * 100),
    r2Pct: Math.round((r2 / total) * 100),
    r3Pct: Math.round((r3 / total) * 100),
    neutralPct: Math.max(0, 100 - Math.round(((player + r1 + r2 + r3) / total) * 100)),
    playerCount: player
  };
}

function getRankTitle(pct) {
  if (pct >= 90) return '👑 Şehir İmparatoru';
  if (pct >= 65) return '🏙️ Holding Patronu';
  if (pct >= 40) return '📈 Bölge Lideri';
  if (pct >= 20) return '🚚 Ticaret Ağı Kurucusu';
  return '🏪 Sokak Girişimcisi';
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// Arayüz Güncelleme
function renderHUD() {
  const inc = calculateTotalIncomePerSec();
  const stats = getOwnershipStats();

  document.getElementById('cashDisplay').textContent = formatMoney(state.cash);
  document.getElementById('incomeDisplay').textContent = '+' + formatMoney(inc) + '/sn';
  document.getElementById('controlDisplay').textContent = '%' + stats.playerPct;
  document.getElementById('playerRank').textContent = getRankTitle(stats.playerPct);

  document.getElementById('domPlayer').style.width = stats.playerPct + '%';
  document.getElementById('domRival1').style.width = stats.r1Pct + '%';
  document.getElementById('domRival2').style.width = stats.r2Pct + '%';
  document.getElementById('domRival3').style.width = stats.r3Pct + '%';
  document.getElementById('domNeutral').style.width = stats.neutralPct + '%';
}

function renderDistrictTabs() {
  const wrap = document.getElementById('districtTabs');
  wrap.innerHTML = '';
  state.districts.forEach(d => {
    const unlocked = state.unlockedDistricts.includes(d.id);
    const btn = document.createElement('button');
    btn.className = 'dist-chip' + (state.selectedDistrict === d.id ? ' active' : '') + (!unlocked ? ' locked' : '');
    btn.innerHTML = `${unlocked ? '📍' : '🔒'} ${d.name}`;
    btn.onclick = () => {
      if (unlocked) {
        state.selectedDistrict = d.id;
        playTone(480, 0.05);
        renderMap();
      } else {
        attemptUnlockDistrict(d);
      }
    };
    wrap.appendChild(btn);
  });
}

function attemptUnlockDistrict(d) {
  if (d.requiresLicense && !state.ownedLicenses.includes('lic_vip_map')) {
    showToast('Önce Yönetim sekmesinden VIP Özel Harita Hakkı almalısın!');
    return;
  }
  if (state.cash < d.unlockCost) {
    showToast(`${d.name} kilidi için ${formatMoney(d.unlockCost)} gerekli!`);
    return;
  }
  state.cash -= d.unlockCost;
  state.unlockedDistricts.push(d.id);
  state.selectedDistrict = d.id;
  playTone(740, 0.14, 'triangle');
  showToast(`🎉 ${d.name} ticaret ağına açıldı!`);
  saveGame();
  renderAll();
}

function renderMap() {
  renderDistrictTabs();
  const dist = state.districts.find(d => d.id === state.selectedDistrict);
  document.getElementById('distName').textContent = dist.name;
  document.getElementById('distDesc').textContent = dist.desc;
  document.getElementById('distBonus').textContent = `Talep: x${dist.demand.toFixed(2)}`;

  const grid = document.getElementById('cityGrid');
  grid.innerHTML = '';

  dist.plots.forEach(plot => {
    const card = document.createElement('div');
    card.className = `plot-card owner-${plot.owner}`;
    const ownerLabel = plot.owner === 'player'
      ? `SENİN (Lv.${plot.level})`
      : plot.owner === 'neutral'
        ? 'SATILIK'
        : RIVALS[plot.owner].name;

    const incomeText = plot.owner === 'player'
      ? `+${formatMoney(getPlotIncomePerSec(plot, dist))}/sn`
      : `Değer: ${formatMoney(getPlotBuyCost(plot))}`;

    const warTag = (plot.owner === 'player' && plot.strategy === 'undercut')
      ? `<div class="plot-war-tag">⚔️ Fiyat Kırıyor</div>`
      : '';

    card.innerHTML = `
      <div class="plot-top">
        <span class="plot-icon">${plot.icon}</span>
        <span class="plot-badge">${ownerLabel}</span>
      </div>
      <div class="plot-name">${plot.name}</div>
      <div class="plot-meta">
        <span>Seviye ${plot.level}</span>
        <strong>${incomeText}</strong>
      </div>
      ${warTag}
    `;
    card.onclick = () => openPlotModal(dist, plot);
    grid.appendChild(card);
  });

  drawLogisticsLines();
  renderRivalsSummary();
}

function drawLogisticsLines() {
  const svg = document.getElementById('logisticsSvg');
  svg.innerHTML = '';
  const cards = Array.from(document.querySelectorAll('.plot-card.owner-player'));
  if (cards.length < 2) return;
  const parentRect = document.getElementById('cityMapContainer')?.getBoundingClientRect() || svg.getBoundingClientRect();

  for (let i = 0; i < cards.length - 1; i++) {
    const r1 = cards[i].getBoundingClientRect();
    const r2 = cards[i + 1].getBoundingClientRect();
    const x1 = r1.left - parentRect.left + r1.width / 2;
    const y1 = r1.top - parentRect.top + r1.height / 2;
    const x2 = r2.left - parentRect.left + r2.width / 2;
    const y2 = r2.top - parentRect.top + r2.height / 2;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#10b981');
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-dasharray', '6 4');
    line.setAttribute('opacity', '0.65');
    svg.appendChild(line);
  }
}

function renderRivalsSummary() {
  const list = document.getElementById('rivalsList');
  list.innerHTML = '';
  Object.values(RIVALS).forEach(r => {
    let count = 0;
    state.districts.forEach(d => d.plots.forEach(p => { if (p.owner === r.id) count++; }));
    const row = document.createElement('div');
    row.className = 'rival-row';
    row.innerHTML = `
      <div><span class="rival-dot" style="background:${r.color}"></span><strong>${r.name}</strong></div>
      <span>${count} İşletme</span>
    `;
    list.appendChild(row);
  });
}

function getPlotBuyCost(plot) {
  let cost = plot.baseCost * Math.pow(1.45, plot.level - 1);
  if (plot.owner !== 'neutral' && plot.owner !== 'player') {
    cost *= 1.35; // Rakip işletmeyi devralma primi
    if (state.ownedLicenses.includes('lic_monopoly')) cost *= 0.8;
  }
  return Math.floor(cost);
}

function getPlotUpgradeCost(plot) {
  return Math.floor(plot.baseCost * 0.75 * Math.pow(1.55, plot.level));
}

function openPlotModal(dist, plot) {
  const modal = document.getElementById('plotModal');
  const tag = document.getElementById('modalOwnerTag');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.textContent = `${plot.icon} ${plot.name}`;
  if (plot.owner === 'player') {
    tag.textContent = `SENİN İŞLETMEN • SEVİYE ${plot.level}`;
    const upgCost = getPlotUpgradeCost(plot);
    const curInc = getPlotIncomePerSec(plot, dist);
    body.innerHTML = `
      <div class="modal-stat-grid">
        <div class="m-stat"><span>Mevcut Gelir</span><strong>+${formatMoney(curInc)}/sn</strong></div>
        <div class="m-stat"><span>Fiyat Politikası</span><strong>${plot.strategy === 'undercut' ? '⚔️ Fiyat Kırma' : plot.strategy === 'premium' ? '💎 Lüks Marj' : '⚖️ Dengeli'}</strong></div>
      </div>
      <div class="strategy-pills">
        <button class="s-pill undercut ${plot.strategy === 'undercut' ? 'active' : ''}" onclick="setPlotStrategy('${dist.id}','${plot.id}','undercut')">⚔️ Fiyat Kır</button>
        <button class="s-pill balanced ${plot.strategy === 'balanced' ? 'active' : ''}" onclick="setPlotStrategy('${dist.id}','${plot.id}','balanced')">⚖️ Dengeli</button>
        <button class="s-pill premium ${plot.strategy === 'premium' ? 'active' : ''}" onclick="setPlotStrategy('${dist.id}','${plot.id}','premium')">💎 Yüksek Kâr</button>
      </div>
      <button class="primary-action-btn full-w" ${state.cash < upgCost ? 'disabled' : ''} onclick="upgradePlot('${dist.id}','${plot.id}')">
        ⬆️ İşletmeyi Büyüt (${formatMoney(upgCost)})
      </button>
    `;
  } else {
    const buyCost = getPlotBuyCost(plot);
    const estInc = getPlotIncomePerSec({ ...plot, owner: 'player' }, dist);
    const ownerName = plot.owner === 'neutral' ? 'Belediye / Boş' : RIVALS[plot.owner].name;
    tag.textContent = plot.owner === 'neutral' ? 'SATIN ALINABİLİR' : `RAKİP: ${ownerName.toUpperCase()}`;
    body.innerHTML = `
      <div class="modal-stat-grid">
        <div class="m-stat"><span>Tahmini Kazanç</span><strong>+${formatMoney(estInc)}/sn</strong></div>
        <div class="m-stat"><span>Devralma Bedeli</span><strong>${formatMoney(buyCost)}</strong></div>
      </div>
      <button class="primary-action-btn ${plot.owner !== 'neutral' ? 'danger' : ''} full-w" ${state.cash < buyCost ? 'disabled' : ''} onclick="buyPlot('${dist.id}','${plot.id}')">
        ${plot.owner === 'neutral' ? '🏢 Dükkânı Satın Al' : '⚔️ Rakibi Satın Al ve Devral'} (${formatMoney(buyCost)})
      </button>
    `;
  }

  modal.classList.remove('hidden');
}

window.setPlotStrategy = function(distId, plotId, strat) {
  const dist = state.districts.find(d => d.id === distId);
  const plot = dist.plots.find(p => p.id === plotId);
  plot.strategy = strat;
  playTone(580, 0.06);
  if (strat === 'undercut') {
    document.getElementById('newsTickerText').textContent = `⚔️ ${plot.name} fiyat kırdı! ${dist.name} bölgesindeki rakipler müşteri kaybediyor!`;
  }
  saveGame();
  openPlotModal(dist, plot);
  renderAll();
};

window.upgradePlot = function(distId, plotId) {
  const dist = state.districts.find(d => d.id === distId);
  const plot = dist.plots.find(p => p.id === plotId);
  const cost = getPlotUpgradeCost(plot);
  if (state.cash < cost) return;
  state.cash -= cost;
  plot.level++;
  playTone(680, 0.1, 'triangle');
  showToast(`⬆️ ${plot.name} Seviye ${plot.level} oldu!`);
  saveGame();
  openPlotModal(dist, plot);
  renderAll();
};

window.buyPlot = function(distId, plotId) {
  const dist = state.districts.find(d => d.id === distId);
  const plot = dist.plots.find(p => p.id === plotId);
  const cost = getPlotBuyCost(plot);
  if (state.cash < cost) return;
  const oldOwner = plot.owner;
  state.cash -= cost;
  plot.owner = 'player';
  playTone(780, 0.15, 'triangle');
  const msg = oldOwner === 'neutral'
    ? `✅ ${plot.name} artık senin!`
    : `🔥 ${RIVALS[oldOwner].name} elindeki ${plot.name} devralındı!`;
  showToast(msg);
  document.getElementById('newsTickerText').textContent = msg;
  document.getElementById('plotModal').classList.add('hidden');
  saveGame();
  renderAll();
};

// Sekme 2: İşletmelerim Listesi
function renderOwnedShops() {
  const list = document.getElementById('ownedShopsList');
  list.innerHTML = '';
  state.districts.forEach(d => {
    d.plots.filter(p => p.owner === 'player').forEach(p => {
      const upgCost = getPlotUpgradeCost(p);
      const inc = getPlotIncomePerSec(p, d);
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-top">
          <div>
            <div class="item-title">${p.icon} ${p.name} (Lv.${p.level})</div>
            <div class="item-sub">${d.name} • Gelir: +${formatMoney(inc)}/sn</div>
          </div>
          <button class="primary-action-btn" ${state.cash < upgCost ? 'disabled' : ''} onclick="upgradePlot('${d.id}','${p.id}')">
            ⬆️ ${formatMoney(upgCost)}
          </button>
        </div>
        <div class="strategy-pills">
          <button class="s-pill undercut ${p.strategy === 'undercut' ? 'active' : ''}" onclick="setPlotStrategy('${d.id}','${p.id}','undercut')">⚔️ Fiyat Kır</button>
          <button class="s-pill balanced ${p.strategy === 'balanced' ? 'active' : ''}" onclick="setPlotStrategy('${d.id}','${p.id}','balanced')">⚖️ Dengeli</button>
          <button class="s-pill premium ${p.strategy === 'premium' ? 'active' : ''}" onclick="setPlotStrategy('${d.id}','${p.id}','premium')">💎 Lüks Marj</button>
        </div>
      `;
      list.appendChild(card);
    });
  });
}

// Sekme 3: Lojistik & Dağıtım Ağı
function renderLogistics() {
  document.getElementById('logisticsMultDisplay').textContent = getLogisticsMultiplier().toFixed(2) + 'x';
  const list = document.getElementById('logisticsUpgradesList');
  list.innerHTML = '';
  LOGISTICS_UPGRADES.forEach(u => {
    const lvl = state.logisticsLevels[u.id] || 0;
    const cost = Math.floor(u.baseCost * Math.pow(1.65, lvl));
    const maxed = lvl >= u.maxLevel;
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-top">
        <div>
          <div class="item-title">🚚 ${u.name} (Lv.${lvl}/${u.maxLevel})</div>
          <div class="item-sub">${u.desc}</div>
        </div>
        <button class="primary-action-btn" ${maxed || state.cash < cost ? 'disabled' : ''} onclick="buyLogistics('${u.id}')">
          ${maxed ? 'MAKS' : formatMoney(cost)}
        </button>
      </div>
    `;
    list.appendChild(card);
  });
}

window.buyLogistics = function(id) {
  const u = LOGISTICS_UPGRADES.find(x => x.id === id);
  const lvl = state.logisticsLevels[id] || 0;
  const cost = Math.floor(u.baseCost * Math.pow(1.65, lvl));
  if (lvl >= u.maxLevel || state.cash < cost) return;
  state.cash -= cost;
  state.logisticsLevels[id] = lvl + 1;
  playTone(640, 0.1, 'triangle');
  showToast(`🚚 ${u.name} Seviye ${lvl + 1} oldu!`);
  saveGame();
  renderAll();
};

// Sekme 4: Yönetim & Mağaza
function renderStore() {
  const mgrList = document.getElementById('managersList');
  mgrList.innerHTML = '';
  MANAGERS.forEach(m => {
    const owned = state.ownedManagers.includes(m.id);
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-top">
        <div>
          <div class="item-title">${m.icon} ${m.name}</div>
          <div class="item-sub">${m.desc}</div>
        </div>
        <button class="primary-action-btn gold" ${owned || state.cash < m.cost ? 'disabled' : ''} onclick="buyManager('${m.id}')">
          ${owned ? 'AKTİF ✓' : formatMoney(m.cost)}
        </button>
      </div>
    `;
    mgrList.appendChild(card);
  });

  const licList = document.getElementById('licensesList');
  licList.innerHTML = '';
  LICENSES.forEach(l => {
    const owned = state.ownedLicenses.includes(l.id);
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-top">
        <div>
          <div class="item-title">${l.icon} ${l.name}</div>
          <div class="item-sub">${l.desc}</div>
        </div>
        <button class="primary-action-btn gold" ${owned || state.cash < l.cost ? 'disabled' : ''} onclick="buyLicense('${l.id}')">
          ${owned ? 'ALINDI ✓' : formatMoney(l.cost)}
        </button>
      </div>
    `;
    licList.appendChild(card);
  });

  const packsGrid = document.getElementById('capitalPacksList');
  packsGrid.innerHTML = '';
  const now = Date.now();
  CAPITAL_PACKS.forEach(pk => {
    const readyAt = state.packCooldowns[pk.id] || 0;
    const remSec = Math.max(0, Math.ceil((readyAt - now) / 1000));
    const card = document.createElement('div');
    card.className = 'pack-card';
    card.innerHTML = `
      <div style="font-size:1.7rem">${pk.icon}</div>
      <h4>${pk.name}</h4>
      <p>${pk.desc}</p>
      <button class="primary-action-btn gold full-w" ${remSec > 0 ? 'disabled' : ''} onclick="claimCapitalPack('${pk.id}')">
        ${remSec > 0 ? `${remSec} sn sonra` : 'Sermaye Al'}
      </button>
    `;
    packsGrid.appendChild(card);
  });
}

window.buyManager = function(id) {
  const m = MANAGERS.find(x => x.id === id);
  if (state.ownedManagers.includes(id) || state.cash < m.cost) return;
  state.cash -= m.cost;
  state.ownedManagers.push(id);
  playTone(820, 0.14, 'triangle');
  showToast(`🤖 ${m.name} göreve başladı!`);
  saveGame();
  renderAll();
};

window.buyLicense = function(id) {
  const l = LICENSES.find(x => x.id === id);
  if (state.ownedLicenses.includes(id) || state.cash < l.cost) return;
  state.cash -= l.cost;
  state.ownedLicenses.push(id);
  playTone(860, 0.16, 'triangle');
  showToast(`🏛️ ${l.name} onaylandı!`);
  saveGame();
  renderAll();
};

window.claimCapitalPack = function(id) {
  const pk = CAPITAL_PACKS.find(x => x.id === id);
  const now = Date.now();
  if ((state.packCooldowns[id] || 0) > now) return;
  state.cash += pk.amount;
  state.packCooldowns[id] = now + pk.cooldownSec * 1000;
  playTone(760, 0.14, 'triangle');
  showToast(`💰 +${formatMoney(pk.amount)} sermaye hesabına eklendi!`);
  saveGame();
  renderAll();
};

function showOfflineModal(sec, earned) {
  const mins = Math.floor(sec / 60);
  document.getElementById('offlineTimeText').textContent = `Çevrimdışı Süre: ${mins > 0 ? mins + ' dk' : sec + ' sn'}`;
  document.getElementById('offlineCashText').textContent = '+' + formatMoney(earned);
  const modal = document.getElementById('offlineModal');
  modal.classList.remove('hidden');
  document.getElementById('claimOfflineBtn').onclick = () => {
    state.cash += earned;
    modal.classList.add('hidden');
    playTone(800, 0.15, 'triangle');
    saveGame();
    renderHUD();
  };
}

// Canlı Rakip Yapay Zekası & Ekonomi Döngüsü
setInterval(() => {
  const inc = calculateTotalIncomePerSec();
  state.cash += inc / 2; // 500ms tick
  renderHUD();
}, 500);

// Rakipler arası dinamik piyasa olayları (Her 18 saniyede bir)
setInterval(() => {
  const rivalKeys = Object.keys(RIVALS);
  const rk = rivalKeys[Math.floor(Math.random() * rivalKeys.length)];
  const rival = RIVALS[rk];
  const openDistricts = state.districts.filter(d => state.unlockedDistricts.includes(d.id));
  const dist = openDistricts[Math.floor(Math.random() * openDistricts.length)];
  const neutrals = dist.plots.filter(p => p.owner === 'neutral');

  if (neutrals.length > 0 && Math.random() < 0.55) {
    const target = neutrals[Math.floor(Math.random() * neutrals.length)];
    target.owner = rk;
    document.getElementById('newsTickerText').textContent = `⚠️ ${rival.name}, ${dist.name} bölgesindeki ${target.name} işletmesini satın aldı!`;
    renderMap();
  } else {
    document.getElementById('newsTickerText').textContent = `📊 ${dist.name} piyasasında ticaret hacmi yükseldi! Fiyat kıran dükkânlar öne geçiyor.`;
  }
  saveGame();
}, 18000);

// Sekme Geçişleri & Buton Dinleyicileri
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    playTone(440, 0.04);
    renderAll();
  };
});

document.querySelectorAll('[data-global-strat]').forEach(btn => {
  btn.onclick = () => {
    const strat = btn.dataset.globalStrat;
    state.districts.forEach(d => d.plots.forEach(p => { if (p.owner === 'player') p.strategy = strat; }));
    showToast(strat === 'undercut' ? '⚔️ Tüm dükkânlarda fiyat kırma başlatıldı!' : '⚖️ Tüm dükkânlar dengeli fiyata geçti.');
    saveGame();
    renderAll();
  };
});

document.getElementById('closeModalBtn').onclick = () => {
  document.getElementById('plotModal').classList.add('hidden');
};

document.getElementById('soundToggleBtn').onclick = (e) => {
  state.soundOn = !state.soundOn;
  e.target.textContent = state.soundOn ? '🔊' : '🔇';
  saveGame();
};

document.getElementById('offlineReportBtn').onclick = () => {
  const hasBot = state.ownedManagers.includes('mgr_offline');
  showToast(hasBot ? '🤖 Gece Vardiyası Asistanı aktif (4 saat %100 verim).' : '💡 Yönetim sekmesinden Asistan Bot alarak çevrimdışı kazancını 4 saate çıkar!');
};

function renderAll() {
  renderHUD();
  renderMap();
  renderOwnedShops();
  renderLogistics();
  renderStore();
}

loadGame();
renderAll();
