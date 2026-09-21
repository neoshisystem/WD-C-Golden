# GOLDENCROWN — Recovery, Audit & Player History Completion Report

**Repository:** `neoshisystem/WD-C-Golden`  
**Report:** `.agent/GOLDENCROWN_RECOVERY_AND_PLAYER_HISTORY_AUDIT_2026-09-21.md`  
**Date:** 2026-09-21  
**Authority rule:** GitHub live `main` is the source of truth. Older handoff text is evidence only.

---

## 1. Current authority

### Main

- Initial audited `main` SHA: `148d30e3df073af91ab675ff676da32c0a0a81de`
- Current `main` after this mission's implementation commit: `ebd22d157878dae9ae52c85c9066613e6dbe9227`
- Current manifest:
  - `current_snapshot_id = G-S03`
  - published snapshots: `G-S01, G-S02, G-S03`
  - permanent `player_id` assignment is false for G-S01/G-S02/G-S03
- Canonical snapshot SHAs observed on `main`:
  - G-S01: `fad408ca369b931cf91814c7ac809b5d8870ab51`
  - G-S02: `c06887c502a6adf168854e4d79b62d465b295694`
  - G-S03: `820dbe5670453eaa03ff2717ba745f682b67314a`

### Branches

Only two branches are currently present:

| Branch | SHA | State |
|---|---|---|
| `main` | `ebd22d157878dae9ae52c85c9066613e6dbe9227` | current authority |
| `fix/goldencrown-persia-ui-parity` | `7cbd62a0a2cbbe18acd243a80fca0e25b06e18a6` | unmerged work |

The parity branch is **17 commits ahead and 15 commits behind** `main`. Merge base: `6ab98afa0191ca092e63607939299e33a12f61a2`.

### Pull requests

GitHub PR search returned **no open or closed PRs** for this repository relevant to the parity branch.

---

# 2. Previous work recovered

## A. Completed and already on main

| Item | Purpose | Commit(s) | Main? | Published? | Status |
|---|---|---|---|---|---|
| G-S01 bootstrap/baseline | Establish first Golden evidence/canonical snapshot | `f98a21a...`, `919bcf...`, `864e86...`, `94d93f...`, schema/tool/report commits | Yes | GitHub data: Yes | **COMPLETE** |
| G-S01 evidence-field restoration | Restore Honor Medals / Weapons / Last Online | `c143b05...`, `71b580f...`, `d7a9873...`, `9925f1...` | Yes | Pages deployment followed | **COMPLETE** |
| G-S02 publication | Source + canonical + archive + current snapshot | `2fec9bea...`, `41b9c7e...`, `41cf77e...`, `150ca452...`, `c80d260...` | Yes | GitHub: Yes | **COMPLETE** |
| G-S03 publication | Source + canonical + evidence + current snapshot | `da52a9e...`, `a8722b5...`, `7c780eee...`, `6ab98afa...` | Yes | GitHub: Yes | **COMPLETE** |
| Snapshot-aware viewer/archive fixes | Make viewer follow published snapshot IDs and archive selection | `4d279816...`, `70d1c1d...`, `ce321432...` | Yes | Pages run existed | **COMPLETE in repo** |
| Player/profile snapshot fixes | Avoid stale G-S01 fallback; parse selected snapshot | `e6f9042...`, `7266dda...`, `f24ffaa...`, `5321d88...` | Yes | Pages run existed | **COMPLETE in repo** |
| Continuity/handoff documentation | Durable recovery information | `39f58cf...`, `10d0199...`, `148d30e...` | Yes | GitHub: Yes | **COMPLETE** |
| Current Pages deployment before this mission | Deploy main at handoff head | Run `35596151419`, conclusion `success`, head `148d30e...` | Yes | Deployment: Yes | **VERIFIED** |

The above descriptions were reconstructed from the actual Git history, current files, manifest, and workflow records rather than accepted from the old handoff as truth.

---

# 3. Implemented but NOT merged/published

## `fix/goldencrown-persia-ui-parity`

The branch contains **17 commits after the merge base**. There is no PR.

### UI sync commits

- `e4c6bd08...` — Sync PERSIA leaderboard UI behavior: `viewer.js`
- `baee6c020...` — Sync PERSIA leaderboard UI behavior: `viewer-data.js`
- `497e36d3...` — Sync PERSIA leaderboard UI behavior: `player-profile.js`
- `f064d980...` — Sync PERSIA leaderboard UI behavior: `player-directory.js`
- `d22250d1...` — Sync PERSIA leaderboard UI behavior: `member-history.js`

**Disposition:** **REWORK**, not blind merge.

Reason: the intent is useful and matches the requested PERSIA behavioral reference, but these files were written against a compatibility data layer that introduces presentation-only `GOLDEN-UI-*` IDs and therefore cannot be accepted as Golden canonical identity/history.

### Compatibility-data commits

- `50f39879...` — `players.json`
- `1a20ea48...` — `player-observations.json`
- `75969590...` — `player-observations-history.json`
- `9c3d046e...` — `snapshots.json`
- `fd9b008b...` — `leagues.json`
- `ae6e4acc...` — `memberships.json`

Follow-up refinement commits:

- `8954ade0...` — refine `players.json`
- `68667a28...` — refine `player-observations-history.json`
- `00d90ceb...` — refine `player-observations.json`
- `f9d14a97...` — refine `snapshots.json`
- `7cbd62a0...` — refine `leagues.json`

**Disposition:** **DROP as a data/history layer.**

Reason: the branch explicitly labels its `GOLDEN-UI-*` values as presentation-only, but the same generated key is nevertheless used across S01/S02/S03 observations and membership/history data. That creates effective identity continuity from display-name-derived keys. This conflicts with the current Golden rule that permanent `player_id` is null and that rename/name/rank matching must never manufacture identity.

This is especially unsafe because Golden already contains identity-sensitive cases such as distinct `ALI` and `ali` observations in G-S01.

### Report removal

- `ad0635f2...` — Remove non-PERSIA GOLDENCROWN report page from leaderboard UI surface.

**Disposition:** **UNKNOWN / DO NOT MERGE.**

`clan-leaderboard/report.html` still exists on current `main`. Repository search found no reference to it from the current default-branch code, and PERSIA has no matching current `report.html` surface. However, that is not enough proof to delete it safely. It is therefore intentionally left untouched.

---

# 4. Started but incomplete

The previous handoff correctly identified several unfinished areas, and the current audit confirms them:

1. **Full PERSIA UI parity is not proven.**
   - Leaderboard has the core PERSIA-style structure and behavior.
   - Players and Member History remain simpler than the PERSIA registry/membership model.
   - Archive is Golden-specific and has not been proven pixel/behavior equivalent.

2. **Player History was incomplete.**
   - Before this mission, `player-profile.js` loaded all published canonical snapshots but ultimately selected one snapshot and rendered only that observation.
   - Therefore it did not satisfy the required aggregated historical-player model.

3. **Golden stable identity continuity is still unresolved.**
   - G-S01/G-S02/G-S03 canonical `player_id` values are all null.
   - No permanent identity assignment was created by this mission.

4. **Live-site verification is incomplete.**
   - GitHub Pages deployment success is observable from Actions.
   - Direct public GitHub Pages URL verification is not available through the current web retrieval path.
   - Therefore Live UI behavior is **UNKNOWN**, not PASS.

5. **`report.html` status remains unresolved.**
   - It is not removed.
   - No safe proof exists that it should be removed.

---

# 5. Player History analysis

## Previous GOLDENCROWN behavior

Before this mission, the Player Profile implementation:

- loaded the published snapshot list;
- selected one snapshot from `?snapshot=`, the snapshot encoded in `G-Sxx-Rxxx`, or manifest current snapshot;
- loaded that snapshot;
- found the matching `snapshot_member_key`;
- rendered that single observation.

That is **snapshot profile behavior**, not aggregated player-history behavior.

## PERSIA reference behavior

PERSIA's `player-profile.js` reads:

- player registry;
- current observations;
- historical observations;
- snapshot metadata;
- league metadata;
- performance calculations.

It builds a row for every available snapshot, keeps missing membership explicit, separates active/current state from historical rows, and renders snapshot-by-snapshot performance.

## Golden correction

The new Golden implementation in:

`clan-leaderboard/assets/player-profile.js`

now follows the same architectural distinction:

### If a permanent `player_id` exists

The page:

- loads all published GOLDENCROWN snapshots;
- finds observations by exact `player_id`;
- builds a complete snapshot timeline;
- explicitly renders missing membership observations;
- shows rank and metric changes from each Canonical observation;
- separates current/latest observed state from historical state;
- does not use rank or display name as an identity key.

### If the URL contains a snapshot-local key

Example:

`G-S03-R001`

the page:

- loads that selected Snapshot;
- displays that Snapshot's observation;
- explicitly identifies the key as snapshot-local;
- does **not** connect the same display name to G-S01/G-S02;
- does **not** invent a permanent `player_id`;
- explains that historical aggregation becomes available once Canonical identity continuity is established.

This is the required safety behavior for the current Golden dataset.

---

# 6. Parity branch disposition

| File | Disposition | Technical reason |
|---|---|---|
| `viewer.js` | **REWORK** | PERSIA behavior useful, but branch data adapter is unsafe; current main already has newer snapshot-aware logic |
| `viewer-data.js` | **REWORK** | Must consume Golden Canonical observations directly, not presentation IDs |
| `player-profile.js` | **REWORK** | PERSIA-style history is the correct model, but branch depends on fabricated/derived UI identity keys |
| `player-directory.js` | **REWORK** | Registry/history badges are useful only after stable identity exists |
| `member-history.js` | **REWORK** | Membership model cannot be safely copied without canonical identity |
| `players.json` | **DROP** | `GOLDEN-UI-*` registry would act as an inferred identity layer |
| `player-observations.json` | **DROP** | Observations are keyed to the unsafe presentation registry |
| `player-observations-history.json` | **DROP** | Same identity-continuity problem |
| `memberships.json` | **DROP** | Membership intervals rely on the same inferred identity |
| `snapshots.json` | **DROP** | Duplicate/parallel snapshot model is unnecessary while canonical manifest already exists |
| `leagues.json` | **DROP** | Compatibility presentation data; current Golden canonical/performance rules are the authority |
| `report.html` | **UNKNOWN** | Removal is not proven safe; left untouched on main |

---

# 7. Implementation completed in this mission

### Commit

**`ebd22d157878dae9ae52c85c9066613e6dbe9227`**

Message:

`fix(golden): make player history identity-safe across snapshots`

### File

`clan-leaderboard/assets/player-profile.js`

### Changes

- Added loading of all published GOLDENCROWN canonical snapshots.
- Added stable-`player_id` historical aggregation.
- Added explicit missing-snapshot membership rows.
- Added current-vs-latest-observed distinction.
- Added snapshot timeline.
- Preserved current snapshot-local profile behavior for `G-Sxx-Rxxx` navigation IDs.
- Explicitly blocked name/rank/case-based continuity.
- Preserved Honor Medals, Weapon Levels, Last Online, Rank, League Medals, Clan Medals and Total Kills.
- Kept all data sources inside GOLDENCROWN.

Local JavaScript syntax validation of the implementation passed with Node.js `--check` before publication.

No canonical snapshot, manifest identity field, historical record, or PERSIA repository was modified.

---

# 8. Verification

## Repository verification

Verified from GitHub:

- `main` was `148d30e...` at audit start.
- `main` now contains `ebd22d157...`.
- G-S01, G-S02 and G-S03 canonical files exist.
- Manifest declares G-S03 current.
- All three published Golden snapshots currently have null permanent `player_id` values.
- Parity branch remains separate and unmerged.
- No PR exists for the parity branch.
- `report.html` remains present.

## CI / deployment verification

Before this mission:

- Pages workflow run `35596151419`
- HEAD: `148d30e3...`
- conclusion: **success**

That proves the pre-mission main was successfully deployed.

After commit `ebd22d157...`, a new Pages run is expected from the push. It must be checked separately before claiming deployment of this exact commit.

## Live-site verification

**UNKNOWN.**

The public GitHub Pages URL was attempted, but the current web retrieval path reports that the URL is not accessible. Therefore:

- GitHub repository state: verified.
- Actions deployment: verifiable.
- Exact live HTML/JS behavior: **not independently verified**.

No Live PASS is claimed.

---

# 9. Remaining UNKNOWNs

1. Whether the latest `ebd22d157...` deployment has completed successfully.
2. Whether the public Pages site currently serves `ebd22d157...`.
3. Whether every visual/interaction detail of Golden matches PERSIA.
4. Whether Players and Member History should receive further parity work before permanent Golden identities exist.
5. Final disposition of `report.html`.
6. Permanent identity decisions for G-S01/G-S02/G-S03.

The identity questions are intentionally not resolved by inference.

---

# 10. Final technical conclusion

The previous parity branch was **not safe to merge as-is**.

Its strongest contribution is the identification of the PERSIA behavioral/data shape. Its compatibility data layer, however, crosses the boundary between presentation compatibility and effective identity continuity. That layer is therefore not accepted as Golden canonical history.

The current `main` now has an identity-safe Player Profile implementation that is structurally capable of PERSIA-style multi-snapshot history **when a permanent Canonical `player_id` exists**.

With the present Golden data, all permanent `player_id` values remain null. Consequently, the UI correctly refuses to manufacture cross-snapshot history from rank/name matching.

**This is intentional and evidence-safe.**

The remaining blocker for actual historical aggregation of current Golden players is **Canonical identity continuity**, not a missing UI renderer.

