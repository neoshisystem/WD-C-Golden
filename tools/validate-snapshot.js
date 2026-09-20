#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const file=process.argv[2]||'data/canonical/G-S01.json';
const d=JSON.parse(fs.readFileSync(file,'utf8'));
const e=[],m=Array.isArray(d.members)?d.members:[];
if(!/^G-S\\d+$/.test(d.snapshot_id||''))e.push('snapshot_id');
if(d.clan!=='GOLDENCROWN')e.push('clan');
if(d.baseline_rule?.total_kills!=='baseline')e.push('total_kills baseline');
if(d.baseline_rule?.clan_medals!=='baseline')e.push('clan_medals baseline');
if(d.baseline_rule?.kills_delta!==null)e.push('kills_delta');
if(d.baseline_rule?.clan_medals_delta!==null)e.push('clan_medals_delta');
if(m.length!==d.member_count)e.push('member_count');
const ranks=new Set(m.map(x=>x.rank));
for(let i=1;i<=m.length;i++)if(!ranks.has(i))e.push('missing rank '+i);
if(ranks.size!==m.length)e.push('duplicate rank');
const keys=new Set();
for(const x of m){
  if(!x.snapshot_member_key||keys.has(x.snapshot_member_key))e.push('snapshot_member_key duplicate/missing');
  keys.add(x.snapshot_member_key);
  for(const k of ['rank','stage','league_medals','total_kills','clan_medals'])if(!Number.isInteger(x[k])||x[k]<0)e.push(x.snapshot_member_key+': '+k);
  if(!x.display_name?.trim())e.push(x.snapshot_member_key+': display_name');
  if(!x.role?.trim())e.push(x.snapshot_member_key+': role');
}
const norm=new Map();
for(const x of m){const n=x.display_name.trim().toLocaleLowerCase();norm.set(n,[...(norm.get(n)||[]),x.rank]);}
const collisions=[...norm.entries()].filter(([,r])=>r.length>1);
if(collisions.length)console.log('WARN: case-insensitive display-name collisions:',JSON.stringify(collisions));
if(e.length){console.error('VALIDATION FAIL');for(const x of e)console.error(' - '+x);process.exit(1);}
console.log('VALIDATION PASS');
console.log(`Snapshot: ${d.snapshot_id}`);
console.log(`Members: ${m.length}`);
console.log(`Ranks: 1..${m.length} contiguous and unique`);
console.log('Baseline: Total Kills + Clan Medals');
console.log(`Permanent player_id assigned: ${m.filter(x=>x.player_id).length}/${m.length}`);
