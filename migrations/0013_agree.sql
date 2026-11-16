-- Agreements signed on hongdam.net/agreement/<slug>/ (her ask 2026-11-16, FERC's Myriad exit).
-- One signature per agreement page. sha: SHA-256 of the plain text signed (functions/_agreements_data.js).
CREATE TABLE IF NOT EXISTS agree_sign (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  at TEXT NOT NULL,
  sha TEXT NOT NULL,
  ip TEXT,
  country TEXT,
  ua TEXT
);
