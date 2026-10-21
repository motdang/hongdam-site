-- Words a page's owner changes on the page itself (functions/api/page/[[path]].js).
CREATE TABLE IF NOT EXISTS page_keys (
  page     TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL,          -- SHA-256 hex of the edit key
  made     TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS page_edits (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  lang TEXT NOT NULL,              -- en, th, de, or * for numbers and dates
  k    TEXT NOT NULL,              -- *reset clears the rows before it
  v    TEXT,
  at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS page_edits_page ON page_edits (page, id);
