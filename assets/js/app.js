(() => {
  'use strict';

  const C = window.WAR_DRONE_WIKI_CONFIG;
  const STAGE_NAMES = [
    "Iron Hawk","COLD FIRE","Desert Storm","Thunderbolt","Viper's Nest","Missing Link","Silent Strike","Steel Hammer","Bust Flush","Desert Fox",
    "Shadow Phoenix","Silent Viper","Iron Shield","Desert Falcon","Night Hawk","Midnight Thunder","Ghost Recon","Crimson Tide","Shadow Hunter","Dark Horizon",
    "Raven Storm","Lost Wolf","Silver Spear","Night Fury","Storm Rider","Arctic Wind","Dragon Strike","Falcon Wing","Steel Fortress","Death Wing",
    "Blaze Fury","Black Ice","Storm Break","Shadow Strike","Broken Fang","Silent Edge","Wild Fury","Storms End","Steel Blizzard","Phoenix Fire",
    "Iron Wolf","Silent Storm","Crimson Dawn","Desert Ghost","Phantom Strike","Steel Cobra","Night Blade","Arctic Flame","Dragon Claw","Falcon Strike",
    "Titan Storm","Death Whisper","Blaze Phantom","Black Talon","Storm Eagle","Shadow Fang","Broken Arrow","Silent Fury","Wild Hawk","Storm Viper",
    "Night Phantom","Phoenix Wing","Thunder Strike","Ghost Blade","Viper Nest","Iron Fist","Silent Thunder","Crimson Blade","Desert Falcon","Phantom Hawk",
    "Steel Talon","Night Stalker","Arctic Phantom","Dragon's Breath","Falcon Claw","Titan's Wrath","Death Whisper","Blaze Strike","Black Thunder","Storm Chaser",
    "Shadow Blade","Broken Shield","Silent Strike","Iron Shield","Storm Front","Phantom Edge","Solar Strike","Void Lancer","Ghost Hunter","Viper's Bite",
    "Steel Phantom","Iron Specter","Arctic Vortex","Iron Tempest","Epic Flurry","Iron Talon","Thunder Warden","Sky Fortress","Dragon's Wing","Endgame / نام مأموریت تأیید نشده"
  ];

  const VIDEO_IDS = [
    "6CSgRjIu_ng","hhXXNp7bC8Y","zVTC-A6-TpQ","JyG3zp9uj7Q","YJW_-XBr-CQ","HHg3d-_BMJ4","xCP9psk0uCw","n96HSsji8J4","0HDA8KgOgl8","3RYGP7uaGSw",
    "iwrwIO0SDLw","J0cPQnaQbn4","Z1l4GKtzYfc","ybF6SGlMw1A","Xxg9zduFCuw","zTUeyXAxMJA","R2XNTopXOA8","ijJlAAD_3Fc","I2Ea03FSFkg","1N--LOHBsog",
    "SBM77IM5Q6Q","r15Hs2xrMvk","LVqvH9dK9HU","wsP2x5F08fs","PhNqnjNLSzU","77n7Fj-Ralg","PGSusnbedoE","yHQkQhAJna4","RorIGwRDtwQ","qG9F5AQElW4",
    "7-KdNUZVxMo","FI0Q93GW0po","sIsdHHw-MsM","JUzBLmcL4CM","Lz4nmOxAkA8","xgGtILRc28w","0DXfp55Io4Y","iKifV7l8eNo","w-dNmloPrwU","LE_QVY7Kdn0",
    "YVUWm72CAIE","fENXEizSDoA","8gibnzcdw9Y","qlbG-Zj1nfc","53aJBdgeNAA","hDoYisDgG8U","v_O97mqoVS8","c9elssKgGl8","ehG21iL66DA","E0vglmnEZ7o",
    "r0enGAOylZ8","QJng3DPz-nk","Z-wvXGvwFGo","oA6z7gXdqdg","px8727H57ts","X4Zu4jkNPyo","DoZPkO3Y9UY","yR3oA-inKeo","coe4FG2xfog","uCblYbPRFp0",
    "aKYU63S7H4E","CSUziMAZPes","tQfve1mOsZI","tp4DSnaSIlc","1JWD48Aw5tE","qe-TbwauCEE","KLffH_4URhE","L1-U1OoTuO8","ZFWE59U8TgQ","x47YhAdv5-0",
    "-JNiY_Bh17U","SvlSMl1OPec","g61zt3rMsEA","OYv8Y6iXgCs","aq4WUZ3xkBA","Mq2QWF2YAJs","K_pmZ6c8Dag","PETmDIxtnRk","MPdOFNnmbgI","2FMfxGZIYBM",
    "OyX8xJfR97o","MR9HPOX4z1c","NTyOI_0LGzY","YTrq76sJYWo","3cnCuOyTHFU","IQ-BKAj0gl8","PsGxiDalr1w","vgc7YE5pfF0","6xEX3apq4hA","aja4IsKle8A",
    "j69IF4RLiNc","oEcl8n8h6ck","BfDqpQX2bVs","4D38p2gK3vQ","xOo0boHqOp4","wJ9Qow0plho","q-lPSfwNIYs","IQps_N9q4IU","q-unRuBlfZY","6VWgL0G82sw"
  ];

  const SPECIAL = {
    42: [{title:'راهنمای سخت‌ترین مأموریت', id:'H8ZWFXhvH70'}],
    52: [{title:'خرج بیش از 3700 Gold برای عبور', id:'QEWAT7YXLOo'}],
    66: [{title:'خرج Gold و تلاش برای Iron Fist', id:'qe-TbwauCEE'}],
    68: [{title:'ویدیوی جایگزین Crimson Blade', id:'J289sB_mj74'}],
    100:[{title:'راهنمای رسیدن به Level 100', id:'6VWgL0G82sw'}]
  };

  const STOP_STAGES = new Set([10,15,19,27,28,39,58,69,78,88,98,99]);
  const DANGER_STAGES = new Set([42,52,66,70,80,90,98,99,100]);
  const CASH_KNOWN = {
    10:'حدود 7–8K در اجرای نزدیک پایان',
    15:'حدود 10–11K با تبلیغ در اجرای 98–99٪',
    19:'حدود 10K؛ بسته به Spawn و پیاده شدن نیروها',
    27:'حدود 10K+؛ اجرای سریع و پرتراکم',
    28:'حدود 12–14K',
    39:'حدود 13.5–14.5K',
    58:'از نقاط فارم برتر؛ عدد وابسته به Run/نسخه'
  };

  // Approximate Cash model for a near-complete (98–99%) run.
  // The advertised reward is calculated as +50% over the estimated base reward.
  // Values are intentionally rounded ranges because enemy spawns and run style change the result.
  const CASH_BASE_ANCHORS = {
    1:700, 5:1500, 10:5000, 15:7000, 20:7200, 28:8500, 39:9300,
    50:9800, 58:10000, 70:10800, 80:11200, 90:11600, 99:12000, 100:12000
  };
  const CASH_BASE_OVERRIDES = {
    10:5000, 15:7000, 19:6700, 27:7200, 28:8500, 39:9300, 58:10000,
    69:10400, 78:10800, 88:11200, 98:11800, 99:12000
  };

  function interpolateCashBase(stage){
    if (CASH_BASE_OVERRIDES[stage]) return CASH_BASE_OVERRIDES[stage];
    const keys = Object.keys(CASH_BASE_ANCHORS).map(Number).sort((a,b)=>a-b);
    if (stage <= keys[0]) return CASH_BASE_ANCHORS[keys[0]];
    if (stage >= keys[keys.length-1]) return CASH_BASE_ANCHORS[keys[keys.length-1]];
    let lo=keys[0], hi=keys[keys.length-1];
    for (let i=0;i<keys.length-1;i++){
      if (stage>=keys[i] && stage<=keys[i+1]) { lo=keys[i]; hi=keys[i+1]; break; }
    }
    const t=(stage-lo)/(hi-lo);
    let value=CASH_BASE_ANCHORS[lo] + (CASH_BASE_ANCHORS[hi]-CASH_BASE_ANCHORS[lo])*t;
    if ([7,8,9].includes(stage%10) && stage>=10) value*=1.04;
    return value;
  }

  function roundedRange(center, spread=.06){
    const round100=v=>Math.round(v/100)*100;
    return [round100(center*(1-spread)), round100(center*(1+spread))];
  }

  function fmtCash(v){
    if (v>=1000) {
      const k=v/1000;
      return (Math.abs(k-Math.round(k))<0.05 ? String(Math.round(k)) : k.toFixed(1).replace('.0',''))+'K';
    }
    return Math.round(v).toLocaleString('en-US');
  }

  function cashRewardEstimate(stage){
    const base=interpolateCashBase(stage);
    const normal=roundedRange(base);
    const ad=roundedRange(base*1.5);
    return {
      normal:`${fmtCash(normal[0])}–${fmtCash(normal[1])}`,
      ad:`${fmtCash(ad[0])}–${fmtCash(ad[1])}`
    };
  }

  const WEAPON_NOTES = {
    10:'25mm را برای مهمات و پایداری بالا ببر؛ Hydra برای گروه‌ها، Hellfire را برای زرهی‌ها نگه دار.',
    19:'25mm حدود 390–410، Hydra حدود 90–110 و Hellfire حدود 25–30 در گزارش‌های بازیکنان به‌عنوان آمادگی مناسب مطرح شده است.',
    42:'تهدید دریایی/هوایی جدی است؛ Harrier/Raptor و Buffهای Water ارزش زیادی دارند.',
    52:'قبل از عبور Deck را تقویت کن؛ این مرحله در تجربه ویدیویی نیاز به ارتقای محسوس نشان داده است.',
    66:'Iron Fist یک دیوار سختی است؛ ارتقای کورکورانه کافی نیست و ترکیب Deck اهمیت دارد.'
  };

  const $ = id => document.getElementById(id);
  const goals = new Set();
  const filters = new Set();

  function clamp(v,min,max){ return Math.min(max,Math.max(min,v)); }
  function stars(n){ return '★'.repeat(n)+'☆'.repeat(5-n); }

  function scoreModel(stage){
    const s = stage;
    const tail = s % 10;
    let cash = s < 10 ? 2 : 3;
    let clan = s < 10 ? 2 : 3;
    let kills = s < 10 ? 2 : 3;

    if ([7,8,9].includes(tail) && s >= 10) {
      cash += 1; clan += 1; kills += 1;
    }

    const cashElite = [15,19,27,28,39,58,69,78,88,98,99];
    const clanElite = [19,27,28,39,58,69,78,88,98,99];
    const killElite = [19,27,39,48,58,69,78,88,98,99];
    if (cashElite.includes(s)) cash = 5;
    if (clanElite.includes(s)) clan = 5;
    if (killElite.includes(s)) kills = 5;

    cash = clamp(cash,1,5); clan = clamp(clan,1,5); kills = clamp(kills,1,5);
    const frenzy = clamp(Math.round((clan*1.15 + kills*.85)/2),1,5);
    const farm99 = STOP_STAGES.has(s) ? 5 : ([7,8,9].includes(tail) && s >= 10 ? 4 : 2);
    const difficulty = [42,52,66].includes(s) ? 5 : (DANGER_STAGES.has(s) ? 4 : clamp(1 + Math.floor(s/28),1,4));

    return { cash, clan, kills, frenzy, farm99, difficulty };
  }

  function defaultWeapon(stage){
    if (WEAPON_NOTES[stage]) return WEAPON_NOTES[stage];
    if (stage <= 9) return 'تمرکز روی ظرفیت مهمات 25mm و یادگیری ترتیب Spawnها؛ منابع را برای ارتقای غیرضروری هدر نده.';
    if (stage <= 20) return 'اولویت با 25mm؛ Hydra برای گروه‌های پیاده و Hellfire برای تانک/APC. قبل از رد کردن نقطه فارم، مهمات را کافی کن.';
    if (stage <= 40) return '25mm پرظرفیت + Hydra پایدار؛ Hellfire را برای اهداف زرهی و موج‌های خطرناک ذخیره کن.';
    if (stage <= 70) return 'از این بازه به بعد Deck، Reinforcement و Buffهای مأموریت‌محور به اندازه سطح سلاح مهم می‌شوند.';
    return 'Late-game: ارتقای متعادل سه سلاح اصلی، پشتیبانی مناسب و Superweapon متناسب با نوع موج اهمیت بیشتری دارد.';
  }

  function noteFor(stage){
    const out = [];
    if (STOP_STAGES.has(stage)) out.push('نقطه توقف/فارم پیشنهادی');
    if ([7,8,9].includes(stage%10) && stage>=10) out.push('الگوی انتهای 7/8/9؛ معمولاً فارم‌پسندتر گزارش شده');
    if (stage===42) out.push('Silent Storm؛ تهدیدات دریایی و هوایی هم‌زمان');
    if (stage===52) out.push('Death Whisper؛ Difficulty Spike و نیاز محسوس به ارتقا');
    if (stage===66) out.push('Iron Fist؛ شکست پس از خرج چند هزار Gold نیز در ویدیو دیده شده');
    if (!out.length) out.push('ارزش مرحله با Build، Spawn، سرعت پاکسازی و درصد پایان تغییر می‌کند');
    return out.join('؛ ');
  }

  const ALL = Array.from({length:100},(_,i) => {
    const stage = i+1;
    const scores = scoreModel(stage);
    return {
      stage,
      name: STAGE_NAMES[i],
      videoId: VIDEO_IDS[i],
      ...scores,
      cashText: CASH_KNOWN[stage] || 'برآورد Cash برای اجرای نزدیک 98–99٪',
      cashReward: cashRewardEstimate(stage),
      weapon: defaultWeapon(stage),
      note: noteFor(stage),
      stop: STOP_STAGES.has(stage),
      danger: DANGER_STAGES.has(stage),
      confidence: [10,15,19,28,39,42,52,58,66].includes(stage) ? 'داده قوی‌تر' : ([7,8,9].includes(stage%10) && stage>=10 ? 'داده متوسط' : 'برآورد راهنما')
    };
  });

  const RANK_BONUS = {
    cash:{39:100,58:98,28:96,15:91,19:89,27:88,10:82,69:80,78:78,88:76,98:74,99:73},
    clan:{39:100,58:98,28:96,19:94,27:92,69:88,78:86,88:84,98:82,99:81},
    kills:{39:100,58:98,48:96,27:94,69:90,78:88,88:86,98:84,99:83,19:82},
    frenzy:{39:100,58:98,28:95,27:93,19:91,69:89,78:87,88:85,98:83,99:82},
    farm99:{39:100,28:97,58:95,19:92,15:90,10:88,69:85,78:83,88:81,98:79,99:78}
  };

  function goalScore(s,g){
    const bonus=(RANK_BONUS[g]&&RANK_BONUS[g][s.stage])||0;
    return bonus || ((s[g]||0)*10 - s.stage/1000);
  }

  function smartScore(s){
    if (!goals.size) return 0;
    let total = 0;
    goals.forEach(g => total += goalScore(s,g));
    return total / goals.size;
  }

  function filterStage(s){
    const from = clamp(parseInt($('fromStage').value || '1',10),1,100);
    const to = clamp(parseInt($('toStage').value || '100',10),1,100);
    const lo = Math.min(from,to), hi = Math.max(from,to);
    if (s.stage < lo || s.stage > hi) return false;

    const q = $('query').value.trim().toLowerCase();
    if (q && !(String(s.stage).includes(q) || s.name.toLowerCase().includes(q))) return false;

    if (filters.has('stop') && !s.stop) return false;
    if (filters.has('danger') && !s.danger) return false;
    if (filters.has('video') && !s.videoId) return false;
    return true;
  }

  function sorted(list){
    const mode = $('sortMode').value;
    const copy = [...list];
    const desc = key => copy.sort((a,b)=>goalScore(b,key)-goalScore(a,key) || a.stage-b.stage);
    if (mode==='stageAsc') return copy.sort((a,b)=>a.stage-b.stage);
    if (mode==='stageDesc') return copy.sort((a,b)=>b.stage-a.stage);
    if (mode==='cash') return desc('cash');
    if (mode==='clan') return desc('clan');
    if (mode==='kills') return desc('kills');
    if (mode==='frenzy') return desc('frenzy');
    if (mode==='difficulty') return desc('difficulty');
    if (goals.size) return copy.sort((a,b)=>smartScore(b)-smartScore(a) || b.cash-a.cash || a.stage-b.stage);
    return copy.sort((a,b)=>a.stage-b.stage);
  }

  function reasonText(s){
    if (!goals.size) return '';
    const labels = {cash:'کش',clan:'مدال کلن',kills:'کیل',frenzy:'فرنزی',farm99:'توقف 98–99٪'};
    const parts = [...goals].map(g=>`${labels[g]} ${stars(s[g])}`);
    return `رتبه‌بندی بر اساس: ${parts.join(' + ')}`;
  }

  function specialLinks(stage){
    const arr = SPECIAL[stage] || [];
    if (!arr.length) return '';
    return `<div class="special-links">${arr.map(v=>`<a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">ویدیوی ویژه: ${v.title}</a>`).join('')}</div>`;
  }

  function card(s){
    const thumb = s.videoId ? `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg` : '';
    return `<article class="stage-card" data-stage="${s.stage}">
      <div class="stage-watermark">${s.stage}</div>
      <div class="stage-card-head">
        <div><span class="stage-label">STAGE ${s.stage}</span><h3>${s.name}</h3></div>
        <div class="tags">${s.stop?'<span class="tag hot">نقطه توقف</span>':''}${s.danger?'<span class="tag danger">حساس</span>':''}<span class="tag">${s.confidence}</span></div>
      </div>
      <div class="score-grid">
        <div class="score"><span>💰 فارم کش</span><b>${stars(s.cash)}</b><small>بدون ویدیو: ≈ ${s.cashReward.normal}<br>با ویدیو (+50٪): ≈ ${s.cashReward.ad}</small></div>
        <div class="score"><span>🏆 مدال کلن</span><b>${stars(s.clan)}</b><small>ارزش نسبی هر Run</small></div>
        <div class="score"><span>☠️ کیل</span><b>${stars(s.kills)}</b><small>تراکم و بازده نسبی</small></div>
        <div class="score"><span>🔥 فرنزی</span><b>${stars(s.frenzy)}</b><small>برآورد Medal/min</small></div>
        <div class="score"><span>🎯 توقف 98–99٪</span><b>${stars(s.farm99)}</b><small>${s.stop?'کاندید توقف':'وابسته به کنترل موج آخر'}</small></div>
        <div class="score"><span>⚠️ سختی</span><b>${stars(s.difficulty)}</b><small>${s.difficulty>=4?'قبل از عبور آماده شو':'عادی تا متوسط'}</small></div>
      </div>
      <div class="intel">
        <div class="intel-row"><b>راهنمای سلاح:</b> ${s.weapon}</div>
        <div class="intel-row"><b>یادداشت مرحله:</b> ${s.note}</div>
      </div>
      ${s.videoId ? `<div class="video-box"><div class="video-thumb"><img src="${thumb}" alt="ویدیوی Stage ${s.stage}" loading="lazy"><span class="youtube-mark"><span></span></span></div><div class="video-copy"><b>آموزش Stage ${s.stage} — ${s.name}</b><a class="video-link" href="https://www.youtube.com/watch?v=${s.videoId}" target="_blank" rel="noopener"><span class="youtube-mark"><span></span></span> تماشای ویدیو در یوتیوب</a>${specialLinks(s.stage)}</div></div>` : ''}
      ${reasonText(s)?`<div class="rank-reason">${reasonText(s)}</div>`:''}
    </article>`;
  }

  function normalizeRangeInputs(){
    let a = clamp(parseInt($('fromStage').value || '1',10),1,100);
    let b = clamp(parseInt($('toStage').value || '100',10),1,100);
    $('fromStage').value = a;
    $('toStage').value = b;
    return [Math.min(a,b),Math.max(a,b)];
  }

  function render(){
    const [lo,hi] = normalizeRangeInputs();
    const list = sorted(ALL.filter(filterStage));
    $('stageGrid').innerHTML = list.map(card).join('');
    $('resultCount').textContent = `${list.length} مرحله`;
    $('rangeLabel').textContent = `نمایش مراحل ${lo} تا ${hi}`;
    $('emptyState').hidden = list.length !== 0;
  }

  function setThemeButton(){ $('themeToggle').textContent = document.documentElement.dataset.theme==='dark' ? '☀️' : '🌙'; }
  document.documentElement.dataset.theme = localStorage.getItem('wd-theme') || C.defaultTheme;
  setThemeButton();
  $('themeToggle').addEventListener('click',()=>{
    document.documentElement.dataset.theme = document.documentElement.dataset.theme==='dark'?'light':'dark';
    localStorage.setItem('wd-theme',document.documentElement.dataset.theme);
    setThemeButton();
  });

  document.querySelectorAll('[data-clan]').forEach(el=>el.textContent=C.clanName);
  document.querySelectorAll('[data-author]').forEach(el=>el.textContent=C.projectAuthor);

  document.querySelectorAll('[data-goal]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const g=btn.dataset.goal;
      btn.classList.toggle('active');
      btn.classList.contains('active')?goals.add(g):goals.delete(g);
      $('sortMode').value='smart';
      render();
    });
  });
  document.querySelectorAll('[data-filter]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const f=btn.dataset.filter;
      btn.classList.toggle('active');
      btn.classList.contains('active')?filters.add(f):filters.delete(f);
      render();
    });
  });

  ['fromStage','toStage','sortMode'].forEach(id=>$(id).addEventListener('change',render));
  $('query').addEventListener('input',render);
  $('resetFilters').addEventListener('click',()=>{
    goals.clear(); filters.clear();
    document.querySelectorAll('.goal.active,.toggle.active').forEach(el=>el.classList.remove('active'));
    $('fromStage').value='1'; $('toStage').value='100'; $('query').value=''; $('sortMode').value='smart';
    render();
  });

  render();
})();