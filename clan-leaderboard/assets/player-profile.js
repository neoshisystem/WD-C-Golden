(() => {
  const root = document.querySelector('#profile');
  if (!root) return;

  const qs = new URLSearchParams(location.search);
  const requestedId = qs.get('id');
  if (!requestedId) {
    root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">شناسه بازیکن مشخص نشده است.</div></div>';
    return;
  }

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
  const fmt = value => value == null ? '—' : Number(value).toLocaleString('en-US');
  const signed = value => value == null ? '—' : Number(value) > 0 ? `+${fmt(value)}` : fmt(value);
  const json = path => fetch(path).then(response => {
    if (!response.ok) throw new Error(path);
    return response.json();
  });

  const snapshotFromKey = String(requestedId).match(/^(G-S\d+)/)?.[1] || null;

  Promise.all([
    json('../data/manifest.json'),
    json('../data/derived/player-history-index.json')
  ]).then(([manifest, historyIndex]) => {
    const publishedIds = Array.isArray(manifest.published_snapshot_ids)
      ? manifest.published_snapshot_ids.slice()
      : [];
    if (!publishedIds.length && manifest.current_snapshot_id) publishedIds.push(manifest.current_snapshot_id);

    return Promise.all(publishedIds.map(snapshotId =>
      json(`../data/canonical/${encodeURIComponent(snapshotId)}.json`)
    )).then(snapshots => ({ manifest, historyIndex, snapshots }));
  }).then(ctx => {
    const snapshots = ctx.snapshots.slice().sort((a, b) =>
      String(b.official_timestamp_persian || '').localeCompare(String(a.official_timestamp_persian || ''))
    );

    const requestedSnapshotId =
      qs.get('snapshot') ||
      snapshotFromKey ||
      ctx.manifest.current_snapshot_id;

    const selectedSnapshot =
      snapshots.find(snapshot => snapshot.snapshot_id === requestedSnapshotId) ||
      snapshots[snapshots.length - 1];

    const requestedObservation = selectedSnapshot?.members?.find(
      member => member.snapshot_member_key === requestedId
    ) || null;

    const keyMap = ctx.historyIndex?.key_map || {};
    const groups = Array.isArray(ctx.historyIndex?.groups) ? ctx.historyIndex.groups : [];
    let groupId = keyMap[requestedId] || null;

    if (!groupId && !/^G-S\d+-R\d+$/i.test(requestedId)) {
      const candidate = groups.find(group => group.canonical_player_id === requestedId);
      groupId = candidate?.history_group_id || null;
    }

    const group = groupId
      ? groups.find(candidate => candidate.history_group_id === groupId) || null
      : null;

    const groupObservations = new Map(
      (group?.observations || []).map(observation => [
        observation.snapshot_id,
        observation.snapshot_member_key
      ])
    );

    const rows = snapshots.map(snapshot => {
      const memberKey = groupObservations.get(snapshot.snapshot_id);
      const observation = memberKey
        ? (snapshot.members || []).find(member => member.snapshot_member_key === memberKey) || null
        : null;
      return { snapshot, observation };
    });

    const latestObservedRow = [...rows].reverse().find(row => row.observation) || null;
    const latestObservation = latestObservedRow?.observation || requestedObservation || null;
    const selectedRow = rows.find(row => row.snapshot.snapshot_id === selectedSnapshot?.snapshot_id) || null;
    const selected = selectedRow?.observation || requestedObservation || latestObservation;

    if (!selected && !latestObservation) {
      root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">بازیکن در داده‌های Canonical GOLDENCROWN پیدا نشد.</div></div>';
      return;
    }

    const isEvidenceHistory = Boolean(group && group.continuity_status === 'evidence-resolved-for-ui');
    const hasMultiSnapshotHistory = rows.filter(row => row.observation).length > 1;
    const currentSnapshot = snapshots[snapshots.length - 1];

    const honors = observation => observation?.honor_medals
      ? `${fmt(observation.honor_medals.gold)} / ${fmt(observation.honor_medals.silver)} / ${fmt(observation.honor_medals.bronze)}`
      : '—';

    const weapons = observation => observation?.weapons
      ? `${fmt(observation.weapons['25mm'])} / ${fmt(observation.weapons.hydra)} / ${fmt(observation.weapons.hellfire)}`
      : '—';

    const rankDisplay = observation => {
      if (!observation?.rank) return '—';
      const movement = Number(observation.rank_movement || 0);
      if (!movement) return fmt(observation.rank);
      return `${fmt(observation.rank)} (${movement > 0 ? '↑' : '↓'} ${fmt(Math.abs(movement))})`;
    };

    const snapshotLabel = snapshot =>
      `${esc(snapshot.snapshot_id)} · ${esc(snapshot.official_timestamp_persian || '—')}`;

    const selectedLabel = selectedSnapshot?.snapshot_id === currentSnapshot?.snapshot_id
      ? 'وضعیت فعلی'
      : `وضعیت ثبت‌شده در ${selectedSnapshot?.snapshot_id || 'Snapshot'}`;

    const renderHistoricalRow = ({ snapshot, observation }) => {
      if (!observation) {
        return `<tr class="snapshot-missing">
          <td colspan="13">این بازیکن در Snapshot ${esc(snapshot.snapshot_id)} مشاهده نشده است؛ عدم حضور به‌تنهایی خروج یا تغییر هویت محسوب نمی‌شود.</td>
        </tr>`;
      }

      return `<tr>
        <td class="rank-cell">${esc(rankDisplay(observation))}</td>
        <td>${esc(observation.display_name || latestObservation?.display_name)}</td>
        <td>${esc(observation.role || latestObservation?.role || 'Member')}</td>
        <td>${fmt(observation.stage)}</td>
        <td>${fmt(observation.league_medals)}</td>
        <td>${observation.clan_medals_delta == null ? '— / baseline' : signed(observation.clan_medals_delta)}</td>
        <td>${fmt(observation.clan_medals)}</td>
        <td>${esc(honors(observation))}</td>
        <td>${fmt(observation.total_kills)}</td>
        <td>${observation.kills_delta == null ? '— / baseline' : signed(observation.kills_delta)}</td>
        <td>${esc(weapons(observation))}</td>
        <td>${esc(observation.last_online_display || '—')}</td>
        <td class="snapshot-cell"><span class="snapshot-badge">${snapshotLabel(snapshot)}</span></td>
      </tr>`;
    };

    const continuityNote = isEvidenceHistory
      ? `<section class="panel source-note">
          <strong>نوع تاریخچه:</strong> این Timeline بر اساس <code>Evidence Continuity Index</code> گلدن ساخته شده است.
          این شاخص یک گروه‌بندی غیرکاننیک برای نمایش تاریخچه است و <code>player_id</code> دائمی ایجاد یا جایگزین نمی‌کند.
          Rank و نام به‌تنهایی Identity محسوب نشده‌اند؛ تطبیق‌های فعلی از گزارش‌های Snapshot و تطابق یک‌به‌یک نام + Fingerprint استفاده می‌کنند.
        </section>`
      : `<section class="panel source-note">
          <strong>وضعیت تاریخچه:</strong> برای این Observation هنوز گروه‌بندی تاریخی تأییدشده‌ای وجود ندارد.
          فقط همان Snapshot نمایش داده می‌شود و هیچ Identity بین Snapshotها حدس زده نمی‌شود.
        </section>`;

    const historySection = isEvidenceHistory
      ? `<section class="panel progression-panel">
          <div class="snapshot-heading">
            <div>
              <span class="badge">HISTORY</span>
              <h2>تاریخچه عملکرد کاربر</h2>
              <p class="muted">
                تمام Snapshotهای منتشرشده بررسی می‌شوند؛ Snapshotهایی که بازیکن در آنها حضور نداشته نیز صریحاً ثبت می‌شوند.
              </p>
            </div>
          </div>
          <div class="table-wrap profile-history-wrap">
            <table class="profile-history-table">
              <thead>
                <tr>
                  <th>رتبه</th><th>نام کاربری</th><th>سمت</th><th>استیج</th>
                  <th>مدال لیگ جاری</th><th>تغییر مدال کلن</th><th>مدال کل کلن</th>
                  <th>مدال افتخار</th><th>مجموع کیل 💀</th><th>افزایش کیل 💀</th>
                  <th>لول سلاح‌ها</th><th>آخرین آنلاین</th><th>Snapshot</th>
                </tr>
              </thead>
              <tbody>${rows.map(renderHistoricalRow).join('')}</tbody>
            </table>
          </div>
        </section>`
      : `<section class="panel progression-panel">
          <div class="snapshot-heading">
            <div>
              <span class="badge">HISTORY</span>
              <h2>تاریخچه عملکرد کاربر</h2>
            </div>
          </div>
          <div class="panel empty">
            تاریخچهٔ بین Snapshotها برای این Observation تأیید نشده است.
          </div>
        </section>`;

    const role = latestObservation?.role || selected?.role || 'Member';
    const displayName = latestObservation?.display_name || selected?.display_name || requestedId;
    const currentState = latestObservation || selected;
    const permanentIdLabel = currentState?.player_id
      ? ` · Canonical player_id: ${esc(currentState.player_id)}`
      : ' · Canonical player_id: unassigned';

    root.innerHTML = `<div class="shell profile-shell">
      <section class="profile-head">
        <div>
          <span class="badge">GOLDENCROWN · PLAYER</span>
          <h1>${esc(displayName)}</h1>
          <div class="identity">
            ${esc(groupId || requestedId)} · ${esc(role)}
            · ${isEvidenceHistory ? 'Evidence-resolved history' : 'Snapshot-local record'}
            ${permanentIdLabel}
          </div>
        </div>
        <div class="profile-actions">
          <a class="btn" href="players.html">← اعضای کلن</a>
          <a class="btn" href="index.html?snapshot=${encodeURIComponent(selectedSnapshot?.snapshot_id || currentSnapshot.snapshot_id)}">لیدربورد</a>
          <a class="btn" href="member-history.html">تاریخچه عضویت</a>
        </div>
      </section>

      <section class="panel">
        <div class="snapshot-heading">
          <div>
            <span class="badge">CURRENT</span>
            <h2>وضعیت فعلی بازیکن</h2>
            <p class="muted">آخرین Observation موجود در زنجیرهٔ GOLDENCROWN.</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="profile-stat"><span>رتبه فعلی</span><strong>${esc(rankDisplay(currentState))}</strong></div>
          <div class="profile-stat"><span>سمت</span><strong>${esc(currentState?.role || 'Member')}</strong></div>
          <div class="profile-stat"><span>استیج فعلی</span><strong>${fmt(currentState?.stage)}</strong></div>
          <div class="profile-stat"><span>مدال لیگ جاری</span><strong>${fmt(currentState?.league_medals)}</strong></div>
          <div class="profile-stat"><span>مدال کل کلن</span><strong>${fmt(currentState?.clan_medals)}</strong></div>
          <div class="profile-stat"><span>مجموع کیل 💀</span><strong>${fmt(currentState?.total_kills)}</strong></div>
          <div class="profile-stat"><span>مدال افتخار</span><strong>${esc(honors(currentState))}</strong></div>
          <div class="profile-stat"><span>لول سلاح‌ها</span><strong>${esc(weapons(currentState))}</strong></div>
          <div class="profile-stat"><span>آخرین آنلاین</span><strong>${esc(currentState?.last_online_display || '—')}</strong></div>
        </div>
      </section>

      ${selectedSnapshot?.snapshot_id !== currentSnapshot?.snapshot_id && selected
        ? `<section class="panel progression-panel">
            <div class="snapshot-heading">
              <div>
                <span class="badge">SELECTED SNAPSHOT</span>
                <h2>${esc(selectedLabel)}</h2>
                <p class="muted">${snapshotLabel(selectedSnapshot)}</p>
              </div>
            </div>
            <div class="profile-stats">
              <div class="profile-stat"><span>رتبه در این Snapshot</span><strong>${esc(rankDisplay(selected))}</strong></div>
              <div class="profile-stat"><span>استیج</span><strong>${fmt(selected.stage)}</strong></div>
              <div class="profile-stat"><span>مدال لیگ جاری</span><strong>${fmt(selected.league_medals)}</strong></div>
              <div class="profile-stat"><span>مدال کل کلن</span><strong>${fmt(selected.clan_medals)}</strong></div>
              <div class="profile-stat"><span>مجموع کیل 💀</span><strong>${fmt(selected.total_kills)}</strong></div>
            </div>
          </section>`
        : ''}

      <section class="panel progression-panel">
        <div class="snapshot-heading">
          <div>
            <span class="badge">TIMELINE</span>
            <h2>خط زمانی Snapshotها</h2>
            <p class="muted">${rows.filter(row => row.observation).length} Observation از ${rows.length} Snapshot منتشرشده.</p>
          </div>
        </div>
        <div class="profile-stats">
          ${rows.map(row => `<div class="profile-stat">
            <span>${snapshotLabel(row.snapshot)}</span>
            <strong>${row.observation
              ? `Rank ${fmt(row.observation.rank)} · ${fmt(row.observation.total_kills)} Kill`
              : 'در این Snapshot حضور ندارد'}</strong>
          </div>`).join('')}
        </div>
      </section>

      ${historySection}
      ${continuityNote}

      <section class="panel source-note">
        <strong>منبع داده:</strong> فقط دادهٔ Canonical و Evidence-derived history index مربوط به GOLDENCROWN.
        هیچ داده، Identity یا History از PERSIA خوانده نشده است.
      </section>
    </div>`;
  }).catch(error => {
    console.error(error);
    root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">داده پروفایل GOLDENCROWN قابل بارگذاری نیست.</div></div>';
  });
})();