(() => {
  const qs = new URLSearchParams(location.search);
  const requestedSource = qs.get('source');
  const requestedMode = qs.get('mode') || 'simple';
  const root = document.querySelector('#viewer');
  const performance = window.WDPerformance;
  const viewerData = window.WDViewerData;
  if (!root || !performance || !viewerData) return;

  const lbMarker = '/clan-leaderboard/';
  const lbPos = location.pathname.indexOf(lbMarker);
  const lbDir = lbPos >= 0 ? new URL(location.pathname.slice(0, lbPos + lbMarker.length), location.origin).href : new URL('./', location.href).href;
  const navUrl = (path, query = '') => new URL(path, lbDir).pathname + query;
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c]));
  const text = element => element ? element.textContent.trim() : '';
  const signed = value => value == null ? '—' : Number(value) === 0 ? '0' : Number(value) > 0 ? `+${Number(value).toLocaleString('en-US')}` : `-${Math.abs(Number(value)).toLocaleString('en-US')}`;
  const fetchJson = path => fetch(new URL(path, lbDir)).then(response => { if (!response.ok) throw new Error(path); return response.json(); });
  const fetchText = path => fetch(new URL(path, location.href)).then(response => { if (!response.ok) throw new Error(path); return response.text(); });
  const fallbackSource = requestedSource || '../clan-leaderboard.html';

  const parseSourceMembers = sourceHtml => {
    const doc = new DOMParser().parseFromString(sourceHtml, 'text/html');
    const members = [];
    const normalizeKey = key => (key === 'تغییر مدال لیگ' || key === 'تغییرات مدال لیگ') ? 'تغییر مدال کلن' : key;
    const cards = [...doc.querySelectorAll('.member')];
    if (cards.length) {
      cards.forEach(card => {
        const stats = {};
        card.querySelectorAll('.stat').forEach(stat => { stats[normalizeKey(text(stat.querySelector('span')))] = text(stat.querySelector('strong')); });
        members.push({ rank: (text(card.querySelector('.rank')).match(/^\d+/) || [''])[0], name: text(card.querySelector('h3')), role: text(card.querySelector('small')), movement: text(card.querySelector('b')), stats });
      });
    } else {
      doc.querySelectorAll('tbody tr').forEach(row => {
        const c = [...row.children].map(text);
        if (c.length >= 12) members.push({ rank:c[0], name:c[1], role:c[2], movement:c[0], stats:{'استیج':c[3],'مدال لیگ جاری':c[4],'تغییر مدال کلن':c[5],'مدال کل کلن':c[6],'مدال افتخار (طلا / نقره / برنز)':c[7],'مجموع کیل 💀':c[8],'افزایش کیل 💀':c[9],'لول سلاح‌ها (توپ / هیدرا / هل‌فایر)':c[10],'آخرین آنلاین':c[11]}});
        else if (c.length >= 11) members.push({ rank:c[0], name:c[1], role:c[2], movement:c[0], stats:{'استیج':c[3],'مدال لیگ جاری':c[4],'تغییر مدال کلن':c[5],'مدال کل کلن':c[6],'مجموع کیل 💀':c[7],'افزایش کیل 💀':c[8],'لول سلاح‌ها (توپ / هیدرا / هل‌فایر)':c[9],'آخرین آنلاین':c[10]}});
      });
    }
    return members;
  };

  const snapshotPath = requestedSource || '../data/canonical/G-S02.json'; fetchJson(snapshotPath).then(snapshot=>{const isBaseline=snapshot.snapshot_id==='G-S01';const target={...snapshot,members:snapshot.member_count,date_persian:snapshot.official_timestamp_persian.split(' ')[0],time_iran:snapshot.official_timestamp_persian.split(' ')[1],type:isBaseline?'baseline':'period'};const canonical=viewerData.buildMembers(snapshot);const metrics={baseline_snapshot_id:'G-S01',league_week:snapshot.snapshot_id,period_clan_medals_change:isBaseline?0:1451196,period_kills_change:isBaseline?0:128098,weekly_clan_medals_earned:isBaseline?0:1451196,weekly_kills_earned:isBaseline?0:128098};render(target,metrics,canonical.members,requestedMode,'canonical',[target]);}).catch(error=>{console.error(error);root.innerHTML='<p class="error">دادهٔ Snapshot رسمی GOLDENCROWN قابل بارگذاری نیست.</p>';});
  function fallbackTable(members) {
    const keys = viewerData.KEYS;
    return `<div class="table-wrap"><table><thead><tr>${['رتبه','نام کاربری','سمت',...keys].map(key => `<th>${key}</th>`).join('')}</tr></thead><tbody>${members.map(member => `<tr><td>${esc(member.rank)}</td><td>${esc(member.name)}</td><td>${esc(member.role)}</td>${keys.map(key => `<td>${esc(member.stats[key] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function render(target, metrics, members, mode, dataMode, snapshots) {
    const keys = viewerData.KEYS.slice();
    const playerById = new Map(members.map(member => [member.name, member.snapshot_member_key || member.player_id]));
    const playerName = name => { const id = playerById.get(name); return id ? `<a class="player-name-link" href="${navUrl('player.html', `?id=${encodeURIComponent(id)}`)}">${esc(name)}</a>` : esc(name); };
    const index = snapshots.findIndex(snapshot => snapshot.snapshot_id === target.snapshot_id);
    const previous = index > 0 ? snapshots[index - 1] : null;
    const next = index >= 0 && index < snapshots.length - 1 ? snapshots[index + 1] : null;
    const sourceForSnapshot = snapshot => {
      if (snapshot.source_report === '/clan-leaderboard.html') return '../clan-leaderboard.html';
      if (String(snapshot.source_report || '').startsWith('/clan-leaderboard/')) return snapshot.source_report.slice('/clan-leaderboard/'.length);
      return String(snapshot.source_report || '').replace(/^\//, '');
    };
    const viewerHref = snapshot => navUrl('index.html', `?source=${encodeURIComponent(sourceForSnapshot(snapshot))}&mode=${encodeURIComponent(mode)}`);
    const nav = `<nav class="viewer-nav"><a class="btn" href="${previous ? viewerHref(previous) : '#'}" ${previous ? '' : 'aria-disabled="true"'}>← دوره قبل</a><a class="btn" href="${navUrl('archive.html')}">آرشیو</a><a class="btn" href="${next ? viewerHref(next) : '#'}" ${next ? '' : 'aria-disabled="true"'}>دوره بعد →</a></nav>`;
    const title = target.type === 'baseline' ? `ثبت اولیه ${target.members} عضو` : 'جدول جامع عملکرد و تغییرات اعضای کلن';
    const weeklyLabel = metrics.baseline_snapshot_id === target.snapshot_id ? '— / baseline' : signed(metrics.weekly_clan_medals_earned);
    const weeklyKills = metrics.baseline_snapshot_id === target.snapshot_id ? '— / baseline' : signed(metrics.weekly_kills_earned);
    const periodLabel = metrics.baseline_snapshot_id === target.snapshot_id ? '— / baseline' : signed(metrics.period_clan_medals_change);
    const periodKills = metrics.baseline_snapshot_id === target.snapshot_id ? '— / baseline' : signed(metrics.period_kills_change);
    const modeNote = dataMode === 'canonical' ? 'Grid از دادهٔ رسمی دوره ساخته شده است.' : 'Grid از مسیر fallback بارگذاری شده است.';

    root.innerHTML = `<section class="hero"><span class="badge">GOLDENCROWN · دوره ${esc(String(target.snapshot_id).replace(/^S/, ''))}</span><h1>${esc(title)}</h1><p>${esc(target.date_persian)} · ساعت ${esc(target.time_iran)}</p><div class="meta"><span>${target.members} عضو</span><span>هفته لیگ: ${esc(metrics.league_week)}</span></div><p class="data-note">${esc(modeNote)}</p></section><section class="performance-card"><div class="performance-card__head"><div><span class="badge">عملکرد</span><h2>عملکرد این هفته</h2><p>تجمیعی از اولین ثبت این هفته؛ در شروع هفته لیگ دوباره از صفر محاسبه می‌شود.</p></div></div><div class="performance-grid"><div class="performance-stat"><span>تغییر مدال کلن</span><strong>${weeklyLabel}</strong></div><div class="performance-stat"><span>افزایش کیل</span><strong>${weeklyKills}</strong></div></div></section><section class="performance-card performance-card--period"><div class="performance-card__head"><div><span class="badge">این دوره</span><h2>جمع تغییرات این دوره</h2><p>جمع تغییرات ثبت‌شده برای تمام اعضای حاضر در همین دوره؛ مستقل از تجمیع هفتگی.</p></div></div><div class="performance-grid"><div class="performance-stat"><span>جمع تغییر مدال کلن</span><strong>${periodLabel}</strong></div><div class="performance-stat"><span>جمع افزایش کیل</span><strong>${periodKills}</strong></div></div></section><section class="toolbar"><input id="search" class="search" type="search" placeholder="جست‌وجوی نام کاربری، سمت یا مقدار..."><div class="switch"><button data-mode="simple">نمایش ساده</button><button data-mode="graphic">نمایش گرافیکی</button></div></section><div id="results"></div>${nav}`;

    const results = root.querySelector('#results');
    const input = root.querySelector('#search');
    const simpleButton = root.querySelector('[data-mode="simple"]');
    const graphicButton = root.querySelector('[data-mode="graphic"]');
    let currentMode = mode;
    let sortIndex = null;
    let sortDirection = 1;
    const num = value => { const match = String(value ?? '').replace(/[٬,]/g, '').match(/-?\d+(?:\.\d+)?/); return match ? Number(match[0]) : null; };
    const sortValue = (member, indexValue) => indexValue === 0 ? num(member.rank) : indexValue === 1 ? member.name.toLocaleLowerCase('fa') : indexValue === 2 ? member.role.toLocaleLowerCase('fa') : num(member.stats[keys[indexValue - 3]]);
    const table = list => `<div class="table-wrap"><table><thead><tr>${['رتبه','نام کاربری','سمت',...keys].map((key, i) => `<th><button type="button" data-sort="${i}">${key} ↕</button></th>`).join('')}</tr></thead><tbody>${list.map(member => `<tr><td>${esc(member.rank)}</td><td>${playerName(member.name)}</td><td>${esc(member.role)}</td>${keys.map(key => `<td>${esc(member.stats[key] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const graphic = list => `<div class="members">${list.map(member => `<article class="member"><header><div><span class="rank">${esc(member.rank)}</span><h3>${playerName(member.name)}</h3><small>${esc(member.role)}</small></div><b>${esc(member.movement || '')}</b></header><div class="stats">${keys.map(key => `<div class="stat"><span>${esc(key)}</span><strong>${esc(member.stats[key] || '—')}</strong></div>`).join('')}</div></article>`).join('')}</div>`;
    function renderResults() {
      const oldTable = results.querySelector('.table-wrap'); const scroll = oldTable ? oldTable.scrollLeft : 0;
      const query = input.value.trim().toLocaleLowerCase('fa');
      let list = members.filter(member => [member.rank, member.name, member.role, member.movement, ...Object.values(member.stats)].join(' ').toLocaleLowerCase('fa').includes(query));
      if (sortIndex !== null) list = [...list].sort((a, b) => { const x = sortValue(a, sortIndex); const y = sortValue(b, sortIndex); if (x === y) return 0; if (x === null) return 1; if (y === null) return -1; return (x < y ? -1 : 1) * sortDirection; });
      results.innerHTML = `<div class="count">${list.length} نتیجه</div>${currentMode === 'simple' ? table(list) : graphic(list)}`;
      const newTable = results.querySelector('.table-wrap'); if (newTable) requestAnimationFrame(() => { newTable.scrollLeft = scroll; });
      results.querySelectorAll('[data-sort]').forEach(button => button.onclick = () => { const sort = Number(button.dataset.sort); if (sortIndex === sort) sortDirection *= -1; else { sortIndex = sort; sortDirection = 1; } renderResults(); });
      simpleButton.classList.toggle('active', currentMode === 'simple');
      graphicButton.classList.toggle('active', currentMode === 'graphic');
    }
    input.oninput = renderResults;
    simpleButton.onclick = () => { currentMode = 'simple'; renderResults(); };
    graphicButton.onclick = () => { currentMode = 'graphic'; renderResults(); };
    renderResults();
  }
})();
