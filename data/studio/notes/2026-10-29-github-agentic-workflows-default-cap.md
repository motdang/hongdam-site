{"title": "GitHub Agentic Workflows: the default spending cap is US$50 a day per workflow", "title_th": "GitHub Agentic Workflows: เพดานค่าใช้จ่ายตั้งต้นคือ 50 ดอลลาร์ต่อวัน ต่อหนึ่งเวิร์กโฟลว์", "date": "2026-10-29", "beat": "automation",
 "dek": "GitHub Agentic Workflows reached general availability on 28 October 2026. The agent job gets no write access to your repository, but a workflow with no cap of its own may spend up to US$10 a run and US$50 a day on AI.",
 "dek_th": "GitHub Agentic Workflows เปิดให้ใช้งานทั่วไปเมื่อ 28 ตุลาคม 2569 ตัวเอเจนต์ไม่ได้สิทธิ์เขียนลงรีโปของคุณ แต่ถ้าไม่ตั้งเพดานเอง เวิร์กโฟลว์หนึ่งตัวใช้ค่า AI ได้ถึง 10 ดอลลาร์ต่อรอบ และ 50 ดอลลาร์ต่อวัน",
 "cards": ["ai-automation", "bots"],
 "sources": [
  {"t": "GitHub Agentic Workflows generally available - GitHub Changelog", "u": "https://github.blog/changelog/2026-10-28-github-agentic-workflows-generally-available"},
  {"t": "Release v1.0.1 · github/gh-aw · GitHub", "u": "https://github.com/github/gh-aw/releases/tag/v1.0.1"},
  {"t": "GitHub Agentic Workflows Quickstart | GitHub Agentic Workflows", "u": "https://github.github.io/gh-aw/setup/quick-start/"},
  {"t": "Safe Outputs | GitHub Agentic Workflows", "u": "https://github.github.io/gh-aw/reference/safe-outputs/"},
  {"t": "agentics/.github/workflows at main · githubnext/agentics · GitHub", "u": "https://github.com/githubnext/agentics/tree/main/.github/workflows"},
  {"t": "Cost Management | GitHub Agentic Workflows", "u": "https://github.github.io/gh-aw/reference/cost-management/"},
  {"t": "Actions runner pricing - GitHub Docs", "u": "https://docs.github.com/en/billing/reference/actions-runner-pricing"},
  {"t": "GitHub Actions billing - GitHub Docs", "u": "https://docs.github.com/en/billing/concepts/product-billing/github-actions"}
 ],
 "card": {"big": "Agentic Workflows: US$50 a day", "sub": "The default cap, and the three lines that lower it"}}
---
GitHub Agentic Workflows became generally available on 28 October 2026, for GitHub Free, Team and Enterprise [1]. Version 1.0.1 of its command-line tool, `gh aw`, came out on 27 October [2]. It lets a coding agent (an AI model that reads files and runs commands) do repository chores inside GitHub Actions: sort new issues, explain a failed build, update the docs, open a pull request.

The safety design holds up when you read the files it generates. The spending defaults are loose: a workflow that sets no cap of its own can spend up to 1,000 AI Credits a run and 5,000 a day, and one AI Credit is US$0.01 [6]. That is US$10 a run, US$50 a day, about US$1,500 a month per workflow. None of the five sample workflows GitHub keeps in its own example repository sets a lower cap [5].

## You write a page of English, GitHub runs about 2,000 lines of YAML

You write a Markdown file: a short settings block, then instructions in plain English. `gh aw compile` turns it into a `.lock.yml` file, an ordinary GitHub Actions workflow, and both files go into the repository [3].

We read the five compiled workflows in the `.github/workflows` folder of githubnext/agentics, the project's example repository, on 29 October 2026 (commit 139fa09, compiled by gh-aw v0.93.3) [5]. We parsed each file and counted its jobs, its steps and the write permissions of each job.

| Workflow | Source lines | Compiled lines | Jobs | Steps |
| --- | --- | --- | --- | --- |
| daily-repo-goals | 199 | 2,255 | 6 | 131 |
| daily-workflow-sync | 150 | 1,876 | 5 | 110 |
| import-workflow | 198 | 1,819 | 5 | 109 |
| link-checker | 236 | 2,185 | 6 | 130 |
| maintainer | 102 | 1,906 | 6 | 114 |

The compiled file is the one that runs. Its header says not to edit it; you edit the Markdown and compile again. A pull request that changes a workflow therefore carries a diff of hundreds of generated lines, and the reviewer reads the Markdown change instead.

## The agent job gets a read-only token

In all five files the job that runs the agent holds a single write permission, `copilot-requests`, which pays for the AI calls. Its token can read code, issues and pull requests; it cannot push code, open an issue or comment. Writes to the repository (`contents`, `issues`, `pull-requests`) sit in two other jobs, `safe_outputs` and `conclusion` [5].

One exception. The agent job also reads two optional repository secrets, `GH_AW_GITHUB_TOKEN` and `GH_AW_GITHUB_MCP_SERVER_TOKEN` [5]. A personal access token (a password-like key tied to your own account) stored under either name keeps whatever scopes you gave it. Give it read scopes only.

This is the design GitHub calls safe outputs: the agent writes requests, and a separate job with the narrow permission carries out the ones the workflow allows, each type with a count limit [4]. With no `safe-outputs` block, the only write allowed is one new issue [4]. Between the two sits a `detection` job, which scans every proposed change before it is applied [1].

Every third-party step in the five files is pinned to a full 40-character commit, not a tag, and every container image to a digest (a fingerprint of its exact contents) [5]. A tag can be moved to point at different code; a commit cannot.

## The money sits in the AI Credits, not the runner minutes

A run pays twice: GitHub Actions minutes for the machine, and the AI provider for the model [6].

- **Minutes.** A standard Linux runner costs US$0.006 a minute, and GitHub rounds each job up to a whole minute [7]. The project's own estimate for an issue-triage workflow with 20 runs a month is about 10 minutes, about US$0.06 [6]. Standard runners in public repositories are free; GitHub Free includes US$12 of minutes a month for private ones [8].
- **AI Credits.** Defaults: 1,000 per run and 5,000 per workflow per 24 hours [6]. The detection job has its own cap of 400 per run [6]. Whether detection counts toward the daily 5,000 is not stated on the page.

The AI Credit count is the tool's own estimate. The project says it may not match what the provider bills [6]. The provider's invoice is the final number.

```chart
{"title": "Most one workflow can spend on AI in 30 days", "unit": " US$", "lower_is_better": true,
 "rows": [["Default caps", 1500], ["max-daily-ai-credits: 500", 150], ["max-daily-ai-credits: 100", 30]],
 "note": "Daily cap × 30 days × US$0.01 per AI Credit, from the Cost Management page, read 29 October 2026. Runner minutes not included."}
```

## Three lines in the settings block set your own ceiling

Each of these is a top-level field in the Markdown file's settings block [6]:

```yaml
max-ai-credits: 200        # US$2 a run
max-daily-ai-credits: 500  # US$5 a day for this workflow
max-turns: 20              # at most 20 agent turns
```

Then run `gh aw compile` again and commit both files. Two more settings cut the number of runs that reach the model at all [6]:

- `skip-if-match` and `skip-if-no-match` under `on:` run a GitHub search in the first, cheap job; when it matches (or does not), the agent job never starts and no AI Credits are spent. Example: skip issues already labelled `duplicate`.
- A schedule or a manual trigger (`workflow_dispatch`) is easier to budget than `push`, which fires on every push [6].

`gh aw forecast`, no longer experimental since the general-availability release, prints a monthly range of AI Credit spend for a workflow, detection included [1]. Run it before you merge a new workflow.

## For a founder

A triage bot that runs on every new issue and stays under its cap costs cents a month in minutes. The same bot on a busy public repository, on the defaults, can reach US$50 a day before it stops. Set `max-daily-ai-credits` to what you would pay a person for the same job.
