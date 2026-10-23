-- hongdam.net — "How is this translation?" on the Burmese and Chinese pages (her word 2026-10-24), in D1 hongdam-tasks (bound as TASKS).
CREATE TABLE IF NOT EXISTS svc_rate (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,      -- path and query of the page rated, e.g. /my/care/ or /zh/buy/?c=translate
  lang TEXT NOT NULL,      -- my · zh
  score TEXT NOT NULL,     -- good · better
  text TEXT,               -- the reader's correction, as typed
  who TEXT,                -- hash of the address it came from, to count repeat answers; not the address
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS svc_rate_page ON svc_rate (lang, page, created_at);
