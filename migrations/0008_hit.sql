-- hongdam.net page events, sent by /assets/hd.js to POST /api/hit and read on /stats/ (GET /api/hit/stats).
-- In D1 hongdam-tasks (bound as TASKS). Robots are dropped before a row is written (functions/_classify.js).
CREATE TABLE IF NOT EXISTS hit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,      -- when, UTC ISO
  day TEXT NOT NULL,     -- the Bangkok date
  s TEXT NOT NULL,       -- one browser tab's visit: a random id kept in sessionStorage
  k TEXT NOT NULL,       -- view · search · tap · line · lang · mail · out · order · pay · claim · slip · ask · egg
  p TEXT NOT NULL,       -- the page's path
  l TEXT,                -- the page's language
  d TEXT,                -- what: the search words, the card and button, the link's host, the egg
  n INTEGER,             -- search: cards found
  r TEXT,                -- view: the host the visitor came from
  c TEXT,                -- country, from Cloudflare
  w INTEGER              -- view: screen width in CSS pixels
);
CREATE INDEX IF NOT EXISTS hit_day ON hit (day, k);
