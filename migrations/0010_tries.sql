-- Daily try counters for routes that call paid services (functions/_tries.js), in D1 hongdam-tasks (bound as TASKS).
CREATE TABLE IF NOT EXISTS tries (
  k TEXT NOT NULL,        -- e.g. slip:ip:<address> · slip:ref:HD-xxxxxx
  day TEXT NOT NULL,      -- the Bangkok date
  n INTEGER NOT NULL,
  PRIMARY KEY (k, day)
);
