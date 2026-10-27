{"title": "Lovable's agent tools have no rate limit: a Postgres cap that also stops double writes", "title_th": "เครื่องมือเอเจนต์ของ Lovable ไม่มีการจำกัดจำนวนครั้ง: ตัวจำกัดใน Postgres ที่กันการเขียนซ้ำได้ด้วย", "date": "2026-10-27", "beat": "last-mile",
 "dek": "Lovable's docs say its agent tools have no rate limit or call quota and no call log. A Postgres function caps calls per user, records each call, and turns a retried write into a no-op. Tested 27 October 2026.",
 "dek_th": "เอกสารของ Lovable ระบุว่าเครื่องมือสำหรับเอเจนต์ AI ไม่มีการจำกัดจำนวนครั้งที่เรียก ไม่มีโควตา และไม่มีบันทึกการเรียก ฟังก์ชัน Postgres ตัวเดียวช่วยจำกัดจำนวนครั้งต่อผู้ใช้ เก็บบันทึกทุกการเรียก และไม่ทำงานซ้ำเมื่อเอเจนต์ส่งคำขอเดิมมาอีกรอบ ทดสอบเมื่อ 27 ตุลาคม 2569",
 "cards": ["vibe", "ai-assistant"],
 "card": {"big": "Your app's AI tools have no limit", "sub": "A per-user cap in Postgres, tested"},
 "sources": [
  {"t": "Agent integrations - Lovable Documentation", "u": "https://docs.lovable.dev/features/agent-integrations"},
  {"t": "Changelog - Lovable Documentation", "u": "https://docs.lovable.dev/changelog"},
  {"t": "Database Functions | Supabase Docs", "u": "https://supabase.com/docs/guides/database/functions"},
  {"t": "Row Level Security | Supabase Docs", "u": "https://supabase.com/docs/guides/database/postgres/row-level-security"},
  {"t": "PGlite - Postgres in WASM", "u": "https://pglite.dev/"}
 ]}
---
Lovable can turn a published app into an MCP server: MCP (Model Context Protocol) is the standard that lets an AI assistant such as ChatGPT or Claude call an app's actions, which MCP calls tools [1]. On 13 October 2026 Lovable added browser tools too, so an AI agent built into a browser can use the page a person has open, with that person's session [2]. Lovable's own documentation, read today, answers three questions a founder should ask before switching this on [1]:

| Question | Lovable's answer [1] |
|---|---|
| Is there a rate limit or a call quota? | "Not today." Sign-in ties calls to a user but does not limit how often they call. |
| Can I see tool calls? | No. Tool errors appear in the app's logs; successful calls do not. |
| Does a tool call cost anything? | No separate charge. It runs in your backend, and AI or backend usage counts against your app's balance. |

The same page warns that an assistant may retry a call after a timeout, so a tool that creates something can create it twice, and it suggests a request identifier [1]. Three gaps, one cause: the app has no memory of who called what, when.

## What the gap costs: a signed-in user's assistant can loop on your credits

Sign-in is the default for agent integrations, and a public, no-login integration needs an explicit choice [1]. Sign-in does not help with volume. An assistant that misreads a task can call `summarize_document` again and again in one session, and every call that uses an AI model spends your app's balance. A retry after a timeout can place the same order twice. Neither shows up anywhere unless the tool fails.

The fix is one table and one function in the app's Postgres database, called at the top of each tool that costs money or writes data.

## The fix: one table, one function, one call per tool

This is for apps whose backend is a Supabase project, where `auth.uid()` returns the ID of the signed-in caller [4]. Paste it into the Supabase SQL Editor:

```sql
create table public.tool_calls (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  tool text not null,
  request_id text,
  called_at timestamptz not null default now(),
  unique (user_id, tool, request_id)
);
create index tool_calls_recent on public.tool_calls (user_id, tool, called_at desc);
alter table public.tool_calls enable row level security;

create or replace function public.take_tool_call(
  p_tool text, p_request_id text, p_limit int default 20, p_window interval default '1 hour')
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  n int;
begin
  if uid is null then return 'no-user'; end if;
  perform pg_advisory_xact_lock(hashtext(uid::text || p_tool));
  if p_request_id is not null and exists (
    select 1 from public.tool_calls
    where user_id = uid and tool = p_tool and request_id = p_request_id) then
    return 'repeat';
  end if;
  select count(*) into n from public.tool_calls
  where user_id = uid and tool = p_tool and called_at > now() - p_window;
  if n >= p_limit then return 'limited'; end if;
  insert into public.tool_calls (user_id, tool, request_id) values (uid, p_tool, p_request_id);
  return 'ok';
end $$;

revoke execute on function public.take_tool_call from public, anon;
grant execute on function public.take_tool_call to authenticated;
```

Line by line, for the parts that matter:

- **Row-level security on, no policies.** Row-level security (RLS) is the Postgres rule set that decides which rows each caller may read or write. With it on and no policy, the public and signed-in keys read nothing from `tool_calls`; only the function writes there.
- **`security definer` with an empty `search_path`.** The function runs with its owner's rights, so it can write the table the caller cannot. Supabase's docs require a pinned `search_path` for such functions and recommend the empty one, with every table named by schema [3].
- **The two last lines.** Supabase lets any role call a new function by default, including `anon`, the role for requests with no user session [3]. The revoke and grant leave it to signed-in users only.
- **The advisory lock.** Two calls from the same user to the same tool wait for each other, so two parallel calls cannot both read "19" and both pass.
- **The request ID.** A second call with the same ID returns `repeat` and writes nothing.

In the tool's code, before the work:

```ts
const { data: verdict, error } = await supabase.rpc('take_tool_call', {
  p_tool: 'summarize_document',
  p_request_id: input.request_id ?? null,
});
if (error || verdict === 'no-user') return { error: 'Sign in first.' };
if (verdict === 'limited') return { error: 'Limit: 20 an hour. Try again later.' };
if (verdict === 'repeat') return { result: 'Already done for this request.' };
```

The Supabase client here has to carry the user's session, or `auth.uid()` is empty and every call comes back `no-user`. The request ID comes from the tool's own input, described to the assistant as "a unique ID for this request, the same on retries"; for a tool where the same inputs mean the same job, a hash of the inputs works.

The `tool_calls` table is the missing call log: one row per allowed call, with user, tool and time. A query in the SQL Editor shows who calls what:

```sql
select tool, user_id, count(*) as calls, max(called_at) as last
from public.tool_calls
where called_at > now() - interval '1 day'
group by tool, user_id order by calls desc limit 20;
```

## Tested in Postgres 17.5: 20 of 25 calls through, retries and anonymous calls stopped

We ran the SQL above, unchanged, in PGlite, a build of Postgres that runs inside Node.js [5], on 27 October 2026. Two stand-ins replaced what Supabase provides: the `anon` and `authenticated` roles, and an `auth.uid()` that returns a test user ID.

| Test | Result |
|---|---|
| User A, 25 calls with new request IDs | 20 `ok`, 5 `limited` |
| User A, request 3 sent again | `repeat` |
| User B, first call | `ok` |
| No signed-in user | `no-user` |
| User A, calls aged 61 minutes, new call | `ok` |
| Can `anon` execute the function? | no |
| Can `authenticated` execute it? | yes |

```chart
{"title": "Milliseconds per check, median of 25 calls", "unit": " ms", "lower_is_better": true,
 "rows": [["Run 1", 0.25], ["Run 2", 0.33], ["Run 3", 0.33], ["Run 4", 0.36], ["Run 5", 0.28]],
 "note": "Five runs of 25 calls, in-process Postgres on a laptop, 27 October 2026. A hosted database adds the network round trip on top."}
```

The check itself is cheap. On a hosted database the cost is one round trip from the tool to Postgres, which the tool makes anyway to do its work.

## Three things to set per tool

- **The limit and window.** 20 an hour suits an AI summary; a read-only lookup may need none. `p_limit` and `p_window` are arguments, so each tool sets its own.
- **Which tools get the check.** Lovable starts browser tools with ones that read or are easy to undo, and adds tools that delete, pay, send, publish or share only on request [1]. Those requested tools, and any tool that calls an AI model, are the ones to wrap first.
- **Apps on Lovable's built-in backend.** The SQL is for Supabase projects. For the built-in backend, the same three parts (a per-user count in a time window, a request ID, a row per call) can be asked of Lovable in the project chat, then checked against the table above.
