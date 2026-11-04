{"title": "n8n 3.0: npm installs end, Code nodes time out at a minute, no way back to 2.x", "title_th": "n8n 3.0: เลิกติดตั้งผ่าน npm, Code node หมดเวลาที่ 1 นาที และย้อนกลับไป 2.x ไม่ได้", "date": "2026-11-05", "beat": "automation",
 "dek": "The n8n 3.0 beta came out on 27 October 2026, stable due in early December. Self-hosted n8n must run in Docker, unverified community nodes stop loading, and a Code node task fails after 60 seconds instead of 300.",
 "dek_th": "n8n 3.0 เบต้าออกเมื่อ 27 ตุลาคม 2569 ตัวเสถียรจะตามมาต้นธันวาคม ต้องรันใน Docker เท่านั้น community node ที่ยังไม่ผ่านการตรวจสอบจะไม่โหลด และงานใน Code node ล้มเหลวหลัง 60 วินาที แทนที่จะเป็น 300",
 "cards": ["ai-automation", "bots"],
 "sources": [
  {"t": "v3.0 Breaking changes | n8n Docs", "u": "https://docs.n8n.io/changelog/v30-breaking-changes"},
  {"t": "Today we're releasing n8n version 3.0.0 BETA – n8n Blog", "u": "https://blog.n8n.io/introducing-n8n-v3"},
  {"t": "v3.0 Migration tool | n8n Docs", "u": "https://docs.n8n.io/changelog/v30-migration-tool"},
  {"t": "Releases · n8n-io/n8n · GitHub", "u": "https://github.com/n8n-io/n8n/releases"},
  {"t": "fix: Make npm install of n8n work on all platforms again (backport to release-candidate/2.46.x) · Pull Request #43035 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/pull/43035"},
  {"t": "n8n/docker/get-n8n.sh at master · n8n-io/n8n · GitHub", "u": "https://github.com/n8n-io/n8n/blob/master/docker/get-n8n.sh"},
  {"t": "n8n - npm", "u": "https://www.npmjs.com/package/n8n?activeTab=versions"},
  {"t": "n8nio/n8n Tags | Docker Hub", "u": "https://hub.docker.com/r/n8nio/n8n/tags"},
  {"t": "Announcing n8n version 3.0 - n8n Community", "u": "https://community.n8n.io/t/announcing-n8n-version-3-0/324016"}
 ],
 "card": {"big": "n8n 3.0: Docker only, 60 s Code nodes", "sub": "Beta 27 October, stable early December, no way back"}}
---
n8n (a workflow automation tool you can run on your own server) released version 3.0.0 as a beta on 27 October 2026, with the stable release due in early December [2]. The breaking changes are mostly removals and tighter defaults [1]. Three of them stop workflows on the day you upgrade: self-hosted n8n must run in Docker (software that packages a program with everything it needs into a container), a Code node task fails after 60 seconds instead of 300, and community nodes not verified by n8n stop loading [1]. There is no path back to 2.x once the database has migrated [2][9].

The 2.x line gets security fixes and fixes for serious bugs for 12 months after the stable 3.0 release. The 1.x line ends on 31 December 2026, and a 1.x instance has to go through 2.x first [2].

## The npm path ends, and it already broke once this week

n8n 3.0 does not publish a runnable package to npm (the package registry for JavaScript). An instance started with `npm install -g n8n` or `npx n8n` cannot move to 3.0 as it is; it needs Docker first [1]. Kubernetes and Helm installs (cluster deployments) are not affected [2].

The npm path is fragile before 3.0 arrives. From 2.46.0 the package refused to install on any machine with an "unsupported platform" error, because the new Edit Image node shipped four platform-specific image libraries as regular dependencies and no host matches all four [5]. 2.46.4 went out as the stable release on 2 November with the fault in it; 2.46.6 fixed it on 4 November [4][5].

n8n's replacement is a one-line installer, `curl -fsSL https://get.n8n.io | sh`, which checks for Docker and the Compose plugin, writes an `.env` and a Compose file, and starts the instance [1]. We read the script on 5 November 2026 (version 1.4.0, 577 lines) [6]. It asks GitHub for the latest stable release and pins that version in `.env`; the script's own comment says a floating tag would upgrade and run database migrations on any container restart [6]. It also starts a separate sandbox service for running code, pinned at 1.8.1 [6]. On failure, and only after you answer yes at a terminal, it sends n8n the script version, the OS name and the failed step [6].

## Twenty-two kinds of node vanish, and their workflows do not start

A workflow that uses a removed node fails when it runs. A published one does not activate when 3.0 starts, so its triggers stop firing [1]. The list runs to 22 entries, several naming more than one node: the legacy Function and Function Item nodes (replaced by the Code node), Item Lists, Cron and Interval (replaced by Schedule Trigger), Read PDF, Read and Write Binary File, the legacy OpenAI node and OpenAI Assistant, HTTP Request Tool, Workflow Trigger, the Insert and Load variants of the Pinecone, Supabase and in-memory vector stores, and the AI Transform node [1].

Version 1 of the AI Agent node goes too, with its SQL, Conversational, OpenAI Functions, Plan and Execute and ReAct modes; the current version replaces them all with Tools Agent [1]. Edit Image versions 1 and 1.1 go, and version 2 uses a different image library, so blur, text placement and PNG quality can come out differently [1].

The migration report can rewrite some of these for you: Cron to Schedule Trigger, AI Transform to a Code node holding the same generated JavaScript. It saves the result as a new workflow version, and the published version keeps running until you publish the new one [3].

## Three defaults shrink, one credential gains a required field

| Setting | 2.x default | 3.0 default |
| --- | --- | --- |
| `N8N_RUNNERS_TASK_TIMEOUT` (Code node task) | 300 s | 60 s |
| `N8N_COMPRESSION_NODE_MAX_DECOMPRESSED_SIZE_BYTES` | 2 GiB | 256 MiB |
| `N8N_COMPRESSION_NODE_MAX_ZIP_ENTRIES` | 5,000 | 1,000 |
| `N8N_UNVERIFIED_PACKAGES_ENABLED` | `true` | `false` |

From the breaking-changes page, read 5 November 2026 [1]. Each old value can be set back by hand in the environment.

A Code node that calls a slow API, or loops over a few thousand rows, now fails at the minute mark [1]. Unverified community nodes (packages from npm that n8n has not reviewed) cannot be installed after the upgrade, and the ones already installed stop loading, unless `N8N_UNVERIFIED_PACKAGES_ENABLED=true` is set [1].

The Slack API credential requires a signing secret (a value from your Slack app's settings that lets n8n check each incoming request came from Slack). A workflow with a Slack Trigger does not publish without it, and an already published one does not activate after the upgrade [1]. The secret sits under Basic Information in the Slack app settings and goes into the credential's Signature Secret field [1].

Two more changes catch instances with custom settings. The binary data folder inside n8n's data directory is renamed from `binaryData` to `storage` on first start, and 3.0 refuses to start when both folders exist [1]. The in-memory binary data mode is gone; instances still on it switch to `filesystem`, which needs disk space on the container's mounted volume [1].

## Every "latest" still points at 2.x today

Measured 5 November 2026, 06:40 in Chiang Rai:

| Channel | What it serves |
| --- | --- |
| npm `latest` and `stable` | 2.46.6, no 3.x version published [7] |
| Docker Hub `latest` and `stable` | 2.46.6 [8] |
| Docker Hub `next` and `beta` | 2.47.2 [8] |
| Docker Hub `3.0.0`, `3.0.1`, `3.1.0` | 27 October, 28 October, 3 November [8] |
| GitHub "latest" release | n8n@2.46.6, so the one-line installer installs 2.46.6 today [4][6] |

3.0.0, 3.0.1 and 3.1.0 are marked pre-release on GitHub [4]. To run the beta, name the tag: `docker.n8n.io/n8nio/n8n:3.1.0`. No floating tag serves 3.x today.

```chart
{"title": "Compressed image size, amd64", "unit": " MB", "lower_is_better": true,
 "rows": [["1.123.92", 314.8], ["2.46.6", 316.5], ["3.0.0", 302.8], ["3.1.0", 309.0]],
 "note": "Docker Hub tag data, read 5 November 2026."}
```

## The order of work

The migration report, at Settings > Migration Report on 2.39 or later, scans the instance and lists each affected workflow with its owner, its node, its run count and the date of its last run [3]. Five impact levels sort the work: Upgrade blocked, Executions will fail, Executions might fail, Behavior changes, Capability removed [3]. A workflow that has not run in 12 months gets a banner offering to mark it won't fix [3].

1. Update to the newest 2.x. In Docker that is the `stable` tag; by npm, 2.46.6 or later [4][5].
2. Open the report. Fix Upgrade blocked and Executions will fail first, then the rest [3].
3. Add the Slack signing secret, set `N8N_RUNNERS_TASK_TIMEOUT` if any Code node runs longer than a minute, and decide on each unverified community node [1].
4. Back up the database. The 3.x migration is one way [2][9].
5. Upgrade a copy first, then the live instance [2].

An npm install needs the Docker move before step 5. The one-line installer starts a new instance rather than converting the old one, so the old instance's workflows come across by export and import: the editor's Import from File, the CLI or the API [1].

## For a founder

If someone set up n8n for you with a single `npm` command on a small server, the December release is the one your instance cannot take. The report in Settings tells you, today, how many of your workflows will stop. A morning of fixes on 2.x now beats a silent stop in December.
