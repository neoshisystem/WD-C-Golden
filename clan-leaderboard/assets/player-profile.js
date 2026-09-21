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
  const isPermanentPlayerId = !/^G-S\d+-R\d+$/i.test(requestedId);

  Promise.all([json('../data/manifest.json')]).then(([manifest]) => {
    const publishedIds = Array.isArray(manifest.published_snapshot_ids)
      ? manifest.published_snapshot_ids.slice()
      : [];
    if (!publishedIds.length && manifest.current_snapshot_id) publishedIds.push(manifest.current_snapshot_id);

    return Promise.all(publishedIds.map(snapshotId =>
      json(`../data/canonical/${encodeURIComponent(snapshotId)}.json`)
    )).then(snapshots => ({ manifest, snapshots }));
  }).then(ctx => {
    const snapshots = ctx.snapshots.slice().sort((a, b) =>
      String(a.official_timestamp_persian || '').localeCompare(String(b.official_timestamp_persian || ''))
    );
    const requestedSnapshotId = qs.get('snapshot') || snapshotFromKey || ctx.manifest.current_snapshot_id;
    const requestedSnapshot = snapshots.find(s => s.snapshot_id === requestedSnapshotId) || snapshots[snapshots.length - 1];

    // snapshot_member_key is a snapshot-local evidence/navigation key.
    // Never use rank, display name, casing, or position to manufacture continuity.
    const currentObservation = requestedSnapshot?.members?.find(m => m.snapshot_member_key === requestedId) || null;

    // Stable history is available only when Canonical observations carry a permanent player_id.
    let identity = null;
    let historyRows = [];
    if (isPermanentPlayerId) {
      for (const snapshot of snapshots) {
        const observation = (snapshot.members || []).find(m => m.player_id === requestedId) || null;
        if (observation && !identity) identity = observation;
        historyRows.push({ snapshot, observation });
      }
    }

    const active = identity || currentObservation;
    if (!active) {
      root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">بازیکن در داده‌های Canonical GOLDENCROWN پیدا نشد.</div></div>';
      return;
    }

    const currentSnapshot = requestedSnapshot || snapshots[snapshots.length - 1];
    const currentIdentityRow = historyRows.find(row => row.snapshot.snapshot_id === ctx.manifest.current_snapshot_id) || null;
    const latestObservedRow = [...historyRows].reverse().find(row => row.observation) || null;
    const currentForIdentity = currentIdentityRow?.observation || latestObservedRow?.observation || currentObservation;
    const currentStateLabel = currentIdentityRow?.observation
      ? 'رتبه فعلی'
      : latestObservedRow?.observation
        ? 'آخرین رتبه مشاهده‌شده'
        : 'رتبه';

    const honors = obs => obs?.honor_medals
      ? `${fmt(obs.honor_medals.gold)} / ${fmt(obs.honor_medals.silver)} / ${fmt(obs.honor_medals.bronze)}`
      : '—';
    const weapons = obs => obs?.weapons
      ? `${fmt(obs.weapons['25mm'])} / ${fmt(obs.weapons.hydra)} / ${fmt(obs.weapons.hellfire)}`
      : '—';
    const rankDisplay = obs => {
      if (!obs?.rank) return '—';
      const movement = Number(obs.rank_movement || 0);
      if (!movement) return fmt(obs.rank);
      return `${fmt(obs.rank)} (${movement > 0 ? '↑' : '↓'} ${fmt(Math.abs(movement))})`;
    };
    const snapshotLabel = snapshot =>
      `${esc(snapshot.snapshot_id)} · ${esc(snapshot.official_timestamp_persian || '—')}`;

    const renderHistoricalRow = ({ snapshot, observation }) => {
      if (!observation) {
        return `<tr class="snapshot-missing"><td colspan="13">این بازیکن در Snapshot ${esc(snapshot.snapshot_id)} حضور نداشته است؛ این عدم حضور به‌عنوان خروج یا هویت جدید تفسیر نشده است.</td></tr>`;
      }
      return `<tr>
        <td class="rank-cell">${esc(rankDisplay(observation))}</td>
        <td>${esc(observation.display_name || active.display_name)}</td>
        <td>${esc(observation.role || active.role || 'Member')}</td>
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

    const identityStatus = isPermanentPlayerId
      ? `<section class="panel source-note"><strong>وضعیت هویت:</strong> این صفحه بر اساس شناسهٔ دائمی Canonical ساخته شده است؛ فقط Observationهایی که همان <code>player_id</code> را دارند به تاریخچه متصل می‌شوند.</section>`
      : `<section class="panel source-note"><strong>وضعیت تاریخچه:</strong> این صفحه با یک <code>snapshot_member_key</code> باز شده است. این کلید فقط مربوط به همان Snapshot است و برای جلوگیری از حدس هویت، تاریخچهٔ بین Snapshotها به این رکورد متصل نشده است. پس از ثبت و تأیید <code>player_id</code> دائمی، همین صفحه می‌تواند تاریخچهٔ واقعی تمام Snapshotهای مربوط را نمایش دهد.</section>`;

    const historySection = isPermanentPlayerId && historyRows.length
      ? `<section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">HISTORY</span><h2>تاریخچه عملکرد کاربر</h2><p class="muted">هر سطر یک Snapshot منتشرشده است؛ عدم حضور بازیکن نیز صریحاً نمایش داده می‌شود و به‌تنهایی به‌عنوان خروج تفسیر نمی‌شود.</p></div></div><div class="table-wrap profile-history-wrap"><table class="profile-history-table"><thead><tr><th>رتبه</th><th>نام کاربری</th><th>سمت</th><th>استیج</th><th>مدال لیگ جاری</th><th>تغییر مدال کلن</th><th>مدال کل کلن</th><th>مدال افتخار</th><th>مجموع کیل 💀</th><th>افزایش کیل 💀</th><th>لول سلاح‌ها</th><th>آخرین آنلاین</th><th>Snapshot</th></tr></thead><tbody>${historyRows.map(renderHistoricalRow).join('')}</tbody></table></div></section>`
      : `<section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">HISTORY</span><h2>تاریخچه عملکرد کاربر</h2><p class="muted">تاریخچهٔ تجمیعی فعلاً قابل تأیید نیست؛ Identity continuity برای این رکورد هنوز Canonical نشده است.</p></div></div><div class="panel empty">فقط Observation مربوط به Snapshot انتخاب‌شده نمایش داده شده است. هیچ Observation مربوط به Snapshot دیگر بدون شناسهٔ دائمی به این بازیکن نسبت داده نمی‌شود.</div></section>`;

    const role = currentForIdentity?.role || active.role || 'Member';
    root.innerHTML = `<div class="shell profile-shell">
      <section class="profile-head">
        <div><span class="badge">GOLDENCROWN · PLAYER</span><h1>${esc(currentForIdentity?.display_name || active.display_name)}</h1><div class="identity">${esc(requestedId)} · ${esc(role)} · ${currentIdentityRow?.observation ? 'Historical identity confirmed by player_id' : 'Snapshot-local identity'}</div></div>
        <div class="profile-actions"><a class="btn" href="players.html">← اعضای کلن</a><a class="btn" href="index.html?snapshot=${encodeURIComponent(currentSnapshot.snapshot_id)}">لیدربورد</a><a class="btn" href="member-history.html">تاریخچه عضویت</a></div>
      </section>
      <section class="panel"><div class="profile-stats">
        <div class="profile-stat"><span>${esc(currentStateLabel)}</span><strong>${esc(rankDisplay(currentForIdentity))}</strong></div>
        <div class="profile-stat"><span>سمت</span><strong>${esc(role)}</strong></div>
        <div class="profile-stat"><span>استیج فعلی</span><strong>${fmt(currentForIdentity?.stage)}</strong></div>
        <div class="profile-stat"><span>مدال لیگ جاری</span><strong>${fmt(currentForIdentity?.league_medals)}</strong></div>
        <div class="profile-stat"><span>مدال کل کلن</span><strong>${fmt(currentForIdentity?.clan_medals)}</strong></div>
        <div class="profile-stat"><span>مجموع کیل 💀</span><strong>${fmt(currentForIdentity?.total_kills)}</strong></div>
        <div class="profile-stat"><span>مدال افتخار</span><strong>${esc(honors(currentForIdentity))}</strong></div>
        <div class="profile-stat"><span>لول سلاح‌ها</span><strong>${esc(weapons(currentForIdentity))}</strong></div>
        <div class="profile-stat"><span>آخرین آنلاین</span><strong>${esc(currentForIdentity?.last_online_display || '—')}</strong></div>
      </div></section>
      ${historyRows.length ? `<section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">TIMELINE</span><h2>خط زمانی Snapshotها</h2><p class="muted">${historyRows.filter(row => row.observation).length} Observation تأییدشده؛ ${historyRows.filter(row => !row.observation).length} Snapshot بدون حضور.</p></div></div><div class="profile-stats">${historyRows.map(row => `<div class="profile-stat"><span>${snapshotLabel(row.snapshot)}</span><strong>${row.observation ? `Rank ${fmt(row.observation.rank)} · ${fmt(row.observation.total_kills)} Kill` : 'در این Snapshot حضور ندارد'}</strong></div>`).join('')}</div></section>` : ''}
      ${historySection}
      ${identityStatus}
      <section class="panel source-note"><strong>منبع داده:</strong> فقط Snapshotهای Canonical منتشرشده در GOLDENCROWN؛ هیچ Identity از Rank، نام یا تطبیق ظاهری ساخته نشده است.</section>
    </div>`;
  }).catch(error => {
    console.error(error);
    root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">داده پروفایل GOLDENCROWN قابل بارگذاری نیست.</div></div>';
  });
})();
