(() => {
  const root = document.querySelector('#profile');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">شناسه بازیکن مشخص نشده است.</div></div>';
    return;
  }

  const json = path => fetch(path).then(response => { if (!response.ok) throw new Error(path); return response.json(); });
  Promise.all([
    json('data/players.json'),
    json('data/player-observations.json'),
    json('data/player-observations-history.json'),
    json('data/player-observations-history-s05.json').catch(() => ({ snapshots: {} })),
    json('data/player-observations-history-s06.json').catch(() => ({ snapshots: {} })),
    json('data/snapshots.json'),
    json('data/leagues.json')
  ]).then(([players, current, history, historyS05, historyS06, snapshotsData, leaguesData]) => {
    const player = players.players.find(item => item.player_id === id);
    if (!player) {
      root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">بازیکن پیدا نشد.</div></div>';
      return;
    }

    const snapshotSets = { ...(history.snapshots || {}), ...(historyS05.snapshots || {}), ...(historyS06.snapshots || {}), ...(current.snapshots || {}) };
    const snapshots = [...(snapshotsData.snapshots || [])].sort((a, b) => b.captured_at_utc.localeCompare(a.captured_at_utc));
    const order = snapshots.map(item => item.snapshot_id).filter(key => snapshotSets[key]);
    const rows = order.map(key => ({ key, obs: (snapshotSets[key] || []).find(item => item.player_id === id) || null }));
    const activeRow = [...rows].find(row => row.obs) || rows[0] || { obs: null, key: snapshotsData.current_snapshot_id };
    const active = activeRow.obs;
    const performance = window.WDPerformance;
    const performanceBySnapshot = performance.computeAll(snapshotsData, [history, historyS05, historyS06, current], leaguesData);
    const activeMetrics = performanceBySnapshot[activeRow.key] || { baseline_snapshot_id: activeRow.key, period_players: {}, players: {}, cumulative_players: {} };
    const weeklyPlayer = activeMetrics.players?.[id] || { clan_medals: 0, kills: 0 };
    const cumulativePlayer = activeMetrics.cumulative_players?.[id] || { clan_medals: 0, kills: 0 };

    const fmt = n => n == null ? '—' : Number(n).toLocaleString('en-US');
    const signed = n => n == null ? '—' : Number(n) > 0 ? `+${fmt(n)}` : fmt(n);
    const esc = s => String(s ?? '').replace(/[&<>\"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c]));
    const rankDisplay = obs => { if (!obs?.rank) return '—'; if (obs.is_new) return `${fmt(obs.rank)} (جدید)`; const movement = Number(obs.rank_movement || 0); if (!movement) return fmt(obs.rank); return `${fmt(obs.rank)} (${movement > 0 ? '↑' : '↓'} ${fmt(Math.abs(movement))})`; };
    const honorDisplay = obs => obs?.honor_medals ? `${fmt(obs.honor_medals.gold)} / ${fmt(obs.honor_medals.silver)} / ${fmt(obs.honor_medals.bronze)}` : '—';
    const weaponDisplay = obs => { if (!obs?.weapons) return '—'; const delta = obs.weapons.upgrade_deltas || {}; const part = key => obs.weapons[key] == null ? '—' : delta[key] == null ? fmt(obs.weapons[key]) : `${fmt(obs.weapons[key])} (+${fmt(delta[key])})`; return `${part('25mm')} / ${part('hydra')} / ${part('hellfire')}`; };
    const snapshotLabel = key => {
      const meta = snapshots.find(item => item.snapshot_id === key);
      if (!meta) return `<span class="snapshot-badge">${esc(key)}</span>`;
      const boundary = meta.boundary_label ? ` · ${meta.boundary_label}` : '';
      return `<span class="snapshot-badge">${esc(key)}</span><span class="snapshot-date">${esc(meta.date_persian)} · ${esc(meta.time_iran)}${esc(boundary)}</span>`;
    };
    const periodDelta = key => performanceBySnapshot[key]?.period_players?.[id] || null;
    const deltaDisplay = (key, field) => {
      const metric = performanceBySnapshot[key];
      if (!metric) return '—';
      const period = periodDelta(key);
      if (!period) return '—';
      return signed(period[field]);
    };
    const columns = ['رتبه','نام کاربری','سمت','استیج','مدال لیگ جاری','تغییر مدال کلن','مدال کل کلن','مدال افتخار (طلا / نقره / برنز)','مجموع کیل 💀','افزایش کیل 💀','لول سلاح‌ها (توپ / هیدرا / هل‌فایر)','آخرین آنلاین'];
    const renderRow = (key, obs) => {
      if (!obs) return `<tr class="snapshot-missing"><td colspan="13">این بازیکن در دوره ${esc(key)} حضور نداشته است.</td></tr>`;
      return `<tr><td class="rank-cell">${esc(rankDisplay(obs))}</td><td><a class="player-name-link" href="player.html?id=${encodeURIComponent(player.player_id)}">${esc(player.display_name)}</a></td><td>${esc(player.role || 'Member')}</td><td>${fmt(obs.stage)}</td><td>${fmt(obs.league_medals)}</td><td>${esc(deltaDisplay(key, 'clan_medals'))}</td><td>${fmt(obs.clan_medals)}</td><td>${esc(honorDisplay(obs))}</td><td>${fmt(obs.total_kills)}</td><td>${esc(deltaDisplay(key, 'kills'))}</td><td>${esc(weaponDisplay(obs))}</td><td>${esc(obs.last_online_display || '—')}</td><td class="snapshot-cell">${snapshotLabel(key)}</td></tr>`;
    };

    const weeklyClan = signed(weeklyPlayer.clan_medals);
    const weeklyKills = signed(weeklyPlayer.kills);

    root.innerHTML = `<div class="shell profile-shell"><section class="profile-head"><div><span class="badge">GOLDENCROWN · PLAYER</span><h1>${esc(player.display_name)}</h1><div class="identity">${esc(player.player_id)} · ${esc(player.role || 'Member')} · ${player.status === 'former' ? 'سابق' : 'فعال'}</div></div><div class="profile-actions"><a class="btn" href="players.html">← اعضای کلن</a><a class="btn" href="index.html">لیدربورد</a><a class="btn" href="member-history.html?id=${encodeURIComponent(player.player_id)}">تاریخچه عضویت</a></div></section><section class="panel"><div class="profile-stats"><div class="profile-stat"><span>رتبه فعلی</span><strong>${rankDisplay(active)}</strong></div><div class="profile-stat"><span>سمت</span><strong>${esc(player.role || 'Member')}</strong></div><div class="profile-stat"><span>استیج فعلی</span><strong>${fmt(active?.stage)}</strong></div><div class="profile-stat"><span>مدال لیگ جاری</span><strong>${fmt(active?.league_medals)}</strong></div><div class="profile-stat"><span>مدال کل کلن</span><strong>${fmt(active?.clan_medals)}</strong></div><div class="profile-stat"><span>مجموع کیل 💀</span><strong>${fmt(active?.total_kills)}</strong></div><div class="profile-stat"><span>مدال افتخار</span><strong>${honorDisplay(active)}</strong></div><div class="profile-stat"><span>آخرین آنلاین</span><strong>${esc(active?.last_online_display || '—')}</strong></div></div></section><section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">عملکرد</span><h2>عملکرد این هفته</h2><p class="muted">تغییر مدال کلن از ابتدای لیگ جاری و افزایش Kill نسبت به مشاهده قبلی محاسبه می‌شود؛ فقط مدال کلن با شروع لیگ Reset می‌شود.</p></div></div><div class="profile-stats"><div class="profile-stat"><span>تغییر مدال کلن</span><strong>${weeklyClan}</strong></div><div class="profile-stat"><span>افزایش کیل</span><strong>${weeklyKills}</strong></div></div></section><section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">CUMULATIVE</span><h2>عملکرد تجمعی</h2><p class="muted">از اولین ثبت معتبر این بازیکن تا آخرین دوره؛ با Reset لیگ یا فاصله عضویت صفر نمی‌شود.</p></div></div><div class="profile-stats"><div class="profile-stat"><span>مجموع مدال کلن کسب‌شده</span><strong>${signed(cumulativePlayer.clan_medals)}</strong></div><div class="profile-stat"><span>مجموع Kill کسب‌شده</span><strong>${signed(cumulativePlayer.kills)}</strong></div></div></section><section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">HISTORY</span><h2>تاریخچه عملکرد کاربر</h2><p class="muted">هر سطر یک دوره ثبت‌شده است؛ تاریخ و مرز لیگ همان observation را نشان می‌دهد و تغییرات از Canonical Performance خوانده می‌شوند.</p></div></div><div class="table-wrap profile-history-wrap"><table class="profile-history-table"><thead><tr>${columns.map(column => `<th>${column}</th>`).join('')}<th>دوره</th></tr></thead><tbody>${rows.map(({key, obs}) => renderRow(key, obs)).join('')}</tbody></table></div></section>${!active ? '<section class="panel empty">برای این بازیکن در هیچ دوره ثبت‌شده‌ای رکوردی پیدا نشد.</section>' : ''}<section class="panel source-note"><strong>منبع داده:</strong> دوره‌های Canonical تأییدشده. هر مقدار از همان داده ثبت‌شده خوانده می‌شود.</section></div>`;
  }).catch(error => { console.error(error); root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">داده پروفایل قابل بارگذاری نیست.</div></div>'; });
})();
