(() => {
  const root = document.querySelector('#players');
  const input = document.querySelector('#playerSearch');
  const count = document.querySelector('#count');
  if (!root) return;

  const json = path => fetch(path).then(response => {
    if (!response.ok) throw new Error(path);
    return response.json();
  });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  const fmt = value => value == null ? '—' : Number(value).toLocaleString('en-US');

  Promise.all([
    json('../data/manifest.json'),
    json('../data/derived/player-history-index.json')
  ]).then(([manifest, historyIndex]) => {
    const publishedIds = Array.isArray(manifest.published_snapshot_ids)
      ? manifest.published_snapshot_ids.slice()
      : (manifest.current_snapshot_id ? [manifest.current_snapshot_id] : []);

    return Promise.all(publishedIds.map(snapshotId =>
      json(`../data/canonical/${encodeURIComponent(snapshotId)}.json`)
    )).then(snapshots => ({ manifest, historyIndex, snapshots }));
  }).then(({ manifest, historyIndex, snapshots }) => {
    const orderedSnapshots = snapshots.slice().sort((a, b) =>
      String(b.official_timestamp_persian || '').localeCompare(String(a.official_timestamp_persian || ''))
    );
    const current = orderedSnapshots.find(snapshot => snapshot.snapshot_id === manifest.current_snapshot_id)
      || orderedSnapshots[0];
    const bySnapshot = new Map(orderedSnapshots.map(snapshot => [snapshot.snapshot_id, snapshot]));
    const groups = Array.isArray(historyIndex.groups) ? historyIndex.groups : [];
    const keyMap = historyIndex.key_map || {};

    const players = groups.map(group => {
      const observations = (group.observations || [])
        .map(observation => ({
          ...observation,
          snapshot: bySnapshot.get(observation.snapshot_id)
        }))
        .filter(item => item.snapshot);
      const latest = observations
        .slice()
        .sort((a, b) => String(b.snapshot.official_timestamp_persian || '').localeCompare(String(a.snapshot.official_timestamp_persian || '')))[0];
      if (!latest) return null;
      const active = current?.snapshot_id === latest.snapshot_id;
      const member = (latest.snapshot.members || []).find(row => row.snapshot_member_key === latest.snapshot_member_key) || {};
      return {
        id: latest.snapshot_member_key,
        display_name: latest.display_name || member.display_name || latest.snapshot_member_key,
        status: active ? 'active' : 'former',
        member,
        history: observations.map(item => item.snapshot_id)
      };
    }).filter(Boolean);

    const known = new Set(players.map(player => player.id));
    (current?.members || []).forEach(member => {
      if (known.has(member.snapshot_member_key)) return;
      players.push({
        id: member.snapshot_member_key,
        display_name: member.display_name || member.snapshot_member_key,
        status: 'active',
        member,
        history: [current.snapshot_id]
      });
    });

    function render() {
      const q = (input.value || '').trim().toLocaleLowerCase('fa');
      const list = players.filter(player =>
        [player.id, player.display_name, player.status, player.member.role]
          .join(' ').toLocaleLowerCase('fa').includes(q)
      );
      count.textContent = `${list.length} بازیکن`;
      root.innerHTML = list.map(player => {
        const m = player.member || {};
        const historyBadge = player.history.join(' · ');
        return `<a class="player-card" href="player.html?id=${encodeURIComponent(player.id)}">
          <header><div><h3>${esc(player.display_name)}</h3><div class="player-id">${esc(player.id)}</div></div>
          <span class="status">${player.status === 'former' ? 'سابق' : 'فعال'}</span></header>
          <div class="stats">
            <div class="stat"><span>Rank فعلی</span><strong>${player.status === 'active' ? (m.rank ?? '—') : '—'}</strong></div>
            <div class="stat"><span>Stage</span><strong>${fmt(m.stage)}</strong></div>
            <div class="stat"><span>Kills</span><strong>${fmt(m.total_kills)}</strong></div>
            <div class="stat"><span>League Medals</span><strong>${fmt(m.league_medals)}</strong></div>
            <div class="stat"><span>Snapshot history</span><strong>${esc(historyBadge)}</strong></div>
          </div>
        </a>`;
      }).join('') || '<div class="empty">بازیکنی با این عبارت پیدا نشد.</div>';
    }

    input.addEventListener('input', render);
    render();
  }).catch(error => {
    console.error(error);
    root.innerHTML = '<div class="empty">داده اعضای GOLDENCROWN قابل بارگذاری نیست.</div>';
  });
})();
