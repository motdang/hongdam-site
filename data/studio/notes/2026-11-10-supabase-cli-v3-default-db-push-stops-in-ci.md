{"title": "Supabase CLI v3 is the default since 2 November: a CI db push now stops for a yes", "title_th": "Supabase CLI v3 เป็นค่าเริ่มต้นตั้งแต่ 2 พฤศจิกายน: db push ใน CI จะหยุดรอคำยืนยัน", "date": "2026-11-10", "beat": "last-mile",
 "dek": "Since 2 November npm, Homebrew and the GitHub Action install Supabase CLI v3. Database commands target the local stack unless told --remote, and a hosted change fails without --yes where nobody can answer. Tested 10 November 2026.",
 "dek_th": "ตั้งแต่ 2 พฤศจิกายน npm, Homebrew และ GitHub Action ติดตั้ง Supabase CLI v3 ให้โดยอัตโนมัติ คำสั่งฐานข้อมูลจะชี้ไปที่เครื่องตัวเองถ้าไม่ใส่ --remote และการแก้โปรเจกต์บนคลาวด์จะล้มเหลวถ้าไม่มี --yes ในที่ที่ไม่มีคนตอบ ทดสอบเมื่อ 10 พฤศจิกายน 2569",
 "cards": ["vibe", "web-care"],
 "card": {"big": "Supabase CLI v3: db push stops in CI", "sub": "Add --yes --remote, or pin v2.stable"},
 "sources": [
  {"t": "Breaking Change: Supabase CLI v3 is local by default and confirms hosted changes", "u": "https://supabase.com/changelog/supabase-cli-v3"},
  {"t": "Migrating to Supabase CLI v3 | Supabase Docs", "u": "https://supabase.com/docs/guides/local-development/cli/migrating-to-v3"},
  {"t": "Release v3.0.0 · supabase/cli", "u": "https://github.com/supabase/cli/releases/tag/v3.0.0"},
  {"t": "Release v2.122.1 · supabase/cli", "u": "https://github.com/supabase/cli/releases/tag/v2.122.1"},
  {"t": "supabase/setup-cli: GitHub Action for Supabase CLI", "u": "https://github.com/supabase/setup-cli"},
  {"t": "supabase - npm, versions", "u": "https://www.npmjs.com/package/supabase?activeTab=versions"},
  {"t": "Managing Environments | Supabase Docs", "u": "https://supabase.com/docs/guides/deployment/managing-environments"},
  {"t": "Automated testing | Supabase Docs", "u": "https://supabase.com/docs/guides/deployment/ci/testing"},
  {"t": "Supabase | Lovable Documentation", "u": "https://docs.lovable.dev/integrations/supabase"},
  {"t": "GitHub code search: \"supabase db push\" in .github/workflows", "u": "https://github.com/search?q=%22supabase+db+push%22+path%3A.github%2Fworkflows&type=code"}
 ]}
---
On 2 November 2026 Supabase released version 3.0.0 of its command-line tool, and from that day `npm install supabase`, Scoop, the Linux packages and the GitHub Action `supabase/setup-cli` install v3 when no version is named; Homebrew followed on 3 November [1]. The CLI is the program that pushes database changes (migrations) to a Supabase project, deploys its edge functions (small server programs) and sets its secrets. Version 3.1.0 followed on 9 November [6]. A deploy workflow that asks for `latest` got 2.122.0 on 1 November and 3.0.0 the next day.

Three changes stop a script written for v2 [1][2]:

- **Database commands target the local stack** unless `--remote` is given. The local stack is the copy of Supabase that runs in Docker on the same computer. A `db push` in a CI job (continuous integration: the service that runs tests and deploys on each push, GitHub Actions for most) with no local stack fails. With one running, as in a test job, it pushes there and never reaches the hosted project [1].
- **A change to a hosted project asks for confirmation, default No.** Where nobody can answer, the command fails with `HostedMutationConsentRequiredError` and changes nothing, unless `--yes` is passed. Piping `y` into the command no longer confirms it, and `SUPABASE_YES` in a `.env` file does not count [2].
- **Removed pieces fail outright.** `[inbucket]` in `supabase/config.toml` stops `supabase start`; removed commands such as `db remote commit` and `gen keys` exit 1 and print their replacement [1][3].

## Tested: the same push on v2 and v3, as a CI runner sees it

We installed supabase 3.1.0 and 2.122.1 from npm into separate folders, ran `supabase init`, added a migration file that creates a table, and started a throwaway Postgres on this computer to stand in for the hosted database. Every command ran with no terminal: input from `/dev/null`, output to a pipe, the way a GitHub Actions step runs. Measured 10 November 2026.

| Command | v2.122.1 | v3.1.0 |
|---|---|---|
| `db push`, not linked | `ProjectRefNotLinkedError`, exit 1 | `Target: local stack`, then a connection error with the hint to start Docker, exit 1 |
| `db push --db-url $DB_URL` | applies 3 migrations, asks nothing, exit 0 | a deprecation warning, then `HostedMutationConsentRequiredError`, exit 1, nothing applied |
| `echo y \| db push --remote=$DB_URL` | runs, with `--db-url`, exit 0 | the same error, exit 1 |
| `db push --remote=$DB_URL --dry-run` | | lists the migrations it would apply, exit 0, no `--yes` needed |
| `db push --remote=$DB_URL --yes` | | "Confirmed by --yes", applies 4 migrations, exit 0 |
| `SUPABASE_YES=1` exported in the shell | | "Confirmed by SUPABASE_YES", applies |
| `SUPABASE_YES=1` in `.env`, with or without the export | | the error, with "SUPABASE_YES in .env does not confirm hosted changes; pass --yes" |
| `gen types typescript --local` | reads the local stack | a warning that `--local` is not needed, reads the local stack |
| `db remote commit` | | `RemovedSurfaceError`, exit 1, "Use `supabase db pull --remote` instead" |

The v2 row matters as much as the v3 ones. v2 asked its question only in a terminal; in a pipe it applied the migrations and said nothing. v3 refuses in the same place: "This run can't ask because stdout is not a terminal. Nothing was changed."

Run from inside an AI coding agent's shell, as we first did, v3 notices and answers differently: output switches to JSON and the error reads "This is an agent run: ask the user before re-running with --yes." An agent that runs the command gets that text instead of a prompt nobody sees [2].

## Public workflows on GitHub: 4,728 run db push, 189 pass --yes

GitHub's code search over public repositories, read 10 November 2026 [10]. The counts are of files under `.github/workflows` and GitHub matches phrases loosely, so the figures move from day to day; the gap between the pairs does not.

```chart
{"title": "Public GitHub workflow files, 10 November 2026", "unit": "",
 "rows": [["setup-cli with version: latest", 6200], ["supabase db push", 4728], ["supabase db push --yes", 189], ["supabase functions deploy", 3744], ["supabase functions deploy --yes", 15], ["setup-cli pinned to v2.stable", 3]],
 "note": "GitHub code search counts, path:.github/workflows, read 10 November 2026."}
```

`version: latest` is what Supabase's own CI examples use, on `supabase/setup-cli@v1` [7][8]. The Action's README says `@v1` installs CLI 2.20.3 when `version` is left out, and whatever `latest` means today when it is set [5]. Today that is 3.1.0 [6]. The newest Action, `@v3`, reads the `supabase` version from `package-lock.json`, `pnpm-lock.yaml` or `bun.lock` at the repository root first, and falls back to `latest` [5]. The two example workflows on Supabase's testing page, `supabase db start` and `supabase test db`, still run on v3, since both are local [8]. The migration-deploy example already carries `--yes --remote` [7].

Lovable writes a project's migrations into `supabase/migrations/` and applies them to the project itself, after you approve the SQL in chat [9]. The CLI enters when the project is exported to GitHub and a deploy workflow is added, often written by the same tool that wrote the app. Those workflows are the 4,728.

## The fix: the v3 forms, or a pin to v2

**Moving to v3.** Supabase's quick reference for CI, with the forms we tested [2]:

| v2 | v3 |
|---|---|
| `supabase db push` | `supabase db push --yes --remote` |
| `supabase db push --db-url "$DB_URL"` | `supabase db push --yes --remote="$DB_URL"` |
| `supabase migration list --linked` | `supabase migration list --remote` |
| `supabase gen types typescript --project-id "$REF"` | `supabase gen types typescript --remote="$REF"` |
| `supabase gen types typescript --local` | `supabase gen types typescript` |
| `supabase functions deploy` | `supabase functions deploy --yes` |
| `supabase secrets set --env-file .env.production` | `supabase secrets set --env-file .env.production --yes` |
| `echo y \| supabase <command>` | `supabase <command> --yes` |

A deploy step after the change:

```yaml
- uses: supabase/setup-cli@v3
  with:
    version: latest
- run: supabase link --project-ref "$SUPABASE_PROJECT_ID"
- run: supabase db push --yes --remote
- run: supabase functions deploy --yes
```

`--remote` goes last when the command takes an argument, as in `supabase migration repair 20240101000000 --status reverted --remote`, or carries its value with `=`; otherwise the CLI reads the next word as the remote's name and stops with a "did you mean" error [2][3]. The old flags `--linked`, `--db-url`, `--project-id` and `--local` still work in v3 with a warning and are removed in v4 [2].

**Staying on v2.** The release of 2.122.1 on 2 November added install channels that stay on the v2 line [4]:

```yaml
- uses: supabase/setup-cli@v3
  with:
    version: v2.stable
```

```json
"devDependencies": { "supabase": "v2.stable" }
```

```bash
brew install supabase/tap/supabase@2
```

`v2.stable` is a tag on the npm package, so `npm install` with that line in `package.json` installs 2.122.1 today and later v2 fixes; the release note gives the one-line form [4].

v2 now gets security fixes and fixes for broken behaviour, no features [4].

**Either way.** Rename `[inbucket]` to `[local_smtp]` in `supabase/config.toml`; v2.108.0 and later already read the new name, so the rename is safe before the upgrade [2]. Run `supabase db push --remote --dry-run` in the workflow first: it lists what would be applied and needs no `--yes`, which we confirmed above. Two more v3 defaults reach production: `secrets unset` with no names fails and needs `--all` to remove every secret, and `config push` now applies `[auth.sms] enable_confirmations = false` as written, so `supabase config diff` before `config push` shows what will change [2].
