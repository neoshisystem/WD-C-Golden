(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WDViewerData = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const KEYS = [
    'استیج',
    'مدال لیگ جاری',
    'تغییر مدال کلن',
    'مدال کل کلن',
    'مدال افتخار (طلا / نقره / برنز)',
    'مجموع کیل 💀',
    'افزایش کیل 💀',
    'لول سلاح‌ها (توپ / هیدرا / هل‌فایر)',
    'آخرین آنلاین'
  ];

  const faNumber = value => Number(value).toLocaleString('en-US');
  const signed = value => value == null ? '—' : Number(value) === 0 ? '0' : Number(value) > 0 ? `+${faNumber(value)}` : `-${faNumber(Math.abs(value))}`;
  const movement = value => value == null || value === 0 ? '-' : value > 0 ? `↑ ${value}` : `↓ ${Math.abs(value)}`;
  const weapon = (level, delta) => delta == null || delta === 0 ? faNumber(level) : `${faNumber(level)} (${signed(delta)})`;

  function getRows(snapshotId, observationSets) {
    for (const source of observationSets || []) {
      const rows = source?.snapshots?.[snapshotId];
      if (Array.isArray(rows)) return rows;
    }
    return [];
  }

  function buildMembers(snapshotId, observationSets, playersData, metrics) {
    const registry = new Map((playersData?.players || []).map(player => [player.player_id, player]));
    const rows = [...getRows(snapshotId, observationSets)].sort((a, b) => Number(a.rank) - Number(b.rank));
    const result = rows.map(row => {
      const player = registry.get(row.player_id) || {};
      const name = row.display_name || player.display_name || row.player_id;
      const role = row.role || player.role || 'Member';
      const honors = row.honor_medals || { gold: 0, silver: 0, bronze: 0 };
      const upgrades = row.weapons?.upgrade_deltas || {};
      const stats = {
        'استیج': faNumber(row.stage ?? 0),
        'مدال لیگ جاری': faNumber(row.league_medals ?? 0),
        'تغییر مدال کلن': '—',
        'مدال کل کلن': faNumber(row.clan_medals ?? 0),
        'مدال افتخار (طلا / نقره / برنز)': `${honors.gold ?? 0} / ${honors.silver ?? 0} / ${honors.bronze ?? 0}`,
        'مجموع کیل 💀': faNumber(row.total_kills ?? 0),
        'افزایش کیل 💀': '—',
        'لول سلاح‌ها (توپ / هیدرا / هل‌فایر)': `${weapon(row.weapons?.['25mm'] ?? 0, upgrades['25mm'])} / ${weapon(row.weapons?.hydra ?? 0, upgrades.hydra)} / ${weapon(row.weapons?.hellfire ?? 0, upgrades.hellfire)}`,
        'آخرین آنلاین': String(row.last_online_display ?? '—')
      };
      const period = metrics?.period_players?.[row.player_id];
      if (period) {
        stats['تغییر مدال کلن'] = period.clan_baseline ? '— / baseline' : signed(period.clan_medals);
        stats['افزایش کیل 💀'] = period.kills_baseline ? '— / baseline' : signed(period.kills);
      } else if (metrics?.baseline_snapshot_id === snapshotId) {
        stats['تغییر مدال کلن'] = '— / baseline';
        stats['افزایش کیل 💀'] = '— / baseline';
      }
      return {
        player_id: row.player_id,
        rank: String(row.rank),
        name,
        role,
        movement: movement(row.rank_movement),
        stats
      };
    });
    return { keys: KEYS.slice(), members: result };
  }

  return { KEYS, getRows, buildMembers };
});
