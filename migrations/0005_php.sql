-- hongdam.net/php — PHP patch bookings, in D1 hongdam-tasks (bound as TASKS).
CREATE TABLE IF NOT EXISTS php_order (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT UNIQUE NOT NULL,        -- PHP-xxxxxx, given to the buyer
  kind TEXT NOT NULL,              -- functions/_php.js KINDS
  site TEXT NOT NULL,              -- the website or server name, as the buyer gave it
  php TEXT,                        -- the PHP version the buyer reported, if any
  contact TEXT NOT NULL,           -- private
  note TEXT,
  baht INTEGER NOT NULL,
  usd INTEGER NOT NULL,
  week INTEGER NOT NULL,           -- the Shoup week the slot sits in (functions/_github.js weekOf)
  state TEXT NOT NULL DEFAULT 'booked', -- booked · paid · done · void
  paid_ref TEXT,                   -- bank reference from SlipOK
  created_at TEXT NOT NULL,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS php_order_week ON php_order (kind, week);
