-- hongdam.net/studio/black-swan/ — predictions people save and share, their votes, and the votes on past events
-- (her ask 2026-10-24: "Give it toys and prediction storage"), in D1 hongdam-tasks (bound as TASKS).
CREATE TABLE IF NOT EXISTS swan (
  id TEXT PRIMARY KEY,              -- six letters; the prediction's page is hongdam.net/swan/<id>
  text TEXT NOT NULL,               -- the prediction, as typed (8–200 characters)
  lang TEXT NOT NULL,               -- the page it was written on: en · th · my · zh · de
  due TEXT NOT NULL,                -- YYYY-MM, the check date: after it the vote is "did it happen?"
  odds INTEGER NOT NULL,            -- 0–4: 1 in 2, 10, 100, 1,000, 10,000
  size INTEGER NOT NULL,            -- 0–3: my life, my town, my country, the world
  name TEXT,                        -- the name the maker gave, if any
  state TEXT NOT NULL DEFAULT 'ok', -- ok (listed) · wait (held for a person to look at) · hidden · gone (deleted by its maker)
  why TEXT,                         -- why it waits: words · model · reports
  key TEXT NOT NULL,                -- SHA-256 of the maker's key, which their browser keeps, to delete it
  who TEXT,                         -- hash of the address it came from; not the address
  yes INTEGER NOT NULL DEFAULT 0,   -- "will it happen?" yes / no, before the check date
  no INTEGER NOT NULL DEFAULT 0,
  came INTEGER NOT NULL DEFAULT 0,  -- "did it happen?" yes / no, after it
  nope INTEGER NOT NULL DEFAULT 0,
  reports INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS swan_new ON swan (state, created_at);
CREATE INDEX IF NOT EXISTS swan_due ON swan (state, due);

-- one vote per address per prediction and phase (p: will it happen · r: did it happen); a new vote replaces the old
CREATE TABLE IF NOT EXISTS swan_vote (
  id TEXT NOT NULL,
  who TEXT NOT NULL,
  ph TEXT NOT NULL,
  v TEXT NOT NULL,                  -- y · n
  at TEXT NOT NULL,
  PRIMARY KEY (id, who, ph)
);

-- "Black swan or not?": one vote per address per past event
CREATE TABLE IF NOT EXISTS swan_poll (
  q TEXT NOT NULL,
  who TEXT NOT NULL,
  v TEXT NOT NULL,                  -- y · n
  at TEXT NOT NULL,
  PRIMARY KEY (q, who)
);

-- one report per address per prediction
CREATE TABLE IF NOT EXISTS swan_report (
  id TEXT NOT NULL,
  who TEXT NOT NULL,
  at TEXT NOT NULL,
  PRIMARY KEY (id, who)
);
