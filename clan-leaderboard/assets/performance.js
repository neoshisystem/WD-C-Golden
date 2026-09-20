(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WDPerformance = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

  function pad(value) { return String(value).padStart(2, '0'); }

  function leagueWeekId(capturedAtUtc, reset) {
    const date = new Date(capturedAtUtc);
    if (Number.isNaN(date.getTime())) throw new Error(`Invalid captured_at_utc: ${capturedAtUtc}`);
    const weekday = DAY_INDEX[reset?.weekday || 'Thursday'];
    const [hour, minute] = String(reset?.time_utc || '00:00').split(':').map(Number);
    const currentWeekday = date.getUTCDay();
    const daysBack = (currentWeekday - weekday + 7) % 7;
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysBack, hour || 0, minute || 0, 0));
    if (date.getTime() < start.getTime()) start.setUTCDate(start.getUTCDate() - 7);
    return `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(start.getUTCDate())}`;
  }

  function getRows(snapshotId, observationSets) {
    // Multiple history shards may contain the same snapshot. Later sources are
    // authoritative because ingestion promotes the newest canonical observation
    // into the current source while preserving older shards for audit/history.
    let resolved = null;
    for (const source of observationSets || []) {
      const rows = source?.snapshots?.[snapshotId];
      if (Array.isArray(rows)) resolved = rows;
    }
    return resolved || [];
  }

  function clonePlayerTotals(players) {
    return Object.fromEntries(Object.entries(players).map(([id, value]) => [id, { clan_medals: value.clan_medals, kills: value.kills }]));
  }

  function clonePeriodPlayers(players) {
    return Object.fromEntries(Object.entries(players).map(([id, value]) => [id, {
      clan_medals: value.clan_medals,
      kills: value.kills,
      baseline: Boolean(value.baseline),
      clan_baseline: Boolean(value.clan_baseline),
      kills_baseline: Boolean(value.kills_baseline)
    }]));
  }

  function cloneCumulativePlayers(players) {
    return Object.fromEntries(Object.entries(players).map(([id, value]) => [id, {
      clan_medals: value.clan_medals,
      kills: value.kills
    }]));
  }

  function computeAll(snapshotsFile, observationSets, leaguesFile) {
    const snapshots = [...(snapshotsFile?.snapshots || [])].sort((a, b) => a.captured_at_utc.localeCompare(b.captured_at_utc));
    const reset = leaguesFile?.reset || { weekday: 'Thursday', time_utc: '00:00' };
    const performanceStartSnapshotId = leaguesFile?.performance_tracking_start_snapshot_id || null;
    const results = {};
    const weeklyState = new Map();
    const cumulativeState = {};
    const cumulativePrevious = new Map();
    let previousSnapshot = null;
    let previousRows = [];
    let performanceTrackingStarted = !performanceStartSnapshotId;

    for (const snapshot of snapshots) {
      const weekId = leagueWeekId(snapshot.captured_at_utc, reset);
      const startsPerformanceTracking = snapshot.snapshot_id === performanceStartSnapshotId;
      if (startsPerformanceTracking) performanceTrackingStarted = true;

      let state = weeklyState.get(weekId);
      if (!state || startsPerformanceTracking) {
        state = { clan_medals: 0, kills: 0, players: {} };
        weeklyState.set(weekId, state);
      }

      const currentRows = getRows(snapshot.snapshot_id, observationSets);
      const previousWeekId = previousSnapshot ? leagueWeekId(previousSnapshot.captured_at_utc, reset) : null;
      const sameWeek = Boolean(previousSnapshot && previousWeekId === weekId);
      const hasPreviousSnapshot = Boolean(previousSnapshot);
      const isLeagueStart = snapshot.league_boundary === 'start';
      const isLeagueEnd = snapshot.league_boundary === 'end';
      const previousById = new Map(sameWeek ? previousRows.map(row => [row.player_id, row]) : []);
      const previousClanById = new Map(hasPreviousSnapshot ? previousRows.map(row => [row.player_id, row]) : []);
      const previousKillById = new Map(hasPreviousSnapshot ? previousRows.map(row => [row.player_id, row]) : []);
      let periodClan = 0;
      let periodKills = 0;
      const periodPlayers = {};

      for (const row of currentRows) {
        const previous = previousById.get(row.player_id);
        const previousClan = previousClanById.get(row.player_id);
        const previousKill = previousKillById.get(row.player_id);
        const clanValue = Number(row.clan_medals || 0);
        const killValue = Number(row.total_kills || 0);

        // Clan Medals are cumulative totals. A league boundary resets the
        // *earned* weekly counter, but it does not erase the previous observed
        // total for an existing player. Therefore an existing player is always
        // compared with their previous valid observation, including S07 -> S08.
        // A player first observed at league start has an explicit Clan Medal
        // baseline of zero, so their observed S08 value is their league delta.
        let clanDelta = 0;
        if (previousClan) clanDelta = clanValue - Number(previousClan.clan_medals || 0);
        else if (isLeagueStart) clanDelta = clanValue;
        else if (isLeagueEnd) clanDelta = clanValue;

        // Kills never reset at league boundaries. A player without a previous
        // observation is a baseline for Kill Delta; their current total is not
        // retroactively counted as earned during this period.
        let killDelta = 0;
        if (previousKill) killDelta = killValue - Number(previousKill.total_kills || 0);
        else if (isLeagueEnd) killDelta = hasPreviousSnapshot ? killValue : 0;

        const baseline = !hasPreviousSnapshot || (!previous && !isLeagueStart && !isLeagueEnd);
        periodClan += clanDelta;
        periodKills += killDelta;
        const currentPlayer = state.players[row.player_id] || { clan_medals: 0, kills: 0 };
        currentPlayer.clan_medals += clanDelta;
        currentPlayer.kills += killDelta;
        state.players[row.player_id] = currentPlayer;
        periodPlayers[row.player_id] = {
          clan_medals: clanDelta,
          kills: killDelta,
          baseline,
          clan_baseline: !hasPreviousSnapshot || (!previousClan && !isLeagueStart && !isLeagueEnd),
          kills_baseline: !previousKill && !isLeagueEnd
        };

        if (!cumulativeState[row.player_id]) cumulativeState[row.player_id] = { clan_medals: 0, kills: 0 };
        const previousCumulative = cumulativePrevious.get(row.player_id);
        if (!previousCumulative) {
          if (!hasPreviousSnapshot) {
            cumulativeState[row.player_id].clan_medals += 0;
            cumulativeState[row.player_id].kills += 0;
          } else if (!sameWeek && isLeagueStart) {
            cumulativeState[row.player_id].clan_medals += clanValue;
            cumulativeState[row.player_id].kills += 0;
          }
        } else {
          // Lifetime earned Clan Medals compare stable identity observations
          // across league boundaries and membership gaps. A first observation
          // at league start uses the explicit zero baseline; a first observation
          // elsewhere remains baseline until a later observation.
          if (!previousCumulative) {
            if (hasPreviousSnapshot && isLeagueStart) {
              cumulativeState[row.player_id].clan_medals += clanValue;
            }
          } else {
            cumulativeState[row.player_id].clan_medals += clanValue - Number(previousCumulative.clan_medals || 0);
          }
          if (previousCumulative) {
            cumulativeState[row.player_id].kills += killValue - Number(previousCumulative.total_kills || 0);
          }
        }
        cumulativePrevious.set(row.player_id, { ...row, captured_at_utc: snapshot.captured_at_utc });
      }

      const weeklyClan = performanceTrackingStarted ? (state.clan_medals += periodClan) : 0;
      const weeklyKills = performanceTrackingStarted ? (state.kills += periodKills) : 0;
      results[snapshot.snapshot_id] = {
        snapshot_id: snapshot.snapshot_id,
        league_week: weekId,
        baseline_snapshot_id: previousSnapshot ? previousSnapshot.snapshot_id : snapshot.snapshot_id,
        period_clan_medals_change: periodClan,
        period_kills_change: periodKills,
        weekly_clan_medals_earned: weeklyClan,
        weekly_kills_earned: weeklyKills,
        period_players: clonePeriodPlayers(periodPlayers),
        players: clonePlayerTotals(state.players),
        cumulative_players: cloneCumulativePlayers(cumulativeState)
      };
      previousSnapshot = snapshot;
      previousRows = currentRows;
    }
    return results;
  }

  return { leagueWeekId, getRows, computeAll };
});
