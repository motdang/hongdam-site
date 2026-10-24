-- The ฿ / $ / € switch (her ask 2026-10-24): the amount an order is paid in, when it is not the price's own
-- currency, and the baht for PromptPay when the price is in US$. JSON {cur, total, due, thb, rate, at}.
ALTER TABLE svc_buy ADD COLUMN pay TEXT;
