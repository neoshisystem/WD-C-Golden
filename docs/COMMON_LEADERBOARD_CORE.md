# Common Leaderboard Core — PERSIA / GOLDENCROWN

## Shared identity rules

- `player_id` is the stable identity key once an identity is confirmed.
- `rank` is snapshot-local and never an identity key.
- Rank movement is contextual only.
- Rename does not create a new identity when continuity evidence supports the same player.
- Membership history is separate from identity.
- Returning after a membership gap does not create a new identity.
- Ambiguous identity is never guessed.

## Shared observation vocabulary

Canonical normalized observations use the PERSIA-compatible vocabulary:

- `rank`
- `rank_movement`
- `stage`
- `league_medals`
- `league_medals_delta`
- `clan_medals`
- `clan_medals_delta`
- `honor_medals: {gold, silver, bronze}`
- `total_kills`
- `kills_delta`
- `weapons: {25mm, hydra, hellfire}`
- `last_online_display`

Source-specific aliases may exist only before canonical normalization.

## Shared performance semantics

- Total Kills are lifetime/cumulative.
- Clan Medals are cumulative observed totals while continuity is established.
- Current League Medals are league-period values and reset at the league boundary.
- Period deltas are identity-based, never rank-based.
- Opening/new-identity observations are baseline where period semantics require it.
- Negative cumulative movement is an anomaly/review signal, not an automatic new identity.
- A fixed number of snapshots per league is not assumed.

## Fingerprint boundary

Fingerprinting is a review aid for reaching an identity decision. It is not a replacement for `player_id`, and it is not an automatic authority.

Useful evidence can include stage, weapon levels, honor medals, cumulative trajectories, historical observations, membership history, exact display name, and screenshot/profile evidence.

Rank, rank movement, and current league medals are excluded as identity selectors.

## Portability requirement

Any architectural rule introduced in GOLDENCROWN must be expressible as a PERSIA-compatible rule and should be testable in both repositories before it is treated as a shared Core rule.
