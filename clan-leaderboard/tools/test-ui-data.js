const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));

const manifest = readJson('data/manifest.json');
const index = readJson('data/derived/player-history-index.json');

if (!Array.isArray(manifest.published_snapshot_ids) || !manifest.published_snapshot_ids.length) {
  throw new Error('manifest.published_snapshot_ids is empty');
}
if (!manifest.published_snapshot_ids.includes(manifest.current_snapshot_id)) {
  throw new Error('current_snapshot_id is not published');
}

const snapshots = manifest.published_snapshot_ids.map(id => {
  const snapshot = readJson(`data/canonical/${id}.json`);
  if (snapshot.snapshot_id !== id) throw new Error(`canonical id mismatch: ${id}`);
  if (!Array.isArray(snapshot.members)) throw new Error(`members missing: ${id}`);
  if (snapshot.members.length !== Number(snapshot.member_count)) {
    throw new Error(`member count mismatch: ${id}`);
  }
  const keys = snapshot.members.map(member => member.snapshot_member_key);
  if (new Set(keys).size !== keys.length) throw new Error(`duplicate snapshot_member_key: ${id}`);
  return snapshot;
});

const bySnapshot = new Map(snapshots.map(snapshot => [snapshot.snapshot_id, snapshot]));
const groups = Array.isArray(index.groups) ? index.groups : [];
const keyMap = index.key_map || {};
const current = bySnapshot.get(manifest.current_snapshot_id);

if (!current) throw new Error('current canonical snapshot missing');

const mappedCurrentKeys = new Set(
  groups.flatMap(group => group.observations || [])
    .filter(observation => observation.snapshot_id === current.snapshot_id)
    .map(observation => observation.snapshot_member_key)
);

for (const member of current.members) {
  if (!mappedCurrentKeys.has(member.snapshot_member_key)) {
    throw new Error(`current member not mapped by history index: ${member.snapshot_member_key}`);
  }
}

for (const [snapshotId, snapshot] of bySnapshot) {
  const validKeys = new Set(snapshot.members.map(member => member.snapshot_member_key));
  for (const group of groups) {
    for (const observation of group.observations || []) {
      if (observation.snapshot_id !== snapshotId) continue;
      if (!validKeys.has(observation.snapshot_member_key)) {
        throw new Error(`history observation points to missing member: ${observation.snapshot_member_key}`);
      }
      if (keyMap[observation.snapshot_member_key] !== group.history_group_id) {
        throw new Error(`key_map mismatch: ${observation.snapshot_member_key}`);
      }
    }
  }
}

console.log(JSON.stringify({
  ok: true,
  current_snapshot_id: manifest.current_snapshot_id,
  published_snapshots: manifest.published_snapshot_ids,
  current_members: current.members.length,
  history_groups: groups.length,
  current_members_mapped: mappedCurrentKeys.size
}, null, 2));
