{"title": "n8n 2.50 retries a failed trigger 25 times in 72 hours; its crash shut-off is off", "title_th": "n8n รุ่นถัดไปลองเปิด trigger ที่ล้มเหลวใหม่ 25 ครั้งใน 72 ชั่วโมง ส่วนระบบหยุด workflow ที่ทำให้เครื่องล่มยังปิดไว้เป็นค่าเริ่มต้น", "date": "2026-11-26", "beat": "automation",
 "dek": "n8n 2.50.0 and 3.4.0, pre-releases from 24 November, bring a trigger back after an outage without a re-publish; stable 2.49.6 does not. Unpublishing a workflow that crashes n8n is off unless you set one variable.",
 "dek_th": "n8n 2.50.0 และ 3.4.0 (รุ่นทดสอบ ออก 24 พ.ย.) ลองเปิด trigger ใหม่เองหลังระบบปลายทางล่ม ไม่ต้องกด publish ซ้ำ แต่รุ่นเสถียร 2.49.6 ยังไม่มี ส่วนการ unpublish workflow ที่ทำให้ n8n ล่มซ้ำ ๆ ยังปิดอยู่ ต้องตั้งค่าตัวแปรเองหนึ่งตัว",
 "cards": ["ai-automation"],
 "card": {"big": "n8n trigger down after an outage?", "sub": "25 retries in 72 hours, from 2.50.0"},
 "sources": [
  {"t": "Release n8n@3.4.0 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/releases/tag/n8n%403.4.0"},
  {"t": "Release n8n@2.50.0 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/releases/tag/n8n%402.50.0"},
  {"t": "Release n8n@2.49.6 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/releases/tag/n8n%402.49.6"},
  {"t": "fix(core): Retry failed trigger activations with exponential backoff · PR #43708 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/pull/43708"},
  {"t": "workflow-publication-retry-state.repository.ts at n8n@3.4.0 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/blob/n8n%403.4.0/packages/%40n8n/db/src/repositories/workflow-publication-retry-state.repository.ts"},
  {"t": "fix(core): Count process crashes per workflow for auto-unpublishing · PR #43685 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/pull/43685"},
  {"t": "executions.config.ts at n8n@3.4.0 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/blob/n8n%403.4.0/packages/%40n8n/config/src/configs/executions.config.ts"},
  {"t": "Executions environment variables · n8n Docs", "u": "https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/executions"},
  {"t": "crash-loop-recovery.ts at n8n@3.4.0 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/blob/n8n%403.4.0/packages/cli/src/crash-loop/crash-loop-recovery.ts"}
 ]}
---
A trigger is the first node of an n8n workflow: the webhook, mail inbox, schedule or poll that starts each run. When you publish a workflow, n8n registers its triggers with the outside service. If that service is down at that moment, or n8n restarts during its outage, activation fails. On n8n 2.49.6, the stable release on 26 November 2026 [3], the workflow stays published with a dead trigger until someone publishes it again; the change that ends this says it lets a workflow "recover without a user publishing it again" [4].

That change, PR #43708, merged on 20 November and shipped on 24 November in two pre-releases: 2.50.0 and 3.4.0 [1][2][4]. A pre-release is the version n8n puts out for testing before it becomes the default download. The same releases carry a second change, PR #43685, which unpublishes a workflow that crashes the whole n8n process [6]. On a self-hosted instance that one is off by default [7][8].

## A failed trigger now retries on a doubling clock for three days

The schedule lives in three constants in the 3.4.0 source [5]: the first retry waits one minute, each failed retry doubles the wait, the wait stops growing at four hours, and retries end once a trigger has failed for three days. The comments give the reasons: a retry at once would hit the same outage, a four-hour cap limits a dead trigger to six attempts a day, and three days covers an outage from Friday evening to Monday morning [5].

We replayed those rules in a short script on 26 November 2026, with each attempt taking no time; real times run a few seconds later.

| Retry | Wait before it | Time since the first failure |
|---|---|---|
| 1 | 1 min | 1 min |
| 2 | 2 min | 3 min |
| 3 | 4 min | 7 min |
| 4 | 8 min | 15 min |
| 5 | 16 min | 31 min |
| 6 | 32 min | 1 h 03 min |
| 7 | 64 min | 2 h 07 min |
| 8 | 128 min | 4 h 15 min |
| 9 to 25 | 4 h each | 8 h 15 min to 72 h 15 min |

```chart
{"title": "Retries that fall inside each window after the first failure", "unit": "", "lower_is_better": false,
 "rows": [["First hour", 5], ["First 4 hours", 7], ["First day", 12], ["Three days", 25]],
 "note": "Replayed from the constants in n8n 3.4.0, 26 November 2026; attempt time taken as zero."}
```

The cost of the cap: after the first eight hours, a service that comes back waits up to four hours for its trigger. An inbox server that returns at 8 h 20 min gets its trigger back at the 12 h 15 min retry, 3 h 55 min later. A restart of n8n, or a new leader in a multi-main setup, tries every scheduled workflow once without waiting for its delay [4], so a restart is the quick way to bring one back.

Three more details from the PR [4]:

- A failure that needs a person (a policy refusal, two workflows on the same webhook path) schedules no retry.
- Publishing by hand resets the schedule and gives the trigger the usual five activation attempts.
- The database migration schedules a first retry for failures already on record, so a dead trigger from last week gets its first try after the upgrade.

During a rolling upgrade, failures recorded by a leader still on the older version get no delay and stay unscheduled [4].

## The crash shut-off counts three crashes in six hours, and is off unless you turn it on

n8n already marks runs that were in progress at a crash as `crashed`, and it can unpublish a workflow whose last three runs crashed, then email the owner. PR #43685 lists four ways a crash loop slipped past that check [6]. Two of them: a workflow set not to save failed runs loses its `crashed` rows at the next pruning, and a poll trigger crashing n8n mid-fetch leaves no run at all.

The fix writes a small file next to n8n's crash log. At each start after a crash, if exactly one workflow was in progress, that workflow gets one crash on its tally; if none or several were, the tally clears. Crashes older than six hours drop out. At three, n8n unpublishes the workflow before the scheduler starts any job [6].

The PR states the feature is on in n8n Cloud [6]. Self-hosted, both the old check and the new tally read one setting [7][9], and the docs list its default as false [8]. With it off, n8n logs a warning naming the workflow that was alone in flight at the crash, and leaves it published [9].

## Turning it on

Two environment variables control it [8]:

```bash
N8N_WORKFLOW_AUTODEACTIVATION_ENABLED=true
# crashes in a row, within six hours, before the workflow is unpublished; 3 is the default
N8N_WORKFLOW_AUTODEACTIVATION_MAX_LAST_EXECUTIONS=3
```

Set them where n8n gets its environment: the `environment:` block of a Docker Compose file, or the service's environment file. The crash tally needs 2.50.0 or 3.4.0 [1][2]; on 2.49.6 the variable turns on only the older last-three-runs check.

For an install on 2.x, 2.50.0 carries both changes without the move to the 3.x line [1][2]. On 2.49.6, a trigger that failed activation during an outage waits for someone to publish the workflow again [4].
