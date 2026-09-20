# GOLDENCROWN G-S01 — Evidence/Normalization Report

## Publication
This report accompanies the first published GOLDENCROWN baseline snapshot.

## Source
- Source archive: `G-S01.zip`
- Source SHA-256: `15e0a5bc727803f8ce48785b952868011f54b3268d7f4ff891ae32c242385a02`
- Evidence files: 58
- Profile screenshots: 50
- Ranking screenshots: 8

## Official Snapshot Time
`1405-06-27 24:00`

The screenshot filename timestamps are capture evidence only. The official Snapshot timestamp is the value above.

## Core Validation
- Members: **50**
- Ranks: **1–50, contiguous, unique**
- Current League Medals total: **2,002,752**
- Total Kills total: **8,539,364**
- Clan Medals Total: **11,908,775**
- Total Kills: **baseline**
- Clan Medals Total: **baseline**
- Period Kill Delta: **not calculated**
- Period Clan Medal Delta: **not calculated**

## Identity Handling
Permanent `player_id` values are intentionally not assigned in the opening evidence snapshot.

Each member has a unique snapshot-local key such as `G-S01-R001`.

One case-insensitive display-name collision exists:
- Rank 17: `ALI`
- Rank 43: `ali`

They remain **two distinct members**. No automatic merge is permitted without cross-snapshot identity evidence.

## Rank 18
Approved normalized display/search name:
**ARM CR7**

## Profile-only fields
The raw evidence also contains:
- Last Online
- Weapon Levels
- Honor Medals

These remain outside the canonical core cache until a dedicated normalization pass is approved.

## Architecture
GOLDENCROWN remains an independent dataset/history/identity registry while using the same portable Leaderboard Core semantics as PERSIA.
