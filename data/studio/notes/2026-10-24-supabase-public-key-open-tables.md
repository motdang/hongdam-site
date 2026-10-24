{
 "title": "16,326 Supabase databases let anyone read their tables: check yours in two minutes",
 "title_th": "ฐานข้อมูล Supabase 16,326 แห่งเปิดให้ใครก็อ่านตารางได้ ตรวจแอปของคุณเองใน 2 นาที",
 "date": "2026-10-24",
 "beat": "last-mile",
 "order": 3,
 "dek": "UpGuard counted 16,326 Supabase databases where anyone with the public key can read the tables. This note shows a two-minute check for your project, the SQL that closes the hole, and what Supabase changes on 30 October 2026.",
 "dek_th": "UpGuard พบฐานข้อมูล Supabase 16,326 แห่งที่ใครมีคีย์สาธารณะก็อ่านตารางได้ บันทึกนี้มีวิธีตรวจโปรเจกต์ของคุณเองใน 2 นาที SQL ที่ปิดช่องโหว่ และสิ่งที่ Supabase เปลี่ยนในวันที่ 30 ตุลาคม 2569",
 "cards": ["vibe", "sec-hacked"],
 "card": {"big": "Can anyone read your database?", "sub": "A two-minute check for Supabase apps"},
 "sources": [
  {"t": "Everything Everywhere: Systemic Data Exposure in Supabase Apps | UpGuard", "u": "https://www.upguard.com/blog/everything-everywhere-systemic-data-exposure-in-supabase-apps"},
  {"t": "API keys | Supabase Docs", "u": "https://supabase.com/docs/guides/getting-started/api-keys"},
  {"t": "Statement on CVE-2025-48757", "u": "https://mattpalmer.io/posts/statement-on-CVE-2025-48757/"},
  {"t": "NVD - CVE-2025-48757", "u": "https://nvd.nist.gov/vuln/detail/CVE-2025-48757"},
  {"t": "20 Million Rows Exposed: A Supabase Security Study of YC Startups | ModernPentest Blog", "u": "https://modernpentest.com/blog/yc-supabase-vulnerability-research"},
  {"t": "We Scanned 1,072 Vibe Coded Apps, 98% Had Security Flaws", "u": "https://www.symbioticsec.ai/blog/we-scanned-1-072-vibe-coded-apps-98-had-security-flaws"},
  {"t": "Hacking Moltbook: AI Social Network Reveals 1.5M API Keys | Wiz Blog", "u": "https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys"},
  {"t": "Breaking Change: Tables not exposed to Data and GraphQL API automatically · Changelog | Supabase", "u": "https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically"},
  {"t": "Row Level Security | Supabase Docs", "u": "https://supabase.com/docs/guides/database/postgres/row-level-security"},
  {"t": "Security overview - Lovable Documentation", "u": "https://docs.lovable.dev/features/security"},
  {"t": "Event Triggers | Supabase Docs", "u": "https://supabase.com/docs/guides/database/postgres/event-triggers"}
 ]
}
---
UpGuard counted 16,326 Supabase databases where anyone who holds the app's public key can read the tables [1]. The study, published 24 September 2026 and updated 14 October, started from about 300,000 domains that appeared to use Supabase and found signs of personal data in more than half of the 16,326. UpGuard links the problem to how tables are made: Supabase turns on row-level security (RLS, explained next) for tables created in its Table Editor, but not for tables created through the API, which is how coding agents work [1].

Row-level security (RLS) is the rule set inside Postgres, the database Supabase runs on, that decides which rows each caller may read or change. A Supabase app includes a public key in its browser code, called the publishable key (older name: the `anon` key). Supabase describes it as safe to publish because it can only access what RLS allows [2]. With RLS off, that key can access every row. A second key, the secret key (older name: the `service_role` key), bypasses RLS entirely and belongs on a server [2].

## Four scans since March 2025 all found open tables

Matt Palmer's scan of Lovable projects came first: he found the flaw on 20 March 2025, completed a scan of 1,645 projects on 21 March and published on 29 May 2025 [3]. NVD, the US vulnerability database, lists it as CVE-2025-48757 (insufficient RLS in Lovable through 15 April 2025): published 30 May 2025, severity 9.3 of 10 as scored by MITRE, the CVE's issuer. The record is marked disputed, because the supplier holds each customer responsible for protecting its own app's data [4].

| Scan | Published | Sample | Open tables found |
|---|---|---|---|
| Palmer, Lovable projects [3] | 29 May 2025 | 1,645 projects, home pages only | 170 projects (about 10.3%), 303 endpoints |
| Modern Pentest, Y Combinator startups [5] | 26 January 2026 | 71 startups with reachable Supabase databases | 20 exposed personal data (28%); 43 had some exposure (61%) |
| Symbiotic Security [6] | 2 June 2026 | 1,072 Supabase sites from Lovable, v0, Bolt.new, Replit and Windsurf | 39 with tables readable by the public key; 34 more with sensitive columns exposed |
| UpGuard [1] | 24 September 2026 | about 300,000 domains showing signs of Supabase | 16,326 databases with readable tables |

The samples differ, so the percentages cannot be compared across rows. Wiz found the same problem in Moltbook, a social network for AI agents, and reported it on 31 January 2026: the project URL and public key were in the production JavaScript, RLS was not configured, and queries returned 1.5 million API tokens and 35,000 email addresses. One PATCH request (an HTTP call that edits a record) changed an existing post, so writes were open too. The maintainer closed the tables in several steps within hours [7].

## Two checks show whether anyone can read your app's data

The Connect dialog in the Supabase dashboard shows the project URL and the publishable key [2]. This request asks for one table that the app uses, with the placeholders replaced:

```bash
curl -s "https://YOUR-REF.supabase.co/rest/v1/orders?select=*&limit=3" \
  -H "apikey: YOUR_PUBLISHABLE_KEY"
```

Rows in the reply mean every visitor to the site can read that table. `[]` means the key can access no rows (RLS on with no policy, or an empty table). A `42501` permission error means the table is not exposed to the key at all [8].

The SQL Editor in the same dashboard checks every table at once:

```sql
select c.relname as table_name,
       c.relrowsecurity as rls_on,
       has_table_privilege('anon', c.oid, 'select') as anon_can_read
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','p')
order by rls_on, table_name;
```

A row with `rls_on` false and `anon_can_read` true is a table the public key reads. Both checks run against your own project.

## The fix: turn on RLS, take away the public role's access, and add one policy per action

```sql
alter table public.orders enable row level security;
revoke all on public.orders from anon;

create policy "owner reads own orders" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "owner adds own orders" on public.orders
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
```

`auth.uid()` returns the signed-in user's id; wrapping it in `select` lets Postgres evaluate it once per statement instead of once per row [9].

We ran these statements on 24 October 2026 on Postgres on our own computer (PGlite 0.5.11, Postgres 18.6) with test versions of the `anon` and `authenticated` roles, not on a hosted Supabase project. Before, the public role read every order. After, the public role got `permission denied`, user 1 read only user 1's rows, and an insert naming user 2 failed with a row-level security violation.

## A policy that says `true` opens the table again

A policy of `using (true)` matches every row for every caller. Palmer reports that the scanner Lovable released in April 2025 checked that a policy exists, not what it says [3]. Lovable's documentation lists rules that let everyone through among its quick scan's database checks, and says the scans find common issues, not all of them [10]. On the same test Postgres, a table with a `using (true)` policy returned its row to the `anon` role. One query lists the policies that match:

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and (qual = 'true' or with_check = 'true');
```

## On 30 October 2026 Supabase changes the default for new tables; existing tables keep their settings

A Supabase changelog entry of 28 April 2026 says new tables in the `public` schema are no longer reachable through the Data API (the generated REST layer that `supabase-js` calls) until a `grant` allows it. New projects get the new default from 30 May 2026, in a rollout over a few weeks; the entry sets 30 October 2026 for existing projects, six days after this note. Existing tables keep their grants and stay reachable, and RLS works as before. The entry gives the reason: agents, CLI scripts and AI platforms create tables without a human reviewing the change [8]. The new default does not close tables that are already open; the check above shows which ones are.

An existing project can adopt the new default before 30 October with two statements from the same entry [8]. On our test Postgres, a table made afterwards returned `permission denied` to `anon`, the older table stayed readable, and an explicit `grant select` made the new one readable again.

```sql
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;
```

An event trigger (a Postgres rule that runs when the database structure changes) can turn on RLS for each table created afterwards, whichever tool made it. Supabase publishes its own version [11]; this shorter one ran in the same test and caught both `create table` and `create table as`:

```sql
create function rls_on_new_tables() returns event_trigger
language plpgsql security definer set search_path = pg_catalog as $$
declare t record;
begin
  for t in select * from pg_event_trigger_ddl_commands()
           where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
             and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', t.object_identity);
  end loop;
end $$;

create event trigger rls_on_new_tables on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function rls_on_new_tables();
```

Tables created before the trigger need `alter table … enable row level security` run on them manually [11].

## Two more problems: columns the browser can write, and secret keys in the browser

On Linkable, a paid site built with Lovable, Palmer sent a POST request with no authorization header and inserted a record with `payment_status` set to "paid", bypassing Stripe [3]. A column the browser may write is a column a visitor may set. Column-level grants remove the write access: on our test Postgres, a signed-in user's insert or update of `plan` got `permission denied`, while `display_name` stayed writable.

```sql
revoke insert, update on public.profiles from authenticated;
grant insert (id, display_name), update (display_name) on public.profiles to authenticated;
```

The server that receives the payment provider's event then writes `plan` with the secret key, which bypasses RLS [2]. That key in a browser bundle defeats every policy above. Supabase answers a secret key sent from a browser with a 401 error, and says a leaked key still works from other tools [2]. In a framework such as Next.js, a `NEXT_PUBLIC_` prefix on a variable name sends its value to the browser:

```bash
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # sent to the browser
SUPABASE_SECRET_KEY=sb_secret_...                          # server only: no prefix
```

`grep -r "sb_secret_" dist build .next/static` over a build folder finds a new-format secret key left in it. You replace a leaked secret key in the dashboard under Settings, API Keys [2]. Supabase is deprecating the `anon` and `service_role` keys by the end of 2026 and replacing them with the publishable and secret keys [2].
