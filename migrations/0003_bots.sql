-- hongdam.net/bots — purchases, in D1 hongdam-tasks (bound as TASKS).
CREATE TABLE IF NOT EXISTS bot_order (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT UNIQUE NOT NULL,        -- NB-xxxxxx, given to the buyer
  kind TEXT NOT NULL,              -- scout · desk · earner · run · share · crew
  site TEXT NOT NULL,              -- the buyer's site, repo or account the bot works on
  contact TEXT NOT NULL,           -- private
  note TEXT,
  baht INTEGER NOT NULL,           -- 0 for share
  usd INTEGER NOT NULL,
  pct INTEGER,                     -- share only: the percentage agreed
  week INTEGER NOT NULL,           -- the Shoup week the slot sits in (functions/_bots.js weekOf)
  state TEXT NOT NULL DEFAULT 'bought', -- bought · paid · done · void
  paid_ref TEXT,
  created_at TEXT NOT NULL,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS bot_order_week ON bot_order (kind, week);
