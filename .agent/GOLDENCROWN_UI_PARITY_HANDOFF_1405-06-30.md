# GOLDENCROWN UI Parity / Continuity Handoff
## تاریخ تهیه: 1405-06-30 / 2026-09-21
## وضعیت: HANDOFF FOR NEXT AGENT — READ BEFORE FURTHER UI WORK

### 1. مأموریت این گزارش

این فایل برای انتقال دقیق وضعیت پروژه GOLDENCROWN به Conversation/Agent بعدی تهیه شده است.

Project Authority درخواست کرده است که رابط کاربری و رفتار صفحات پروژه Golden، تا جای ممکن **Clone مستقیم پروژه مرجع PERSIA** باشد؛ نه یک طراحی مجدد مستقل.

مرجع UI/Behavior:
- Repository: `neoshisystem/war-drone-wiki`
- Leaderboard area: `clan-leaderboard/`

Repository هدف:
- `neoshisystem/WD-C-Golden`

قاعده مهم:
**Data / identity / history Golden مستقل است؛ فقط UI، ساختار صفحه، رفتار تعاملی و الگوهای ارائه باید از PERSIA Clone شوند.**
PERSIA history نباید به عنوان history رسمی Golden وارد شود.

---

### 2. مشکل مشاهده‌شده توسط Project Authority

در تست Reality روی Leaderboard Golden، با کلیک روی نام بازیکن، صفحه `player.html` از نظر UI و behavior با Player Profile پروژه PERSIA هم‌سطح نبود.

همچنین گزارش شد که در یک مسیر/استقرار، Player Profile به جای Snapshot جاری، داده/نمایش مربوط به **G-S01** را نشان می‌داد؛ در حالی که G-S03 در Repository منتشر شده بود.

Project Authority همچنین تأکید کرد که:
- تمام صفحات داخلی Leaderboard باید از نظر UI/Behavior با PERSIA هم‌ساختار باشند.
- `player.html`
- `players.html`
- `member-history.html`
- `archive.html`
- Leaderboard اصلی
- و هر صفحه/asset مربوط به Leaderboard
باید بر پایه همان implementation مرجع PERSIA بررسی شوند.
- تفاوت مجاز فقط در Branding و Data Adapterهای Golden است؛ نه بازطراحی UI.

---

### 3. وضعیت داده Golden هنگام این گزارش

`data/manifest.json` در Main فعلی:

- `current_snapshot_id = G-S03`
- `published_snapshot_ids = [G-S01, G-S02, G-S03]`
- `g_s01_permanent_player_ids_assigned = false`
- `g_s02_permanent_player_ids_assigned = false`
- `g_s03_permanent_player_ids_assigned = false`

G-S03 Canonical موجود است:
- `data/canonical/G-S03.json`
- SHA: `820dbe5670453eaa03ff2717ba745f682b67314a`
- Official timestamp: `1405-06-29 24:00`
- Member count: 49

G-S02 Canonical موجود است:
- SHA: `c06887c502a6adf168854e4d79b62d465b295694`
- Official timestamp: `1405-06-28 24:00`

G-S01 Canonical:
- SHA: `fad408ca369b931cf91814c7ac809b5d8870ab51`
- Official timestamp: `1405-06-27 24:00`

**نکته:** وجود فایل‌ها و Manifest در GitHub به معنی تأیید نهایی Live GitHub Pages نیست. Live Pages باید در تست بعدی به‌صورت مستقل بررسی شود.

---

### 4. علت فنی مشکل Player Link که در این جلسه پیدا و اصلاح شد

در Golden، Leaderboard نام کاربر را به `player.html?id=...` لینک می‌کرد.

اکنون لینک اصلاح شده و Snapshot انتخاب‌شده را نیز صریحاً ارسال می‌کند:

`player.html?id=<snapshot_member_key>&snapshot=<snapshot_id>`

این کار باعث می‌شود کلیک روی بازیکن از G-S03، صراحتاً G-S03 را به Player Profile منتقل کند و Profile به Snapshot اشتباه fallback نکند.

Commit:
- `f24ffaa0c09d1ae20947dadf0439cf29b97b494f`
- File: `clan-leaderboard/assets/viewer.js`

---

### 5. اصلاح Player Profile در همین Session

`clan-leaderboard/assets/player-profile.js` قبلاً یک نسخه ساده‌تر از Player Profile PERSIA بود.

در همین Session:
- منطق انتخاب Snapshot اصلاح شد.
- `snapshot` query parameter اولویت دارد.
- اگر query موجود نباشد، Snapshot از `G-Sxx-Rxxx` استخراج می‌شود.
- در غیر این صورت `manifest.current_snapshot_id` استفاده می‌شود.
- داده مستقیماً از `data/canonical/<snapshot>.json` خوانده می‌شود.
- ساختار Profile به ساختار بصری Player Profile PERSIA نزدیک‌تر شد:
  - Profile Header
  - Profile Stats
  - Performance section
  - History section
  - Source note
  - Snapshot badge
  - همان کلاس‌های موجود در `players.css`
- Rank movement، Honor Medals، Weapon Levels، Last Online و Deltaها نمایش داده می‌شوند.
- هیچ Identity بین Snapshotها بر اساس نام یا Rank حدس زده نمی‌شود.

Commit:
- `5321d88c925e4658882d24696ec62f081ff2e7f9`
- File: `clan-leaderboard/assets/player-profile.js`

JavaScript syntax این دو فایل پس از تغییر با parser داخلی بررسی شد:
- `viewer.js`: syntax OK
- `player-profile.js`: syntax OK

آخرین Main head در پایان این اصلاحات:
- `5321d88c925e4658882d24696ec62f081ff2e7f9`

---

### 6. آنچه هنوز Clone کامل PERSIA نشده است

این بخش مهم‌ترین بخش برای Agent بعدی است.

#### A) player.html
بهبود داده شد، اما هنوز باید با Player Profile PERSIA **side-by-side** مقایسه شود و parity کامل behavior تأیید شود.

PERSIA دارای:
- current profile
- weekly performance
- cumulative performance
- multi-snapshot history
- membership/history navigation
- detailed historical rows
- status/identity presentation

Golden فعلی به دلیل اینکه `player_id` پایدار هنوز برای G-S01/G-S02/G-S03 تخصیص نیافته، نمی‌تواند history بین Snapshotها را بدون ریسک identity guessing بازسازی کند.

بنابراین Agent بعدی باید:
1. UI را عین PERSIA نگه دارد.
2. Data Adapter را Golden کند.
3. History را فقط بر اساس Identity تأییدشده نمایش دهد.
4. Rank/Name matching خودکار را وارد Canonical Identity نکند.

#### B) players.html / player-directory.js
PERSIA implementation فعلی richer است و شامل:
- registry-based player view
- current status
- current rank
- history coverage badge
- former/active state
- Snapshot history indicator

Golden نسخه فعلی ساده‌تر است و فقط Current Snapshot را نمایش می‌دهد.

**این باید Clone شود، نه دوباره طراحی.**

#### C) member-history.html / member-history.js
PERSIA:
- membership intervals
- start/through Snapshot
- ended/active status
- event description
- precision information

Golden فعلی membership history را به شکل ساده Current Snapshot نمایش می‌دهد.

این یکی از اختلاف‌های اصلی parity است.

#### D) archive.html
Golden archive از نظر visual grammar تا حدی از PERSIA گرفته شده، اما implementation فعلی مستقل و کوتاه‌تر است.

باید:
- همان markup/interaction pattern PERSIA حفظ شود.
- فقط dataset Golden نمایش داده شود.
- هیچ historical period از PERSIA وارد Golden نشود.

#### E) report.html
Golden یک `clan-leaderboard/report.html` دارد که implementation متفاوت/legacy دارد و در nav اصلی PERSIA معادل مستقیمی برای آن در مسیر فعلی پیدا نشد.

Agent بعدی باید تصمیم فنی را بر اساس ساختار مرجع مشخص کند:
- یا دقیقاً آن را به صفحه/behavior معادل PERSIA تبدیل کند،
- یا اگر page orphan/legacy است، با evidence از مسیر UI مشخص کند که نباید در محصول نهایی باقی بماند.

**بدون حذف مستقیم؛ ابتدا تحلیل و سپس تصمیم Project Authority.**

#### F) Leaderboard index/viewer
ساختار کلی آن از PERSIA آمده و:
- Simple view
- Graphic view
- Search
- Sort headers
- Player hyperlinks
- Archive navigation
را دارد.

اما باید یک side-by-side behavior audit کامل با نسخه PERSIA انجام شود و هر تفاوتی که صرفاً به خاطر Adapter Golden نیست، حذف شود.

---

### 7. مهم‌ترین قاعده Identity

فعلاً:

- G-S01: player_id همه null
- G-S02: player_id همه null
- G-S03: player_id همه null

بنابراین Agent بعدی **نباید** برای ساخت profile history از این روش‌ها استفاده کند:
- Rank matching
- exact name matching به‌عنوان identity
- lowercase/uppercase matching به‌عنوان identity

موارد خاصی مثل:
- G-S01 rank 17 = ALI
- G-S01 rank 43 = ali

نباید با هم ادغام شوند.

برای Golden باید همان workflow حفظ شود:

Evidence → Technical Review → Fingerprint Comparison → Identity Decision → player_id → Canonical Observation

Ambiguous = UNKNOWN، نه حدس.

---

### 8. نکته G-S03 و انتشار

Current GitHub Main نشان می‌دهد G-S03 در data layer حاضر است و Manifest آن را Current/Published معرفی می‌کند.

اما Project Authority گزارش کرده که در GitHub Pages، انتشار ظاهراً کامل نبوده و Player Profile در یک مسیر G-S01 را نشان داده است.

بنابراین Agent بعدی باید **حتماً Live Pages را verify کند**:
1. Leaderboard current page
2. G-S03 current data
3. click روی چند player
4. URL و query parameter
5. Player Profile همان Snapshot را نشان دهد
6. Back-to-leaderboard به همان Snapshot برگردد
7. Archive
8. Players
9. Member History
10. page deployment / cache state

تا این verification انجام نشده است، وضعیت Live UI را PASS اعلام نکنید.

---

### 9. کارهای انجام‌شده در این Session

1. Repository Golden بررسی شد.
2. PERSIA reference implementation برای صفحات اصلی بررسی شد.
3. اختلاف Player Profile شناسایی شد.
4. علت Snapshot-link ambiguity پیدا شد.
5. Leaderboard player link به Snapshot انتخاب‌شده bind شد.
6. Player Profile loader برای snapshot-specific loading اصلاح شد.
7. ساختار Player Profile به الگوی PERSIA نزدیک شد.
8. JS syntax validation انجام شد.
9. هیچ فایل داده‌ای از G-S01/G-S02/G-S03 تغییر داده نشد.
10. هیچ Identity جدیدی ساخته یا حدس زده نشد.

---

### 10. کارهایی که Agent بعدی باید انجام دهد

**Phase 1 — Verify current live state**
- Live Pages را بررسی کند.
- G-S03 را باز کند.
- حداقل چند Player را از Leaderboard باز کند.
- بررسی کند URL شامل Snapshot درست است.
- بررسی کند Profile همان Snapshot را نشان می‌دهد.

**Phase 2 — Full PERSIA parity audit**
Side-by-side:
- `index.html`
- `viewer.js`
- `viewer-data.js`
- `player.html`
- `player-profile.js`
- `players.html`
- `player-directory.js`
- `member-history.html`
- `member-history.js`
- `archive.html`
- CSSهای مربوطه
- navigation
- theme behavior
- sort/search/two-view behavior
- player hyperlinks

**Phase 3 — Clone, don't redesign**
هر اختلافی که مربوط به Golden Data Adapter نیست، از implementation PERSIA به Golden منتقل شود.

**Phase 4 — Identity-safe adaptation**
هر جایی که PERSIA به stable player_id/history registry متکی است:
- Golden adapter باید همان UI را نگه دارد،
- ولی داده را فقط در صورت وجود Identity evidence معتبر نمایش دهد،
- نه اینکه برای پر کردن UI identity را حدس بزند.

**Phase 5 — Deployment verification**
پس از Sync:
- GitHub Actions Pages
- deployed commit
- live leaderboard
- live player page
- archive
را verify کند.

---

### 11. معیار پایان کار

این مأموریت زمانی واقعاً بسته می‌شود که:

- Golden UI از نظر ظاهر و behavior با PERSIA هم‌ساختار باشد.
- Branding PERSIA → GOLDENCROWN شده باشد.
- هیچ PERSIA historical data وارد Golden نشده باشد.
- Current Snapshot از Manifest/Canonical درست خوانده شود.
- Player link همیشه Snapshot صحیح را منتقل کند.
- Player Profile Snapshot اشتباه نشان ندهد.
- Search/Sort/Simple/Graphic behavior parity تأیید شود.
- Players و Member History رفتار معادل PERSIA داشته باشند.
- Archive Golden فقط Golden data داشته باشد.
- Live Pages با GitHub Main هماهنگ باشند.
- هیچ Identity مبهمی حدس زده نشده باشد.

---

### 12. اصل اجرایی برای Conversation بعدی

**Conversation بعدی ابتدا همین فایل را بخواند، سپس وضعیت واقعی Main را دوباره Fetch کند.**

از SHAهای این گزارش به عنوان evidence استفاده کنید، نه به عنوان live truth.

Live truth = GitHub Main در همان لحظه.

قبل از هر تغییر داده‌ای:
- Manifest
- Canonical snapshots
- current head
- UI files
را دوباره بررسی کنید.

قبل از هر تغییر معماری Identity، Project Authority approval لازم است.

---

## وضعیت نهایی در زمان تهیه گزارش

- Data integrity: برقرار در لایه GitHub فعلی
- G-S03 present in Main: بله
- Current manifest snapshot: G-S03
- Player-link snapshot binding: اصلاح شد
- Player Profile snapshot loader: اصلاح شد
- Player Profile UI parity: **بهبود یافته، اما هنوز Full Parity تأیید نشده**
- Players page parity: **باز است**
- Member History parity: **باز است**
- Archive parity: **باز است**
- Report page parity/status: **باز است**
- Live Pages verification: **هنوز انجام نشده**
- Identity continuity: **تأیید نشده / player_idها null**

**نتیجه عملی:** کار این Session یک hot-fix و partial parity repair بود، نه اعلام پایان کامل Clone.

این فایل مرجع ادامه کار Conversation بعدی است.
