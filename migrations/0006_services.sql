-- hongdam.net/ — orders for the services list, counted by the monthly Shoup walk (functions/_services.js).
-- In D1 hongdam-tasks (bound as TASKS).
CREATE TABLE IF NOT EXISTS svc_order (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  svc TEXT NOT NULL,              -- data/services.json item id
  month INTEGER NOT NULL,         -- Bangkok year * 12 + month (functions/_services.js monthOf)
  who TEXT NOT NULL,              -- first 16 hex of SHA-256 of the email or LINE ID; team orders: team:<note>
  src TEXT NOT NULL,              -- form · desk
  state TEXT NOT NULL DEFAULT 'asked', -- asked · void
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS svc_order_month ON svc_order (svc, month);

-- Prices the Hongdam Desk bot posts for the services it walks itself (Grab).
CREATE TABLE IF NOT EXISTS svc_price (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  svc TEXT NOT NULL,
  baht INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
