(() => {
  const root = document.querySelector('#history');
  const input = document.querySelector('#historySearch');
  const count = document.querySelector('#historyCount');
  if (!root) return;

  const json = path => fetch(path).then(response => {
    if (!response.ok) throw new Error(path);
    return response.json();
  });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  Promise.all([
    json('../data/manifest.json'),
    json('../data/derived/player-history-index.json')
  ]).then(([manifest, historyIndex]) => {
    const ids = Array.isArray(manifest.published_snapshot_ids) ? manifest.published_snapshot_ids : [];
    return Promise.all(ids.map(id => json(`../data/canonical/${encodeURIComponent(id)}.json`)))
      .then(snapshots => ({ manifest, historyIndex, snapshots }));
  }).then(({ manifest, historyIndex, snapshots }) => {
    const byId = new Map(snapshots.map(snapshot => [snapshot.snapshot_id, snapshot]));
    const ordered = snapshots.slice().sort((a, b) =>
      String(a.official_timestamp_persian || '').localeCompare(String(b.official_timestamp_persian || ''))
    );
    const groups = Array.isArray(historyIndex.groups) ? historyIndex.groups : [];
    const rows = groups.map(group => {
      const observations = (group.observations || [])
        .map(observation => ({...observation, snapshot: byId.get(observation.snapshot_id)}))
        .filter(item => item.snapshot)
        .sort((a, b) => String(a.snapshot.official_timestamp_persian || '').localeCompare(String(b.snapshot.official_timestamp_persian || '')));
      if (!observations.length) return null;
      const first = observations[0];
      const last = observations[observations.length - 1];
      const active = last.snapshot.snapshot_id === manifest.current_snapshot_id;
      const event = active
        ? (first.snapshot.snapshot_id === manifest.published_snapshot_ids?.[0] ? 'فعال' : 'عضویت جدید')
        : 'پایان عضویت';
      const precision = active ? '' : 'آخرین مشاهده در Snapshot ثبت‌شده';
      return { group, first, last, active, event, precision };
    }).filter(Boolean);

    function render() {
      const q = (input.value || '').trim().toLocaleLowerCase('fa');
      const filtered = rows.filter(row => [
        row.group.history_group_id,
        row.first.display_name,
        row.last.display_name,
        row.first.snapshot_member_key,
        row.last.snapshot_member_key,
        row.event
      ].join(' ').toLocaleLowerCase('fa').includes(q));
      const sorted = filtered.slice().sort((a, b) =>
        String(b.last.snapshot.official_timestamp_persian || '').localeCompare(String(a.last.snapshot.official_timestamp_persian || ''))
      );
      count.textContent = `${sorted.length} سابقه`;
      root.innerHTML = sorted.map(row => {
        const hrefId = row.last.snapshot_member_key;
        return `<a class="player-card" href="player.html?id=${encodeURIComponent(hrefId)}">
          <header><div><h3>${esc(row.last.display_name || row.first.display_name)}</h3><div class="player-id">${esc(hrefId)}</div></div>
          <span class="status">${esc(row.event)}</span></header>
          <div class="stats">
            <div class="stat"><span>شروع</span><strong>${esc(row.first.snapshot.official_timestamp_persian || '—')}</strong></div>
            <div class="stat"><span>آخرین Snapshot</span><strong>${esc(row.last.snapshot.official_timestamp_persian || '—')}</strong></div>
            <div class="stat"><span>وضعیت</span><strong>${row.active ? 'فعال' : 'سابق'}</strong></div>
            <div class="stat"><span>توضیح</span><strong>${esc(row.precision || row.group.continuity_status || '—')}</strong></div>
          </div>
        </a>`;
      }).join('') || '<div class="empty">سابقه‌ای پیدا نشد.</div>';
    }

    input.addEventListener('input', render);
    render();
  }).catch(error => {
    console.error(error);
    root.innerHTML = '<div class="empty">داده تاریخچه عضویت GOLDENCROWN قابل بارگذاری نیست.</div>';
  });
})();
