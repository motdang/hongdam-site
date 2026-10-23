-- hongdam.net/buy — orders from the Buy button on every service card, in D1 hongdam-tasks (bound as TASKS).
CREATE TABLE IF NOT EXISTS svc_buy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT UNIQUE NOT NULL,        -- HD-xxxxxx, given to the buyer
  card TEXT NOT NULL,              -- data/shop.json card id
  opt TEXT NOT NULL,               -- data/services.json item id (the option bought)
  qty INTEGER NOT NULL DEFAULT 1,
  addon INTEGER NOT NULL DEFAULT 0, -- 1 when the card's add-on is ticked (the translator's stamp)
  total INTEGER NOT NULL,          -- whole job, in cur
  due INTEGER NOT NULL,            -- to pay now: the total, or half of it from ฿10,000 / US$300
  cur TEXT NOT NULL,               -- THB · USD
  contact TEXT NOT NULL,           -- LINE ID, phone or email, as typed; private
  note TEXT,
  lang TEXT,                       -- en · th · my · zh
  state TEXT NOT NULL DEFAULT 'booked', -- booked · claimed (said paid by PayPal or Wise) · paid · started · done · void
  paid_ref TEXT,                   -- bank reference from SlipOK, or paypal / wise
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS svc_buy_state ON svc_buy (state, created_at);
