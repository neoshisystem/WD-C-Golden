(() => {
  const root = document.querySelector('#history');
  const input = document.querySelector('#historySearch');
  const count = document.querySelector('#historyCount');
  if (!root) return;
  Promise.all([
    fetch('data/players.json').then(r => r.json()),
    fetch('data/memberships.json').then(r => r.json()),
    fetch('data/snapshots.json').then(r => r.json())
  ]).then(([players, memberships, snapshots]) => {
    const byId = new Map(players.players.map(p => [p.player_id, p]));
    const snapById = new Map((snapshots.snapshots || []).map(s => [s.snapshot_id, s]));
    const esc = s => String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    function label(id) {
      return snapById.get(id) || {snapshot_id:id,date_persian:id,time_iran:''};
    }
    function render() {
      const q = (input.value || '').trim().toLocaleLowerCase('fa');
      const rows = (memberships.memberships || []).filter(m => {
        const p = byId.get(m.player_id) || {};
        return [m.player_id, p.display_name, m.status].join(' ').toLocaleLowerCase('fa').includes(q);
      });
      count.textContent = `${rows.length} سابقه`;
      root.innerHTML = rows.map(m => {
        const p = byId.get(m.player_id) || {};
        const from = label(m.from_snapshot);
        const through = label(m.through_snapshot);
        const event = m.status === 'ended' ? 'پایان عضویت' : (m.start_event ? 'عضویت جدید' : 'فعال');
        const precision = m.end_precision === 'between_snapshots' ? 'زمان دقیق ثبت نشده' : '';
        return `<a class="player-card" href="player.html?id=${encodeURIComponent(m.player_id)}"><header><div><h3>${esc(p.display_name || m.player_id)}</h3><div class="player-id">${esc(m.player_id)}</div></div><span class="status">${esc(event)}</span></header><div class="stats"><div class="stat"><span>شروع</span><strong>${esc(from.date_persian)} · ${esc(from.time_iran)}</strong></div><div class="stat"><span>آخرین Snapshot</span><strong>${esc(through.date_persian)} · ${esc(through.time_iran)}</strong></div><div class="stat"><span>وضعیت</span><strong>${m.status === 'ended' ? 'سابق' : 'فعال'}</strong></div><div class="stat"><span>توضیح</span><strong>${esc(precision || m.end_event || m.start_event || '—')}</strong></div></div></a>`;
      }).join('') || '<div class="empty">سابقه‌ای پیدا نشد.</div>';
    }
    input.addEventListener('input', render);
    render();
  }).catch(() => {
    root.innerHTML = '<div class="empty">داده تاریخچه عضویت قابل بارگذاری نیست.</div>';
  });
})();
