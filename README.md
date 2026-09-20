# WD-C-Golden — GOLDENCROWN Leaderboard

This repository is the independent GOLDENCROWN implementation of the shared War Drone Leaderboard Core used by PERSIA.

## G-S01 baseline publication

- Snapshot: `G-S01`
- Official timestamp: `1405-06-27 24:00`
- Members: `50`
- Total Kills: baseline
- Clan Medals: baseline
- Rank coverage: `1..50`, unique and contiguous
- Source archive SHA-256: `15e0a5bc727803f8ce48785b952868011f54b3268d7f4ff891ae32c242385a02`

Permanent `player_id` values are intentionally not assigned in the opening evidence snapshot. Each row has a unique `snapshot_member_key` such as `G-S01-R001`. Cross-snapshot identity continuity will be established from evidence before permanent identity records are finalized. This preserves the rule that rank is never identity.

## Common Core rules

The canonical normalized model uses PERSIA-compatible vocabulary: `stage`, `league_medals`, `clan_medals`, `total_kills`, `honor_medals`, `weapons`, and `last_online_display`.

Fingerprinting and identity matching are review aids only. Ambiguous identity is never guessed, and a genuinely new identity requires explicit confirmation.

## Validation

The published baseline currently includes the canonical snapshot validator:

```bash
node tools/validate-snapshot.js data/canonical/G-S01.json
```

The broader synthetic Common-Core and identity-matcher test suite remains in the local v0.9 working package until that scaffolding is promoted as a repository-wide test contract.

No PERSIA data is imported as canonical GOLDENCROWN history. The repositories remain independent; portable Core semantics are documented so improvements can be back-ported where appropriate.

## Publication status

`G-S01` is published as the opening GOLDENCROWN baseline/evidence snapshot. This publication does not assign permanent `player_id` values; identity seeding remains snapshot-local until cross-snapshot evidence is reviewed.
