(function(){
  const root=document.querySelector('#profile'); if(!root) return;
  const qs=new URLSearchParams(location.search), id=qs.get('id');
  if(!id){root.innerHTML='<div class="shell profile-shell"><div class="panel empty">شناسه بازیکن مشخص نشده است.</div></div>';return;}
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=v=>v==null?'—':Number(v).toLocaleString('en-US');
  const signed=v=>v==null?'—':Number(v)>0?'+'+fmt(v):fmt(v);
  const idSnapshot=String(id).match(/^G-S[0-9]+/);
  fetch('../data/manifest.json').then(r=>{if(!r.ok)throw Error('manifest');return r.json();}).then(function(manifest){
    const snapshotId=qs.get('snapshot') || (idSnapshot&&idSnapshot[0]) || manifest.current_snapshot_id;
    const ids=Array.isArray(manifest.published_snapshot_ids)?manifest.published_snapshot_ids:[manifest.current_snapshot_id];
    return Promise.all(ids.map(function(s){return fetch('../data/canonical/'+encodeURIComponent(s)+'.json').then(r=>{if(!r.ok)throw Error(s);return r.json();});}).concat([])).then(function(snaps){return {manifest:manifest,snaps:snaps,snapshotId:snapshotId};});
  }).then(function(ctx){
    const snap=ctx.snaps.find(s=>s.snapshot_id===ctx.snapshotId);
    if(!snap) throw Error('snapshot');
    const p=(snap.members||[]).find(x=>x.snapshot_member_key===id);
    if(!p){root.innerHTML='<div class="shell profile-shell"><div class="panel empty">این بازیکن در Snapshot '+esc(ctx.snapshotId)+' پیدا نشد.</div></div>';return;}
    const base=snap.snapshot_id==='G-S01';
    const honors=p.honor_medals?fmt(p.honor_medals.gold)+' / '+fmt(p.honor_medals.silver)+' / '+fmt(p.honor_medals.bronze):'—';
    const weapons=p.weapons?fmt(p.weapons['25mm'])+' / '+fmt(p.weapons.hydra)+' / '+fmt(p.weapons.hellfire):'—';
    const rank=p.rank_movement&&Number(p.rank_movement)!==0?fmt(p.rank)+' ('+(Number(p.rank_movement)>0?'↑ ':'↓ ')+fmt(Math.abs(Number(p.rank_movement)))+')':fmt(p.rank);
    const clanDelta=base||p.clan_medals_delta==null?'— / baseline':signed(p.clan_medals_delta);
    const killDelta=base||p.kills_delta==null?'— / baseline':signed(p.kills_delta);
    root.innerHTML='<div class="shell profile-shell">'+
      '<section class="profile-head"><div><span class="badge">GOLDENCROWN · PLAYER</span><h1>'+esc(p.display_name)+'</h1><div class="identity">'+esc(p.snapshot_member_key)+' · '+esc(p.role||'Member')+' · '+(base?'Baseline':'Snapshot')+'</div></div>'+
      '<div class="profile-actions"><a class="btn" href="players.html">← اعضای کلن</a><a class="btn" href="index.html?snapshot='+encodeURIComponent(snap.snapshot_id)+'">لیدربورد</a><a class="btn" href="member-history.html">تاریخچه عضویت</a></div></section>'+
      '<section class="panel"><div class="profile-stats">'+
      '<div class="profile-stat"><span>رتبه فعلی</span><strong>'+rank+'</strong></div><div class="profile-stat"><span>سمت</span><strong>'+esc(p.role||'Member')+'</strong></div><div class="profile-stat"><span>استیج فعلی</span><strong>'+fmt(p.stage)+'</strong></div><div class="profile-stat"><span>مدال لیگ جاری</span><strong>'+fmt(p.league_medals)+'</strong></div>'+
      '<div class="profile-stat"><span>مدال کل کلن</span><strong>'+fmt(p.clan_medals)+'</strong></div><div class="profile-stat"><span>مجموع کیل 💀</span><strong>'+fmt(p.total_kills)+'</strong></div><div class="profile-stat"><span>مدال افتخار</span><strong>'+honors+'</strong></div><div class="profile-stat"><span>آخرین آنلاین</span><strong>'+esc(p.last_online_display||'—')+'</strong></div>'+
      '</div></section>'+
      '<section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">عملکرد</span><h2>عملکرد ثبت‌شده در '+esc(snap.snapshot_id)+'</h2><p class="muted">ساختار صفحه با Player Profile پروژهٔ PERSIA هم‌تراز شده است؛ داده‌ها مستقیماً از Canonical GOLDENCROWN خوانده می‌شوند.</p></div></div>'+
      '<div class="profile-stats"><div class="profile-stat"><span>تغییر مدال کلن</span><strong>'+clanDelta+'</strong></div><div class="profile-stat"><span>افزایش کیل</span><strong>'+killDelta+'</strong></div><div class="profile-stat"><span>لول سلاح‌ها (توپ / هیدرا / هل‌فایر)</span><strong>'+weapons+'</strong></div><div class="profile-stat"><span>Snapshot</span><strong>'+esc(snap.snapshot_id)+'</strong></div></div></section>'+
      '<section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">HISTORY</span><h2>تاریخچه عملکرد کاربر</h2><p class="muted">برای Golden، تا زمانی که player_id پایدار تخصیص نیافته، تطبیق بین Snapshotها بر اساس نام یا Rank انجام نمی‌شود.</p></div></div>'+
      '<div class="table-wrap profile-history-wrap"><table class="profile-history-table"><thead><tr><th>رتبه</th><th>نام کاربری</th><th>سمت</th><th>استیج</th><th>مدال لیگ جاری</th><th>تغییر مدال کلن</th><th>مدال کل کلن</th><th>مدال افتخار</th><th>مجموع کیل 💀</th><th>افزایش کیل 💀</th><th>لول سلاح‌ها</th><th>آخرین آنلاین</th><th>دوره</th></tr></thead><tbody>'+
      '<tr><td class="rank-cell">'+rank+'</td><td>'+esc(p.display_name)+'</td><td>'+esc(p.role||'Member')+'</td><td>'+fmt(p.stage)+'</td><td>'+fmt(p.league_medals)+'</td><td>'+clanDelta+'</td><td>'+fmt(p.clan_medals)+'</td><td>'+honors+'</td><td>'+fmt(p.total_kills)+'</td><td>'+killDelta+'</td><td>'+weapons+'</td><td>'+esc(p.last_online_display||'—')+'</td><td class="snapshot-cell"><span class="snapshot-badge">'+esc(snap.snapshot_id)+'</span><span class="snapshot-date">'+esc(snap.official_timestamp_persian)+'</span></td></tr>'+
      '</tbody></table></div></section>'+
      '<section class="panel source-note"><strong>منبع داده:</strong> Canonical Snapshot '+esc(snap.snapshot_id)+'. Identity continuity بین دوره‌ها هنوز تعیین نشده و هیچ تطبیق خودکاری انجام نمی‌شود.</section>'+
      '</div>';
  }).catch(function(e){console.error(e);root.innerHTML='<div class="shell profile-shell"><div class="panel empty">داده پروفایل قابل بارگذاری نیست.</div></div>';});
})();